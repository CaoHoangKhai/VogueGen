import React, { useEffect, useState } from "react";
import { getAllOrders } from "../../../api/Order/order.api";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return format(date, "dd/MM/yyyy HH:mm:ss");
};


const ORDERS_PER_PAGE = 8;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
        setFilteredOrders(data);
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

  useEffect(() => {
    let filtered = [...orders];

    if (searchName.trim()) {
      filtered = filtered.filter((o) =>
        o.hoten?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((o) => o.trangthai === Number(selectedStatus));
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // reset về trang đầu
  }, [searchName, selectedStatus, orders]);

  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header text-dark text-center">
          <h4>📋 Danh Sách Đơn Hàng</h4>
        </div>

        <div className="card-body">
          {/* Bộ lọc tìm kiếm */}
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm theo tên khách hàng..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value={1}>Chờ xác nhận</option>
                <option value={2}>Đang giao</option>
                <option value={3}>Hoàn tất</option>
                <option value={4}>Đã huỷ</option>
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchName("");
                  setSelectedStatus("");
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Bảng đơn hàng */}
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light text-center">
                    <tr>
                      <th className="col-3">Mã</th>
                      <th className="col-2">Khách</th>
                      <th className="col-1">Tiền</th>
                      <th className="col-2">Ngày</th>
                      <th className="col-1">Trạng thái</th>
                      <th className="col-1">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order._id} className="align-middle text-center">
                        <td>{order.madonhang}</td>
                        <td>{order.hoten}</td>
                        <td>{order.tongtien.toLocaleString("vi-VN")}₫</td>
                        <td>{formatDate(order.ngaydat)}</td>
                        <td>
                          <span className={`badge ${order.class}`}>
                            {order.trangthaidonhang}
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
                    ))}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          Không có đơn hàng nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                          &laquo;
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i}
                          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
