import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDesignById } from "../../api/Design/design.api";
import LeftSidebarDesign from "../../Components/Sidebar/LeftSidebarDesign";

const TShirtDesign = () => {
    const { id } = useParams();
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const data = await getDesignById(id);
                setDesign(data);
                if (data?.hinhanh_mau && data.hinhanh_mau.length > 0) {
                    setSelectedImg(data.hinhanh_mau[0].url);
                }
            } catch {
                setDesign(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDesign();
    }, [id]);

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (!design) return <div className="text-center">Không tìm thấy thiết kế</div>;

    return (
        <div className="container-fluid" style={{ minHeight: "100vh" }}>
            <div className="row">
                {/* Sidebar chọn màu */}
                <div className="col-md-1 p-0">
                    <LeftSidebarDesign onColorChange={setSelectedColor} />
                </div>
                {/* Nội dung chính */}
                <div className="col-12 col-md-9" style={{ padding: 32 }}>
                    <h2>Thiết kế áo thun</h2>
                    {/* Hiển thị ảnh lớn với overlay màu (chỉ phần áo nếu là PNG nền trong suốt) */}
                    {selectedImg && (
                        <div className="my-3 position-relative" style={{ width: 400, maxWidth: "100%", minHeight: 400 }}>
                            {/* Lớp màu phía dưới */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: selectedColor,
                                    borderRadius: 12,
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    zIndex: 1
                                }}
                            />
                            {/* Ảnh áo PNG nền trong suốt phía trên */}
                            <img
                                src={selectedImg}
                                alt="Ảnh áo đang chọn"
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    display: "block",
                                    position: "relative",
                                    zIndex: 2
                                }}
                            />
                        </div>
                    )}
                </div>
                {/* Panel phải: nút chọn áo, hiển thị hình ảnh full */}

                <div
                    className="col-12 col-md-1 d-flex flex-column position-fixed end-0 top-0 align-items-center"
                    style={{
                        background: "#f5f5f5",
                        minHeight: "100vh",
                        padding: 12,
                        right: 0,
                        zIndex: 1050,
                        width: 140,
                        maxWidth: 160
                    }}
                >
                    <h6 className="mb-3 text-center" style={{ fontSize: 14 }}>
                        {design.theloai_info?.tendanhmuc}
                    </h6>

                    {/* ẢNH THIẾT KẾ GỐC */}
                    <div style={{ width: "100%" }}>
                        <p className="text-center mb-2" style={{ fontSize: 12, fontWeight: 500 }}>Thiết kế</p>
                        {design.hinhanh_mau?.length > 0 ? (
                            design.hinhanh_mau.map((img, idx) => (
                                <div key={idx} className="mb-3 d-flex flex-column align-items-center">
                                    <div
                                        className={`rounded shadow-sm border ${selectedImg === img.url ? "border-primary border-3" : "border-light"}`}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            overflow: "hidden",
                                            backgroundColor: "#fdfdfd",
                                            backgroundImage: `url(${img.url})`,
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease-in-out",
                                            boxShadow: selectedImg === img.url
                                                ? "0 0 6px rgba(0, 123, 255, 0.5)"
                                                : "0 1px 3px rgba(0,0,0,0.1)"
                                        }}
                                        onClick={() => setSelectedImg(img.url)}
                                    />
                                    <button
                                        className={`btn btn-sm ${selectedImg === img.url ? "btn-primary" : "btn-outline-secondary"} mt-1 text-capitalize`}
                                        style={{
                                            fontSize: 12,
                                            borderRadius: 20,
                                            minWidth: 60,
                                            padding: "1px 8px"
                                        }}
                                        onClick={() => setSelectedImg(img.url)}
                                    >
                                        {img.position || `Mẫu ${idx + 1}`}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: 12, color: "#777" }}>Không có mẫu ảnh</div>
                        )}
                    </div>


                    {/* ẢNH KẾT QUẢ */}
                    <div className="mt-4 w-100 text-center">
                        <p className="text-center mb-3" style={{ fontSize: 14, fontWeight: 600 }}>Kết quả các mẫu</p>

                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {design.hinhanh_mau?.map((img, idx) => (
                                <div key={idx} className="text-center">
                                    <div
                                        className="position-relative"
                                        style={{
                                            width: 68,
                                            height: 80,
                                            borderRadius: 8,
                                            overflow: "hidden",
                                            margin: "0 auto",
                                            backgroundColor: selectedColor,
                                            boxShadow: "0 1px 5px rgba(0,0,0,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 0
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.position || `Mẫu ${idx + 1}`}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "contain",
                                                display: "block"
                                            }}
                                        />
                                    </div>

                                    <p style={{ fontSize: 11, marginTop: 4 }}>{img.position || `Mẫu ${idx + 1}`}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TShirtDesign;