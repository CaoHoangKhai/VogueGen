import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getProductsByCategory, getAllCategories } from "../../api/Category/category.api";

const ProductCard = ({ product, convertBase64 }) => {
    return (
        <Link
            to={`/products/detail/${product._id}`}
            className="text-decoration-none text-dark"
            style={{ minWidth: "250px", maxWidth: "250px", flexShrink: 0 }}
        >
            <div
                className="card border-0 shadow-sm me-3 h-100"
                style={{
                    borderRadius: "14px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
            >
                {/* Ảnh sản phẩm */}
                <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: "220px" }}
                >
                    <img
                        src={convertBase64(product.anhdaidien)}
                        alt={product.tensanpham}
                        className="img-fluid p-3"
                        style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="card-body">
                    <p className="card-title fw-bold text-truncate mb-2" style={{ fontSize: "1rem" }}>
                        {product.tensanpham}
                    </p>
                    <p className="card-text fw-bold text-danger mb-3" style={{ fontSize: "1.1rem" }}>
                        {product.giasanpham?.toLocaleString()} đ
                    </p>

                    {/* Màu sản phẩm */}
                    <div className="d-flex align-items-center mb-3" style={{ gap: "6px" }}>
                        {product.mausanpham?.map((mau, idx) => (
                            <div
                                key={idx}
                                className="rounded-circle border"
                                title={mau.mau}
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: mau.mau
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Size */}
                    <div className="d-flex flex-wrap" style={{ gap: "6px" }}>
                        {product.kichthuoc?.map((kt, idx) => (
                            <span
                                key={idx}
                                className="badge bg-light text-muted border"
                                style={{ fontSize: "0.85rem", padding: "4px 6px" }}
                            >
                                {kt.size}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Link>
    );
};

const CategorySection = ({ cat, convertBase64 }) => {
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    };

    const scrollRight = () => {
        scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    };

    return (
        <div className="mb-5 p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0 fw-bold">{cat.tendanhmuc}</h5>
                <Link to={`/category/${cat.slug}`}
                    className="btn btn-outline-primary btn-sm rounded-pill">
                    Xem tất cả →
                </Link>
            </div>

            {cat.sanpham?.length > 0 ? (
                cat.sanpham.length >= 4 ? (
                    <div className="position-relative">
                        {/* Nút trái */}
                        <button onClick={scrollLeft}
                            className="btn btn-light shadow-sm position-absolute top-50 start-0 translate-middle-y"
                            style={{ zIndex: 10, borderRadius: "50%" }}>‹
                        </button>

                        {/* Dãy sản phẩm */}
                        <div ref={scrollRef}
                            className="d-flex pb-2"
                            style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                            {cat.sanpham.map((sp) => (
                                <ProductCard key={sp._id} product={sp} convertBase64={convertBase64} />
                            ))}
                        </div>

                        {/* Nút phải */}
                        <button onClick={scrollRight}
                            className="btn btn-light shadow-sm position-absolute top-50 end-0 translate-middle-y"
                            style={{ zIndex: 10, borderRadius: "50%" }}>›
                        </button>
                    </div>
                ) : (
                    <div className="row g-3">
                        {cat.sanpham.map((sp) => (
                            <div key={sp._id} className="col-6 col-md-3 col-lg-2">
                                <ProductCard product={sp} convertBase64={convertBase64} />
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <p className="fst-italic text-muted">Không có sản phẩm trong danh mục này.</p>
            )}
        </div>
    );
};

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoriesWithProducts = async () => {
            try {
                const categoryList = await getAllCategories();
                const fullData = await Promise.all(
                    categoryList.map(async (cat) => {
                        const sanpham = await getProductsByCategory(cat.slug);
                        return { ...cat, sanpham };
                    })
                );
                setCategories(fullData);
            } catch (err) {
                console.error("❌ Lỗi khi lấy danh mục + sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesWithProducts();
    }, []);

    const convertBase64 = (anhdaidien) => {
        if (!anhdaidien?.data || !anhdaidien?.contentType) return "";
        return `data:${anhdaidien.contentType};base64,${anhdaidien.data}`;
    };

    if (loading) return <p className="text-center text-muted">Đang tải dữ liệu...</p>;

    return (
        <div className="container py-4">
            <h1 className="h4 mb-4 fw-bold text-center">Danh mục sản phẩm</h1>
            {categories.map((cat) => (
                <CategorySection key={cat.slug} cat={cat} convertBase64={convertBase64} />
            ))}
        </div>
    );
};

export default Category;
