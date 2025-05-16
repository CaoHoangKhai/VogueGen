import { useEffect, useState } from 'react';
import Logo from '../../assets/images/header/VogueGen.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import Button from "@mui/material/Button";

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // ✅ Lấy thông tin user từ LocalStorage khi component render lần đầu
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // ✅ Lắng nghe sự kiện thay đổi của LocalStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // ✅ Hàm xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("storage"));  // Phát sự kiện để cập nhật Header
        setUser(null);
        navigate('/signin');
    };

    return (
        <>
            <div className="header">
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
                                    <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/user'}>
                                    <FaUser /> Đăng Nhập
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
