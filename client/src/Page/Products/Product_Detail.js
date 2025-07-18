import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, getImagesByColor } from "../../api/Product/product.api";
import { colors } from "../../config/colors";
import {
    toggleFavorite as toggleFavoriteApi,
    checkIsFavorite as checkIsFavoriteApi,
} from "../../api/favorite.api";
import { addToCart } from "../../api/Cart/cart.api";
import Toast from "../../Components/Toast";
import { createDesign } from "../../api/Design/design.api";

import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState(null);
    const [activeColor, setActiveColor] = useState(null);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [imagesByPosition, setImagesByPosition] = useState({});
    const [user, setUser] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const navigate = useNavigate();
    const userId = user?._id;

    const getBase64Image = (img) =>
        `data:${img.contentType};base64,${img.data}`;

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            checkIsFavoriteApi(parsed._id, id).then((res) => {
                setIsFavorite(!!res?.isFavorite);
            });
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;
        getProductById(id).then((prod) => {
            if (!prod) return;
            setProduct(prod);
            const defaultColor = prod.mausanpham?.[0]?.mau;
            setActiveColor(defaultColor);
        });
    }, [id]);

    useEffect(() => {
        if (!id || !activeColor) return;
        console.log("🟡 gọi getImagesByColor với:", id, activeColor); // ← CHECK
        getImagesByColor(id, activeColor).then((images) => {
            if (images?.length) {
                const grouped = {};
                images.forEach((img) => {
                    if (!grouped[img.vitri]) grouped[img.vitri] = [];
                    grouped[img.vitri].push(img);
                });
                setImagesByPosition(grouped);
                setMainImg(getBase64Image(images[0]));
            } else {
                setImagesByPosition({});
                setMainImg(null);
            }
        });
    }, [id, activeColor]);

    const handleToggleSize = (size) => {
        setSelectedSizes((prev) =>
            prev.includes(size)
                ? prev.filter((s) => s !== size)
                : [...prev, size]
        );
    };

    const handleToggleFavorite = async () => {
        if (!userId) {
            return setToast({
                show: true,
                message: (
                    <>
                        Bạn cần{" "}
                        <a href="/auth/signin" style={{ color: "#00bcd4" }}>
                            đăng nhập
                        </a>{" "}
                        để yêu thích sản phẩm.
                    </>
                ),
                type: "warning",
            });
        }

        try {
            await toggleFavoriteApi(userId, id);
            const res = await checkIsFavoriteApi(userId, id);
            setIsFavorite(!!res?.isFavorite);
        } catch {
            setToast({
                show: true,
                message: "Lỗi khi cập nhật yêu thích!",
                type: "error",
            });
        }
    };

    const handleAddToCart = async () => {
        if (!userId) {
            return setToast({
                show: true,
                message: (
                    <>
                        Bạn cần{" "}
                        <a href="/auth/signin" style={{ color: "#00bcd4" }}>
                            đăng nhập
                        </a>{" "}
                        để thêm vào giỏ hàng.
                    </>
                ),
                type: "warning",
            });
        }

        if (!activeColor || selectedSizes.length === 0) {
            return setToast({
                show: true,
                message: "Vui lòng chọn màu và kích thước!",
                type: "warning",
            });
        }

        try {
            const requests = selectedSizes.map((size) =>
                addToCart({
                    manguoidung: userId,
                    masanpham: product._id,
                    soluong: 1,
                    size,
                    mausac: activeColor,
                })
            );
            await Promise.all(requests);

            // ✅ Hiển thị toast và reset size đã chọn
            setToast({ show: true, message: "Đã thêm vào giỏ hàng!", type: "success" });
            setSelectedSizes([]); // ← RESET ở đây
        } catch (err) {
            setToast({
                show: true,
                message: "Lỗi khi thêm vào giỏ hàng!",
                type: "error",
            });
        }
    };
    const handleGoToDesign = async () => {
        if (!userId) {
            return setToast({
                show: true,
                message: (
                    <>
                        Bạn cần{" "}
                        <a href="/auth/signin" style={{ color: "#00bcd4" }}>
                            đăng nhập
                        </a>{" "}
                        để sử dụng tính năng thiết kế.
                    </>
                ),
                type: "warning",
            });
        }

        if (!product || !product.theloai || !activeColor) {
            return setToast({
                show: true,
                message: "Thiếu thông tin sản phẩm hoặc màu sắc.",
                type: "warning",
            });
        }

        try {
            const res = await createDesign({
                manguoidung: userId,
                theloai: product.theloai,
                masanpham: product._id,          // 👈 Gửi thêm mã sản phẩm
                mausac: activeColor              // 👈 Gửi thêm mã màu
            });

            if (res.success) {
                navigate(`/design/${res.link}`);
            } else {
                setToast({ show: true, message: res.message, type: "error" });
            }
        } catch (err) {
            console.error("❌ Lỗi khi tạo thiết kế:", err);
            setToast({
                show: true,
                message: "Đã xảy ra lỗi khi tạo thiết kế.",
                type: "error",
            });
        }
    };


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
                transition: "all 0.3s ease",
            }}
        >
            {isFavorite ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 
              2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
              4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 
              22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
              11.54L12 21.35z" />
                </svg>
            ) : (
                <svg
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
        <div dangerouslySetInnerHTML={{ __html: product?.mota || "" }} />
    );

    if (!product) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-info" role="status" />
                <p>Đang tải sản phẩm...</p>
            </div>
        );
    }

    return (
        <>
            <div className="container mt-5">
                <div className="row">
                    {/* Hình ảnh */}
                    <div className="col-md-6 d-flex">
                        <div style={{ marginRight: 12 }}>
                            {Object.entries(imagesByPosition).map(([pos, imgs]) => (
                                <div key={pos} className="mb-2">
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {imgs.map((img) => {
                                            const base64 = getBase64Image(img);
                                            return (
                                                <img
                                                    key={img._id}
                                                    src={base64}
                                                    alt={pos}
                                                    onClick={() => setMainImg(base64)}
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                        objectFit: "cover",
                                                        border:
                                                            mainImg === base64
                                                                ? "2px solid #007bff"
                                                                : "1px solid #ccc",
                                                        borderRadius: 4,
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                width: 400,
                                height: 400,
                                borderRadius: 8,
                                background: "#fff",
                                padding: 8,
                            }}
                        >
                            {mainImg ? (
                                <img
                                    src={mainImg}
                                    alt="main"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 8,
                                    }}
                                />
                            ) : (
                                <div className="text-muted">Không có ảnh</div>
                            )}
                        </div>
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                            <h2 className="me-2">{product.tensanpham}</h2>
                            {renderFavoriteIcon()}
                        </div>
                        <p>
                            <strong>Giá:</strong>{" "}
                            {product.giasanpham?.toLocaleString("vi-VN")} đ
                        </p>
                        <p>
                            <strong>Danh mục:</strong> {product.tendanhmuc}
                        </p>
                        {/* Màu sắc */}
                        <div className="mb-3">
                            <strong className="d-block mb-2">Màu sắc:</strong>
                            <div style={{ display: "flex", gap: 10 }}>
                                {product.mausanpham.map((mau) => {
                                    const matched = colors.find((c) => c.code === mau.mau);
                                    return (
                                        <div
                                            key={mau._id}
                                            onClick={() => setActiveColor(mau.mau)}
                                            title={matched?.color}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                backgroundColor: mau.mau,
                                                border: "1px solid #ccc",
                                                borderRadius: "50%",
                                                cursor: "pointer",
                                                position: "relative",
                                            }}
                                        >
                                            {activeColor === mau.mau && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: -6,
                                                        right: -6,
                                                        backgroundColor: "#fff",
                                                        borderRadius: "50%",
                                                        padding: 2,
                                                        border: "1px solid #007bff",
                                                        color: "#007bff",
                                                        fontSize: 12,
                                                        fontWeight: "bold",
                                                        width: 18,
                                                        height: 18,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="mb-3">
                            <strong>Kích thước:</strong>
                            <div style={{ display: "flex", gap: 8 }}>
                                {product.kichthuoc?.map((kt) => (
                                    <button
                                        key={kt._id}
                                        className={`btn btn-sm ${selectedSizes.includes(kt.size)
                                            ? "btn-primary text-white"
                                            : "btn-outline-primary"
                                            }`}
                                        onClick={() => handleToggleSize(kt.size)}
                                    >
                                        {kt.size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-primary" onClick={handleAddToCart}>
                                Thêm vào giỏ hàng
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleGoToDesign}
                            >
                                Thiết kế
                            </button>

                        </div>
                    </div>
                </div>

                {/* Mô tả */}
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
                                Chất liệu sản phẩm
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
                                {/* Thông tin thêm */}
                            </button>
                        </div>
                    </nav>

                    <div className="tab-content mt-3" id="nav-tabContent">
                        <div
                            className="tab-pane fade show active ps-3"
                            id="nav-home"
                            role="tabpanel"
                            aria-labelledby="nav-home-tab"
                        >
                            {renderDescription()}
                        </div>
                        <div
                            className="tab-pane fade ps-3"
                            id="nav-profile"
                            role="tabpanel"
                            aria-labelledby="nav-profile-tab"
                        >
                            <p style={{ color: "#666", fontStyle: "italic" }}>Chưa có nội dung.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Toast */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: "", type: "" })}
            />
        </>
    );
};

export default ProductDetail;
