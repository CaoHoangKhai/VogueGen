const { ObjectId } = require("mongodb");

class OrderService {
    constructor(client) {
        this.donhang = client.db().collection("donhang");
        this.chitietdonhang = client.db().collection("chitietdonhang");
        this.giohang = client.db().collection("giohang");
    }

    extractOrderData(payload) {
        const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
        return {
            manguoidung: payload.manguoidung,
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            diachinguoidung: payload.diachinguoidung,
            ghichu: payload.ghichu,
            tongtien: payload.tongtien,
            ngaydat: nowVN,
            phuongthucthanhtoan: payload.phuongthucthanhtoan,
            trangthai: 1
        };
    }

    extractOrderDetailData(payload) {
        return {
            madonhang: payload.madonhang,
            masanpham: payload.masanpham,
            soluong: payload.soluong,
            mausanpham: payload.mausanpham || payload.mausac || payload.color || null, // Ưu tiên lấy đúng trường
            size: payload.size,
            giatien: payload.giatien
        };
    }

    async createOrder(payload) {
        try {
            if (!payload) throw new Error("Thiếu thông tin đơn hàng.");

            const orderData = this.extractOrderData(payload);

            // Bước 1: Tạo đơn hàng
            const result = await this.donhang.insertOne(orderData);
            const madonhang = result.insertedId.toString();
            orderData.madonhang = madonhang;

            // Cập nhật madonhang vào đơn hàng đã tạo
            await this.donhang.updateOne(
                { _id: result.insertedId },
                { $set: { madonhang: madonhang } }
            );

            const orderDetails = Array.isArray(payload.chitiet) ? payload.chitiet : [];

            // Bước 2: Xử lý chi tiết đơn hàng
            if (orderDetails.length > 0) {
                const detailDocs = [];

                for (const item of orderDetails) {
                    const detail = {
                        ...this.extractOrderDetailData(item),
                        madonhang: madonhang,
                    };

                    // Kiểm tra không có trường nào là null
                    if (!detail.masanpham || !detail.soluong || !detail.size || !detail.mausanpham || !detail.giatien) {
                        throw new Error("Thông tin chi tiết đơn hàng không hợp lệ.");
                    }

                    detailDocs.push(detail);
                }

                await this.chitietdonhang.insertMany(detailDocs);
            }

            // Bước 3: Xoá giỏ hàng của người dùng
            if (!payload.manguoidung) throw new Error("Thiếu mã người dùng để xoá giỏ hàng.");
            await this.giohang.deleteMany({ manguoidung: new ObjectId(payload.manguoidung) });

            return {
                success: true,
                message: "Tạo đơn hàng thành công",
                orderId: madonhang
            };
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error.message);
            return {
                success: false,
                message: "Tạo đơn hàng thất bại",
                error: error.message
            };
        }
    }

    async getAllOrdersSorted() {
        // Lấy tất cả đơn hàng, sắp xếp theo thời gian giảm dần (mới nhất trước)
        const orders = await this.donhang.find().sort({ ngaydat: -1 }).toArray();
        return orders;
    }


    async getOrdersByUserId(userId) {
        try {
            if (!userId) {
                throw new Error("Thiếu mã người dùng.");
            }

            // Thử chuyển userId thành ObjectId, nếu không được thì để nguyên
            let objectUserId = null;
            try {
                objectUserId = new ObjectId(userId);
            } catch (e) {
                console.warn("userId không phải ObjectId hợp lệ, sẽ tìm bằng string.");
            }

            // Truy vấn theo cả ObjectId và string (nếu có)
            const query = objectUserId
                ? { $or: [{ manguoidung: userId }, { manguoidung: objectUserId }] }
                : { manguoidung: userId };

            const orders = await this.donhang
                .find(query)
                .sort({ ngaydat: -1 })
                .toArray();

            return {
                success: true,
                data: orders,
            };
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng theo người dùng:", error.message);
            return {
                success: false,
                message: "Không thể lấy đơn hàng.",
                error: error.message,
            };
        }
    }
    async getOrderByIdWithDetails(orderId) {
        try {
            if (!orderId) throw new Error("Thiếu mã đơn hàng.");

            const objectOrderId = new ObjectId(orderId);

            // 1. Lấy thông tin đơn hàng
            const order = await this.donhang.findOne({ _id: objectOrderId });

            if (!order) {
                return {
                    success: false,
                    message: "Không tìm thấy đơn hàng."
                };
            }

            // 2. Lấy chi tiết đơn hàng
            const orderDetails = await this.chitietdonhang
                .find({ madonhang: orderId })
                .toArray();

            return {
                success: true,
                data: {
                    ...order,
                    chitiet: orderDetails
                }
            };
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error.message);
            return {
                success: false,
                message: "Không thể lấy chi tiết đơn hàng.",
                error: error.message
            };
        }
    }


}

module.exports = OrderService;