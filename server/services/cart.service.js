const { ObjectId } = require("mongodb");

class CartService {
    constructor(client) {
        this.cart = client.db().collection("giohang");
        this.sanpham = client.db().collection("sanpham");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
    }

    extractCartData(payload) {
        return {
            manguoidung: ObjectId.isValid(payload.manguoidung) ? new ObjectId(payload.manguoidung) : null,
            masanpham: ObjectId.isValid(payload.masanpham) ? new ObjectId(payload.masanpham) : null,
            soluong: typeof payload.soluong === 'number' && payload.soluong > 0 ? payload.soluong : 1,
            size: payload.size ? payload.size.trim() : null,
            mausac: payload.mausac ? payload.mausac.trim() : null
        };
    }

    async getCartByUserId(userId) {
        if (!ObjectId.isValid(userId)) {
            throw new Error("ID người dùng không hợp lệ.");
        }

        const cartItems = await this.cart.find({ manguoidung: new ObjectId(userId) }).toArray();
        if (!cartItems.length) {
            throw new Error("Giỏ hàng trống hoặc không tìm thấy.");
        }

        // Lấy thông tin sản phẩm và hình ảnh cho từng item
        const result = await Promise.all(cartItems.map(async (item) => {
            // Lấy thông tin sản phẩm
            const product = await this.sanpham.findOne({ _id: item.masanpham });
            // Lấy hình ảnh đầu tiên (hoặc tất cả nếu muốn)
            const image = await this.hinhanhsanpham.findOne({ masanpham: item.masanpham });

            return {
                ...item,
                tensanpham: product ? product.tensanpham : null,
                giasanpham: product ? product.giasanpham : null,
                hinhanh: image ? `http://localhost:4000/images/${image.tenfile}` : null
            };
        }));

        return result;
    }
    async addToCart(payload) {
        const data = this.extractCartData(payload);
        if (!data.manguoidung || !data.masanpham || !data.size || !data.mausac) {
            throw new Error("Dữ liệu không hợp lệ.");
        }

        const existed = await this.cart.findOne({
            manguoidung: data.manguoidung,
            masanpham: data.masanpham,
            size: data.size,
            mausac: data.mausac
        });

        if (existed) {
            // Nếu sản phẩm với size & màu đã có trong giỏ, tăng số lượng
            await this.cart.updateOne(
                { _id: existed._id },
                { $inc: { soluong: data.soluong } }
            );
            return { message: "Đã cập nhật số lượng trong giỏ hàng." };
        } else {
            await this.cart.insertOne(data);
            return { message: "Đã thêm vào giỏ hàng." };
        }
    }


    async increaseQuantity(cartId) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");
        const result = await this.cart.updateOne(
            { _id: new ObjectId(cartId) },
            { $inc: { soluong: 1 } }
        );
        if (result.modifiedCount === 1) {
            return { success: true, message: "Đã tăng số lượng sản phẩm." };
        }
        return { success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng." };
    }

    async decreaseQuantity(cartId) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");
        const item = await this.cart.findOne({ _id: new ObjectId(cartId) });
        if (!item) return { success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng." };

        if (item.soluong > 1) {
            await this.cart.updateOne(
                { _id: new ObjectId(cartId) },
                { $inc: { soluong: -1 } }
            );
            return { success: true, message: "Đã giảm số lượng sản phẩm." };
        } else {
            await this.cart.deleteOne({ _id: new ObjectId(cartId) });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        }
    }

    async updateQuantity(cartId, quantity) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");
        if (typeof quantity !== "number" || quantity < 0) {
            throw new Error("Số lượng phải là số nguyên không âm.");
        }
        if (quantity === 0) {
            // Nếu số lượng là 0 thì xóa khỏi giỏ hàng
            await this.cart.deleteOne({ _id: new ObjectId(cartId) });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        } else {
            const result = await this.cart.updateOne(
                { _id: new ObjectId(cartId) },
                { $set: { soluong: quantity } }
            );
            if (result.modifiedCount === 1) {
                return { success: true, message: "Đã cập nhật số lượng sản phẩm." };
            }
            return { success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng." };
        }
    }
}

module.exports = CartService;
