import { useState } from 'react';
import {
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { signUp } from '../../api/auth.api';  // import hàm gọi API đăng ký

const SignUp = () => {
    const [formData, setFormData] = useState({
        hoten: '',
        email: '',
        sodienthoai: '',
        matkhau: ''
    });

    const [message, setMessage] = useState({ type: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Cập nhật giá trị input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', content: '' });
    };

    // Kiểm tra đầu vào
    const validateForm = () => {
        if (!formData.hoten.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Họ và Tên.' });
            return false;
        }
        if (!formData.email.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Email.' });
            return false;
        }
        if (!formData.sodienthoai.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Số điện thoại.' });
            return false;
        }
        if (!formData.matkhau.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Mật khẩu.' });
            return false;
        }
        return true;
    };

    // Xử lý submit form đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });

        if (!validateForm()) return;
        setLoading(true);

        try {
            const response = await signUp(formData);

            if (response.status === 201 || response.status === 200) {
                setMessage({
                    type: 'success',
                    content: 'Đăng ký thành công! Vui lòng đăng nhập.'
                });
                setFormData({
                    hoten: '',
                    email: '',
                    sodienthoai: '',
                    matkhau: ''
                });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!';
            setMessage({ type: 'error', content: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section signUpPage">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light" onSubmit={handleSubmit} noValidate>
                            <h4 className="mb-3">Thông tin cá nhân</h4>

                            {message.content && (
                                <Alert severity={message.type} className="mb-3">
                                    {message.content}
                                </Alert>
                            )}

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
                                <span>
                                    Đã có tài khoản?{' '}
                                    <Link to="/auth/signin" className="text-decoration-none quick-link text-secondary">
                                        Đăng nhập
                                    </Link>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignUp;
