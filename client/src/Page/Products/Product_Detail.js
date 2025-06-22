import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getProductById } from '../../api/Admin/products.api';
import {
    toggleFavorite as toggleFavoriteApi,
    checkIsFavorite as checkIsFavoriteApi
} from '../../api/favorite.api';
import { colors } from "../../config/colors";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from "../../Components/Toast";
import { addToCart } from '../../api/User/cart.api';
import { createDesign } from "../../api/Design/design.api";
const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const availableSizes = product?.kichthuoc || [];
    const colorRef = useRef();
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    const userId = user?._id;

    // Lấy tên màu dựa trên mã màu
    const getColorName = (code) => {
        const found = colors.find(c => c.code.toLowerCase() === code.toLowerCase());
        return found ? found.color : "Không rõ";
    };

    // Khởi tạo lại tooltip khi product thay đổi
    useEffect(() => {
        if (window.bootstrap && colorRef.current) {
            const tooltipTriggerList = colorRef.current.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(el => {
                new window.bootstrap.Tooltip(el);
            });
        }
    }, [product]);

    // Lấy dữ liệu sản phẩm theo id
    useEffect(() => {
        if (id) {
            getProductById(id)
                .then((prod) => {
                    setProduct(prod);
                    setMainImg(prod?.hinhanh?.[0]?.url || null);
                })
                .catch(() => {
                    setProduct(null);
                    setMainImg(null);
                });
        }
    }, [id]);

    // Kiểm tra trạng thái yêu thích từ API khi userId hoặc id thay đổi
    useEffect(() => {
        const checkFavorite = async () => {
            if (!userId || !id) {
                setIsFavorite(false);
                return;
            }
            try {
                const res = await checkIsFavoriteApi(userId, id);
                setIsFavorite(!!res?.isFavorite);
            } catch (err) {
                setIsFavorite(false);
            }
        };
        checkFavorite();
    }, [userId, id]);

    // Toggle trạng thái yêu thích qua API
    const handleToggleFavorite = async () => {
        if (!user?._id) {
            setToast({
                show: true,
                message: (
                    <>
                        Bạn cần{" "}
                        <a href="/auth/signin" style={{ color: "#00bcd4", textDecoration: "underline" }}>
                            đăng nhập
                        </a>{" "}
                        để tiếp tục
                    </>
                ),
                type: "error"
            });
            return;
        }
        try {
            await toggleFavoriteApi(userId, id);
            const res = await checkIsFavoriteApi(userId, id);
            setIsFavorite(!!res?.isFavorite);
        } catch (err) {
            setToast({ show: true, message: "Có lỗi khi cập nhật yêu thích!", type: "error" });
        }
    };

    const handleCustomize = async () => {
        if (!user?._id) {
            setToast({
                show: true,
                message: (
                    <>
                        Bạn cần{" "}
                        <a href="/auth/signin" style={{ color: "#00bcd4", textDecoration: "underline" }}>
                            đăng nhập
                        </a>{" "}
                        để tiếp tục
                    </>
                ),
                type: "error"
            });
            return;
        }
        if (!product?.theloai) {
            setToast({ show: true, message: "Thiếu thông tin thể loại sản phẩm!", type: "error" });
            return;
        }

        try {
            const res = await createDesign({
                manguoidung: user._id,
                theloai: product.theloai
            });
            if (res.success) {
                setToast({ show: true, message: res.message, type: "success" });
                // Chuyển hướng sang trang thiết kế nếu muốn:
                window.location.href = `/design/${res.link}`;
            } else {
                setToast({ show: true, message: res.message || "Tạo thiết kế thất bại!", type: "error" });
            }
        } catch (err) {
            setToast({ show: true, message: "Có lỗi khi tạo thiết kế!", type: "error" });
        }
    };

    // Xử lý khi bấm Thêm vào giỏ hàng (mở modal)
    const handleAddToCart = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    // Gửi dữ liệu lên backend khi bấm Thêm vào giỏ hàng trong modal
    const handleSubmitAddToCart = async () => {
        if (!selectedColor) {
            setToast({ show: true, message: "Vui lòng chọn màu!", type: "error" });
            return;
        }
        if (!selectedSizes.length) {
            setToast({ show: true, message: "Vui lòng chọn size và số lượng!", type: "error" });
            return;
        }
        let hasError = false;
        for (const { size, soluong } of selectedSizes) {
            const data = {
                manguoidung: user?._id,
                masanpham: product._id,
                soluong,
                size,
                mausac: selectedColor
            };
            try {
                await addToCart(data);
            } catch (err) {
                hasError = true;
            }
        }
        if (hasError) {
            setToast({ show: true, message: "Có lỗi khi thêm vào giỏ hàng!", type: "error" });
        } else {
            setToast({ show: true, message: "Đã thêm vào giỏ hàng!", type: "success" });
            setShowModal(false);
        }
    };

    if (!product) {
        return <div className="container mt-4">Đang tải chi tiết sản phẩm...</div>;
    }

    // Render danh sách hình nhỏ (thumbnail)
    function renderImageThumbnails() {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginRight: 12, maxHeight: 470, overflowY: "auto" }}>
                {product.hinhanh?.map((img) => (
                    <img
                        key={img._id}
                        src={img.url}
                        alt={img.tenfile}
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: mainImg === img.url ? "2px solid #007bff" : "1px solid #ccc",
                            cursor: "pointer",
                            background: "#f8f9fa",
                            flexShrink: 0
                        }}
                        onClick={() => setMainImg(img.url)}
                    />
                ))}
            </div>
        );
    }

    // Render ảnh chính
    function renderMainImage() {
    return (
        <div style={{
            borderRadius: 8,
            padding: 8,
            background: "#fff",
            flexGrow: 1,
            maxWidth: 480, // Tăng kích thước tối đa
            height: 480,    // Tăng chiều cao
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {mainImg ? (
                <img
                    src={mainImg}
                    alt={product.tensanpham}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                />
            ) : (
                <div style={{ color: "#888" }}>Không có ảnh</div>
            )}
        </div>
    );
}


    // Render kích thước
    function renderSizes() {
        return (
            product.kichthuoc?.length > 0 ? (
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    {product.kichthuoc.map((sz) => (
                        <span
                            key={sz._id}
                            style={{
                                minWidth: 32,
                                padding: "2px 8px",
                                border: "1px solid #007bff",
                                borderRadius: 6,
                                background: "#f0f8ff",
                                color: "#007bff",
                                fontSize: 13,
                                fontWeight: 500,
                                textAlign: "center",
                                lineHeight: 1.5
                            }}
                        >
                            {sz.size}
                        </span>
                    ))}
                </div>
            ) : <span>Không có</span>
        );
    }

    // Render màu sắc
    const renderColors = () => (
        product.mausanpham?.length > 0 ? (
            <div ref={colorRef} style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                {product.mausanpham.map((mau, index) => (
                    <div key={index} style={{ textAlign: "center" }}>
                        <span
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={getColorName(mau)}
                            style={{
                                width: 24,
                                height: 24,
                                background: mau,
                                border: "1px solid #333",
                                borderRadius: "4px",
                                display: "inline-block",
                                cursor: "default",
                                transition: "border 0.2s"
                            }}
                        />
                    </div>
                ))}
            </div>
        ) : <span>Không có</span>
    );

    const renderFavoriteIcon = () => (
        <button
            onClick={handleToggleFavorite}
            aria-pressed={isFavorite}
            title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
            style={{
                backgroundColor: "#fff",
                border: `2px solid ${isFavorite ? "#e53935" : "#ccc"}`,
                color: isFavorite ? "#e53935" : "#aaa",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                marginLeft: 12,
                transition: "all 0.3s ease"
            }}
        >
            {isFavorite ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24px"
                    height="24px"
                >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 
                2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 
                22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
                11.54L12 21.35z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="24px"
                    height="24px"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 
                5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 
                1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 
                5.5 0 0 0 0-7.78z" />
                </svg>
            )}
        </button>
    );

    const renderDescription = () => (
        <div className="product-description" style={{ padding: 16, borderRadius: 6, border: "1px solid #ddd", minHeight: 120 }}>
            <div dangerouslySetInnerHTML={{ __html: product.mota }} />
        </div>
    );

    // Chọn màu trong modal
    const inputColors = () => (
        product.mausanpham?.length > 0 ? (
            <div ref={colorRef} style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                {product.mausanpham.map((mau, index) => (
                    <div key={index} style={{ textAlign: "center" }}>
                        <span
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={getColorName(mau)}
                            style={{
                                width: 24,
                                height: 24,
                                background: mau,
                                border: selectedColor === mau ? "2px solid #007bff" : "1px solid #333",
                                borderRadius: "4px",
                                display: "inline-block",
                                cursor: "pointer",
                                transition: "border 0.2s"
                            }}
                            onClick={() => setSelectedColor(mau)}
                        />
                    </div>
                ))}
            </div>
        ) : <span>Không có</span>
    );

    // Chọn size và số lượng trong modal
    function inputSizeProduct() {
        

        const toggleSize = (size) => {
            setSelectedSizes((prev) => {
                const exists = prev.find((s) => s.size === size);
                if (exists) {
                    return prev.filter((s) => s.size !== size);
                } else {
                    return [...prev, { size, soluong: 1 }];
                }
            });
        };

        
        return (
            <>
                <div className="mb-3">
                    <label className="form-label fw-bold">Chọn Size:</label>
                    <div className="d-flex flex-wrap gap-2 border p-3 rounded">
                        {availableSizes.map((size) => {
                            const isSelected = selectedSizes.some((s) => s.size === size.size);
                            return (
                                <button
                                    key={size._id}
                                    type="button"
                                    className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                                    onClick={() => toggleSize(size.size)}
                                    disabled={size.soluong === 0}
                                >
                                    {size.size} {size.soluong === 0 && "(Hết hàng)"}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Phần ảnh sản phẩm */}
                <div className="col-md-6 mb-4">
                    <div className="d-flex align-items-start">
                        {/* Thumbnail nằm dọc bên trái */}
                        <div className="me-3 d-flex flex-column gap-2">
                            {renderImageThumbnails()}
                        </div>

                        {/* Ảnh chính */}
                        <div style={{ flex: 1 }}>
                            {renderMainImage()}
                        </div>
                    </div>
                </div>


                {/* Phần thông tin sản phẩm */}
                <div className="col-md-6">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "start",
                            gap: 8,
                        }}
                    >
                        <h2
                            style={{
                                fontWeight: 600,
                                margin: 0,
                                lineHeight: "1",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {product.tensanpham}
                        </h2>
                        <div
                            style={{
                                marginLeft: 8,
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            {renderFavoriteIcon()}
                        </div>
                    </div>

                    <div style={{ fontSize: 24, color: "#e53935", margin: "12px 0" }}>
                        <strong>{product.giasanpham?.toLocaleString("vi-VN") || "0"} đ</strong>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#888" }}>Danh mục: </span>
                        <strong>{product.tentheloai || "Không có"}</strong>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <span style={{ color: "#888" }}>Kích thước:</span> {renderSizes()}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <span style={{ color: "#888" }}>Màu sắc:</span> {renderColors()}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                        <button
                            className="btn btn-primary"
                            style={{ minWidth: 160, fontWeight: 500 }}
                            onClick={handleAddToCart}
                        >
                            Thêm vào giỏ hàng
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            style={{ minWidth: 120, fontWeight: 500 }}
                            onClick={handleCustomize}
                        >
                            Thiết kế
                        </button>
                    </div>
                </div>
            </div>


            {/* Modal Bootstrap khi thêm vào giỏ hàng */}
            {showModal && (
                <div className="modal fade show" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm vào giỏ hàng</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: "#888" }}></span> {inputSizeProduct()}
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: "#888" }}></span> {inputColors()}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmitAddToCart}
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hiển thị Toast */}
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

            {/* Phần tab mô tả và thông tin thêm */}
            <div className="modal-body mt-4">
                <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                            className="nav-link active"
                            id="nav-home-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-home"
                            type="button"
                            role="tab"
                            aria-selected="true"
                        >
                            Mô tả sản phẩm
                        </button>
                        <button
                            className="nav-link"
                            id="nav-profile-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-profile"
                            type="button"
                            role="tab"
                            aria-selected="false"
                        >
                            Thông tin thêm
                        </button>
                    </div>
                </nav>

                <div className="tab-content mt-3" id="nav-tabContent">
                    <div
                        className="tab-pane fade show active"
                        id="nav-home"
                        role="tabpanel"
                        aria-labelledby="nav-home-tab"
                    >
                        {renderDescription()}
                    </div>
                    <div
                        className="tab-pane fade"
                        id="nav-profile"
                        role="tabpanel"
                        aria-labelledby="nav-profile-tab"
                    >
                        <p style={{ color: "#666", fontStyle: "italic" }}>Chưa có nội dung.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;