import { useState } from 'react';
import {
    TextField,
    Button,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
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
    const [showPassword, setShowPassword] = useState(false);

    // Cập nhật giá trị input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    // Kiểm tra đầu vào
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

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/auth/signup', formData);

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
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={formData.matkhau}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    aria-label="toggle password visibility"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
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
                                <span>Đã có tài khoản? <Link to={'/signin'}>Đăng nhập</Link></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
