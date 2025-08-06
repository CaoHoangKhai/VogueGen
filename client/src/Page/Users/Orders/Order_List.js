import { useEffect, useState } from "react";
import { getOrdersByUserId } from "../../../api/Order/order.api";
import { useNavigate } from "react-router-dom";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const ordersPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser?._id) {
        fetchOrders(parsedUser._id);
      } else {
        setError("Không tìm thấy thông tin người dùng.");
        setLoading(false);
      }
    } else {
      setError("Bạn cần đăng nhập để xem đơn hàng.");
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (userId) => {
    try {
      const result = await getOrdersByUserId(userId);
      if (result.success) {
        setOrders(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } else {
        setError(result.message || "Không thể lấy danh sách đơn hàng.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi gọi API.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (madonhang) => {
    navigate(`/user/order_detail/${madonhang}`);
  };

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Lọc theo tên khách hàng, mã đơn và trạng thái
  const filteredOrders = orders.filter((order) => {
    const keyword = searchName.toLowerCase();
    const matchesNameOrId =
      order.madonhang?.toLowerCase().includes(keyword) ||
      order.hoten?.toLowerCase().includes(keyword);
    const matchesStatus = selectedStatus
      ? String(order.trangthai) === selectedStatus
      : true;

    return matchesNameOrId && matchesStatus;
  });

  // Phân trang sau khi lọc
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container">
      <div className="card p-4 shadow-sm">
        <h4 className="text-center mb-4">Lịch Sử Đơn Hàng</h4>

        {/* Tìm kiếm & Lọc trạng thái */}
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm theo tên khách hàng hoặc mã đơn hàng..."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="1">Chờ xác nhận</option>
              <option value="2">Đang giao</option>
              <option value="3">Hoàn tất</option>
              <option value="4">Đã huỷ</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchName("");
                setSelectedStatus("");
                setCurrentPage(1);
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        {loading ? (
          <p className="text-center">Đang tải đơn hàng...</p>
        ) : error ? (
          <p className="text-danger text-center">Lỗi: {error}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center">Không có đơn hàng phù hợp.</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center">
                <thead className="table-light">
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Họ Tên</th>
                    <th>Điện Thoại</th>
                    <th>Địa Chỉ</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order._id || order.madonhang}>
                      <td>{order.madonhang}</td>
                      <td>{order.hoten}</td>
                      <td>{order.sodienthoai}</td>
                      <td className="text-start">
                        {(() => {
                          const parts = order.diachinguoidung.split(",");
                          const first = parts[0]?.trim() || "";
                          const second = parts[1]?.trim() || "";
                          const rest = parts.slice(2).join(",").trim();

                          return (
                            <>
                              <div>{first}</div>
                              <div>{second}</div>
                              <div>{rest}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td>{formatCurrency(order.tongtien)}</td>
                      <td>
                        <span className={`badge ${order.class}`}>
                          {order.trangthaidonhang}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetail(order.madonhang)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="d-flex justify-content-center align-items-center mt-3 gap-2 flex-wrap">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`btn btn-sm ${
                    currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Tiếp →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;
