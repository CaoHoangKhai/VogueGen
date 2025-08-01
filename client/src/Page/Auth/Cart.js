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

  // 🆔 Lấy userId từ localStorage
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData)._id : null;

  // 🛒 Hàm load giỏ hàng
  const loadCart = () => {
    if (!userId) {
      setCartItems([]);
      setInputValues({});
      return;
    }
    getCartByUserId(userId)
      .then(res => {
        const data = res.data || [];
        console.log("📥 [Cart] Data nhận từ API:", data);

        setCartItems(data);

        // Set giá trị input số lượng ban đầu
        const values = {};
        data.forEach(item => {
          values[item._id] = item.soluong?.toString() ?? "1";
        });
        setInputValues(values);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Lỗi load giỏ hàng:", err);
        setToast({ show: true, message: "Không thể tải giỏ hàng.", type: "error" });
        setCartItems([]);
        setInputValues({});
        setLoading(false);
      });
  };

  // 🔄 Load cart khi userId thay đổi
  useEffect(() => {
    loadCart();
  }, [userId]);

  // 🔢 Khi thay đổi input số lượng
  const handleInputChange = (item, value) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');
    setInputValues(prev => ({
      ...prev,
      [item._id]: onlyNumber
    }));
  };

  // 📤 Khi input mất focus
  const handleInputBlur = (item) => {
    let raw = inputValues[item._id];
    let val = parseInt(raw, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val === item.soluong) return;

    updateCartQuantity(item._id, { soluong: val })
      .then(res => {
        const { success, message } = res.data;
        setToast({
          show: true,
          message: message || (success ? "✅ Cập nhật số lượng thành công!" : "⚠️ Không thể cập nhật số lượng."),
          type: success ? "success" : "warning"
        });
        loadCart();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "❌ Lỗi server khi cập nhật số lượng.";
        setToast({ show: true, message: msg, type: "error" });
      });
  };

  // 🔼 Tăng số lượng
  const handleIncrease = (item) => {
    increaseCartQuantity(item._id)
      .then(res => {
        const { success, message } = res.data;
        setToast({
          show: true,
          message: message || (success ? "✅ Tăng số lượng thành công!" : "⚠️ Không thể tăng số lượng."),
          type: success ? "success" : "warning"
        });
        loadCart();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "❌ Lỗi server khi tăng số lượng.";
        setToast({ show: true, message: msg, type: "error" });
      });
  };

  // 🔽 Giảm số lượng
  const handleDecrease = (item) => {
    // Check FE trước
    if ((item.isThietKe || item.madesign) && item.soluong <= 50) {
      setToast({ show: true, message: "⚠️ Sản phẩm thiết kế tối thiểu số lượng là 50!", type: "warning" });
      return;
    }
    if (item.soluong <= 1) return;

    decreaseCartQuantity(item._id)
      .then(res => {
        const { success, message } = res.data;
        setToast({
          show: true,
          message: message || (success ? "✅ Giảm số lượng thành công!" : "⚠️ Không thể giảm số lượng."),
          type: success ? "success" : "warning"
        });
        loadCart();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "❌ Lỗi server khi giảm số lượng.";
        setToast({ show: true, message: msg, type: "error" });
      });
  };

  // 🗑 Xóa sản phẩm
  const handleRemoveItem = (item) => {
    updateCartQuantity(item._id, { soluong: 0 })
      .then(res => {
        const { success, message } = res.data;
        setToast({
          show: true,
          message: message || (success ? "🗑 Đã xóa sản phẩm!" : "⚠️ Không thể xóa sản phẩm."),
          type: success ? "success" : "warning"
        });
        loadCart();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "❌ Xóa sản phẩm thất bại.";
        setToast({ show: true, message: msg, type: "error" });
      });
  };

  // 📦 Khi click vào dòng sản phẩm -> xem chi tiết
  const handleRowClick = (item) => {
    if (item.designLink) {
      window.location.href = `http://localhost:3000/design/${item.designLink}`;
    } else {
      window.location.href = `http://localhost:3000/products/detail/${item.masanpham}`;
    }
  };

  // 💵 Tính tổng tiền
  const total = cartItems.reduce(
    (sum, item) => sum + (item.giasanpham || 0) * (item.soluong || 1),
    0
  );
  const openBase64Image = (base64Data) => {
    // Tách header (data:image/png;base64,) và phần base64 thuần
    const arr = base64Data.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Tạo Blob và URL tạm
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);

    // Mở ảnh trong tab mới
    window.open(url, "_blank");

    // (Tuỳ chọn) Giải phóng URL sau 1 phút cho an toàn
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div className="container mt-4">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="row">
        {/* 🛒 Giỏ hàng */}
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
                    {cartItems.map(item => (
                      <tr
                        key={item._id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRowClick(item)}
                      >
                        {/* 🖼 Hình ảnh */}
                        <td style={{ width: 120, height: 60 }}>
                          <div style={{ display: "flex", width: "100%", height: "100%", gap: 4 }}>
                            {/* Nếu có front/back → sản phẩm custom */}
                            {item.hinhanhFront || item.hinhanhBack ? (
                              <>
                                {/* Front */}
                                <img
                                  src={item.hinhanhFront}
                                  alt="Front"
                                  style={{
                                    width: "50%",
                                    height: "100%",
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                    borderRadius: 4,
                                    cursor: "zoom-in",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBase64Image(item.hinhanhFront);
                                  }}
                                />

                                {/* Back (nếu có) */}
                                {item.hinhanhBack && (
                                  <img
                                    src={item.hinhanhBack}
                                    alt="Back"
                                    style={{
                                      width: "50%",
                                      height: "100%",
                                      objectFit: "cover",
                                      border: "1px solid #ddd",
                                      borderRadius: 4,
                                      cursor: "zoom-in",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openBase64Image(item.hinhanhBack);
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              /* Nếu chỉ có ảnh sản phẩm tiêu chuẩn */
                              <img
                                src={item.hinhanh}
                                alt={item.tensanpham}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                  borderRadius: 4,
                                  cursor: "zoom-in",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBase64Image(item.hinhanh);
                                }}
                              />
                            )}
                          </div>
                        </td>
                        {/* 🏷 Tên sản phẩm */}
                        <td>
                          <div>
                            <div>{item.tensanpham || item.masanpham}</div>
                            <small className="text-muted">
                              {item.madesign ? "Thiết kế riêng" : "Sản phẩm tiêu chuẩn"}
                            </small>
                          </div>
                        </td>

                        {/* 📏 Size */}
                        <td>{item.size}</td>

                        {/* 🎨 Màu */}
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
                          />
                        </td>

                        {/* 🔢 Số lượng */}
                        <td>
                          <div className="input-group input-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={(e) => { e.stopPropagation(); handleDecrease(item); }}
                            >-</button>
                            <input
                              type="text"
                              value={inputValues[item._id] || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleInputChange(item, e.target.value); }}
                              onBlur={() => handleInputBlur(item)}
                              className="form-control text-center shadow-none bg-light"
                              style={{ width: "4rem", minWidth: 60 }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={(e) => { e.stopPropagation(); handleIncrease(item); }}
                            >+</button>
                          </div>
                        </td>

                        {/* 💰 Giá đơn */}
                        <td>{(item.giasanpham || 0).toLocaleString("vi-VN")} đ</td>

                        {/* 💵 Thành tiền */}
                        <td>{((item.giasanpham || 0) * (item.soluong || 1)).toLocaleString("vi-VN")} đ</td>

                        {/* 🗑 Xóa */}
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item); }}
                          >
                            <i className="bi bi-trash" />
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

        {/* 📦 Thanh toán */}
        <div className="col-md-3">
          <div className="card" style={{ position: "sticky", top: "80px", zIndex: 10 }}>
            <div className="card-header fw-bold">Thanh toán</div>
            <div className="card-body">
              {cartItems.length > 0 ? (
                <>
                  <p>Tổng tiền: {total.toLocaleString("vi-VN")}đ</p>
                  <button className="btn btn-primary w-100" onClick={() => window.location.href = "/auth/order"}>
                    Đặt hàng
                  </button>
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