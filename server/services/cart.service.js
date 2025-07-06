const { ObjectId } = require("mongodb");

class CartService {
    constructor(client) {
        this.cart = client.db().collection("giohang");
        this.sanpham = client.db().collection("sanpham");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
    }

    extractCartData(payload) {
        return {
            manguoidung: new ObjectId(payload.manguoidung),
            masanpham: new ObjectId(payload.masanpham),
            soluong: payload.soluong || 1,
            size: payload.size,
            mausac: payload.mausac
        };
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

            let image = await this.hinhanhsanpham.findOne({ masanpham: productId, mau: color, vitri: "front" }) ||
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
                tensanpham: product?.tensanpham || null,
                giasanpham: product?.giasanpham || null,
                hinhanh: imageSrc
            };
        }));

        return result;
    }

    async addToCart(payload) {
        const data = this.extractCartData(payload);

        if (!data.manguoidung || !data.masanpham || !data.size || !data.mausac) {
            throw new Error("Thiếu dữ liệu giỏ hàng.");
        }

        const existed = await this.cart.findOne({
            manguoidung: data.manguoidung,
            masanpham: data.masanpham,
            size: data.size,
            mausac: data.mausac
        });

        if (existed) {
            await this.cart.updateOne({ _id: existed._id }, { $inc: { soluong: 1 } });
            return { success: true, message: "Đã tăng số lượng sản phẩm." };
        } else {
            await this.cart.insertOne({ ...data, soluong: 1 });
            return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng." };
        }
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

        if (item.soluong > 1) {
            await this.cart.updateOne({ _id: item._id }, { $inc: { soluong: -1 } });
            return { success: true, message: "Đã giảm số lượng." };
        } else {
            await this.cart.deleteOne({ _id: item._id });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        }
    }

    async updateQuantity(cartId, quantity) {
        if (!ObjectId.isValid(cartId)) throw new Error("ID giỏ hàng không hợp lệ.");
        if (quantity === 0) {
            await this.cart.deleteOne({ _id: new ObjectId(cartId) });
            return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng." };
        }

        const result = await this.cart.updateOne(
            { _id: new ObjectId(cartId) },
            { $set: { soluong: quantity } }
        );

        return result.modifiedCount === 1
            ? { success: true, message: "Cập nhật số lượng thành công." }
            : { success: false, message: "Không tìm thấy sản phẩm." };
    }
}

module.exports = CartService;
