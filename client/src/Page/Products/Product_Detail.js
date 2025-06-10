import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductById } from '../../api/Admin/products.api';
import { toggleFavorite as toggleFavoriteApi } from '../../api/favorite.api';
import { colors } from "../../config/colors";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [user, setUser] = useState(null);
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

    // Khởi tạo tooltip Bootstrap khi sản phẩm đã load
    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => {
            new window.bootstrap.Tooltip(el);
        });
    }, [product]);

    // Load trạng thái yêu thích từ localStorage khi id hoặc product thay đổi
    useEffect(() => {
        if (!id) return;
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setIsFavorite(favorites.includes(id));
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!userId || !id) return;
        try {
            await toggleFavoriteApi(userId, id); // truyền 2 tham số riêng biệt
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            let newFavorites;
            if (isFavorite) {
                newFavorites = favorites.filter(favId => favId !== id);
            } else {
                newFavorites = [...favorites, id];
            }
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error("toggleFavoriteApi error:", err);
            alert("Có lỗi khi cập nhật yêu thích!");
        }
    };

    if (!product) {
        return <div className="container mt-4">Đang tải chi tiết sản phẩm...</div>;
    }

    // Render danh sách hình nhỏ (thumbnail)
    const renderImageThumbnails = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginRight: 12, maxHeight: 320, overflowY: "auto" }}>
            {product.hinhanh?.map((img) => (
                <img
                    key={img._id}
                    src={img.url}
                    alt={img.tenfile}
                    style={{
                        width: 60,
                        height: 60,
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

    // Render ảnh chính
    const renderMainImage = () => (
        <div style={{
            borderRadius: 8,
            padding: 8,
            background: "#fff",
            flexGrow: 1,
            maxWidth: 320,
            height: 320,
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

    // Render kích thước
    const renderSizes = () => (
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
                        {sz.size} ({sz.soluong})
                    </span>
                ))}
            </div>
        ) : <span>Không có</span>
    );

    // Render màu sắc
    const renderColors = () => (
        product.mausanpham?.length > 0 ? (
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
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
                borderRadius: "50%", // Bo tròn
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

    // Render mô tả sản phẩm
    const renderDescription = () => (
        <div className="product-description" style={{ padding: 16, borderRadius: 6, border: "1px solid #ddd", minHeight: 120 }}>
            <div dangerouslySetInnerHTML={{ __html: product.mota }} />
        </div>
    );

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Phần ảnh sản phẩm */}
                <div className="col-md-4 mb-4 d-flex flex-column">
                    {renderMainImage()}
                    <div className="mt-3 d-flex justify-content-start">
                        {renderImageThumbnails()}
                    </div>
                </div>

                {/* Phần thông tin sản phẩm */}
                <div className="col-md-7">
                    <h2 style={{ fontWeight: 600 }}>{product.tensanpham}</h2>

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
                        >
                            Thêm vào giỏ hàng
                        </button>

                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            {renderFavoriteIcon()}
                        </div>
                    </div>
                </div>
            </div>

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