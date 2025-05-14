import Logo from '../../assets/images/header/VogueGen.jpg';
import { Link } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import Button from "@mui/material/Button";

const Header = () => {
    return (
        <>
            {/* Thanh thông báo màu đỏ */}
            <div className="header">
                <div className="bg-danger text-white py-2">
                    <div className="container">
                        <p className="mb-0 text-center">
                            50th Anniversary of the Liberation of Southern Vietnam and National Reunification.
                        </p>
                    </div>
                </div>
            </div>

            {/* Header chứa logo, thanh tìm kiếm, nút đăng nhập và giỏ hàng */}
            <div className="header">
                <div className="container mt-3">
                    <div className="row align-items-center">
                        {/* Logo */}
                        <div className="logoWrapper col-sm-2">
                            <Link to={'/'}>
                                <img src={Logo} alt="VogueGen Logo" className="logo-img" />
                            </Link>
                        </div>

                        {/* Thanh tìm kiếm */}
                        <div className="col-sm-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm kiếm sản phẩm..."
                                />
                                <span className="input-group-text search-icon">
                                    <Button>
                                        <IoIosSearch />
                                    </Button>
                                </span>
                            </div>
                        </div>

                        {/* Nút Đăng Nhập và Giỏ Hàng */}
                        <div className="col-sm-4 d-flex justify-content-end gap-3">
                            <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/signin'}>
                                <FaUser /> Đăng Nhập
                            </Link>
                            <Link className="btn btn-outline-success d-flex align-items-center gap-2">
                                <FaShoppingCart /> Giỏ Hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thanh Điều hướng */}
            <div className="header">
                <div className="bg-dark text-white py-2 mt-4">
                    <div className="container">
                        <div className="row justify-content-start">
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Trang Chủ</Button>
                            </div>
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Giới Thiệu</Button>
                            </div>
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Sản Phẩm</Button>
                            </div>
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Tin Tức</Button>
                            </div>
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Hệ Thống Cửa Hàng</Button>
                            </div>
                            <div className="col-auto">
                                <Button className="btn btn-dark text-white">Liên Hệ</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
