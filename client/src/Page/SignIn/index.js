import { useState } from 'react';
import { TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import axios from 'axios';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [matkhau, setMatKhau] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Hàm xử lý khi submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Vui lòng nhập Email.');
            document.getElementById('email-input').focus();
            return;
        }

        if (!matkhau) {
            setError('Vui lòng nhập mật khẩu');
            document.getElementById('password-input').focus();
            return;
        }

        const payload = {
            email,
            matkhau
        };

        try {
            const response = await axios.post('http://localhost:4000/auth/login', payload);

            if (response.status === 200) {
                setSuccess(response.data.message);

                // ✅ Lưu thông tin user vào LocalStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log("Thông tin user đã được lưu vào LocalStorage:", response.data.user);

                // ✅ Chuyển hướng sang trang chủ hoặc dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Có lỗi xảy ra, vui lòng thử lại!');
            } else {
                setError('Không thể kết nối đến máy chủ, vui lòng thử lại!');
            }
        }
    };

    return (
        <section className="section signInPage">
            <div className="container mt-4">
                <h3 className="text-center mb-4">Đăng Nhập Tài Khoản</h3>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light" onSubmit={handleSubmit}>
                            <h4 className="mb-3 text-center">KHÁCH HÀNG ĐĂNG NHẬP</h4>

                            {error && <p className="text-danger text-center">{error}</p>}
                            {success && <p className="text-success text-center">{success}</p>}

                            <div className="mb-3">
                                <TextField
                                    id="email-input"
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <TextField
                                    id="password-input"
                                    fullWidth
                                    label="Mật khẩu"
                                    type="password"
                                    variant="outlined"
                                    value={matkhau}
                                    onChange={(e) => setMatKhau(e.target.value)}
                                />
                            </div>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                type="submit"
                            >
                                Đăng Nhập
                            </Button>

                            <div className="text-center mt-3">
                                <span>Bạn chưa có tài khoản? <Link to={'/signup'}>Đăng ký tại đây</Link></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignIn;
