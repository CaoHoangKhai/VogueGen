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
}

module.exports = OrderService;