import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductsByCategory } from "../../api/Category/category.api";
// import Breadcrumb from "../../Components/Breadcrumb";
import { Link } from 'react-router-dom';
const ProductByCategory = () => {
    const { id } = useParams(); // slug
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getProductsByCategory(id);
            setProducts(data);
        };
        fetchData();
    }, [id]);

    return (
        <div className="container">
            {/* <Breadcrumb /> */}
            {products.length === 0 ? (
                <div className="text-center py-5">
                    <h5>🔍 Hiện chưa có sản phẩm nào trong danh mục này.</h5>
                    <p>Vui lòng quay lại sau hoặc khám phá các danh mục khác.</p>
                    <Link to="/" className="btn btn-outline-primary mt-3">⬅ Quay về trang chủ</Link>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {products.map((sp) => {
                        const imageUrl = sp.anhdaidien?.data
                            ? `data:image/png;base64,${sp.anhdaidien.data}`
                            : null;

                        return (
                            <div className="col" key={sp._id}>
                                <Link to={`/products/detail/${sp._id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 shadow-sm border-0">
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
                                                    padding: "10px",
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
                                            <h6 className="card-title text-truncate mb-1">{sp.tensanpham}</h6>
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
                                                            border: "1px solid #ccc",
                                                            cursor: "default",
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
                                                            color: "#212529",
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
    );
};

export default ProductByCategory;
