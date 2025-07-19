import { useEffect, useState } from "react";
import { getOrdersByUserId } from "../../../api/Order/order.api";
import { useNavigate } from "react-router-dom";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
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

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return (
        <div className="container py-4">
            <div className="card p-4 shadow-sm">
                <h4 className="text-center mb-4">Lịch Sử Đơn Hàng</h4>

                {loading ? (
                    <p className="text-center">Đang tải đơn hàng...</p>
                ) : error ? (
                    <p className="text-danger text-center">Lỗi: {error}</p>
                ) : orders.length === 0 ? (
                    <p className="text-center">Bạn chưa có đơn hàng nào.</p>
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
                                            <td>{order.diachinguoidung}</td>
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

                        {/* PHÂN TRANG */}
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
                                    className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
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
