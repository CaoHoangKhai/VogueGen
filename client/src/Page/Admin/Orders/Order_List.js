import React, { useEffect, useState } from "react";
import { getAllOrders } from "../../../api/Order/order.api";
import { useNavigate } from "react-router-dom";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("vi-VN");
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
        setError("");
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };
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

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header text-dark text-center">
          <h4>Danh Sách Đơn Hàng</h4>
        </div>

        <div className="card-body">
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light text-center">
                  <tr>
                    <th>Mã</th>
                    <th>Khách</th>
                    <th>Tiền</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = renderStatus(order.trangthai);

                    return (
                      <tr key={order._id} className="align-middle text-center">
                        <td>{order.madonhang.slice(0, 6)}...</td>
                        <td>{order.hoten}</td>
                        <td>{order.tongtien.toLocaleString("vi-VN")}₫</td>
                        <td>{formatDate(order.ngaydat)}</td>
                        <td>
                          <span className={`badge ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetail(order._id)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Không có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
