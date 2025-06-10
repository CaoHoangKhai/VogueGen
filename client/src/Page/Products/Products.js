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
            const res = await getAllProducts();
            const allProducts = Array.isArray(res?.data) ? res.data : [];

            const keyword = searchParams.get("keyword") || "";
            setInput(keyword);

            const filtered = allProducts.filter(p =>
                p.tensanpham.toLowerCase().includes(keyword.toLowerCase()) ||
                p.mota.toLowerCase().includes(keyword.toLowerCase())
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
                {/* Search Form */}
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

                {/* Product Grid */}
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
                                {/* Product Image */}
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
                                        src={product.hinhanh[0]?.url}
                                        alt={product.tensanpham}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                        }}
                                    />
                                </div>

                                {/* Product Info */}
                                <div style={{
                                    width: "100%",
                                    height: "40%",
                                    padding: "12px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    overflow: "hidden"
                                }}>
                                    <h5 style={{
                                        margin: "0 0 6px 0",
                                        fontSize: "14px",
                                        lineHeight: "1.4",
                                        wordWrap: "break-word",
                                        whiteSpace: "normal"
                                    }}>
                                        {product.tensanpham}
                                    </h5>

                                    {/* Colors */}
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 4,
                                        marginBottom: 6
                                    }}>
                                        {Array.isArray(product.mausanpham) && product.mausanpham.length > 0 ? (
                                            product.mausanpham.map((color, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 6,
                                                        backgroundColor: color,
                                                        border: "1px solid #ccc"
                                                    }}
                                                    title={color}
                                                ></span>
                                            ))
                                        ) : (
                                            <span>Không có</span>
                                        )}
                                    </div>

                                    {/* Sizes */}
                                    <div style={{
                                        fontSize: "13px",
                                        marginBottom: 6
                                    }}>
                                        {Array.isArray(product.kichthuoc) && product.kichthuoc.length > 0 ? (
                                            product.kichthuoc.map((sz, idx) => (
                                                <span key={sz._id || idx} style={{ marginRight: 8 }}>{sz.size}</span>
                                            ))
                                        ) : (
                                            <span>Không có</span>
                                        )}
                                    </div>

                                    {/* Price */}
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
