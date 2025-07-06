import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetailById } from "../../../api/Order/order.api";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { colors } from "../../../config/colors";
const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const getColorName = (code) => {
    if (!code) return "Không rõ";
    const found = colors.find(c => c.code.toLowerCase() === code.toLowerCase());
    return found ? found.color : code;
  };
  useEffect(() => {
    const fetchOrder = async () => {
      console.log("📦 orderId:", orderId);
      setLoading(true);
      try {
        const res = await getOrderDetailById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError("Không tìm thấy đơn hàng.");
        }
      } catch (err) {
        console.error("❌ Lỗi tải đơn hàng:", err);
        setError("Lỗi khi tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);
  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return { label: "Chờ xác nhận", className: "bg-warning" };
      case 2:
        return { label: "Đang giao", className: "bg-info" };
      case 3:
        return { label: "Hoàn tất", className: "bg-success" };
      case 4:
        return { label: "Đã huỷ", className: "bg-danger" };
      default:
        return { label: "Không rõ", className: "bg-secondary" };
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header text-center text-dark">
          <h4>Chi Tiết Đơn Hàng</h4>
        </div>
        <div className="card-body">
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {order && (
            <>
              {/* Thông tin đơn hàng */}
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
                  <p><strong>Trạng thái:</strong>{" "}
                    {(() => {
                      const status = renderStatus(order.trangthai);
                      return (
                        <p>
                          <strong>Trạng thái:</strong>{" "}
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </p>
                      );
                    })()}
                  </p>
                  <p><strong>Tổng tiền:</strong> {order.tongtien.toLocaleString("vi-VN")}₫</p>
                </div>
              </div>

              {/* Ghi chú nếu có */}
              {order.ghichu && (
                <div className="mb-4">
                  <strong>Ghi chú:</strong> <em>{order.ghichu}</em>
                </div>
              )}

              {/* Chi tiết sản phẩm */}
              <hr />
              <h5 className="mt-4">Danh sách sản phẩm</h5>
              <table className="table table-bordered mt-3 text-center">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Mã sản phẩm</th>
                    <th>Màu</th>
                    <th>Size</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.chitiet.map((item, index) => {
                    const colorName = getColorName(item.mausanpham);

                    return (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.masanpham}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                backgroundColor: item.mausanpham,
                                border: "1px solid #ccc",
                                borderRadius: "50%",
                              }}
                              title={colorName}
                            />
                            <span style={{ fontSize: 13 }}>{colorName}</span>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>{item.soluong}</td>
                        <td>{item.giatien.toLocaleString("vi-VN")}₫</td>
                      </tr>
                    );
                  })}
                  {order.chitiet.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Không có sản phẩm nào.
                      </td>
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
