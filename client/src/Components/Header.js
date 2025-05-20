import { useEffect, useState } from 'react';
import Logo from '../assets/images/header/VogueGen.jpg';
import { Link } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import Button from "@mui/material/Button";

const Header = () => {
    const [user, setUser] = useState(null);
    
    // ✅ Lấy thông tin user từ LocalStorage khi component render lần đầu
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        const handleLoginSuccess = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        window.addEventListener('loginSuccess', handleLoginSuccess);

        return () => {
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, []);
    useEffect(() => {
        const handleLoginSuccess = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        // 🔔 Lắng nghe sự kiện loginSuccess
        window.addEventListener('loginSuccess', handleLoginSuccess);

        // 🧹 Hủy lắng nghe khi component unmount
        return () => {
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, []);

    return (
        <>
            <div className="header">

                <div className="bg-danger text-white py-2">
                    <div className="container">
                        <p className="mb-0 text-center">
                            50th Anniversary of the Liberation of Southern Vietnam and National Reunification.
                        </p>
                    </div>
                </div>

                <div className="container mt-3">
                    <div className="row align-items-center">

                        <div className="col-sm-2">
                            <Link to={'/'}>
                                <img src={Logo} alt="VogueGen Logo" className="logo-img" />
                            </Link>
                        </div>

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

                        <div className="col-sm-4 d-flex justify-content-end gap-3">
                            {user ? (
                                <>
                                    <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/user/profile'}>
                                        <FaUser /> {user.username}
                                    </Link>
                                </>
                            ) : (
                                <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/signin'}>
                                    <FaUser /> Đăng Nhập
                                </Link>
                            )}
                            <Link className="btn btn-outline-success d-flex align-items-center gap-2">
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
