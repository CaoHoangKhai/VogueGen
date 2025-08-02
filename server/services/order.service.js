const { ObjectId } = require("mongodb");

class OrderService {
    constructor(client) {
        this.donhang = client.db().collection("donhang");
        this.chitietdonhang = client.db().collection("chitietdonhang");
        this.giohang = client.db().collection("giohang");
        this.thietkecuanguoidung = client.db().collection("thietkecuanguoidung");
        this.sanpham = client.db().collection("sanpham");
        this.trangthaidonhang = client.db().collection("trangthaidonhang");
    }

    /* ===========================
       🔹 Helper Functions
    ============================*/

    // 🏷 Chuẩn hóa dữ liệu đơn hàng
    extractOrderData(payload) {
        const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000); // Giờ VN
        return {
            manguoidung: payload.manguoidung,
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            diachinguoidung: payload.diachinguoidung,
            ghichu: payload.ghichu,
            tongtien: payload.tongtien,
            ngaydat: nowVN,
            phuongthucthanhtoan: payload.phuongthucthanhtoan,
            trangthai: 1 // 1 = Chờ xác nhận
        };
    }

    // 🏷 Chuẩn hóa dữ liệu chi tiết đơn hàng
    extractOrderDetailData(item) {
        return {
            masanpham: item.masanpham,
            soluong: item.soluong,
            mausanpham: item.mausanpham || item.mausac || null,
            size: item.size,
            giatien: item.giatien
        };
    }

    /* ===========================
       🚀 CRUD Đơn Hàng
    ============================*/

    // 🚀 Tạo đơn hàng (ảnh từ client gửi lên)
    async createOrder(payload) {
        try {
            console.log("📦 [createOrder] BẮT ĐẦU XỬ LÝ");
            console.log("📥 DỮ LIỆU CLIENT GỬI LÊN:", payload);

            // 1️⃣ Tạo đơn hàng trong DB
            const orderData = this.extractOrderData(payload);
            const result = await this.donhang.insertOne(orderData);
            const madonhang = result.insertedId.toString();

            // 2️⃣ Gắn mã đơn hàng
            await this.donhang.updateOne({ _id: result.insertedId }, { $set: { madonhang } });

            // 3️⃣ Lấy chi tiết đơn hàng (từ client hoặc fallback giỏ hàng)
            let chitiet = Array.isArray(payload.chitiet) && payload.chitiet.length > 0
                ? payload.chitiet
                : await this.giohang.find({ manguoidung: new ObjectId(payload.manguoidung) }).toArray();

            if (!chitiet.length) throw new Error("Không có sản phẩm để tạo đơn hàng.");

            // 4️⃣ Chuẩn hóa dữ liệu & gắn ảnh
            const details = chitiet.map(item => ({
                ...this.extractOrderDetailData(item),
                madonhang,
                madesign: item.madesign || null,
                isThietKe: item.isThietKe || false,

                // 📌 Ưu tiên lấy ảnh client gửi
                hinhanh: item.hinhanh || null,
                hinhanhFront: item.hinhanhFront || null,
                hinhanhBack: item.hinhanhBack || null
            }));

            // 5️⃣ Lưu chi tiết đơn hàng
            await this.chitietdonhang.insertMany(details);

            // 6️⃣ Xoá giỏ hàng sau khi đặt hàng thành công
            await this.giohang.deleteMany({ manguoidung: new ObjectId(payload.manguoidung) });

            console.log("✅ [createOrder] TẠO ĐƠN HÀNG THÀNH CÔNG:", madonhang);
            return { success: true, message: "Tạo đơn hàng thành công", orderId: madonhang };

        } catch (error) {
            console.error("❌ [createOrder] Lỗi:", error.message);
            return { success: false, message: "Tạo đơn hàng thất bại", error: error.message };
        }
    }

    // 📜 Lấy tất cả đơn hàng (sort mới nhất)
    async getAllOrdersSorted() {
        try {
            const orders = await this.donhang.find().sort({ ngaydat: -1 }).toArray();
            const enrichedOrders = await Promise.all(
                orders.map(async (order) => ({
                    ...order,
                    ...(await this.getTrangThaiDonHangInfo(order.trangthai))
                }))
            );
            return enrichedOrders;
        } catch (error) {
            console.error("❌ [getAllOrdersSorted] Lỗi:", error.message);
            return [];
        }
    }

    // 📜 Lấy đơn hàng theo user
    async getOrdersByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

            const orders = await this.donhang.find({ $or: [{ manguoidung: oid }, { manguoidung: userId }] })
                .sort({ ngaydat: -1 }).toArray();

            const trangthaiList = [...new Set(orders.map(o => o.trangthai))];
            const trangthaiDocs = await this.trangthaidonhang.find({ trangthai: { $in: trangthaiList } }).toArray();

            const statusMap = {};
            trangthaiDocs.forEach(doc => {
                statusMap[doc.trangthai] = { trangthaidonhang: doc.ten, class: doc.class };
            });

            return {
                success: true,
                data: orders.map(o => ({
                    ...o,
                    ...(statusMap[o.trangthai] || { trangthaidonhang: "Không rõ", class: "bg-secondary text-white" })
                }))
            };
        } catch (error) {
            return { success: false, message: "Không thể lấy đơn hàng.", error: error.message };
        }
    }

    // 📜 Lấy chi tiết đơn hàng (gồm ảnh)
    async getOrderByIdWithDetails(orderId) {
        try {
            if (!orderId) throw new Error("Thiếu mã đơn hàng.");

            const query = ObjectId.isValid(orderId)
                ? { $or: [{ _id: new ObjectId(orderId) }, { madonhang: orderId }] }
                : { madonhang: orderId };

            const order = await this.donhang.findOne(query);
            if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

            const chitiet = await this.chitietdonhang.find({ madonhang: order.madonhang }).toArray();

            // Lấy tên sản phẩm
            const masanphamList = chitiet.map(ct => new ObjectId(ct.masanpham));
            const sanphams = await this.sanpham.find({ _id: { $in: masanphamList } }).toArray();
            const spMap = {};
            sanphams.forEach(sp => spMap[sp._id.toString()] = sp);

            const chitietWithTen = chitiet.map(ct => ({
                ...ct,
                tensanpham: spMap[ct.masanpham]?.tensanpham || "Không rõ"
            }));

            return {
                success: true,
                data: {
                    ...order,
                    chitiet: chitietWithTen,
                    ...(await this.getTrangThaiDonHangInfo(order.trangthai))
                }
            };
        } catch (error) {
            return { success: false, message: "Không thể lấy chi tiết đơn hàng.", error: error.message };
        }
    }

    /* ===========================
       📌 Trạng thái đơn hàng
    ============================*/

    async getTrangThaiDonHangInfo(trangthai) {
        try {
            const num = typeof trangthai === "string" ? parseInt(trangthai) : trangthai;
            const result = await this.trangthaidonhang.findOne({ trangthai: num });
            return result
                ? { trangthaidonhang: result.ten, class: result.class }
                : { trangthaidonhang: "Không rõ", class: "bg-secondary text-white" };
        } catch (err) {
            console.error("❌ Lỗi trạng thái:", err);
            return { trangthaidonhang: "Không rõ", class: "bg-secondary text-white" };
        }
    }

    async cancelOrder(orderId) {
        try {
            if (!orderId) throw new Error("Thiếu mã đơn hàng.");
            const query = ObjectId.isValid(orderId) ? { _id: new ObjectId(orderId) } : { madonhang: orderId };

            const order = await this.donhang.findOne(query);
            if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

            if (order.trangthai !== 1) {
                return { success: false, message: "Chỉ huỷ được đơn hàng đang chờ xác nhận." };
            }

            await this.donhang.updateOne(query, { $set: { trangthai: 4 } });
            return { success: true, message: "Đơn hàng đã huỷ thành công." };
        } catch (error) {
            console.error("❌ [cancelOrder] Lỗi:", error.message);
            return { success: false, message: "Không thể huỷ đơn hàng.", error: error.message };
        }
    }

    async updateTrangThaiDonHang(orderId, trangthai) {
        try {
            if (!orderId || typeof trangthai === "undefined") {
                throw new Error("Thiếu mã đơn hàng hoặc trạng thái.");
            }
            const query = ObjectId.isValid(orderId) ? { _id: new ObjectId(orderId) } : { madonhang: orderId };
            await this.donhang.updateOne(query, { $set: { trangthai: parseInt(trangthai) } });

            return { success: true, message: "Cập nhật trạng thái đơn hàng thành công." };
        } catch (error) {
            console.error("❌ [updateTrangThaiDonHang] Lỗi:", error.message);
            return { success: false, message: "Không thể cập nhật trạng thái.", error: error.message };
        }
    }

    /* ===========================
       📊 Report & Thống kê
    ============================*/

    async getOrdersInLast28Days() {
        try {
            const now = new Date();
            const past28Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
            const orders = await this.donhang.find({ ngaydat: { $gte: past28Days } }).sort({ ngaydat: -1 }).toArray();
            return { success: true, data: orders };
        } catch (error) {
            return { success: false, message: "Không thể lấy đơn hàng trong 28 ngày.", error: error.message };
        }
    }

    async getRevenueInLast28Days() {
        try {
            const now = new Date();
            const past28Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

            const result = await this.donhang.aggregate([
                { $match: { ngaydat: { $gte: past28Days } } },
                { $group: { _id: null, totalRevenue: { $sum: "$tongtien" } } }
            ]).toArray();

            return { success: true, totalRevenue: result[0]?.totalRevenue || 0 };
        } catch (error) {
            return { success: false, message: "Không thể tính tổng doanh thu.", error: error.message };
        }
    }

    async getLatestPendingOrders(limit = 5) {
        try {
            const orders = await this.donhang.find({ trangthai: 1 }).sort({ ngaydat: -1 }).limit(limit).toArray();
            const enriched = await Promise.all(orders.map(async (order) => ({
                ...order,
                ...(await this.getTrangThaiDonHangInfo(order.trangthai))
            })));
            return { success: true, data: enriched };
        } catch (error) {
            return { success: false, message: "Không thể lấy đơn hàng chờ xác nhận.", error: error.message };
        }
    }

    async getTotalOrdersByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
            const count = await this.donhang.countDocuments({ $or: [{ manguoidung: oid }, { manguoidung: userId }] });
            return { success: true, total: count };
        } catch (error) {
            return { success: false, message: "Không thể tính tổng đơn hàng.", error: error.message };
        }
    }

    async getTotalSpentByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

            const result = await this.donhang.aggregate([
                { $match: { $or: [{ manguoidung: oid }, { manguoidung: userId }] } },
                { $group: { _id: null, totalSpent: { $sum: "$tongtien" } } }
            ]).toArray();

            return { success: true, totalSpent: result[0]?.totalSpent || 0 };
        } catch (error) {
            return { success: false, message: "Không thể tính tổng tiền đã tiêu.", error: error.message };
        }
    }
}

module.exports = OrderService;
