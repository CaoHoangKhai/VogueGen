import { useState } from 'react';
import {
    TextField, Alert, Button, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });

        if (!email) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Email.' });
            document.getElementById('email-input').focus();
            return;
        }

        if (!password) {
            setMessage({ type: 'error', content: 'Vui lòng nhập mật khẩu.' });
            document.getElementById('password-input').focus();
            return;
        }

        const payload = { email, matkhau: password };

        try {
            const response = await axios.post('http://localhost:4000/auth/signin', payload);

            if (response.status === 200) {
                setMessage({ type: 'success', content: response.data.message });
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('loginSuccess'));
                setTimeout(() => navigate('/'), 1000);
            }
        } catch (err) {
            if (err.response) {
                setMessage({ type: 'error', content: err.response.data.message || 'Có lỗi xảy ra, vui lòng thử lại!' });
            } else {
                setMessage({ type: 'error', content: 'Không thể kết nối đến máy chủ, vui lòng thử lại!' });
            }
        }
    };

    return (
        <section className="section signInPage">
            <div className="container mt-4">
                <h3 className="text-center mb-4">Đăng Nhập Tài Khoản</h3>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light" onSubmit={handleSignIn}>
                            <h4 className="mb-3 text-center">KHÁCH HÀNG ĐĂNG NHẬP</h4>

                            {message.content && (
                                <Alert severity={message.type} className="mb-3">
                                    {message.content}
                                </Alert>
                            )}

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
                                    type={showPassword ? 'text' : 'password'} // 👁️ Toggle hiển thị
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
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
