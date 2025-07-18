import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetailById, updateOrderStatus } from "../../../api/Order/order.api";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { colors } from "../../../config/colors";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getOrderDetailById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
        setStatusUpdate(res.data.trangthai);
      } else {
        setError("Không tìm thấy đơn hàng.");
      }
    } catch (err) {
      setError("Lỗi khi tải đơn hàng.");
      console.error("❌ Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getColorName = (code) => {
    const found = colors.find((c) => c.code.toLowerCase() === code?.toLowerCase());
    return found ? found.color : code || "Không rõ";
  };

  const handleStatusChange = (e) => {
    setStatusUpdate(Number(e.target.value));
  };

  const handleUpdateStatus = async () => {
    if (!window.confirm("Bạn có chắc muốn cập nhật trạng thái đơn hàng?")) return;
    if (statusUpdate === null || statusUpdate === undefined) {
      alert("⚠️ Bạn chưa chọn trạng thái mới.");
      return;
    }

    setUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, statusUpdate);
      if (res.success) {
        alert("✅ Cập nhật trạng thái thành công");
        fetchOrder(); // reload dữ liệu mới
      } else {
        alert(res.message || "❌ Không thể cập nhật trạng thái");
      }
    } catch (err) {
      alert("❌ Lỗi khi cập nhật trạng thái");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="container"><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header text-center text-dark">
          <h4>Chi Tiết Đơn Hàng</h4>
        </div>

        <div className="card-body">
          {order && (
            <>
              {/* Thông tin chung */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Mã đơn hàng:</strong> {order.madonhang}</p>
                  <p><strong>Khách hàng:</strong> {order.hoten}</p>
                  <p><strong>SĐT:</strong> {order.sodienthoai}</p>
                  <p><strong>Địa chỉ:</strong> {order.diachinguoidung}</p>
                </div>

                <div className="col-md-6">
                  <p><strong>Ngày đặt:</strong> {formatDate(order.ngaydat)}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.phuongthucthanhtoan === "cod" ? "Thanh toán khi nhận hàng" : order.phuongthucthanhtoan}</p>
                  <p>
                    <strong>Trạng thái hiện tại:</strong>{" "}
                    <span className={`badge ${order.class}`}>
                      {order.trangthaidonhang}
                    </span>
                  </p>

                  {/* Chỉ hiển thị nếu chưa hoàn tất hoặc chưa huỷ */}
                  {order.trangthai !== 3 && order.trangthai !== 4 && (
                    <div className="mt-2">
                      <label><strong>🛠 Cập nhật trạng thái</strong></label>
                      <div className="d-flex gap-2 align-items-center">
                        <select className="form-select" value={statusUpdate} onChange={handleStatusChange}>
                          <option value={1}>Chờ xác nhận</option>
                          <option value={2}>Đang giao</option>
                          <option value={3}>Hoàn tất</option>
                          <option value={4}>Đã huỷ</option>
                        </select>
                        <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating}>
                          {updating ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                      </div>
                    </div>
                  )}


                  <p className="mt-2"><strong>Tổng tiền:</strong> {order.tongtien.toLocaleString("vi-VN")}₫</p>
                </div>
              </div>

              {/* Ghi chú */}
              {order.ghichu && (
                <div className="mb-4">
                  <strong>Ghi chú:</strong> <em>{order.ghichu}</em>
                </div>
              )}

              <hr />
              <h5 className="mt-4">Danh sách sản phẩm</h5>

              {/* Bảng sản phẩm */}
              <table className="table table-bordered mt-3 text-center">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Màu</th>
                    <th>Size</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.chitiet.length > 0 ? (
                    order.chitiet.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.masanpham}</td>
                        <td>{item.tensanpham}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <div style={{
                              width: 20,
                              height: 20,
                              backgroundColor: item.mausanpham,
                              borderRadius: "50%",
                              border: "1px solid #ccc"
                            }} title={getColorName(item.mausanpham)} />
                            <span style={{ fontSize: 13 }}>{getColorName(item.mausanpham)}</span>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>{item.soluong}</td>
                        <td>{item.giatien.toLocaleString("vi-VN")}₫</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-muted">Không có sản phẩm nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
