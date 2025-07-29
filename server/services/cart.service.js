const { ObjectId } = require("mongodb");

class CartService {
    constructor(client) {
        this.cart = client.db().collection("giohang"); // sử dụng "giohang"
        this.sanpham = client.db().collection("sanpham");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
    }

    extractCartData(payload) {
        return {
            manguoidung: new ObjectId(payload.manguoidung),
            masanpham: new ObjectId(payload.masanpham),
            soluong: payload.soluong || 1,
            size: payload.size || null,
            mausac: payload.mausac || null,
            madesign: payload.madesign ? new ObjectId(payload.madesign) : null,
            mathietke: payload.mathietke ? new ObjectId(payload.mathietke) : null,
            isThietKe: payload.isThietKe || false
        };
    }

    async addToCart(payload) {
        const data = this.extractCartData(payload);

        if (!data.manguoidung || !data.masanpham || !data.size || !data.mausac) {
            throw new Error("Thiếu dữ liệu giỏ hàng.");
        }

        // Ưu tiên mathietke nếu chưa có madesign
        if (data.mathietke && !data.madesign) {
            data.madesign = data.mathietke;
        }

        const query = {
            manguoidung: data.manguoidung,
            masanpham: data.masanpham,
            size: data.size,
            mausac: data.mausac
        };

        if (data.madesign) {
            query.madesign = data.madesign;
        }

        const existed = await this.cart.findOne(query);

        if (existed) {
            await this.cart.updateOne({ _id: existed._id }, { $inc: { soluong: data.soluong } });
            return { success: true, message: "Đã tăng số lượng sản phẩm." };
        } else {
            await this.cart.insertOne({
                manguoidung: data.manguoidung,
                masanpham: data.masanpham,
                size: data.size,
                mausac: data.mausac,
                soluong: data.soluong,
                ...(data.madesign && { madesign: data.madesign }),
                ...(data.isThietKe && { isThietKe: true }),
                createdAt: new Date()
            });
            return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng." };
        }
    }

    async getCartByUserId(userId) {
        if (!ObjectId.isValid(userId)) throw new Error("ID người dùng không hợp lệ.");
        const uid = new ObjectId(userId);

        const cartItems = await this.cart.find({ manguoidung: uid }).toArray();
        if (!cartItems.length) return [];

        const result = await Promise.all(cartItems.map(async (item) => {
            const productId = new ObjectId(item.masanpham);
            const product = await this.sanpham.findOne({ _id: productId });

            const color = typeof item.mausac === "string" ? item.mausac.trim().toUpperCase() : null;

            let image = await this.hinhanhsanpham.findOne({
                masanpham: productId,
                mau: color,
                vitri: "front"
            }) ||
                await this.hinhanhsanpham.findOne({ masanpham: productId, mau: color }) ||
                await this.hinhanhsanpham.findOne({ masanpham: productId, vitri: "front" }) ||
                await this.hinhanhsanpham.findOne({ masanpham: productId, vitri: "back" });

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
                tensanpham: product?.tensanpham || null,
                giasanpham: product?.giasanpham || null,
                hinhanh: imageSrc
            };
        }));

        return result;
    }

    async increaseQuantity(cartId) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");
        const result = await this.cart.updateOne(
            { _id: new ObjectId(cartId) },
            { $inc: { soluong: 1 } }
        );

        return result.modifiedCount === 1
            ? { success: true, message: "Đã tăng số lượng." }
            : { success: false, message: "Không tìm thấy sản phẩm." };
    }

    async decreaseQuantity(cartId) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");

        const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
        if (!item) return { success: false, message: "Không tìm thấy sản phẩm." };

        // ✅ Trường hợp sản phẩm thiết kế (có madesign)
        if (item.isThietKe || item.madesign) {
            if (item.soluong <= 50) {
                return { success: false, message: "Sản phẩm thiết kế tối thiểu số lượng là 50." };
            } else {
                await this.cart.updateOne(
                    { _id: item._id },
                    { $inc: { soluong: -1 } }
                );
                return { success: true, message: "Đã giảm số lượng (thiết kế)." };
            }
        }
        if (item.soluong > 1) {
            await this.cart.updateOne(
                { _id: item._id },
                { $inc: { soluong: -1 } }
            );
            return { success: true, message: "Đã giảm số lượng." };
        } else {
            await this.cart.deleteOne({ _id: item._id });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        }
    }


    async updateQuantity(cartId, quantity) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");

        // ✅ Lấy thông tin sản phẩm trong giỏ hàng
        const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
        if (!item) return { success: false, message: "Không tìm thấy sản phẩm." };

        // ✅ Nếu số lượng nhập là 0 → xóa khỏi giỏ
        if (quantity === 0) {
            await this.cart.deleteOne({ _id: new ObjectId(cartId) });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        }

        // ✅ Trường hợp sản phẩm thiết kế: không cho phép số lượng < 50
        if ((item.isThietKe || item.madesign) && quantity < 50) {
            return { success: false, message: "⚠️ Sản phẩm thiết kế tối thiểu số lượng là 50." };
        }

        // ✅ Tiến hành cập nhật số lượng
        const result = await this.cart.updateOne(
            { _id: new ObjectId(cartId) },
            { $set: { soluong: quantity } }
        );

        return result.modifiedCount === 1
            ? { success: true, message: "✅ Cập nhật số lượng thành công." }
            : { success: false, message: "Không tìm thấy sản phẩm." };
    }

}

module.exports = CartService;
