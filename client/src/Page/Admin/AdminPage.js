import React, { useEffect, useState } from "react";
import {
  getDashboardData
} from "../../api/Admin/products.api";
import { getLatestConfirmedOrders } from "../../api/Order/order.api";
import { getTopSellingProducts } from "../../api/Product/product.api";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
// ✅ Hàm fetch dữ liệu dashboard
function fetchDashboardData(setDashboardData, setLatestOrders, setError, setLoading) {
  const fetchData = async () => {
    try {
      const [dashboardRes, orderRes] = await Promise.all([
        getDashboardData(),
        getLatestConfirmedOrders(5),
      ]);

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

// ✅ Cards thống kê
function renderStats(data) {
  return (
    <div className="row g-3">
      {renderStatCard("Khách hàng", data.totalCustomers, "text-primary", <FaUsers size={24} />, false, "/admin/users")}
      {renderStatCard("Sản phẩm", data.totalProducts, "text-success", <FaBoxOpen size={24} />, false, "/admin/products")}
      {renderStatCard("Đơn hàng (28 ngày)", data.totalOrders28days, "text-warning", <FaShoppingCart size={24} />, false, "/admin/orders")}
      {renderStatCard("Doanh thu (28 ngày)", data.totalRevenue28days, "text-danger", <FaMoneyBillWave size={24} />, true, "/admin/orders")}
    </div>
  );
}

function renderStatCard(label, value, colorClass, icon, isMoney = false, to = "#") {
  return (
    <div className="col-6 col-md-3" key={label}>
      <Link to={to} style={{ textDecoration: "none" }}>
        <div className="card small-dashboard-card border-0 shadow-sm rounded-3 hover-card">
          <div className="card-body text-center py-3">
            <div className="mb-1">{React.cloneElement(icon, { className: colorClass })}</div>
            <div className="text-muted" style={{ fontSize: "0.85rem" }}>{label}</div>
            <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
              {value.toLocaleString("vi-VN") + (isMoney ? "₫" : "")}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ✅ Bảng đơn hàng mới nhất
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

function renderOrdersTable(orders, handleViewOrder) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return <div className="text-center">Không có đơn hàng nào.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm">
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
              <td>{order.trangthaidonhang}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewOrder(order)}>
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

// ✅ Bảng sản phẩm bán chạy
function renderTopSellingProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="card border-2 shadow-sm rounded-3 mt-4">
        <div className="card-header bg-white fw-bold text-center">Sản phẩm bán chạy</div>
        <div className="card-body text-center">Không có dữ liệu.</div>
      </div>
    );
  }

  return (
    <div className="card border-2 shadow-sm rounded-3 mt-4">
      <div className="card-header bg-white fw-bold text-center">🔥 Top sản phẩm bán chạy</div>
      <div className="card-body p-3">
        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="table-light">
              <tr>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Đã bán</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/products/detail/${p._id}`} style={{ textDecoration: "none" }}>
                      {p.tensanpham}
                    </Link>
                  </td>
                  <td>{p.giasanpham.toLocaleString("vi-VN")}₫</td>
                  <td className="text-center">{p.tong_soluong}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData(setDashboardData, setLatestOrders, setError, setLoading);

    getTopSellingProducts()
      .then((data) => setTopSellingProducts(data || []))
      .catch((err) => {
        console.error("❌ Lỗi khi lấy sản phẩm bán chạy:", err);
      });
  }, []);

  const handleViewOrder = (order) => {
    if (order && order._id) {
      navigate(`/admin/orders/${order._id}`);
    }
  };

  if (loading) return renderLoading();
  if (error) return renderError(error);

  return (
    <div className="container">
      {/* Hàng 1: Cards thống kê */}
      <div className="row">
        <div className="col-12">{renderStats(dashboardData)}</div>
      </div>

      {/* Hàng 2: Đơn hàng mới nhất và sản phẩm bán chạy */}
      <div className="row">
        <div className="col-12 col-md-7">{renderLatestOrders(latestOrders, handleViewOrder)}</div>
        <div className="col-12 col-md-5">{renderTopSellingProducts(topSellingProducts)}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
