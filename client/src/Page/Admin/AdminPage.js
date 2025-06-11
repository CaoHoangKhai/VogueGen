import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders28days: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://localhost:4000/admin/dashboard")
      .then((response) => {
        setDashboardData({
          totalCustomers: response.data.totalCustomers || 0,
          totalProducts: response.data.totalProducts || 0,
          totalOrders28days: response.data.totalOrders28days || 0,
        });
      })
      .catch((error) => {
        setError("Lỗi khi tải dữ liệu dashboard");
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <h4>Đang tải dữ liệu...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center text-danger">
        <h4>{error}</h4>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-4">Trang Quản Trị Admin</h2>

        <div className="row text-center">
          <div className="col-6 col-md-3 mb-3">
            <div className="border p-3 rounded shadow-sm bg-light">
              <strong>Số lượng khách hàng</strong>
              <div style={{ fontSize: "24px", marginTop: "8px" }}>
                {dashboardData.totalCustomers}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="border p-3 rounded shadow-sm bg-light">
              <strong>Số lượng sản phẩm</strong>
              <div style={{ fontSize: "24px", marginTop: "8px" }}>
                {dashboardData.totalProducts}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3 mb-3">
            <div className="border p-3 rounded shadow-sm bg-light">
              <strong>Số đơn hàng (28 ngày)</strong>
              <div style={{ fontSize: "24px", marginTop: "8px" }}>
                {dashboardData.totalOrders28days}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
