import { useEffect, useState } from "react";
import { getOrdersByUserId } from "../../../api/User/order.api";
import { useNavigate } from "react-router-dom";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            {orders.map((order) => (
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
                )}
            </div>
        </div>
    );
};

export default OrderList;
