import { TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import Button from "@mui/material/Button";
import { FaFacebookF, FaGoogle, FaInstagram } from "react-icons/fa";

const SignIn = () => {
    return (
        <section className="section signInPage">
            <div className="container mt-4">
                <h3 className="text-center mb-4">Đăng Nhập Tài Khoản</h3>

                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        <form className="p-4 border rounded bg-light">
                            <h4 className="mb-3 text-center">KHÁCH HÀNG ĐĂNG NHẬP</h4>

                            <div className="mb-3">
                                <TextField 
                                    fullWidth
                                    label="Email" 
                                    type="email" 
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
                                Đăng Nhập
                            </Button>

                            <div className="text-center mt-3">
                                <span>Bạn chưa có tài khoản? <Link to={'/signup'}>Đăng ký tại đây</Link></span>
                            </div>

                            <div className="text-center mt-4">
                                <b>Or continue with social account</b>
                                <div className="d-flex justify-content-center gap-4 mt-3">
                                    <Button 
                                        variant="outlined" 
                                        className="btn btn-outline-primary"
                                        style={{ borderRadius: "50%", padding: "10px" }}
                                    >
                                        <FaFacebookF />
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        className="btn btn-outline-danger"
                                        style={{ borderRadius: "50%", padding: "10px" }}
                                    >
                                        <FaGoogle />
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        className="btn btn-outline-secondary"
                                        style={{ borderRadius: "50%", padding: "10px" }}
                                    >
                                        <FaInstagram />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignIn;
