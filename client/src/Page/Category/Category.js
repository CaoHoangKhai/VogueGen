import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductsByCategory, getAllCategories } from "../../api/Category/category.api";

const ProductCard = ({ product, convertBase64 }) => {
    return (
        <Link
            to={`/products/detail/${product._id}`}
            className="text-decoration-none text-dark"
            style={{ minWidth: '170px', maxWidth: '190px', flexShrink: 0 }}
        >
            <div className="me-3 border rounded shadow-sm p-2 bg-white">
                <div
                    className="bg-light rounded mb-2 d-flex align-items-center justify-content-center"
                    style={{ height: '160px', overflow: 'hidden' }}
                >
                    <img
                        src={convertBase64(product.anhdaidien)}
                        alt={product.tensanpham}
                        className="img-fluid"
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                </div>

                <p className="mb-1 small fw-semibold text-truncate">{product.tensanpham}</p>
                <p className="mb-1 small text-muted">{product.giasanpham?.toLocaleString()} đ</p>

                <div className="d-flex align-items-center mb-1" style={{ gap: '4px' }}>
                    {product.mausanpham?.map((mau, idx) => (
                        <div
                            key={idx}
                            title={mau.mau}
                            style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: mau.mau,
                                border: '1px solid #ccc',
                            }}
                        />
                    ))}
                </div>

                <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
                    {product.kichthuoc?.map((kt, idx) => (
                        <span
                            key={idx}
                            className="border rounded px-1 small text-muted"
                            style={{ fontSize: '0.75rem' }}
                        >
                            {kt.size}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
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
            <h1 className="h4 mb-4">Danh mục sản phẩm</h1>

            {categories.map((cat) => (
                <div key={cat.slug} className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-primary mb-0">{cat.tendanhmuc}</h5>
                        <Link to={`/category/${cat.slug}`} className="btn btn-link btn-sm text-decoration-none">
                            Xem tất cả &rarr;
                        </Link>
                    </div>

                    {cat.sanpham?.length > 0 ? (
                        cat.sanpham.length >= 4 ? (
                            <div className="d-flex overflow-auto pb-2">
                                {cat.sanpham.map((sp) => (
                                    <ProductCard key={sp._id} product={sp} convertBase64={convertBase64} />
                                ))}
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
            ))}
        </div>
    );
};

export default Category;
