import React, { useEffect, useState } from 'react';
import {
    getCartByUserId,
    updateCartQuantity,
    increaseCartQuantity,
    decreaseCartQuantity
} from '../../api/User/cart.api';
import Toast from "../../Components/Toast";
import { Link } from 'react-router-dom';
const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValues, setInputValues] = useState({});
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    // Lưu userId để dùng lại
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData)._id : null;

    // Hàm load lại giỏ hàng
    const fetchCart = () => {
        if (!userId) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        getCartByUserId(userId)
            .then(res => {
                setCartItems(res.data || []);
                setLoading(false);
            })
            .catch(() => {
                setCartItems([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line
    }, []);

    // Đồng bộ inputValues với cartItems
    useEffect(() => {
        const values = {};
        cartItems.forEach(item => {
            values[item._id] = item.soluong?.toString() ?? "1";
        });
        setInputValues(values);
    }, [cartItems]);

    const total = cartItems.reduce((sum, item) => sum + (item.giasanpham || 0) * (item.soluong || 1), 0);

    // Xử lý nhập số lượng (chỉ lưu vào inputValues, không gọi API)
    const handleInputChange = (item, value) => {
        const onlyNumber = value.replace(/[^0-9]/g, '');
        setInputValues(prev => ({
            ...prev,
            [item._id]: onlyNumber
        }));
    };

    // Khi blur hoặc Enter mới gọi API cập nhật số lượng
    const handleInputBlur = (item) => {
        let raw = inputValues[item._id];
        let val = parseInt(raw, 10);

        if (isNaN(val) || val < 1) val = 1;

        // Nếu giá trị không đổi thì không gọi API
        if (val === item.soluong) return;

        updateCartQuantity(item._id, { soluong: val })
            .then(() => {
                setToast({
                    show: true,
                    message: "Cập nhật số lượng thành công!",
                    type: "success"
                });
                fetchCart();
            })
            .catch(() => {
                setToast({
                    show: true,
                    message: "Cập nhật số lượng thất bại!",
                    type: "error"
                });
                fetchCart();
            });
    };


    // Tăng số lượng
    const handleIncrease = (item) => {
        increaseCartQuantity(item._id)
            .then(() => {
                setToast({ show: true, message: "Tăng số lượng thành công!", type: "success" });
                fetchCart();
            })
            .catch(() => {
                setToast({ show: true, message: "Tăng số lượng thất bại!", type: "error" });
                fetchCart();
            });
    };

    // Giảm số lượng
    const handleDecrease = (item) => {
        decreaseCartQuantity(item._id)
            .then(() => {
                setToast({ show: true, message: "Giảm số lượng thành công!", type: "success" });
                fetchCart();
            })
            .catch(() => {
                setToast({ show: true, message: "Giảm số lượng thất bại!", type: "error" });
                fetchCart();
            });
    };

    const handleRemoveItem = (item) => {
        updateCartQuantity(item._id, { soluong: 0 })
            .then(() => {
                setToast({ show: true, message: "Đã xóa sản phẩm khỏi giỏ hàng!", type: "success" });
                fetchCart();
            })
            .catch(() => {
                setToast({ show: true, message: "Xóa sản phẩm thất bại!", type: "error" });
                fetchCart();
            });
    };

    return (
        <div className="container mt-4">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
            <div className="row">
                {/* Bên trái: 9 cột */}
                <div className="col-md-9">
                    <div className="card mb-3">
                        <div className="card-header fw-bold">Giỏ hàng của bạn</div>
                        <div className="card-body">
                            {loading ? (
                                <p>Đang tải...</p>
                            ) : cartItems.length === 0 ? (
                                <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
                            ) : (
                                <table className="table table-striped table-hover align-middle text-nowrap">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Sản phẩm</th>
                                            <th>Size</th>
                                            <th>Màu</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Thành tiền</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item, idx) => (
                                            <tr key={item._id || idx}>
                                                <td>
                                                    <img
                                                        src={item.hinhanh || "https://via.placeholder.com/60"}
                                                        alt={item.tensanpham}
                                                        className="img-thumbnail"
                                                        style={{ width: 60, height: 60, objectFit: "cover" }}
                                                    />
                                                </td>
                                                <td>{item.tensanpham || item.masanpham}</td>
                                                <td>{item.size}</td>
                                                <td>
                                                    <span
                                                        className="d-inline-block"
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            backgroundColor: item.mausac,
                                                            border: "1px solid #ccc",
                                                            borderRadius: 4
                                                        }}
                                                        title={item.mausac}
                                                    ></span>
                                                </td>
                                                <td>
                                                    <div className="input-group input-group-sm">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            onClick={() => handleDecrease(item)}
                                                            aria-label="Giảm số lượng"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="text"
                                                            min={1}
                                                            value={inputValues[item._id] ?? ""}
                                                            onChange={(e) => handleInputChange(item, e.target.value)}
                                                            onBlur={() => handleInputBlur(item)}
                                                            className="form-control text-center shadow-none bg-light"
                                                            style={{ width: 30, padding: "0.25rem 0.4rem" }}
                                                        />

                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            onClick={() => handleIncrease(item)}
                                                            aria-label="Tăng số lượng"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{(item.giasanpham || 0).toLocaleString("vi-VN")} đ</td>
                                                <td>
                                                    {((item.giasanpham || 0) * (item.soluong || 1)).toLocaleString("vi-VN")} đ
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRemoveItem(item)}
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
                {/* Bên phải: 3 cột */}
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-header fw-bold">Thanh toán</div>
                        <div className="card-body">
                            <p>Tổng tiền: {total.toLocaleString("vi-VN")}đ</p>
                            <Link to="/auth/order" className="btn btn-primary w-100" disabled={cartItems.length === 0}>
                                Đặt hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;