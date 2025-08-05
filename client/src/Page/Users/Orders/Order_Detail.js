import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderDetailById, cancelOrder } from "../../../api/Order/order.api";
import { colors } from "../../../config/colors";

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getColorName = (code) => {
        if (!code) return "Không rõ";
        const found = colors.find(c => c.code.toLowerCase() === code.toLowerCase());
        return found ? found.color : code;
    };

    const isLightColor = (hex) => {
        if (!hex || hex.length !== 7 || !hex.startsWith("#")) return false;
        const c = hex.substring(1);
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance > 200;
    };


    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const result = await getOrderDetailById(orderId);
                if (result.success) {
                    setOrder(result.data);
                    setError(null);
                } else {
                    setError(result.message || "Không thể lấy chi tiết đơn hàng.");
                }
            } catch {
                setError("Lỗi khi gọi API.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này không?")) return;

        try {
            const res = await cancelOrder(orderId);
            if (res.success) {
                alert("✅ Huỷ đơn hàng thành công.");
                setOrder(prev => ({
                    ...prev,
                    trangthai: 4,
                    trangthaidonhang: "Đã huỷ",
                    class: "bg-danger text-white"
                }));
            } else {
                alert(res.message || "❌ Không thể huỷ đơn hàng.");
            }
        } catch (error) {
            console.error("❌ Lỗi khi huỷ đơn:", error);
            alert("Lỗi không xác định khi huỷ đơn hàng.");
        }
    };
    // ✅ Hàm mở ảnh base64 an toàn
    const openBase64Image = (base64Data) => {
        if (!base64Data) return;

        // Tách header và phần data
        const arr = base64Data.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]); // giải mã base64
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        // Tạo Blob + URL tạm
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);

        // ✅ Mở tab mới
        window.open(url, "_blank");

        // 🧹 Giải phóng bộ nhớ sau 1 phút
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    return (
        <div className="container">
            <div className="card shadow-sm p-4">
                <h4 className="text-center mb-4">Chi Tiết Đơn Hàng</h4>

                {loading ? (
                    <p className="text-center">Đang tải dữ liệu...</p>
                ) : error ? (
                    <p className="text-danger text-center">Lỗi: {error}</p>
                ) : order ? (
                    <>
                        {/* PHẦN 1: Thông tin đơn hàng */}
                        <div className="mb-4 border rounded p-3 bg-light">
                            <h5 className="mb-3 text-primary">Thông tin đơn hàng</h5>
                            <div className="row">
                                <div className="col-md-6 mb-2"><strong>Mã đơn hàng:</strong> {order.madonhang}</div>
                                {order && (
                                    <div className="col-md-6 mb-2">
                                        <strong>Ngày đặt (UTC):</strong>{" "}
                                        {new Date(order.ngaydat).toISOString().replace("T", " ").slice(0, 19)}
                                    </div>
                                )}
                                <div className="col-md-6 mb-2"><strong>Họ tên:</strong> {order.hoten}</div>
                                <div className="col-md-6 mb-2"><strong>Số điện thoại:</strong> {order.sodienthoai}</div>
                                <div className="col-md-6 mb-2">
                                    <strong>Địa chỉ:</strong> {(order.diachinguoidung)}
                                </div>
                                <div className="col-md-6 mb-2"><strong>Ghi chú:</strong> {order.ghichu || "Không có"}</div>
                                <div className="col-md-6 mb-2">
                                    <strong>Phương thức thanh toán:</strong> {order.phuongthucthanhtoan?.toUpperCase()}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Trạng thái:</strong>{" "}
                                    <span className={`badge ${order.class}`}>
                                        {order.trangthaidonhang || "Không rõ"}
                                    </span>
                                </div>

                                {order.trangthai === 1 && (
                                    <div className="col-md-6 mb-2">
                                        <button className="btn btn-outline-danger btn-sm mt-1" onClick={handleCancelOrder}>
                                            ❌ Hủy đơn hàng
                                        </button>
                                    </div>
                                )}

                                <div className="col-md-6 mb-2">
                                    <strong>Tổng tiền:</strong> {order.tongtien.toLocaleString()}đ
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 2: Danh sách sản phẩm */}
                        <div className="border rounded p-3 bg-white">
                            <h5 className="mb-3 text-success">Chi tiết sản phẩm</h5>
                            <table className="table table-bordered table-hover text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Mã SP</th>
                                        <th>Hình ảnh</th> {/* ✅ thêm cột hình ảnh */}
                                        <th>Tên sản phẩm</th>
                                        <th>Loại</th>
                                        <th>Màu sắc</th>
                                        <th>Size</th>
                                        <th>Số lượng</th>
                                        <th>Giá tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.chitiet.map((item, index) => {
                                        const colorName = getColorName(item.mausanpham);
                                        const isLight = isLightColor(item.mausanpham);
                                        const productLink = item.designLink
                                            ? `http://localhost:3000/design/${item.designLink}`
                                            : `http://localhost:3000/products/detail/${item.masanpham}`;

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.masanpham}</td>

                                                {/* ✅ Hiển thị hình ảnh */}
                                                <td>
                                                    {item.isThietKe ? (
                                                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                                                            {item.hinhanhFront && (
                                                                <img
                                                                    src={item.hinhanhFront}
                                                                    alt="Front"
                                                                    style={{
                                                                        width: 50,
                                                                        height: 50,
                                                                        border: "1px solid #ddd",
                                                                        borderRadius: 4,
                                                                        objectFit: "cover",
                                                                        cursor: "zoom-in",
                                                                    }}
                                                                    onClick={() => openBase64Image(item.hinhanhFront)} // ✅ dùng hàm mới
                                                                />
                                                            )}
                                                            {item.hinhanhBack && (
                                                                <img
                                                                    src={item.hinhanhBack}
                                                                    alt="Back"
                                                                    style={{
                                                                        width: 50,
                                                                        height: 50,
                                                                        border: "1px solid #ddd",
                                                                        borderRadius: 4,
                                                                        objectFit: "cover",
                                                                        cursor: "zoom-in",
                                                                    }}
                                                                    onClick={() => openBase64Image(item.hinhanhBack)} // ✅ dùng hàm mới
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        item.hinhanh && (
                                                            <img
                                                                src={item.hinhanh}
                                                                alt={item.tensanpham}
                                                                style={{
                                                                    width: 50,
                                                                    height: 50,
                                                                    border: "1px solid #ddd",
                                                                    borderRadius: 4,
                                                                    objectFit: "cover",
                                                                    cursor: "zoom-in",
                                                                }}
                                                                onClick={() => openBase64Image(item.hinhanh)} // ✅ dùng hàm mới
                                                            />
                                                        )
                                                    )}
                                                </td>

                                                <td>
                                                    <Link to={productLink} target="_blank">
                                                        {item.tensanpham}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${item.isThietKe ? "bg-info text-dark" : "bg-secondary"}`}
                                                    >
                                                        {item.isThietKe ? "Thiết kế riêng" : "Sản phẩm tiêu chuẩn"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <span
                                                            style={{
                                                                backgroundColor: item.mausanpham,
                                                                display: "inline-block",
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: "50%",
                                                                border: isLight ? "1px solid #333" : "1px solid #ccc",
                                                            }}
                                                            title={colorName}
                                                        ></span>
                                                        <span>{colorName}</span>
                                                    </div>
                                                </td>
                                                <td>{item.size}</td>
                                                <td>{item.soluong}</td>
                                                <td>{item.giatien.toLocaleString()}đ</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p className="text-center">Không tìm thấy thông tin đơn hàng.</p>
                )}
            </div>
        </div>
    );
};

export default OrderDetail;
