import React, { useEffect, useState } from 'react';
import {
    getCartByUserId,
    updateCartQuantity,
    increaseCartQuantity,
    decreaseCartQuantity
} from '../../api/Cart/cart.api';
import Toast from "../../Components/Toast";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValues, setInputValues] = useState({});
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData)._id : null;

    useEffect(() => {
        if (!userId) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        getCartByUserId(userId)
            .then(res => {
                const data = res.data || [];
                setCartItems(data);
                const values = {};
                data.forEach(item => {
                    values[item._id] = item.soluong?.toString() ?? "1";
                });
                setInputValues(values);
                setLoading(false);
            })
            .catch(() => {
                setCartItems([]);
                setLoading(false);
            });
    }, [userId]);

    const total = cartItems.reduce((sum, item) => sum + (item.giasanpham || 0) * (item.soluong || 1), 0);

    const handleInputChange = (item, value) => {
        const onlyNumber = value.replace(/[^0-9]/g, '');
        setInputValues(prev => ({
            ...prev,
            [item._id]: onlyNumber
        }));
    };

    const handleInputBlur = (item) => {
        let raw = inputValues[item._id];
        let val = parseInt(raw, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val === item.soluong) return;

        updateCartQuantity(item._id, { soluong: val })
            .then(() => {
                const updatedItems = cartItems.map(ci =>
                    ci._id === item._id ? { ...ci, soluong: val } : ci
                );
                setCartItems(updatedItems);
                setToast({ show: true, message: "Cập nhật số lượng thành công!", type: "success" });
            })
            .catch(() => {
                setToast({ show: true, message: "Cập nhật số lượng thất bại!", type: "error" });
            });
    };

    const handleIncrease = (item) => {
        increaseCartQuantity(item._id)
            .then(() => {
                const updatedItems = cartItems.map(ci =>
                    ci._id === item._id ? { ...ci, soluong: ci.soluong + 1 } : ci
                );
                setCartItems(updatedItems);
                setInputValues(prev => ({
                    ...prev,
                    [item._id]: String(item.soluong + 1)
                }));
                setToast({ show: true, message: "Tăng số lượng thành công!", type: "success" });
            })
            .catch(() => {
                setToast({ show: true, message: "Tăng số lượng thất bại!", type: "error" });
            });
    };

    const handleDecrease = (item) => {
        if (item.soluong <= 1) return;
        decreaseCartQuantity(item._id)
            .then(() => {
                const updatedItems = cartItems.map(ci =>
                    ci._id === item._id ? { ...ci, soluong: ci.soluong - 1 } : ci
                );
                setCartItems(updatedItems);
                setInputValues(prev => ({
                    ...prev,
                    [item._id]: String(item.soluong - 1)
                }));
                setToast({ show: true, message: "Giảm số lượng thành công!", type: "success" });
            })
            .catch(() => {
                setToast({ show: true, message: "Giảm số lượng thất bại!", type: "error" });
            });
    };

    const handleRemoveItem = (item) => {
        updateCartQuantity(item._id, { soluong: 0 })
            .then(() => {
                const updatedItems = cartItems.filter(ci => ci._id !== item._id);
                setCartItems(updatedItems);
                setInputValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[item._id];
                    return newValues;
                });
                setToast({ show: true, message: "Đã xóa sản phẩm khỏi giỏ hàng!", type: "success" });
            })
            .catch(() => {
                setToast({ show: true, message: "Xóa sản phẩm thất bại!", type: "error" });
            });
    };

    return (
        <div className="container mt-4">
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <div className="row">
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
                                        <tr className="text-center">
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
                                        {cartItems.map((item) => (
                                            <tr key={item._id}>
                                                <td><img src={item.hinhanh} alt={item.tensanpham} className="img-thumbnail" style={{ width: 60, height: 60, objectFit: "cover" }} /></td>
                                                <td>{item.tensanpham || item.masanpham}</td>
                                                <td>{item.size}</td>
                                                <td>
                                                    <span
                                                        className="d-inline-block"
                                                        style={{ width: 20, height: 20, backgroundColor: item.mausac, border: "1px solid #ccc", borderRadius: 4 }}
                                                        title={item.mausac}
                                                    ></span>
                                                </td>
                                                <td>
                                                    <div className="input-group input-group-sm">
                                                        <button className="btn btn-outline-secondary" onClick={() => handleDecrease(item)}>-</button>
                                                        <input
                                                            type="text"
                                                            value={inputValues[item._id] || ''}
                                                            onChange={(e) => handleInputChange(item, e.target.value)}
                                                            onBlur={() => handleInputBlur(item)}
                                                            className="form-control text-center shadow-none bg-light"
                                                            style={{ width: "4rem", minWidth: 60 }}
                                                        />
                                                        <button className="btn btn-outline-secondary" onClick={() => handleIncrease(item)}>+</button>
                                                    </div>
                                                </td>
                                                <td>{(item.giasanpham || 0).toLocaleString("vi-VN")} đ</td>
                                                <td>{((item.giasanpham || 0) * (item.soluong || 1)).toLocaleString("vi-VN")} đ</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveItem(item)}>
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
                <div className="col-md-3">
                    <div className="card" style={{ position: "sticky", top: "80px", zIndex: 10 }}>
                        <div className="card-header fw-bold">Thanh toán</div>
                        <div className="card-body">
                            {cartItems.length > 0 ? (
                                <>
                                    <p>Tổng tiền: {total.toLocaleString("vi-VN")}đ</p>
                                    <button className="btn btn-primary w-100" onClick={() => window.location.href = "/auth/order"}>Đặt hàng</button>
                                </>
                            ) : (
                                <div className="text-muted text-center small">
                                    <p>Không có sản phẩm.</p>
                                    <button className="btn btn-secondary w-100" disabled>Đặt hàng</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
