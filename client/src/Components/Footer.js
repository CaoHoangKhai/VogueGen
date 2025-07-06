import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>
            <div className="footer mt-2 py-4 bg-light">
                <div className="container">
                    <div className="row">
                        {/* VỀ SHOPIFY */}
                        <div className="col-md-2 col-sm-6 mb-4">
                            <h6 className="text-uppercase mb-3" style={{ color: "#0097a7" }}>
                                Về Shopify
                            </h6>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#00838f" }} to="/about_us">
                                        Giới thiệu Shopify
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#00838f" }} to="/ai_thu_ao">
                                        Trải nghiệm thử áo
                                    </Link>
                                </li>

                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#00838f" }} to="/contact">
                                        Liên hệ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* HƯỚNG DẪN */}
                        <div className="col-md-3 col-sm-6 mb-4">
                            <h6 className="text-uppercase mb-3" style={{ color: "#0097a7" }}>
                                Hướng dẫn
                            </h6>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#0288d1" }} to="/huong_dan/huong_dan_mua_hang">
                                        Hướng dẫn mua hàng
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#0288d1" }} to="/huong_dan/thiet_ke_ao">
                                        Hướng dẫn thiết kế áo cá nhân
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#0288d1" }} to="/huong_dan/quy_trinh_doi_tra_hang">
                                        Quy trình đổi trả hàng
                                    </Link>
                                </li>

                            </ul>

                        </div>

                        {/* CHÍNH SÁCH */}
                        <div className="col-md-2 col-sm-6 mb-4">
                            <h6 className="text-uppercase mb-3" style={{ color: "#0097a7" }}>
                                Chính sách
                            </h6>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to="/chinh_sach/phuong_thuc_thanh_toan">
                                        Phương thức thanh toán
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to="/chinh_sach/phuong_thuc_giao_hang">
                                        Phương thức giao hàng
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to="/chinh_sach/chinh_sach_doi_tra">
                                        Chính sách đổi trả
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to="/chinh_sach/chinh_sach_bao_mat">
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                                <li className="mb-2">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to="/chinh_sach/dieu_khoan_thanh_toan">
                                        Điều khoản thanh toán
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* LIÊN HỆ */}
                        <div className="col-md-5 col-sm-6 mb-4">
                            <h6 className="text-uppercase mb-3" style={{ color: "#0097a7" }}>
                                Liên hệ
                            </h6>
                            <ul className="list-unstyled">
                                <li className="mb-2" style={{ color: "#00695c" }}>
                                    Shopify hướng đến giá trị cộng đồng trong kinh doanh thời trang ứng dụng AI cá nhân hoá.
                                </li>
                                <li className="d-flex align-items-center gap-2 mb-2" style={{ color: "#00838f" }}>
                                    <FaMapMarkerAlt />
                                    <span>Trường Đại Học Cần Thơ</span>
                                </li>
                                <li className="d-flex align-items-center gap-2 mb-2" style={{ color: "#0288d1" }}>
                                    <MdEmail />
                                    <span>khaib2106839@student.ctu.edu.vn</span>
                                </li>
                                <li className="d-flex align-items-center gap-2" style={{ color: "#43A047" }}>
                                    <FaPhoneAlt />
                                    <span>0834 477 131</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <hr style={{ borderTop: "1px solid #0097a7" }} />

                    <div className="text-center" style={{ color: "#00838f", fontWeight: 500 }}>
                        © 2025 Shopify Fashion. All rights reserved.
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
