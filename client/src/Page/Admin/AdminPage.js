import React, { useEffect, useState } from "react";
import { getDashboardData } from "../../api/Admin/products.api";
import { getLatestConfirmedOrders } from "../../api/Order/order.api";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ✅ Hàm fetch dữ liệu dashboard
function fetchDashboardData(setDashboardData, setLatestOrders, setError, setLoading) {
  const fetchData = async () => {
    try {
      const [dashboardRes, orderRes] = await Promise.all([
        getDashboardData(),
        getLatestConfirmedOrders(5),
      ]);

      console.log("📦 Kết quả gọi API đơn hàng:", orderRes);

      setDashboardData({
        totalCustomers: dashboardRes.totalCustomers || 0,
        totalProducts: dashboardRes.totalProducts || 0,
        totalOrders28days: dashboardRes.totalOrders28days || 0,
        totalRevenue28days: dashboardRes.totalRevenue28days || 0,
      });

      const orders = Array.isArray(orderRes) ? orderRes : [];
      setLatestOrders(orders);
    } catch (err) {
      console.error("❌ Lỗi khi tải dashboard:", err);
      setError("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}

// ✅ Hiển thị loading
function renderLoading() {
  return (
    <div className="container text-center mt-5">
      <h6>Đang tải dữ liệu...</h6>
    </div>
  );
}

// ✅ Hiển thị lỗi
function renderError(error) {
  return (
    <div className="container text-center mt-5 text-danger">
      <h6>{error}</h6>
    </div>
  );
}

// ✅ Hiển thị các thẻ thống kê
function renderStats(data) {
  return (
    <div className="row g-3">
      {renderStatCard("Khách hàng", data.totalCustomers, "text-primary", <FaUsers size={24} />)}
      {renderStatCard("Sản phẩm", data.totalProducts, "text-success", <FaBoxOpen size={24} />)}
      {renderStatCard("Đơn hàng (28 ngày)", data.totalOrders28days, "text-warning", <FaShoppingCart size={24} />)}
      {renderStatCard("Doanh thu (28 ngày)", data.totalRevenue28days, "text-danger", <FaMoneyBillWave size={24} />, true)}
    </div>
  );
}

// ✅ Component thẻ thống kê đơn lẻ
function renderStatCard(label, value, colorClass, icon, isMoney = false) {
  return (
    <div className="col-6 col-md-3" key={label}>
      <div className="card small-dashboard-card border-0 shadow-sm rounded-3">
        <div className="card-body text-center py-3">
          <div className="mb-1">{React.cloneElement(icon, { className: colorClass })}</div>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>{label}</div>
          <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
            {value.toLocaleString("vi-VN") + (isMoney ? "₫" : "")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Component chính
function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders28days: 0,
    totalRevenue28days: 0,
  });

  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetchDashboardData(setDashboardData, setLatestOrders, setError, setLoading);
  }, []);

  const handleViewOrder = (order) => {
    if (order && order._id) {
      navigate(`/admin/orders/${order._id}`); // <-- điều hướng đến chi tiết đơn hàng
    }
  };


  if (loading) return renderLoading();
  if (error) return renderError(error);

  return (
    <div className="container">
      {/* Hàng 1: Thống kê full row */}
      <div className="row">
        <div className="col-12">{renderStats(dashboardData)}</div>
      </div>

      {/* Hàng 2: Đơn hàng mới nhất chiếm 6/12 (có thể chỉnh) */}
      <div className="row">
        <div className="col-12 col-md-6">
          {renderLatestOrders(latestOrders, handleViewOrder)}
        </div>
      </div>
    </div>
  );
}

// ✅ Hiển thị bảng đơn hàng
function renderLatestOrders(orders, handleViewOrder) {
  return (
    <div className="card border-2 shadow-sm rounded-3 mt-4">
      <div className="card-header bg-white fw-bold text-center">Đơn hàng mới nhất</div>
      <div className="card-body p-3">
        {renderOrdersTable(orders, handleViewOrder)}
      </div>
    </div>
  );
}

// ✅ Bảng đơn hàng
function renderOrdersTable(orders, handleViewOrder) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return <div className="text-center">Không có đơn hàng nào.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm ">
        <thead className="table-light">
          <tr>
            <th>Ngày đặt</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{new Date(order.ngaydat).toLocaleDateString("vi-VN")}</td>
              <td>{order.hoten || "Ẩn danh"}</td>
              <td>{order.tongtien?.toLocaleString("vi-VN") + "₫"}</td>
              <td><span className="badge bg-success">Đã xác nhận</span></td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleViewOrder(order)}
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
