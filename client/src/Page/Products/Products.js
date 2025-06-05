import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { getAllProducts } from "../../api/products.api";

const Products = () => {
    const [searchParams] = useSearchParams();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const navigate = useNavigate();
    const [input, setInput] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await getAllProducts();

            const k = searchParams.get("keyword") || "";
            setInput(k);

            const filtered = allProducts.filter(p =>
                p.tensanpham.toLowerCase().includes(k.toLowerCase()) ||
                p.mota.toLowerCase().includes(k.toLowerCase())
            );
            setFilteredProducts(filtered);
        };

        loadProducts();
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(`/products?keyword=${encodeURIComponent(input)}`);
    };

    return (
        <div className="container" style={{ display: "flex", flexDirection: "row" }}>
            <Navbar />
            <div style={{ flex: 1, padding: "24px" }}>
                <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "1px solid #ccc",
                            fontSize: 16
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px 16px",
                            borderRadius: 8,
                            border: "none",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 16
                        }}
                    >
                        Search
                    </button>
                </form>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                    {filteredProducts.map(product => (
                        <Link
                            key={product._id}
                            to={`/products/detail/${product._id}`}
                            style={{
                                textDecoration: "none",
                                color: "inherit"
                            }}
                        >
                            <div
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    background: "#fafafa",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 350,
                                    overflow: "hidden"
                                }}
                            >
                                {/* Ảnh full màn hình phần trên */}
                                <div style={{
                                    width: "100%",
                                    height: "60%",
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderBottom: "1px solid #eee"
                                }}>
                                    <img
                                        src={`http://localhost:4000${product.hinhanh[0]?.url}`}
                                        alt={product.tensanpham}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                        }}
                                    />
                                </div>


                                {/* Thông tin sản phẩm */}
                                <div style={{
                                    width: "100%",
                                    height: "40%",
                                    padding: "12px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    overflow: "hidden"
                                }}>
                                    {/* Tên sản phẩm - tự động xuống dòng tại khoảng trắng */}
                                    <h5 style={{
                                        margin: "0 0 6px 0",
                                        fontSize: "14px",
                                        lineHeight: "1.4",
                                        wordWrap: "break-word",
                                        whiteSpace: "normal"
                                    }}>
                                        {product.tensanpham}
                                    </h5>

                                    {/* Màu sắc - tự xuống dòng nếu nhiều */}
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 4,
                                        marginBottom: 6
                                    }}>
                                        {product.mausanpham?.length > 0 ? (
                                            product.mausanpham.map((color, idx) => (
                                                <span
                                                    key={color._id || idx}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 6,
                                                        backgroundColor: color.mau,
                                                        border: "1px solid #ccc"
                                                    }}
                                                    title={color.mau}
                                                ></span>
                                            ))
                                        ) : (
                                            <span>Không có</span>
                                        )}
                                    </div>

                                    {/* Kích thước */}
                                    <div style={{
                                        fontSize: "13px",
                                        marginBottom: 6
                                    }}>
                                        {product.kichthuoc?.length > 0 ? (
                                            product.kichthuoc.map((sz, idx) => (
                                                <span key={sz._id || idx} style={{ marginRight: 8 }}>{sz.size}</span>
                                            ))
                                        ) : (
                                            <span>Không có</span>
                                        )}
                                    </div>

                                    {/* Giá sản phẩm */}
                                    <p style={{
                                        fontWeight: "bold",
                                        color: "#d0021b",
                                        fontSize: "15px",
                                        margin: 0
                                    }}>
                                        {product.giasanpham.toLocaleString()} đ
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Products;