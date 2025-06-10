import React, { useEffect, useState } from 'react';
import {
    getCartByUserId,
    updateCartQuantity,
    increaseCartQuantity,
    decreaseCartQuantity
} from '../../api/User/cart.api';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValues, setInputValues] = useState({});

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
        let val = parseInt(inputValues[item._id], 10);
        if (isNaN(val) || val < 1) val = 1;
        // Chỉ gửi { soluong: val }
        updateCartQuantity(item._id, { soluong: val })
            .then(() => fetchCart())
            .catch(() => fetchCart());
    };

    // Tăng số lượng
    const handleIncrease = (item) => {
        increaseCartQuantity(item._id)
            .then(() => fetchCart())
            .catch(() => fetchCart());
    };

    // Giảm số lượng
    const handleDecrease = (item) => {
        // Cho phép giảm về 0 để backend xóa sản phẩm
        decreaseCartQuantity(item._id)
            .then(() => fetchCart())
            .catch(() => fetchCart());
    };

    return (
        <div className="container mt-4">
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
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Sản phẩm</th>
                                            <th>Size</th>
                                            <th>Màu</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item, idx) => (
                                            <tr key={item._id || idx}>
                                                <td>
                                                    <img
                                                        src={item.hinhanh || "https://via.placeholder.com/60"}
                                                        alt={item.tensanpham}
                                                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                                                    />
                                                </td>
                                                <td>{item.tensanpham || item.masanpham}</td>
                                                <td>{item.size}</td>
                                                <td>
                                                    <span style={{
                                                        display: "inline-block",
                                                        width: 20,
                                                        height: 20,
                                                        background: item.mausac,
                                                        border: "1px solid #ccc",
                                                        borderRadius: 4
                                                    }} title={item.mausac}></span>
                                                </td>
                                                <td style={{ maxWidth: 110 }}>
                                                    <div className="input-group input-group-sm">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            onClick={() => handleDecrease(item)}
                                                        >-</button>
                                                        <input
                                                            type="text"
                                                            min={1}
                                                            value={inputValues[item._id] ?? ""}
                                                            onChange={e => handleInputChange(item, e.target.value)}
                                                            onBlur={() => handleInputBlur(item)}
                                                            className="form-control text-center"
                                                            style={{ width: 50 }}
                                                        />
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            onClick={() => handleIncrease(item)}
                                                        >+</button>
                                                    </div>
                                                </td>
                                                <td>{(item.giasanpham || 0).toLocaleString("vi-VN")} đ</td>
                                                <td>{((item.giasanpham || 0) * (item.soluong || 1)).toLocaleString("vi-VN")} đ</td>
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
                            <button className="btn btn-primary w-100" disabled={cartItems.length === 0}>
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;