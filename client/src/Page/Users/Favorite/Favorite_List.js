import React, { useEffect, useState } from "react";
import { getFavoritesByUser, deleteFavoriteById } from "../../../api/favorite.api";
import { useNavigate } from "react-router-dom";

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user?._id) return;
            try {
                const response = await getFavoritesByUser(user._id);
                setFavorites(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách yêu thích:", error);
            }
        };
        fetchFavorites();
    }, [user]);

    const handleRemoveFavorite = async (mayeuthich) => {
        try {
            await deleteFavoriteById(mayeuthich);
            const response = await getFavoritesByUser(user._id);
            setFavorites(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Lỗi khi xoá sản phẩm yêu thích:", error);
        }
    };

    return (
        <div className="container py-4">
            <h4 className="mb-4 fw-bold text-primary">📌 Danh sách sản phẩm yêu thích</h4>
            <div className="row g-3">
                {favorites.map((product, index) => (
                    <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                        <div
                            className="card h-100 shadow-sm border-0 position-relative product-card"
                            onClick={() => navigate(`/products/detail/${product._id}`)}
                            style={{ cursor: "pointer", transition: "transform 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                            {/* Nút xoá */}
                            <button
                                className="btn-close position-absolute"
                                style={{ top: "8px", right: "8px", zIndex: 2 }}
                                aria-label="Xoá khỏi yêu thích"
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngăn điều hướng khi xoá
                                    handleRemoveFavorite(product.mayeuthich);
                                }}
                            ></button>

                            {/* Ảnh sản phẩm */}
                            <img
                                src={product.hinhanh?.[0]?.url || "/placeholder.jpg"}
                                className="card-img-top"
                                alt={product.tensanpham}
                                style={{
                                    height: "130px",
                                    objectFit: "contain",
                                    backgroundColor: "#f8f9fa"
                                }}
                            />

                            {/* Thông tin */}
                            <div className="card-body p-2">
                                <h6 className="card-title mb-1 text-truncate">{product.tensanpham}</h6>
                                <p className="text-danger fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                                    {product.giasanpham?.toLocaleString()} đ
                                </p>

                                {/* Kích thước */}
                                <div className="mb-1">
                                    <small className="text-muted">Kích thước:</small><br />
                                    {product.kichthuoc?.map((kt) => (
                                        <span key={kt._id} className="badge bg-secondary me-1">{kt.size}</span>
                                    ))}
                                </div>

                                {/* Màu sắc */}
                                <div>
                                    <small className="text-muted">Màu sắc:</small><br />
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                        {product.mausanpham?.map((color, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-circle border"
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    backgroundColor: color
                                                }}
                                            ></span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {favorites.length === 0 && (
                    <div className="col-12 text-center mt-4 text-muted">
                        Bạn chưa có sản phẩm nào trong danh sách yêu thích 💔
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteList;
