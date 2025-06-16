import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDesignById } from "../../api/Design/design.api";
import { FaPalette, FaImage, FaFont, FaHome } from "react-icons/fa";
import Toast from "../../Components/Toast"; // Giữ nguyên Toast nếu bạn đã có component này
import { colors } from "../../config/colors";

const menu = [
    { label: "Color", key: "color", icon: <FaPalette /> },
    { label: "Image", key: "img", icon: <FaImage /> },
    { label: "Text", key: "text", icon: <FaFont /> }
];

const TShirtDesign = () => {
    const { id } = useParams();
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [text, setText] = useState("");

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const data = await getDesignById(id);
                setDesign(data);
                if (data?.hinhanh_mau?.length > 0) {
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

    return (
        <div className="container-fluid" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
            <div className="row">
                {/* === PHẦN 1: SIDEBAR TRÁI === */}
                <div className="col-2 border-end py-3">
                    <LeftSidebarDesign
                        onColorChange={setSelectedColor}
                        onImageChange={setSelectedImg}
                        onTextChange={setText}
                    />
                </div>

                {/* === PHẦN 2: THIẾT KẾ Ở GIỮA === */}
                <div className="col-8 d-flex justify-content-center align-items-start py-3 mt-5">
                    <div style={{
                        width: 420,
                        height: 500,
                        backgroundColor: selectedColor,
                        position: "relative",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        overflow: "hidden"
                    }}>
                        {selectedImg && (
                            <img
                                src={selectedImg}
                                alt="Thiết kế đang chọn"
                                className="img-fluid position-absolute top-0 start-0 w-100 h-100"
                                style={{ objectFit: "contain" }}
                            />
                        )}
                        {text && (
                            <div className="position-absolute w-100 text-center" style={{ bottom: "10%" }}>
                                <span style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>{text}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* === PHẦN 3: ẢNH GỐC & KẾT QUẢ === */}
                <div className="col-2 py-3">
                    <p className="text-center mb-2 fw-medium" style={{ fontSize: 12 }}>Thiết kế</p>

                    {design?.hinhanh_mau?.length > 0 ? (
                        <div className="d-flex flex-column align-items-center gap-3">
                            {design.hinhanh_mau.map((img, idx) => (
                                <div key={idx} className="text-center">
                                    <div
                                        className={`rounded shadow-sm border ${selectedImg === img.url ? "border-primary border-3" : "border-light"}`}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            backgroundImage: `url(${img.url})`,
                                            backgroundSize: "contain",
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "center",
                                            cursor: "pointer",
                                            margin: "0 auto"
                                        }}
                                        onClick={() => setSelectedImg(img.url)}
                                    />
                                    <button
                                        className={`btn btn-sm ${selectedImg === img.url ? "btn-primary" : "btn-outline-secondary"} mt-1 text-capitalize`}
                                        style={{ fontSize: 12, borderRadius: 20 }}
                                        onClick={() => setSelectedImg(img.url)}
                                    >
                                        {img.position || `Mẫu ${idx + 1}`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted text-center" style={{ fontSize: 12 }}>Không có mẫu ảnh</div>
                    )}

                    {/* KẾT QUẢ */}
                    {/* <div className="mt-4">
                        <p className="text-center mb-2 fw-semibold" style={{ fontSize: 14 }}>Kết quả</p>
                        <div className="d-flex flex-column align-items-center gap-2">
                            {design?.hinhanh_mau?.map((img, idx) => (
                                <div key={idx} className="text-center">
                                    <img
                                        src={img.url}
                                        alt={img.position || `Mẫu ${idx + 1}`}
                                        className="img-fluid"
                                        style={{
                                            width: 80,
                                            objectFit: "contain",
                                            borderRadius: 6,
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                                        }}
                                    />
                                    <p className="mt-1" style={{ fontSize: 10 }}>{img.position || `Mẫu ${idx + 1}`}</p>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

const LeftSidebarDesign = ({ onColorChange, onImageChange, onTextChange }) => {
    const [activeTab, setActiveTab] = useState("color");
    const [selectedColors, setSelectedColors] = useState([]);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [inputText, setInputText] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const colorRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (window.bootstrap?.Tooltip) {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(el => {
                try {
                    new window.bootstrap.Tooltip(el);
                } catch (err) {
                    console.error("Tooltip init error:", err);
                }
            });
        }
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 2 * 1024 * 1024;

            if (!allowedTypes.includes(file.type)) {
                setToast({ show: true, message: "Chỉ chấp nhận ảnh .jpg, .jpeg hoặc .png", type: "error" });
                return;
            }

            if (file.size > maxSize) {
                setToast({ show: true, message: "Dung lượng ảnh vượt quá 2MB!", type: "error" });
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result);
                setToast({ show: true, message: "Tải ảnh thành công!", type: "success" });
                onImageChange && onImageChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleColor = (code) => {
        setSelectedColors([code]);
        onColorChange && onColorChange(code);
    };

    const renderColorPanel = () => (
        <>
            <div style={{ marginBottom: 12 }} className="text-center"><strong>Chọn màu</strong></div>
            <hr />
            <div className="mb-3">
                <div className="d-flex gap-2 mt-3" style={{ flexWrap: "wrap" }} ref={colorRef}>
                    {colors.map(({ color, code }) => {
                        const isSelected = selectedColors.includes(code);
                        return (
                            <div
                                key={code}
                                onClick={() => toggleColor(code)}
                                title={color}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: code,
                                    cursor: "pointer",
                                    border: isSelected ? "3px solid #007bff" : "1px solid #ccc",
                                    boxShadow: isSelected ? "0 0 6px #007bff55" : "none"
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );

    const renderImgPanel = () => (
        <>
            <div style={{ marginBottom: 12, color: "#fff" }} className="text-center"><strong>Tải ảnh</strong></div>
            <label
                htmlFor="fileInput"
                className="d-flex flex-column align-items-center justify-content-center text-center"
                style={{
                    cursor: "pointer",
                    minHeight: "120px",
                    border: "2px dashed #6c757d",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#2c2f38",
                    color: "#adb5bd"
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = "#3b404b";
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = "#2c2f38";
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload({ target: { files: [file] } });
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#0d6efd" className="mb-3" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                </svg>
                <span><h5>Click để tải ảnh</h5><p>PNG, JPG, JPEG</p></span>
            </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
            {uploadedImage && (
                <img src={uploadedImage} alt="Uploaded" style={{ marginTop: 12, width: "100%", borderRadius: "8px" }} />
            )}
        </>
    );

    const renderTextPanel = () => (
        <>
            <div style={{ marginBottom: 12 }} className="text-center"><strong>Nhập chữ</strong></div>
            <textarea
                value={inputText}
                onChange={(e) => {
                    const val = e.target.value;
                    setInputText(val);
                    onTextChange && onTextChange(val);
                }}
                placeholder="Nhập text..."
                style={{
                    width: "100%",
                    height: 80,
                    borderRadius: 6,
                    padding: 8,
                    resize: "none"
                }}
            />
        </>
    );

    const renderMenuButton = (item) => {
        const isActive = activeTab === item.key;
        return (
            <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isActive ? 80 : 72,
                    height: isActive ? 80 : 72,
                    marginBottom: 20,
                    borderRadius: 16,
                    background: isActive ? "#383e4a" : "transparent",
                    color: isActive ? "#fff" : "#bbb",
                    border: isActive ? "2px solid #555" : "none",
                    boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.2)" : "none",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer"
                }}
                title={item.label}
            >
                <span style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</span>
                <span style={{ fontSize: 13 }}>{item.label}</span>
            </button>
        );
    };

    return (
        <>
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            <div style={{
                width: 64, background: "#23272f", height: "100vh", position: "fixed", top: 0, left: 0,
                display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20
            }}>
                <button
                    onClick={() => navigate("/")}
                    style={{
                        width: 48, height: 48, marginBottom: 28, borderRadius: 12, background: "#383e4a",
                        color: "#fff", border: "none", fontSize: 24, cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}
                    title="Về trang chính"
                >
                    <FaHome />
                </button>
                {menu.map(renderMenuButton)}
            </div>

            <div style={{
                width: 200,
                background: "#2b2f38",
                padding: 14,
                position: "fixed",
                top: 0,
                left: 64,
                height: "100vh",
                color: "#fff"
            }}>
                {activeTab === "color" && renderColorPanel()}
                {activeTab === "img" && renderImgPanel()}
                {activeTab === "text" && renderTextPanel()}
            </div>
        </>
    );
};

export default TShirtDesign;
