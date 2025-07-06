import { useState } from 'react';
import {
    TextField, Alert, Button, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../../api/Auth/auth.api';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });

        if (!email.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập Email.' });
            document.getElementById('email-input').focus();
            return;
        }

        if (!password.trim()) {
            setMessage({ type: 'error', content: 'Vui lòng nhập mật khẩu.' });
            document.getElementById('password-input').focus();
            return;
        }

        setLoading(true);

        try {
            const response = await signIn(email, password);

            if (response.status === 200) {
                setMessage({ type: 'success', content: response.data.message || 'Đăng nhập thành công!' });

                localStorage.setItem('user', JSON.stringify(response.data.user));

                window.dispatchEvent(new Event('loginSuccess'));

                setTimeout(() => navigate('/'), 1000);
            }
        } catch (err) {
            if (err.response) {
                setMessage({
                    type: 'error',
                    content: err.response.data.message || 'Tài khoản hoặc mật khẩu không đúng!'
                });
            } else {
                setMessage({ type: 'error', content: 'Không thể kết nối đến máy chủ, vui lòng thử lại!' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section signInPage">
            <div className="container">
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
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                            </Button>

                            <div className="text-center mt-3 ">
                                <span>Bạn chưa có tài khoản? <Link to="/auth/signup" className="text-decoration-none quick-link text-secondary">Đăng ký tại đây</Link></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignIn;
