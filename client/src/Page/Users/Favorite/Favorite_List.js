import React, { useEffect, useState } from "react";
import axios from "axios";

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user?._id) return;
            try {
                const response = await axios.get(`http://localhost:4000/favorite/user/${user._id}`);
                const cleanedData = response.data
                    .filter(item => item.success && item.data)
                    .map(item => item.data);
                setFavorites(cleanedData);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách yêu thích:", error);
            }
        };
        fetchFavorites();
    }, [user]);

    const handleRemoveFavorite = async (productId) => {
        try {
            await axios.delete(`http://localhost:4000/favorite/${productId}`);
            setFavorites(prev => prev.filter(item => item._id !== productId));
        } catch (error) {
            console.error("Lỗi khi xoá sản phẩm yêu thích:", error);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">📌 Danh sách sản phẩm yêu thích</h2>
            <div className="row">
                {favorites.map((product, index) => (
                    <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2 mb-3">
                        <div className="card position-relative shadow-sm" style={{ fontSize: '0.85rem' }}>
                            {/* Nút X */}
                            <button
                                className="btn-close position-absolute"
                                style={{ top: '8px', right: '8px', zIndex: 10 }}
                                aria-label="Xoá khỏi yêu thích"
                                onClick={() => handleRemoveFavorite(product._id)}
                            ></button>

                            {/* Ảnh */}
                            <img
                                src={product.hinhanh?.[0]?.url}
                                className="card-img-top"
                                alt={product.tensanpham}
                                style={{
                                    height: "130px",
                                    objectFit: "contain",
                                    backgroundColor: "#f8f9fa"
                                }}
                            />

                            <div className="card-body p-2">
                                <h6 className="card-title mb-1">{product.tensanpham}</h6>
                                <p className="text-danger fw-bold mb-2" style={{ fontSize: "0.9rem" }}>
                                    {product.giasanpham.toLocaleString()} đ
                                </p>

                                {/* Kích thước */}
                                <div className="mb-1">
                                    <small className="text-muted">Kích thước:</small><br />
                                    {product.kichthuoc.map((kt) => (
                                        <span key={kt._id} className="badge bg-secondary me-1">{kt.size}</span>
                                    ))}
                                </div>

                                {/* Màu sắc */}
                                <div>
                                    <small className="text-muted">Màu sắc:</small><br />
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                        {product.mausanpham.map((color, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-circle border"
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
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
            </div>
        </div>
    );
};

export default FavoriteList;
