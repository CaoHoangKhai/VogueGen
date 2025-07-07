import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductsByCategory } from "../../api/Category/category.api";
import ProductFilter from "../../Components/ProductFilter";
import { Link } from "react-router-dom";

const ProductByCategory = () => {
    const { id } = useParams(); // slug
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        price: { min: 0, max: 1000000 },
        colors: [],
        sizes: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProductsByCategory(id);
            setProducts(data);
        };
        fetchData();
    }, [id]);

    const filteredProducts = products.filter((product) => {
        const gia = Number(product.giasanpham);
        const { price, colors, sizes } = filters;

        const matchPrice = gia >= price.min && gia <= price.max;

        const matchColor =
            colors.length === 0 ||
            product.mausanpham?.some((mau) => colors.includes(mau.mau));

        const matchSize =
            sizes.length === 0 ||
            product.kichthuoc?.some((size) => sizes.includes(size.size));

        return matchPrice && matchColor && matchSize;
    });

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-3 mb-4">
                    <div className="position-sticky" style={{ top: 80 }}>
                        <ProductFilter onFilterChange={setFilters} />
                    </div>
                </div>


                <div className="col-lg-9">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>🔍 Không tìm thấy sản phẩm phù hợp.</h5>
                            <p>Hãy thử điều chỉnh bộ lọc hoặc chọn danh mục khác.</p>
                            <Link to="/" className="btn btn-outline-primary mt-3">
                                ⬅ Quay về trang chủ
                            </Link>
                        </div>
                    ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                            {filteredProducts.map((sp) => {
                                const imageUrl = sp.anhdaidien?.data
                                    ? `data:image/png;base64,${sp.anhdaidien.data}`
                                    : null;

                                return (
                                    <div className="col" key={sp._id}>
                                        <Link
                                            to={`/products/detail/${sp._id}`}
                                            className="text-decoration-none text-dark"
                                        >
                                            <div className="card h-100 shadow-sm border-2">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        className="card-img-top"
                                                        alt={sp.tensanpham}
                                                        style={{
                                                            height: 220,
                                                            objectFit: "contain",
                                                            backgroundColor: "#f8f9fa",
                                                            borderRadius: "0.5rem 0.5rem 0 0",
                                                            padding: "10px"
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="card-img-top bg-light d-flex justify-content-center align-items-center"
                                                        style={{ height: 220, borderRadius: "0.5rem 0.5rem 0 0" }}
                                                    >
                                                        <span className="text-muted">Không có ảnh</span>
                                                    </div>
                                                )}

                                                <div className="card-body p-3">
                                                    <h6 className="card-title text-truncate mb-1">
                                                        {sp.tensanpham}
                                                    </h6>
                                                    <p className="text-danger fw-semibold mb-2">
                                                        {Number(sp.giasanpham).toLocaleString()}₫
                                                    </p>

                                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                                        {sp.mausanpham?.map((mau) => (
                                                            <div
                                                                key={mau._id}
                                                                title={mau.mau}
                                                                style={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: 6,
                                                                    backgroundColor: mau.mau,
                                                                    border: "1px solid #ccc"
                                                                }}
                                                            ></div>
                                                        ))}
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-1 mt-2 mb-2">
                                                        {sp.kichthuoc?.map((s) => (
                                                            <span
                                                                key={s._id}
                                                                className="badge"
                                                                style={{
                                                                    padding: "5px 10px",
                                                                    fontSize: "0.85rem",
                                                                    backgroundColor: "#e9ecef",
                                                                    border: "1px solid #ced4da",
                                                                    borderRadius: "0.375rem",
                                                                    color: "#212529"
                                                                }}
                                                            >
                                                                {s.size}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductByCategory;