import { useEffect, useState } from 'react';
import Logo from '../assets/images/header/VogueGen.jpg';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { getAllCategories } from "../api/Category/category.api";

const navLinks = [
//   { to: "/products", label: "Tất cả sản phẩm" },
  { to: "/try-on", label: "Thử áo ảo" },
  { to: "/contact", label: "Liên hệ" },
  { to: "/news", label: "Tin tức" }
];


const Header = () => {
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const location = useLocation();

    // Lấy thông tin user từ localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Lắng nghe sự kiện đăng nhập thành công
    useEffect(() => {
        const handleLoginSuccess = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        window.addEventListener('loginSuccess', handleLoginSuccess);
        return () => window.removeEventListener('loginSuccess', handleLoginSuccess);
    }, []);

    // Gọi API lấy danh sách danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getAllCategories();
                setCategories(res);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            <div className="header">
                {/* Banner top */}
                <div style={{ background: "linear-gradient(90deg, #C2185B 0%, #7B1FA2 100%)" }} className="text-white py-2">
                    <div className="container">
                        <p className="mb-0 text-center">
                            50th Anniversary of the Liberation of Southern Vietnam and National Reunification.
                        </p>
                    </div>
                </div>

                {/* Main header */}
                <div className="container mt-3">
                    <div className="row align-items-center">

                        {/* Logo */}
                        <div className="col-sm-2">
                            <Link to={'/'}>
                                <img src={Logo} alt="VogueGen Logo" className="logo-img" />
                            </Link>
                        </div>

                        {/* Navigation menu */}
                        <div className="col-sm-6">
                            <div className="d-flex gap-3 align-items-center flex-wrap">

                                {/* Menu Tĩnh */}
                                {navLinks.map((link, idx) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`nav-link px-0 ${location.pathname === link.to ? "active-link" : ""}`}
                                        style={{
                                            fontWeight: link.to === "/summer-sale" ? 700 : 500,
                                            color: link.to === "/summer-sale" ? "#E91E63" : "#7B1FA2"
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                {/* Menu danh mục động */}
                                <div className="dropdown">
                                    <span
                                        className="nav-link dropdown-toggle"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{ cursor: "pointer", color: "#7B1FA2", fontWeight: 500 }}
                                    >
                                        Danh mục
                                    </span>
                                    <ul className="dropdown-menu">
                                        {categories.map((cate) => (
                                            <li key={cate._id}>
                                                <Link className="dropdown-item" to={`/category/${cate.slug}`}>
                                                    {cate.tendanhmuc}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* User / Cart */}
                        <div className="col-sm-4 d-flex justify-content-end gap-3">
                            {user ? (
                                user.VaiTro_id === 0 ? (
                                    <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/user/profile'}>
                                        <FaUser /> {user.hoten || "User"}
                                    </Link>
                                ) : user.VaiTro_id === 1 ? (
                                    <Link className="btn btn-outline-danger d-flex align-items-center gap-2" to={'/admin/dashboard'}>
                                        <FaUser />
                                    </Link>
                                ) : (
                                    <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/auth/signin'}>
                                        <FaUser /> Đăng Nhập
                                    </Link>
                                )
                            ) : (
                                <Link className="btn btn-outline-primary d-flex align-items-center gap-2" to={'/auth/signin'}>
                                    <FaUser /> Đăng Nhập
                                </Link>
                            )}

                            <Link className="btn btn-outline-success d-flex align-items-center gap-2" to={'/auth/cart'}>
                                <FaShoppingCart /> Giỏ Hàng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <hr />

            {/* CSS nội tuyến */}
            <style>
                {`
                .nav-link.active-link {
                    border-bottom: 2px solid #C2185B !important;
                    color: #C2185B !important;
                }
                .nav-link {
                    color: #7B1FA2;
                    text-decoration: none !important;
                    transition: color 0.2s;
                }
                .nav-link:hover {
                    color: #C2185B !important;
                }
                .text-pink {
                    color: #E91E63 !important;
                }
                `}
            </style>
        </>
    );
};

export default Header;
