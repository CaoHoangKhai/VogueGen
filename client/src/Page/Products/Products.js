import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "24px",
                                background: "#fafafa",
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: 350,
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ width: "100%", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img
                                    src={`http://localhost:4000${product.hinhanh[0]?.url}`}
                                    alt={product.tensanpham}
                                    style={{
                                        maxWidth: "80%",
                                        maxHeight: "100%",
                                        objectFit: "contain"
                                    }}
                                />
                            </div>
                            <h4 style={{ margin: "12px 0 4px 0" }}>{product.tensanpham}</h4>
                            <p style={{ flex: 1, margin: 0 }}>{product.mota}</p>
                            <p style={{ fontWeight: "bold", margin: "12px 0 0 0" }}>{product.giasanpham.toLocaleString()} đ</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;