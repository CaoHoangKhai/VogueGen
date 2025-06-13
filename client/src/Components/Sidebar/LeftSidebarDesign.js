import { useEffect, useState, useRef } from 'react';
import { FaPalette, FaImage, FaFont, FaHome } from "react-icons/fa";
import Toast from '../Toast';
import { useNavigate } from "react-router-dom";
import { colors } from "../../config/colors";

const menu = [
    { label: "Color", key: "color", icon: <FaPalette /> },
    { label: "Image", key: "img", icon: <FaImage /> },
    { label: "Text", key: "text", icon: <FaFont /> }
];

const LeftSidebarDesign = ({ onColorChange }) => {
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
            const maxSize = 2 * 1024 * 1024; // 2MB

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
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleColor = (code) => {
        setSelectedColors([code]);
        if (onColorChange) {
            onColorChange(code);
        }

    };

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
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                }}
                title={item.label}
            >
                <span style={{
                    fontSize: 32,
                    marginBottom: 8,
                    color: isActive ? "#fff" : "#bbb"
                }}>
                    {item.icon}
                </span>
                <span style={{ fontSize: 13 }}>{item.label}</span>
            </button>
        );
    };

    const renderColorPanel = () => (
        <>
            <div style={{ marginBottom: 12 }} className="text-center"><strong>Chọn màu</strong></div>
            <hr />
            <div className="mb-3">
                <div
                    className="d-flex gap-2 mt-3"
                    style={{ flexWrap: "wrap" }}
                    ref={colorRef}
                >
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
                                    boxShadow: isSelected ? "0 0 6px #007bff55" : "none",
                                    transition: "border 0.2s, box-shadow 0.2s"
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
            <div style={{ marginBottom: 12, color: "#fff" }} className="text-center">
                <strong>Tải ảnh</strong>
            </div>

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
                    color: "#adb5bd",
                    transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#343841"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2c2f38"}

                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "#3b404b";
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "#2c2f38";
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "#2c2f38";

                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload({ target: { files: [file] } });
                }}
            >

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="#0d6efd"
                    className="mb-3"
                    viewBox="0 0 16 16"
                >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                </svg>
                <span style={{ fontSize: 14 }}>
                    <h5>Click to upload</h5>
                    <p>PNG, JPG, JPEG files are allowed</p>
                </span>
            </label>

            <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="d-none"
            />

            {uploadedImage && (
                <img
                    src={uploadedImage}
                    alt="Uploaded"
                    style={{
                        marginTop: 12,
                        width: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                />
            )}
        </>
    );

    const renderTextPanel = () => (
        <>
            <div style={{ marginBottom: 12 }} className="text-center"><strong>Nhập chữ</strong></div>
            <textarea
                value={inputText}
                onChange={(e) => {
                    setInputText(e.target.value);
                    setToast({ show: true, message: "Đã nhập text!", type: "info" });
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
            {inputText && (
                <div style={{ marginTop: 10 }}>
                    <strong>Preview:</strong> {inputText}
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Toast thông báo */}
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

            {/* Sidebar */}
            <div
                style={{
                    width: 64,
                    background: "#23272f",
                    height: "100vh",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 20,
                    zIndex: 1000,
                    boxShadow: "2px 0 12px rgba(0,0,0,0.12)"
                }}
            >
                {/* Nút về trang chính */}
                <button
                    onClick={() => navigate("/")}
                    style={{
                        width: 48,
                        height: 48,
                        marginBottom: 28,
                        borderRadius: 12,
                        background: "#383e4a",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        cursor: "pointer"
                    }}
                    title="Về trang chính"
                >
                    <FaHome />
                </button>
                {menu.map(renderMenuButton)}
            </div>

            {/* Panel bên cạnh */}
            <div
                style={{
                    width: 200,
                    background: "#2b2f38",
                    padding: 14,
                    borderRadius: "0 8px 8px 0",
                    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                    position: "fixed",
                    top: 0,
                    left: 64,
                    height: "100vh",
                    zIndex: 999,
                    color: "#fff"
                }}
            >
                {activeTab === "color" && renderColorPanel()}
                {activeTab === "img" && renderImgPanel()}
                {activeTab === "text" && renderTextPanel()}
            </div>
        </>
    );
};

export default LeftSidebarDesign;