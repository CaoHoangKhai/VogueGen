import { useState } from 'react';
import { TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import Button from "@mui/material/Button";
import axios from 'axios';

const SignUp = () => {
    const [formData, setFormData] = useState({
        hoten: '',
        email: '',
        sodienthoai: '',
        matkhau: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Hàm cập nhật giá trị cho form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    // Hàm kiểm tra thông tin đầu vào
    const validateForm = () => {
        if (!formData.hoten) {
            setError('Vui lòng nhập Họ và Tên.');
            return false;
        }
        if (!formData.email) {
            setError('Vui lòng nhập Email.');
            return false;
        }
        if (!formData.sodienthoai) {
            setError('Vui lòng nhập Số điện thoại.');
            return false;
        }
        if (!formData.matkhau) {
            setError('Vui lòng nhập Mật khẩu.');
            return false;
        }
        return true;
    };

    // Hàm xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // ✅ Kiểm tra thông tin đầu vào
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/auth/register', formData);

            if (response.status === 201 || response.status === 200) {
                setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
                setFormData({
                    hoten: '',
                    email: '',
                    sodienthoai: '',
                    matkhau: ''
                });
            }
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Đã có lỗi xảy ra, vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    // Giao diện
    return (
        <section className="section signUpPage">
            <div className="container mt-4">
                <h3 className="text-center mb-4">Đăng Ký Tài Khoản</h3>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light" onSubmit={handleSubmit} noValidate>
                            <h4 className="mb-3">Thông tin cá nhân</h4>

                            {/* Thông báo lỗi */}
                            {error && <p className="text-danger text-center">{error}</p>}
                            {success && <p className="text-success text-center">{success}</p>}

                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Họ và Tên"
                                    name="hoten"
                                    type="text"
                                    variant="outlined"
                                    value={formData.hoten}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    variant="outlined"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    name="sodienthoai"
                                    type="text"
                                    variant="outlined"
                                    value={formData.sodienthoai}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-4">
                                <TextField
                                    fullWidth
                                    label="Mật khẩu"
                                    name="matkhau"
                                    type="password"
                                    variant="outlined"
                                    value={formData.matkhau}
                                    onChange={handleChange}
                                />
                            </div>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                            </Button>

                            <div className="text-center mt-3">
                                <span>Nếu đã có tài khoản, click vào <Link to={'/signin'}>đây</Link> để đăng nhập</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
