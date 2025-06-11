import { useEffect, useState } from 'react';
import Logo from '../assets/images/header/VogueGen.jpg';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser } from "react-icons/fa";

// Màu fashion: tím, hồng, pastel
const navLinks = [
    { to: "/products", label: "Products" },
    { to: "/services", label: "Services" },
    { to: "/shipping", label: "Shipping" },
    { to: "/help-center", label: "Help Center" },
    { to: "/summer-sale", label: "Summer Sale", className: "text-pink fw-bold" }
];

const Header = () => {
    const [user, setUser] = useState(null);
    const location = useLocation();

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

    return (
        <>
            <div className="header">
                <div style={{ background: "linear-gradient(90deg, #C2185B 0%, #7B1FA2 100%)" }} className="text-white py-2">
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
                            <div className="d-flex gap-4 align-items-center">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`nav-link px-0 ${link.className || ""} ${location.pathname === link.to ? "active-link" : ""}`}
                                        style={{
                                            textDecoration: "none",
                                            fontWeight: link.to === "/summer-sale" ? 700 : 500,
                                            color: link.to === "/summer-sale" ? "#E91E63" : "#7B1FA2"
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

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