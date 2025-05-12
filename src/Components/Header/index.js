import Logo from '../../assets/images/header/VogueGen.jpg';
import { Link } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";


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
                                    <IoIosSearch />
                                </span>
                            </div>
                        </div>

                        {/* Nút Đăng Nhập và Giỏ Hàng */}
                        <div className="col-sm-4 d-flex justify-content-end gap-3">
                            <Link to={'/login'} className="btn btn-outline-primary d-flex align-items-center gap-2">
                                <FaUser /> Đăng Nhập
                            </Link>
                            <Link to={'/cart'} className="btn btn-outline-success d-flex align-items-center gap-2">
                                <FaShoppingCart /> Giỏ Hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
