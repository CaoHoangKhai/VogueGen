import { TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import Button from "@mui/material/Button";

const SignUp = () => {
    return (
        <section className="section signUpPage">
            <div className="container mt-4">
                <h3 className="text-center mb-4">Đăng Ký Tài Khoản</h3>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light">
                            <h4 className="mb-3">Thông tin cá nhân</h4>

                            <div className="mb-3">
                                <TextField 
                                    fullWidth
                                    label="Họ và Tên" 
                                    type="text" 
                                    required 
                                    variant="outlined" 
                                />
                            </div>

                            <div className="mb-3">
                                <TextField 
                                    fullWidth
                                    label="Email" 
                                    type="email" 
                                    required 
                                    variant="outlined" 
                                />
                            </div>

                            <div className="mb-3">
                                <TextField 
                                    fullWidth
                                    label="Số điện thoại" 
                                    type="text" 
                                    required 
                                    variant="outlined" 
                                />
                            </div>

                            <div className="mb-4">
                                <TextField 
                                    fullWidth
                                    label="Mật khẩu" 
                                    type="password" 
                                    required 
                                    variant="outlined" 
                                />
                            </div>

                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                size="large" 
                                type="submit"
                            >
                                Đăng Ký
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
