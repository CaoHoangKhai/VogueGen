import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>
            <div className="footer mt-2 py-3"            >
                <div className="container">
                    <div className="row justify-content-start">
                        <div className="col-6">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase', color: "#0097a7" }}>
                                CÔNG TY TNHH THỜI TRANG SHOPIFY
                            </strong>
                            <ul className="list-unstyled">
                                <li className="mb-1" style={{ color: "#00695c" }}>
                                    Shopify đặt mục tiêu kinh doanh với chiến lược phát triển toàn diện, trong đó giá trị cộng đồng là yếu tố cốt lõi mà chúng tôi muốn hướng tới.
                                </li>
                                <li className="mb-1"></li>
                                <hr />
                            </ul>
                            <ul className="list-unstyled">
                                <li className="d-flex align-items-center mb-2 gap-2" style={{ color: "#00838f" }}>
                                    <FaMapMarkerAlt />
                                    <b>VPGD:</b>
                                    <span>Số 11 LK 11A KĐT Mỗ Lao, Q. Hà Đông, TP. Hà Nội</span>
                                </li>
                                <li className="d-flex align-items-center mb-2 gap-2" style={{ color: "#0288d1" }}>
                                    <MdEmail />
                                    <b>Email:</b>
                                    <span>khaib2106839@student.ctu.edu.vn</span>
                                </li>
                                <li className="d-flex align-items-center mb-1 gap-2" style={{ color: "#43A047" }}>
                                    <FaPhoneAlt />
                                    <b>Hotline:</b>
                                    <span>0834477131</span>
                                </li>
                            </ul>
                        </div>

                        <div className="col-2">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase', color: "#0097a7" }}>
                                VỀ Shopify
                            </strong>
                            <ul className="list-unstyled mb-4">
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#00838f" }} to="#">Giới thiệu Shopify</Link></li>
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#00838f" }} to="#">Tuyển dụng</Link></li>
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#00838f" }} to="#">Hệ thống cửa hàng</Link></li>
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#00838f" }} to="#">Liên hệ</Link></li>
                            </ul>
                        </div>

                        <div className="col-2">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase', color: "#0097a7" }}>
                                HƯỚNG DẪN
                            </strong>
                            <ul className="list-unstyled mb-4">
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#0288d1" }} to="#">Hướng dẫn mua hàng</Link></li>
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#0288d1" }} to="#">Quy trình đổi trả hàng</Link></li>
                                <li className="mb-1"><Link className="text-decoration-none" style={{ color: "#0288d1" }} to="#">Điều khoản mua hàng</Link></li>
                            </ul>
                        </div>

                        <div className="col-2">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase', color: "#0097a7" }}>
                                Chính sách
                            </strong>
                            <ul className="list-unstyled mb-4">
                                <li className="mb-1">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to={'/phuong_thu_thanh_toan'}>
                                        Phương thức thanh toán
                                    </Link>
                                </li>
                                <li className="mb-1">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to={'/phuong_thu_giao_hang'}>
                                        Phương thức giao hàng
                                    </Link>
                                </li>
                                <li className="mb-1">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to={'/chinh_sach_doi_tra'}>
                                        Chính sách đổi trả
                                    </Link>
                                </li>
                                <li className="mb-1">
                                    <Link className="text-decoration-none" style={{ color: "#43A047" }} to={'/chinh_sach_bao_mat'}>
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr style={{ borderTop: "1px solid #0097a7" }} />
                    <div className="row">
                        <div className="col-12 text-center" style={{ color: "#00838f", fontWeight: 500 }}>
                            © 2025 Shopify Fashion. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;