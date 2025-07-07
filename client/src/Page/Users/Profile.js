import React, { useEffect, useState } from 'react';
import { getUserById, countFavoritesByUser } from '../../api/User/user.api';
import { getTotalOrdersByUserId,getTotalSpentByUser } from '../../api/Order/order.api';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');

        if (!userData) {
            console.warn("⚠️ Không có dữ liệu người dùng trong localStorage.");
            setLoading(false);
            return;
        }

        try {
            const parsed = JSON.parse(userData);
            const userFromStorage = parsed?.data || parsed;
            const userId = userFromStorage._id;

            if (!userId) {
                setLoading(false);
                return;
            }

            // Hiển thị tạm
            setUser(userFromStorage);

            // Gọi các API để cập nhật thông tin
            Promise.all([
                getUserById(userId),
                getTotalOrdersByUserId(userId),
                countFavoritesByUser(userId),
                getTotalSpentByUser(userId)
            ])
                .then(([resUser, resOrderCount, resFavorites, resTotalSpent]) => {
                    const data = resUser?.data || resUser;
                    data.soDonHang = resOrderCount?.total ?? 0;
                    data.soYeuThich = resFavorites?.data?.favoriteCount ?? 0;
                    data.tongChiTieu = resTotalSpent?.totalSpent ?? 0;
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    console.log("❤️ Kết quả favorites từ API:", resFavorites);
                    console.log("❤️ Kết quả đơn hàng từ API:", resOrderCount);
                    console.log("❤️ Kết quả tổng chi tiêu từ API:", resTotalSpent);
                })
                .catch((err) => {
                    console.warn("❌ Lỗi khi gọi API:", err.message);
                })
                .finally(() => setLoading(false));
        } catch (err) {
            console.error("❌ Lỗi khi parse localStorage:", err.message);
            setLoading(false);
        }
    }, []);

    if (loading) return <div className="container mt-4">Đang tải thông tin người dùng...</div>;
    if (!user) return <div className="container mt-4">Không tìm thấy thông tin người dùng.</div>;

    return (
        <div className="container">
            <h3 className="text-center mb-4">Thông tin người dùng</h3>

            <div className="row text-center mb-4">
                <div className="col-md-3">
                    <Link className="text-decoration-none text-secondary" to="/user/orders">
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Đã tiêu</strong>
                            <div>{(user.tongChiTieu || 0).toLocaleString()}₫</div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link className="text-decoration-none text-secondary" to="/user/location">
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Số địa chỉ</strong>
                            <div>{user.sodiachi ?? 0}/5</div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link className="text-decoration-none text-secondary" to="/user/orders">
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Số đơn hàng</strong>
                            <div>{user.soDonHang ?? 0}</div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link className="text-decoration-none text-secondary" to="/user/favorites">
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Yêu thích</strong>
                            <div>{user.soYeuThich ?? 0}</div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Mã người dùng</label>
                    <input type="text" className="form-control" value={user._id} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Họ tên</label>
                    <input type="text" className="form-control" value={user.hoten} disabled />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" className="form-control" value={user.sodienthoai} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={user.email} disabled />
                </div>
            </div>
        </div>
    );
};

export default Profile;
