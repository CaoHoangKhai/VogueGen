import React, { useEffect, useState } from 'react';
import { getCartByUserId } from '../../api/Cart/cart.api';
import { createOrder } from '../../api/Order/order.api';
import Toast from "../../Components/Toast";
import { getUserById, getUserLocations } from '../../api/User/user.api';
import diachiData from '../../assets/data/vietnam_administrative_data.json';
// import { useNavigate } from "react-router-dom";
const Order = () => {
    const [cartItems, setCartItems] = useState([]);
    // const navigate = useNavigate();
    const [form, setForm] = useState({
        hoten: "",
        sodienthoai: "",
        diachinguoidung: "",
        ghichu: "",
        phuongthucthanhtoan: "cod"
    });
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [loading, setLoading] = useState(true);
    const [addressList, setAddressList] = useState([]);

    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData)._id : null;

    // Hàm chuyển mã sang tên
    const getCityName = (cityCode) => {
        const city = diachiData.find(c => c.Id === cityCode);
        return city ? city.Name : cityCode;
    };

    const getDistrictName = (cityCode, districtCode) => {
        const city = diachiData.find(c => c.Id === cityCode);
        if (!city) return districtCode;
        const district = city.Districts.find(d => d.Id === districtCode);
        return district ? district.Name : districtCode;
    };

    // Lấy thông tin user, cart và địa chỉ
    useEffect(() => {
        if (userId) {
            getUserById(userId)
                .then(res => {
                    const user = res.data;
                    setForm(prev => ({
                        ...prev,
                        hoten: user.hoten || "",
                        sodienthoai: user.sodienthoai || "",
                        diachinguoidung: user.diachinguoidung || ""
                    }));
                })
                .catch(() => { });

            getCartByUserId(userId)
                .then(res => {
                    setCartItems(res.data || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));

            getUserLocations(userId)
                .then(res => {
                    setAddressList(res.data || []);
                })
                .catch(() => setAddressList([]));
        }
    }, [userId]);

    const total = cartItems.reduce((sum, item) => sum + (item.giasanpham || 0) * (item.soluong || 1), 0);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "sodienthoai") {
            // ✅ Chỉ giữ lại số (loại bỏ chữ tự động)
            const onlyNumbers = value.replace(/\D/g, "");

            // ✅ Giới hạn 10 số
            if (onlyNumbers.length <= 10) {
                setForm({ ...form, [name]: onlyNumbers });
            }
            return;
        }

        setForm({ ...form, [name]: value });
    };

    // Khi chọn địa chỉ có sẵn
    const handleLocationChange = (e) => {
        const selectedId = e.target.value;
        const selected = addressList.find(addr => addr._id === selectedId);
        setForm(prev => ({
            ...prev,
            diachinguoidung: selected
                ? `${getCityName(selected.thanhpho)}, ${getDistrictName(selected.thanhpho, selected.quan_huyen)}, ${selected.diachi}`
                : ""
        }));
    };
    const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

    const handleOrder = async (e) => {
        e.preventDefault();

        // ✅ Kiểm tra số điện thoại
        if (!validatePhone(form.sodienthoai)) {
            setToast({ show: true, message: "❌ Số điện thoại phải gồm đúng 10 chữ số!", type: "error" });
            return;
        }

        // ✅ Kiểm tra giỏ hàng
        if (cartItems.length === 0) {
            setToast({ show: true, message: "Giỏ hàng của bạn đang trống!", type: "error" });
            return;
        }

        // ✅ Kiểm tra thông tin bắt buộc
        if (!form.hoten || !form.diachinguoidung) {
            setToast({ show: true, message: "Vui lòng nhập đầy đủ thông tin!", type: "error" });
            return;
        }

        // 🟢 Tạo payload cho API
        const orderData = {
            manguoidung: userId,
            hoten: form.hoten,
            sodienthoai: form.sodienthoai,
            diachinguoidung: form.diachinguoidung,
            ghichu: form.ghichu,
            tongtien: total,
            phuongthucthanhtoan: form.phuongthucthanhtoan,
            chitiet: cartItems.map(item => {
                const base = {
                    masanpham: item.masanpham,
                    tensanpham: item.tensanpham,
                    soluong: item.soluong,
                    giatien: item.giasanpham,
                    size: item.size,
                    mausac: item.mausac,
                    isThietKe: !!item.madesign,
                    madesign: item.madesign || null,
                };

                if (item.hinhanhFront || item.hinhanhBack) {
                    return {
                        ...base,
                        hinhanhFront: item.hinhanhFront || null,
                        hinhanhBack: item.hinhanhBack || null,
                        hinhanh: null
                    };
                }

                return {
                    ...base,
                    hinhanh: item.hinhanh || null,
                    hinhanhFront: null,
                    hinhanhBack: null
                };
            })
        };

        try {
            const res = await createOrder(orderData);
            console.log("✅ Đặt hàng thành công:", res);

            setToast({ show: true, message: "Đặt hàng thành công!", type: "success" });

            // 🧹 Dọn giỏ hàng
            setCartItems([]);

            // 🧹 Reset ghi chú
            setForm(prev => ({ ...prev, ghichu: "" }));

        } catch (error) {
            console.error("❌ Đặt hàng thất bại:", error);
            setToast({ show: true, message: "Đặt hàng thất bại!", type: "error" });
        }
    };


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
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
            <div className="row">
                {/* Bên trái: Sản phẩm */}
                <div className="col-md-7">
                    <div className="card mb-3">
                        <div className="card-header fw-bold">Sản phẩm trong giỏ hàng</div>
                        <div className="card-body">
                            {loading ? (
                                <p>Đang tải...</p>
                            ) : cartItems.length === 0 ? (
                                <p>Không có sản phẩm nào trong giỏ hàng.</p>
                            ) : (
                                <table className="table table-bordered align-middle">
                                    <thead>
                                        <tr className="text-center">
                                            <th>Hình ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Size</th>
                                            <th>Màu</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
                                        {cartItems.map((item, idx) => (
                                            <tr key={item._id || idx}>
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
                                                                    width: "50%",
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
                                                <td>{item.tensanpham}</td>
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
                                                <td>{item.soluong}</td>
                                                <td>{(item.giasanpham || 0).toLocaleString("vi-VN")} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="text-end fw-bold mt-2">
                                Tổng tiền: {total.toLocaleString("vi-VN")} đ
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bên phải: Thông tin đặt hàng */}
                <div className="col-md-5">
                    <div className="card" style={{ position: "sticky", top: "80px", zIndex: 10 }}>
                        <div className="card-header fw-bold">Thông tin đặt hàng</div>
                        <div className="card-body">
                            <form onSubmit={handleOrder}>
                                <div className="mb-3">
                                    <label className="form-label">Họ tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="hoten"
                                        value={form.hoten}
                                        onChange={handleChange}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="sodienthoai"
                                    value={form.sodienthoai}
                                    onChange={handleChange}
                                    inputMode="numeric"     // ⚡ Gợi ý bàn phím số trên mobile
                                    placeholder="Nhập số điện thoại 10 số"
                                />

                                <div className="mb-3">
                                    <label className="form-label">Chọn địa chỉ có sẵn</label>
                                    <select
                                        className="form-select"
                                        onChange={handleLocationChange}
                                        value={
                                            addressList.find(addr =>
                                                `${getCityName(addr.thanhpho)}, ${getDistrictName(addr.thanhpho, addr.quan_huyen)}, ${addr.diachi}` === form.diachinguoidung
                                            )?._id || ""
                                        }
                                    >
                                        <option value="">-- Chọn địa chỉ --</option>
                                        {addressList.map(addr => (
                                            <option key={addr._id} value={addr._id}>
                                                {getCityName(addr.thanhpho)}, {getDistrictName(addr.thanhpho, addr.quan_huyen)}, {addr.diachi}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Hidden input dùng để giữ giá trị địa chỉ */}
                                    <input
                                        type="hidden"
                                        className="form-control"
                                        name="diachinguoidung"
                                        value={form.diachinguoidung}
                                        onChange={handleChange}
                                        placeholder="Nhập địa chỉ giao hàng"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-control"
                                        name="ghichu"
                                        value={form.ghichu}
                                        onChange={handleChange}
                                        placeholder="Nhập ghi chú"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Phương thức thanh toán</label>
                                    <select
                                        className="form-select"
                                        name="phuongthucthanhtoan"
                                        value={form.phuongthucthanhtoan}
                                        onChange={handleChange}
                                    >
                                        <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                        <option value="bank">Chuyển khoản ngân hàng</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={cartItems.length === 0}
                                >
                                    Đặt hàng
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Order;