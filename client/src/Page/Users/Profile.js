import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
const Profile = () => {
    const [user, setUser] = useState({
        _id: '',
        hoten: '',
        sodienthoai: '',
        email: '',
        sodiachi: 0,
        tongChiTieu: 0,
        soDonHang: 0,
        ngayTao: null
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);

            // Gọi API lấy thông tin user từ backend
            axios.get(`http://localhost:4000/user/${parsed._id}`)
                .then(res => {
                    // Giả sử server trả về dữ liệu user đầy đủ
                    setUser({
                        _id: res.data._id,
                        hoten: res.data.hoten,
                        sodienthoai: res.data.sodienthoai,
                        email: res.data.email,
                        sodiachi: res.data.sodiachi ?? 0,
                        tongChiTieu: res.data.tongChiTieu ?? 0,
                        soDonHang: res.data.soDonHang ?? 0,
                        ngayTao: res.data.ngayTao ?? null,
                    });
                })
                .catch(err => {
                    console.error('Lỗi khi lấy thông tin user:', err);
                    // Nếu lỗi thì fallback dùng data từ localStorage
                    setUser({
                        _id: parsed._id,
                        hoten: parsed.hoten,
                        sodienthoai: parsed.sodienthoai,
                        email: parsed.email,
                        sodiachi: parsed.sodiachi ?? 0,
                        tongChiTieu: parsed.tongChiTieu ?? 0,
                        soDonHang: parsed.soDonHang ?? 0,
                        ngayTao: parsed.ngayTao ?? null
                    });
                });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    return (
        <div className="container">
            <h3 className="text-center mb-4">Thông tin người dùng</h3>

            {/* Bốn khối thông tin */}
            <div className="row text-center mb-4">
                <div className="col-md-3">
                    <Link className="text-decoration-none quick-link text-secondary" to={'/user/orders'}>
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Đã tiêu</strong>
                            <div>{user.tongChiTieu.toLocaleString()}₫</div>
                        </div>
                    </Link>
                </div>

                <div className="col-md-3">
                    <Link className="text-decoration-none quick-link text-secondary" to={'/user/location'}>
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Số địa chỉ</strong>
                            <div>{user.sodiachi}/5</div>
                        </div>
                    </Link>

                </div>

                <div className="col-md-3">
                    <Link className="text-decoration-none quick-link text-secondary" to={'/user/orders'}>
                        <div className="border p-3 rounded shadow-sm">
                            <strong>Số đơn hàng</strong>
                            <div>{user.soDonHang}</div>
                        </div>
                    </Link>
                </div>

                {/* <div className="col-md-3">
                    <div className="border p-3 rounded shadow-sm">
                        <strong>Ngày tạo</strong>
                        <div>{user.ngayTao ? new Date(user.ngayTao).toLocaleDateString() : '---'}</div>
                    </div>
                </div> */}
            </div>

            {/* Form chỉnh sửa */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Mã người dùng</label>
                    <input type="text" className="form-control" value={user._id} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Họ tên</label>
                    <input
                        type="text"
                        className="form-control"
                        name="hoten"
                        value={user.hoten}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input
                        type="text"
                        className="form-control"
                        name="sodienthoai"
                        value={user.sodienthoai}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
