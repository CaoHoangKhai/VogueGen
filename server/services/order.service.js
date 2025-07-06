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

    extractOrderDetailData(item) {
        return {
            masanpham: item.masanpham,
            soluong: item.soluong,
            mausanpham: item.mausanpham || item.mausac || item.color || null,
            size: item.size,
            giatien: item.giatien
        };
    }

    async createOrder(payload) {
        try {
            const orderData = this.extractOrderData(payload);

            // Tạo đơn hàng chính
            const result = await this.donhang.insertOne(orderData);
            const madonhang = result.insertedId.toString();

            // Gắn lại mã đơn hàng
            await this.donhang.updateOne({ _id: result.insertedId }, { $set: { madonhang } });

            const details = (payload.chitiet || []).map(item => ({
                ...this.extractOrderDetailData(item),
                madonhang
            }));

            if (details.length) {
                for (const d of details) {
                    if (!d.masanpham || !d.soluong || !d.mausanpham || !d.size || !d.giatien) {
                        throw new Error("Thông tin chi tiết đơn hàng không hợp lệ.");
                    }
                }

                await this.chitietdonhang.insertMany(details);
            }

            // Xoá giỏ hàng sau khi tạo đơn
            if (payload.manguoidung) {
                await this.giohang.deleteMany({ manguoidung: new ObjectId(payload.manguoidung) });
            }

            return {
                success: true,
                message: "Tạo đơn hàng thành công",
                orderId: madonhang
            };
        } catch (error) {
            console.error("❌ [createOrder] Lỗi:", error.message);
            return {
                success: false,
                message: "Tạo đơn hàng thất bại",
                error: error.message
            };
        }
    }

    async getAllOrdersSorted() {
        return await this.donhang.find().sort({ ngaydat: -1 }).toArray();
    }

    async getOrdersByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : null;

            const query = oid
                ? { $or: [{ manguoidung: oid }, { manguoidung: userId }] }
                : { manguoidung: userId };

            const data = await this.donhang.find(query).sort({ ngaydat: -1 }).toArray();
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                message: "Không thể lấy đơn hàng.",
                error: error.message
            };
        }
    }

    async getOrderByIdWithDetails(orderId) {
        try {
            if (!orderId) throw new Error("Thiếu mã đơn hàng.");

            const query = ObjectId.isValid(orderId)
                ? { $or: [{ _id: new ObjectId(orderId) }, { madonhang: orderId }] }
                : { madonhang: orderId };

            const order = await this.donhang.findOne(query);

            if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

            const chitiet = await this.chitietdonhang.find({ madonhang: order.madonhang }).toArray();

            return {
                success: true,
                data: { ...order, chitiet }
            };
        } catch (error) {
            return {
                success: false,
                message: "Không thể lấy chi tiết đơn hàng.",
                error: error.message
            };
        }
    }


    // Lấy đơn hàng trong 28 ngày gần nhất
    async getOrdersInLast28Days() {
        try {
            const now = new Date();
            const past28Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

            const orders = await this.donhang
                .find({ ngaydat: { $gte: past28Days } })
                .sort({ ngaydat: -1 })
                .toArray();

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            console.error("❌ [getOrdersInLast28Days] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể lấy đơn hàng trong 28 ngày.",
                error: error.message
            };
        }
    }

    // Lấy tổng doanh thu trong 28 ngày gần nhất
    async getRevenueInLast28Days() {
        try {
            const now = new Date();
            const past28Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

            const result = await this.donhang.aggregate([
                {
                    $match: { ngaydat: { $gte: past28Days } }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$tongtien" }
                    }
                }
            ]).toArray();

            const total = result[0]?.totalRevenue || 0;

            return {
                success: true,
                totalRevenue: total
            };
        } catch (error) {
            console.error("❌ [getRevenueInLast28Days] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể tính tổng doanh thu.",
                error: error.message
            };
        }
    }

    // Lấy 5 đơn hàng mới nhất đã xác nhận
    async getLatestConfirmedOrders(limit = 5) {
        try {
            const orders = await this.donhang.find({ trangthai: 1 })
                .sort({ ngaydat: -1 }) // Mới nhất trước
                .limit(limit)
                .toArray();

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            console.error("❌ [getLatestConfirmedOrders] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể lấy đơn hàng đã xác nhận.",
                error: error.message
            };
        }
    }


}

module.exports = OrderService;
