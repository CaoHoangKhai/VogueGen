const { ObjectId } = require("mongodb");

class CartService {
    constructor(client) {
        this.cart = client.db().collection("giohang");
        this.sanpham = client.db().collection("sanpham");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
    }

    extractCartData(payload) {
        return {
            manguoidung: payload.manguoidung ? new ObjectId(payload.manguoidung) : null,
            masanpham: payload.masanpham ? new ObjectId(payload.masanpham) : null,
            soluong: payload.soluong || 1,
            size: payload.size || null,
            mausac: payload.mausac || null,
            madesign: payload.madesign ? new ObjectId(payload.madesign) : null,
            mathietke: payload.mathietke ? new ObjectId(payload.mathietke) : null,
            isThietKe: payload.isThietKe || false,

            // 🆕 Thêm 2 trường này để nhận từ frontend
            previewFront: payload.previewFront || null,
            previewBack: payload.previewBack || null,
        };
    }

    async addToCart(payload) {
        try {
            const data = this.extractCartData(payload);

            // ✅ Kiểm tra dữ liệu cần thiết
            if (!data.manguoidung) return { success: false, message: "❌ Thiếu ID người dùng." };
            if (!data.masanpham) return { success: false, message: "❌ Thiếu ID sản phẩm." };
            if (!data.size) return { success: false, message: "❌ Thiếu size sản phẩm." };
            if (!data.mausac) return { success: false, message: "❌ Thiếu màu sắc sản phẩm." };

            // ✅ Ưu tiên mathietke nếu chưa có madesign
            if (data.mathietke && !data.madesign) {
                data.madesign = data.mathietke;
            }

            // ✅ Kiểm tra số lượng tối thiểu/tối đa
            if ((data.isThietKe || data.madesign) && data.soluong < 50) {
                data.soluong = 50;
            }
            if (data.soluong > 10000) {
                data.soluong = 10000;
            }

            // ✅ Query tìm sản phẩm đã có trong giỏ
            const query = {
                manguoidung: data.manguoidung,
                masanpham: data.masanpham,
                size: data.size,
                mausac: data.mausac
            };

            if (data.madesign) query.madesign = data.madesign;

            const existed = await this.cart.findOne(query);

            // ================================
            // 🔄 1️⃣ Nếu sản phẩm đã tồn tại
            // ================================
            if (existed) {

                // ⚠️ Nếu đã đạt 10.000 trước đó
                if (existed.soluong >= 10000) {
                    return {
                        success: true,
                        message: "⚠️ Sản phẩm này đã đạt số lượng tối đa (10.000) cho size này."
                    };
                }

                const newQuantity = existed.soluong + data.soluong;

                // ✅ Nếu cộng thêm vượt 10.000 thì giới hạn lại
                const finalQuantity = Math.min(newQuantity, 10000);

                // ✅ Cập nhật số lượng & ảnh thiết kế mới nhất
                const updateData = { soluong: finalQuantity };
                if (data.isThietKe || data.madesign) {
                    if (data.previewFront) updateData.hinhanhFront = data.previewFront;
                    if (data.previewBack) updateData.hinhanhBack = data.previewBack;
                }

                await this.cart.updateOne(
                    { _id: existed._id },
                    { $set: updateData }
                );

                // ✅ Phân biệt 2 tình huống:
                if (newQuantity > 10000) {
                    return {
                        success: true,
                        message: "⚠️ Đã đạt giới hạn tối đa 10.000 sản phẩm. Chỉ thêm đủ để đạt 10.000."
                    };
                } else {
                    return {
                        success: true,
                        message: "✅ Đã tăng số lượng và cập nhật ảnh thiết kế."
                    };
                }
            }

            // ================================
            // 🔄 2️⃣ Nếu sản phẩm chưa có trong giỏ
            // ================================
            await this.cart.insertOne({
                manguoidung: data.manguoidung,
                masanpham: data.masanpham,
                size: data.size,
                mausac: data.mausac,
                soluong: data.soluong,
                ...(data.madesign && { madesign: data.madesign }),
                ...(data.isThietKe && { isThietKe: true }),

                // ✅ Lưu ảnh thiết kế (nếu có)
                ...(data.previewFront && { hinhanhFront: data.previewFront }),
                ...(data.previewBack && { hinhanhBack: data.previewBack }),

                createdAt: new Date()
            });

            return { success: true, message: "✅ Đã thêm sản phẩm vào giỏ hàng." };

        } catch (err) {
            return { success: false, message: `❌ Lỗi hệ thống khi thêm giỏ hàng: ${err.message}` };
        }
    }


    async getCartByUserId(userId) {
        try {
            if (!ObjectId.isValid(userId)) {
                return { success: false, message: "❌ ID người dùng không hợp lệ." };
            }
            const uid = new ObjectId(userId);

            // 🛒 Lấy tất cả sản phẩm trong giỏ hàng
            const cartItems = await this.cart.find({ manguoidung: uid }).toArray();
            if (!cartItems.length) return [];

            // 🔄 Duyệt từng item trong giỏ
            const result = await Promise.all(
                cartItems.map(async (item) => {
                    // 📦 Lấy thông tin sản phẩm
                    const product = await this.sanpham.findOne({ _id: new ObjectId(item.masanpham) });

                    // 🎨 Nếu là sản phẩm thiết kế
                    if (item.isThietKe) {
                        // ✅ Nếu đã có cả front hoặc back => trả về đúng như hiện tại
                        if (item.hinhanhFront || item.hinhanhBack) {
                            return {
                                _id: item._id,
                                manguoidung: item.manguoidung,
                                masanpham: item.masanpham,
                                soluong: item.soluong,
                                size: item.size,
                                mausac: item.mausac,
                                madesign: item.madesign || null,
                                tensanpham: product?.tensanpham || "Sản phẩm thiết kế",
                                giasanpham: product?.giasanpham ?? 400000,
                                hinhanhFront: item.hinhanhFront || null,
                                hinhanhBack: item.hinhanhBack || null,
                                designLink: product ? `${product.loaisanpham}/${item.madesign}` : null
                            };
                        }

                        // ✅ Nếu KHÔNG có hình ảnh thiết kế → fallback giống sản phẩm thường
                        const color = typeof item.mausac === "string" ? item.mausac.trim().toUpperCase() : null;
                        let image = await this.hinhanhsanpham.findOne({
                            masanpham: item.masanpham,
                            mau: color,
                            vitri: "front"
                        }) ||
                            await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, mau: color }) ||
                            await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, vitri: "front" }) ||
                            await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, vitri: "back" });

                        let imageSrc = null;
                        if (image?.data?.buffer) {
                            const base64 = image.data.buffer.toString("base64");
                            imageSrc = `data:${image.contentType};base64,${base64}`;
                        }

                        return {
                            _id: item._id,
                            manguoidung: item.manguoidung,
                            masanpham: item.masanpham,
                            soluong: item.soluong,
                            size: item.size,
                            mausac: item.mausac,
                            madesign: item.madesign || null,
                            tensanpham: product?.tensanpham || "Sản phẩm thiết kế",
                            giasanpham: product?.giasanpham ?? 400000,
                            hinhanh: imageSrc, // 🔄 fallback sang field hinhanh
                            designLink: product ? `${product.loaisanpham}/${item.madesign}` : null
                        };
                    }

                    // 🖼 Nếu là sản phẩm thường -> tìm ảnh trong `hinhanhsanpham`
                    const color = typeof item.mausac === "string" ? item.mausac.trim().toUpperCase() : null;
                    let image = await this.hinhanhsanpham.findOne({
                        masanpham: item.masanpham,
                        mau: color,
                        vitri: "front"
                    }) ||
                        await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, mau: color }) ||
                        await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, vitri: "front" }) ||
                        await this.hinhanhsanpham.findOne({ masanpham: item.masanpham, vitri: "back" });

                    let imageSrc = null;
                    if (image?.data?.buffer) {
                        const base64 = image.data.buffer.toString("base64");
                        imageSrc = `data:${image.contentType};base64,${base64}`;
                    }

                    return {
                        _id: item._id,
                        manguoidung: item.manguoidung,
                        masanpham: item.masanpham,
                        soluong: item.soluong,
                        size: item.size,
                        mausac: item.mausac,
                        madesign: null,
                        tensanpham: product?.tensanpham || null,
                        giasanpham: product?.giasanpham || null,
                        hinhanh: imageSrc
                    };
                })
            );

            return result;
        } catch (err) {
            return { success: false, message: `❌ Lỗi khi lấy giỏ hàng: ${err.message}` };
        }
    }


    async increaseQuantity(cartId) {
        try {
            if (!ObjectId.isValid(cartId)) return { success: false, message: "❌ ID giỏ hàng không hợp lệ." };
            const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
            if (!item) return { success: false, message: "❌ Không tìm thấy sản phẩm." };

            if (item.soluong >= 10000) {
                return { success: false, message: "⚠️ Số lượng tối đa là 10.000." };
            }

            await this.cart.updateOne({ _id: item._id }, { $inc: { soluong: 1 } });
            return { success: true, message: "✅ Đã tăng số lượng." };
        } catch (err) {
            return { success: false, message: `❌ Lỗi khi tăng số lượng: ${err.message}` };
        }
    }

    async decreaseQuantity(cartId) {
        try {
            if (!ObjectId.isValid(cartId)) return { success: false, message: "❌ ID giỏ hàng không hợp lệ." };

            const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
            if (!item) return { success: false, message: "❌ Không tìm thấy sản phẩm." };

            if (item.isThietKe || item.madesign) {
                if (item.soluong <= 50) {
                    return { success: false, message: "⚠️ Sản phẩm thiết kế tối thiểu là 50." };
                }
            }

            if (item.soluong > 1) {
                await this.cart.updateOne({ _id: item._id }, { $inc: { soluong: -1 } });
                return { success: true, message: "✅ Đã giảm số lượng." };
            } else {
                await this.cart.deleteOne({ _id: item._id });
                return { success: true, message: "🗑️ Đã xóa sản phẩm khỏi giỏ hàng." };
            }
        } catch (err) {
            return { success: false, message: `❌ Lỗi khi giảm số lượng: ${err.message}` };
        }
    }

    async updateQuantity(cartId, quantity) {
        try {
            if (!ObjectId.isValid(cartId))
                return { success: false, message: "❌ ID giỏ hàng không hợp lệ." };

            const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
            if (!item)
                return { success: false, message: "❌ Không tìm thấy sản phẩm." };

            if (quantity > 10000) quantity = 10000;

            if (quantity === 0) {
                await this.cart.deleteOne({ _id: new ObjectId(cartId) });
                return { success: true, message: "🗑️ Đã xóa sản phẩm khỏi giỏ hàng." };
            }

            if ((item.isThietKe || item.madesign) && quantity < 50) {
                return { success: false, message: "⚠️ Sản phẩm thiết kế tối thiểu số lượng là 50." };
            }

            const result = await this.cart.updateOne(
                { _id: new ObjectId(cartId) },
                { $set: { soluong: quantity } }
            );

            if (result.matchedCount === 0) {
                return { success: false, message: "❌ Không tìm thấy sản phẩm." };
            }

            if (result.modifiedCount === 0) {
                // ✅ Có match, nhưng số lượng không thay đổi
                return { success: true, message: "⚠️ Số lượng không thay đổi (đã giống trước đó)." };
            }

            return { success: true, message: "✅ Cập nhật số lượng thành công." };
        } catch (err) {
            return { success: false, message: `❌ Lỗi khi cập nhật số lượng: ${err.message}` };
        }
    }

}

module.exports = CartService;
