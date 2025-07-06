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
            if (parsedUser._id) {
                fetchOrders(parsedUser._id);
            } else {
                setError("Không tìm thấy userId.");
                setLoading(false);
            }
        } else {
            setError("Chưa đăng nhập.");
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
                setError(result.message || "Không thể lấy đơn hàng.");
            }
        } catch (err) {
            setError("Lỗi khi gọi API.");
        } finally {
            setLoading(false);
        }
    };

    const renderStatus = (status) => {
        switch (status) {
            case 1:
                return "Chờ xác nhận";
            case 2:
                return "Đang giao";
            case 3:
                return "Hoàn tất";
            case 4:
                return "Đã huỷ";
            default:
                return "Không rõ";
        }
    };

    const handleViewDetail = (madonhang) => {
        navigate(`/user/order_detail/${madonhang}`);
    };

    // PHÂN TRANG: cắt mảng orders hiện tại
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="container">
            <div className="card p-4 shadow-sm">
                <h4 className="text-center mb-3">Danh Sách Đơn Hàng</h4>

                {loading ? (
                    <p className="text-center">Đang tải dữ liệu...</p>
                ) : error ? (
                    <p className="text-danger text-center">Lỗi: {error}</p>
                ) : orders.length === 0 ? (
                    <p className="text-center">Chưa có đơn hàng nào.</p>
                ) : (
                    <>
                        <table className="table table-bordered table-hover text-center">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã Đơn Hàng</th>
                                    <th>Họ Tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Địa chỉ</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order.madonhang}</td>
                                        <td>{order.hoten}</td>
                                        <td>{order.sodienthoai}</td>
                                        <td>{order.diachinguoidung}</td>
                                        <td>{renderStatus(order.trangthai)}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleViewDetail(order.madonhang)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                                    className={`btn btn-sm ${
                                        currentPage === i + 1
                                            ? "btn-primary"
                                            : "btn-outline-primary"
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
