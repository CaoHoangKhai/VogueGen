import { FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { FaFacebookF, FaGoogle, FaInstagram, FaYoutube } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Button from "@mui/material/Button";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <>


            <div className="footer mt-4 py-2 bg-light">
                <div className="container">
                    <div className="row justify-content-start">
                        <div className="col-6">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase' }}>
                                CÔNG TY TNHH THỜI TRANG SHOPIFY
                            </strong>

                            <ul className="list-unstyled">
                                <li className="mb-1">Shopify đặt mục tiêu kinh doanh với chiến lược phát triển toàn diện, trong đó giá trị cộng đồng là yếu tố cốt lõi mà chúng tôi muốn hướng tới.</li>
                                <li className="mb-1"></li>
                                <hr />
                            </ul>
                            <ul className="list-unstyled">
                                <li className="d-flex align-items-center mb-2 gap-2">
                                    <FaMapMarkerAlt />
                                    <b>VPGD:</b>
                                    <span>Số 11 LK 11A KĐT Mỗ Lao, Q. Hà Đông, TP. Hà Nội</span>
                                </li>
                                <li className="d-flex align-items-center mb-2 gap-2">
                                    <MdEmail />
                                    <b>Email:</b>
                                    <span>khaib2106839@student.ctu.edu.vn</span>
                                </li>
                                <li className="d-flex align-items-center mb-1 gap-2">
                                    <FaPhoneAlt />
                                    <b>Hotline:</b>
                                    <span>0834477131</span>
                                </li>
                            </ul>
                        </div>

                        <div className="col-2">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase' }}>
                                VỀ Shopify
                            </strong>
                            <ul className="list-unstyled mb-4">
                                <li className="mb-1">Giới thiệu Shopify</li>
                                <li className="mb-1">Tuyển dụng</li>
                                <li className="mb-1">Hệ thống cửa hàng</li>
                                <li className="mb-1">Liên hệ</li>
                            </ul>
                        </div>

                        <div className="col-2">

                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase' }}>
                                HƯỚNG DẪN
                            </strong>
                            <ul className="list-unstyled mb-4">
                                <li className="mb-1">Hướng dẫn mua hàng</li>
                                <li className="mb-1">Quy trình đổi trả hàng</li>
                                <li className="mb-1">Điều khoản mua hàng</li>
                                <li className="mb-1"></li>
                            </ul>

                        </div>

                        <div className="col-2">
                            <strong className="d-block mb-2" style={{ textTransform: 'uppercase' }}>
                                Chính sách
                            </strong>
                            <ul className="list-unstyled mb-4">

                                <Link className="text-decoration-none quick-link text-secondary" to={'/phuong_thu_thanh_toan'}>
                                    <li className="mb-1">Phương thức thanh toán</li>
                                </Link>

                                <Link className="text-decoration-none quick-link text-secondary" to={'/phuong_thu_giao_hang'}>
                                    <li className="mb-1">Phương thức giao hàng</li>
                                </Link>

                                <Link className="text-decoration-none quick-link text-secondary" to={'/chinh_sach_doi_tra'}>
                                    <li className="mb-1">Chính sách đổi trả</li>
                                </Link>

                                <Link className="text-decoration-none quick-link text-secondary" to={'/chinh_sach_bao_mat'}>
                                    <li className="mb-1">Chính sách bảo mật</li>
                                </Link>

                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            <div className="footer mt-5 py-4 bg-dark">
                <div className="container text-white text-center row">

                    <div className="col-8 text-center">
                        © 2025
                    </div>

                    <div className="col-4 d-flex justify-content-center">
                        <div className="d-flex gap-3">
                            <Button
                                variant="outlined"
                                className="btn btn-outline-primary"
                                style={{ borderRadius: "50%", padding: "10px" }}
                            >
                                <FaFacebookF style={{ fontSize: '20px' }} />
                            </Button>

                            <Button
                                variant="outlined"
                                className="btn btn-outline-danger"
                                style={{ borderRadius: "50%", padding: "10px" }}
                            >
                                <FaGoogle style={{ fontSize: '20px' }} />
                            </Button>

                            <Button
                                variant="outlined"
                                className="btn btn-outline-secondary"
                                style={{ borderRadius: "50%", padding: "10px" }}
                            >
                                <FaInstagram style={{ fontSize: '20px' }} />
                            </Button>

                            <Button
                                variant="outlined"
                                className="btn btn-outline-danger"
                                style={{ borderRadius: "50%", padding: "10px" }}
                            >
                                <FaYoutube style={{ fontSize: '20px' }} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;