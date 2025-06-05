import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductById } from '../../api/Admin/products.api';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImg, setMainImg] = useState(null);

    // Hàm chuyển \n thành <br /> an toàn cho mô tả


    useEffect(() => {
        if (id) {
            getProductById(id)
                .then((prod) => {
                    console.log("Product fetched:", prod); // Debug dữ liệu
                    setProduct(prod);

                    if (prod && prod.hinhanh && prod.hinhanh.length > 0) {
                        setMainImg(`http://localhost:4000${prod.hinhanh[0].url}`);
                    } else {
                        setMainImg(null);
                    }
                })
                .catch((error) => {
                    console.error("Lỗi lấy sản phẩm:", error);
                    setProduct(null);
                    setMainImg(null);
                });
        }
    }, [id]);

    // Nếu chưa có product thì hiển thị loading
    if (!product) {
        return <div className="container mt-4">Đang tải chi tiết sản phẩm...</div>;
    }

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Ảnh lớn và danh sách ảnh nhỏ nằm ngang */}
                <div className="col-md-4 mb-4 d-flex">
                    {/* Danh sách ảnh nhỏ thẳng đứng */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            marginRight: 12,
                            maxHeight: 320,
                            overflowY: "auto",
                        }}
                    >
                        {product.hinhanh?.map((img) => (
                            <img
                                key={img._id}
                                src={`http://localhost:4000${img.url}`}
                                alt={img.tenfile}
                                style={{
                                    width: 60,
                                    height: 60,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    border:
                                        mainImg === `http://localhost:4000${img.url}`
                                            ? "2px solid #007bff"
                                            : "1px solid #ccc",
                                    cursor: "pointer",
                                    background: "#f8f9fa",
                                    flexShrink: 0,
                                }}
                                onClick={() => setMainImg(`http://localhost:4000${img.url}`)}
                            />
                        ))}
                    </div>

                    {/* Ảnh lớn */}
                    <div
                        style={{
                            borderRadius: 8,
                            padding: 8,
                            background: "#fff",
                            flexGrow: 1,
                            maxWidth: 320,
                            height: 320,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {mainImg ? (
                            <img
                                src={mainImg}
                                alt={product.tensanpham}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    background: "#f8f9fa",
                                }}
                            />
                        ) : (
                            <div style={{ color: "#888" }}>Không có ảnh</div>
                        )}
                    </div>
                </div>

                {/* Thông tin sản phẩm bên phải */}
                <div className="col-md-7">
                    <h2 style={{ fontWeight: 600 }}>{product.tensanpham}</h2>
                    <div style={{ fontSize: 24, color: "#e53935", margin: "12px 0" }}>
                        <strong>
                            {product.giasanpham
                                ? product.giasanpham.toLocaleString("vi-VN")
                                : "0"}{" "}
                            đ
                        </strong>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#888" }}>Danh mục:</span>{" "}
                        <strong>{product.tentheloai || "Không có"}</strong>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <span style={{ color: "#888" }}>Kích thước:</span>{" "}
                        {product.kichthuoc && product.kichthuoc.length > 0 ? (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 4,
                                    flexWrap: "wrap",
                                }}
                            >
                                {product.kichthuoc.map((sz) => (
                                    <span
                                        key={sz._id}
                                        style={{
                                            minWidth: 38,
                                            padding: "4px 10px",
                                            border: "1px solid #007bff",
                                            borderRadius: 4,
                                            background: "#fff",
                                            color: "#007bff",
                                            fontWeight: 500,
                                            textAlign: "center",
                                        }}
                                    >
                                        {sz.size} ({sz.soluong})
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span>Không có</span>
                        )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <span style={{ color: "#888" }}>Màu sắc:</span>{" "}
                        {product.mausanpham && product.mausanpham.length > 0 ? (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 4,
                                    flexWrap: "wrap",
                                }}
                            >
                                {product.mausanpham.map((mau) => (
                                    <span
                                        key={mau._id}
                                        title={mau.mau}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            background: mau.mau,
                                            border: "2px solid #333",
                                            borderRadius: "4px",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            display: "inline-block",
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <span>Không có</span>
                        )}
                    </div>

                    <button
                        className="btn btn-primary mt-3"
                        style={{ minWidth: 160, fontWeight: 500 }}
                    >
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>

            {/* Phần mô tả nằm dưới, chiếm toàn bộ chiều ngang */}
            <div className="modal-body">
                <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <button
                            className="nav-link active"
                            id="nav-home-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-home"
                            type="button"
                            role="tab"
                            aria-controls="nav-home"
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
                            aria-controls="nav-profile"
                            aria-selected="false"
                        >
                            {/* Tab 2 có thể để trống hoặc thêm nội dung */}
                        </button>
                    </div>
                </nav>

                <div className="tab-content mt-3" id="nav-tabContent">
                    <div
                        className="tab-pane fade show active"
                        id="nav-home"
                        role="tabpanel"
                        aria-labelledby="nav-home-tab"
                        tabIndex={0}
                    >
                        {product ? (
                            <div
                                className="product-description"
                                style={{
                                    padding: 16,
                                    borderRadius: 6,
                                    border: "1px solid #ddd",
                                    minHeight: 120,
                                    whiteSpace: "normal",
                                }}
                                dangerouslySetInnerHTML={{ __html: product.mota }}
                            />

                        ) : (
                            <p>Đang tải mô tả...</p>
                        )}
                    </div>

                    <div
                        className="tab-pane fade"
                        id="nav-profile"
                        role="tabpanel"
                        aria-labelledby="nav-profile-tab"
                        tabIndex={0}
                    >
                        <p style={{ color: "#666", fontStyle: "italic" }}>
                            Chưa có nội dung.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
