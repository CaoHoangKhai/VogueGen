const { ObjectId } = require("mongodb");

class OrderService {
    constructor(client) {
        this.donhang = client.db().collection("donhang");
        this.chitietdonhang = client.db().collection("chitietdonhang");
        this.giohang = client.db().collection("giohang");
        this.trangthaidonhang = client.db().collection("trangthaidonhang");
        this.sanpham = client.db().collection("sanpham");
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
            giatien: item.giatien,
            designId: item.designId || null  // nếu có design
        };
    }

    async createOrder(payload) {
        try {
            console.log("📦 [createOrder] BẮT ĐẦU XỬ LÝ");
            console.log("📥 [createOrder] DỮ LIỆU CLIENT GỬI LÊN:", payload);

            // 1. Trích xuất dữ liệu đơn hàng
            const orderData = this.extractOrderData(payload);

            // 2. Tạo đơn hàng trong DB
            const result = await this.donhang.insertOne(orderData);
            const madonhang = result.insertedId.toString();

            // 3. Cập nhật lại mã đơn hàng (dễ truy vấn)
            await this.donhang.updateOne(
                { _id: result.insertedId },
                { $set: { madonhang } }
            );

            let details = [];

            // 4. Xử lý chi tiết đơn hàng
            if (Array.isArray(payload.chitiet) && payload.chitiet.length > 0) {
                // Nếu client gửi trực tiếp chi tiết đơn hàng (không phải từ giỏ hàng)
                details = payload.chitiet.map(item => ({
                    ...this.extractOrderDetailData(item),
                    madonhang,
                    madesign: item.madesign || null,
                    isThietKe: item.isThietKe || false
                }));
            } else {
                // Nếu không gửi `chitiet`, dùng dữ liệu từ giỏ hàng
                const giohangData = await this.giohang
                    .find({ manguoidung: new ObjectId(payload.manguoidung) })
                    .toArray();

                details = giohangData.map(item => ({
                    ...this.extractOrderDetailData(item),
                    madonhang,
                    madesign: item.madesign || null,
                    isThietKe: item.isThietKe || false
                }));
            }

            // 5. Kiểm tra chi tiết đơn hàng hợp lệ
            const isValidDetail = details.every(d =>
                d.masanpham && d.soluong && d.mausanpham && d.size && d.giatien
            );

            if (!isValidDetail || !details.length) {
                throw new Error("Thông tin chi tiết đơn hàng không hợp lệ.");
            }

            // 6. Chèn chi tiết đơn hàng vào DB
            await this.chitietdonhang.insertMany(details);

            // 7. Xoá giỏ hàng của người dùng (nếu có)
            await this.giohang.deleteMany({ manguoidung: new ObjectId(payload.manguoidung) });

            console.log("✅ [createOrder] TẠO ĐƠN HÀNG THÀNH CÔNG:", madonhang);
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
        try {
            const orders = await this.donhang.find().sort({ ngaydat: -1 }).toArray();

            const enrichedOrders = await Promise.all(
                orders.map(async (order) => {
                    const trangthaiInfo = await this.getTrangThaiDonHangInfo(order.trangthai);
                    return {
                        ...order,
                        ...trangthaiInfo
                    };
                })
            );

            return enrichedOrders;
        } catch (error) {
            console.error("❌ [getAllOrdersSorted] Lỗi:", error.message);
            return [];
        }
    }

    async getOrdersByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");

            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : null;

            const query = oid
                ? { $or: [{ manguoidung: oid }, { manguoidung: userId }] }
                : { manguoidung: userId };

            const orders = await this.donhang.find(query).sort({ ngaydat: -1 }).toArray();

            // Lấy danh sách mã trạng thái duy nhất từ đơn hàng
            const trangthaiList = [...new Set(orders.map(o => o.trangthai))];

            // Lấy thông tin trạng thái cho từng mã
            const statusMap = {};
            const trangthaiDocs = await this.trangthaidonhang
                .find({ trangthai: { $in: trangthaiList } })
                .toArray();

            for (const doc of trangthaiDocs) {
                statusMap[doc.trangthai] = {
                    trangthaidonhang: doc.ten,
                    class: doc.class
                };
            }

            // Gắn trạng thái vào từng đơn
            const enrichedOrders = orders.map(order => {
                const info = statusMap[order.trangthai] || {
                    trangthaidonhang: "Không rõ",
                    class: "bg-secondary text-white"
                };
                return {
                    ...order,
                    ...info
                };
            });

            return { success: true, data: enrichedOrders };

        } catch (error) {
            return {
                success: false,
                message: "Không thể lấy đơn hàng.",
                error: error.message
            };
        }
    }

    async getTrangThaiDonHangInfo(trangthai) {
        try {
            const trangthaiNumber = typeof trangthai === "string" ? parseInt(trangthai) : trangthai;

            const result = await this.trangthaidonhang.findOne({ trangthai: trangthaiNumber });

            if (!result) {
                return {
                    trangthaidonhang: "Không rõ",
                    class: "bg-secondary text-white"
                };
            }

            return {
                trangthaidonhang: result.ten,
                class: result.class
            };
        } catch (err) {
            console.error("❌ Lỗi lấy trạng thái đơn hàng:", err);
            return {
                trangthaidonhang: "Không rõ",
                class: "bg-secondary text-white"
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

            // Chuyển string -> ObjectId để truy vấn sanpham
            const masanphamList = chitiet.map(ct => new ObjectId(ct.masanpham));
            const sanphams = await this.sanpham.find({ _id: { $in: masanphamList } }).toArray();

            const sanphamMap = {};
            sanphams.forEach(sp => {
                sanphamMap[sp._id.toString()] = sp;
            });

            const chitietWithTen = chitiet.map(ct => {
                const sp = sanphamMap[ct.masanpham];
                return {
                    ...ct,
                    tensanpham: sp?.tensanpham || "Không rõ"
                };
            });

            // Lấy thông tin trạng thái
            const trangthaiInfo = await this.getTrangThaiDonHangInfo(order.trangthai);

            return {
                success: true,
                data: {
                    ...order,
                    chitiet: chitietWithTen,
                    ...trangthaiInfo
                }
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

    // Lấy 5 đơn hàng mới nhất đang chờ xác nhận
    async getLatestPendingOrders(limit = 5) {
        try {
            const orders = await this.donhang.find({ trangthai: 1 })
                .sort({ ngaydat: -1 })
                .limit(limit)
                .toArray();

            const enriched = await Promise.all(
                orders.map(async (order) => {
                    const statusInfo = await this.getTrangThaiDonHangInfo(order.trangthai);
                    return {
                        ...order,
                        ...statusInfo
                    };
                })
            );

            return { success: true, data: enriched };
        } catch (error) {
            console.error("❌ [getLatestPendingOrders] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể lấy đơn hàng đang chờ xác nhận.",
                error: error.message
            };
        }
    }
    // Lấy tổng số đơn hàng của người dùng
    async getTotalOrdersByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

            const count = await this.donhang.countDocuments({
                $or: [{ manguoidung: oid }, { manguoidung: userId }]
            });

            return {
                success: true,
                total: count
            };
        } catch (error) {
            console.error("❌ [getTotalOrdersByUserId] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể tính tổng đơn hàng.",
                error: error.message
            };
        }
    }

    // Tính tổng tiền đã tiêu của người dùng
    async getTotalSpentByUserId(userId) {
        try {
            if (!userId) throw new Error("Thiếu mã người dùng.");
            const oid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;

            const result = await this.donhang.aggregate([
                {
                    $match: {
                        $or: [
                            { manguoidung: oid },
                            { manguoidung: userId }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: "$tongtien" }
                    }
                }
            ]).toArray();

            const total = result[0]?.totalSpent || 0;

            return {
                success: true,
                totalSpent: total
            };
        } catch (error) {
            console.error("❌ [getTotalSpentByUserId] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể tính tổng tiền đã tiêu.",
                error: error.message
            };
        }
    }

    // Huỷ đơn hàng (chỉ khi trạng thái hiện tại là "Chờ xác nhận")
    async cancelOrder(orderId) {
        try {
            if (!orderId) throw new Error("Thiếu mã đơn hàng.");

            const query = ObjectId.isValid(orderId)
                ? { _id: new ObjectId(orderId) }
                : { madonhang: orderId };

            const order = await this.donhang.findOne(query);
            if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

            // Chỉ huỷ được nếu đơn hàng đang ở trạng thái "Chờ xác nhận" (1)
            if (order.trangthai !== 1) {
                return {
                    success: false,
                    message: "Chỉ có thể huỷ đơn hàng khi đang chờ xác nhận."
                };
            }

            await this.donhang.updateOne(query, {
                $set: { trangthai: 4 }
            });

            return {
                success: true,
                message: "Đơn hàng đã được huỷ thành công."
            };
        } catch (error) {
            console.error("❌ [cancelOrder] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể huỷ đơn hàng.",
                error: error.message
            };
        }
    }

    async updateTrangThaiDonHang(orderId, trangthai) {
        try {
            if (!orderId || typeof trangthai === 'undefined') {
                throw new Error("Thiếu thông tin mã đơn hàng hoặc trạng thái.");
            }

            const query = ObjectId.isValid(orderId)
                ? { _id: new ObjectId(orderId) }
                : { madonhang: orderId };

            const order = await this.donhang.findOne(query);
            if (!order) {
                return {
                    success: false,
                    message: "Không tìm thấy đơn hàng."
                };
            }

            const validStatuses = [1, 2, 3, 4]; // Chờ xác nhận, Đang giao, Hoàn tất, Đã huỷ
            if (!validStatuses.includes(parseInt(trangthai))) {
                return {
                    success: false,
                    message: "Trạng thái không hợp lệ."
                };
            }

            await this.donhang.updateOne(query, {
                $set: { trangthai: parseInt(trangthai) }
            });

            return {
                success: true,
                message: "Cập nhật trạng thái đơn hàng thành công."
            };
        } catch (error) {
            console.error("❌ [updateTrangThaiDonHang] Lỗi:", error.message);
            return {
                success: false,
                message: "Không thể cập nhật trạng thái đơn hàng.",
                error: error.message
            };
        }
    }
}

module.exports = OrderService;
