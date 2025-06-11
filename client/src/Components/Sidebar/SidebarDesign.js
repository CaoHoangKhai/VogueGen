import { useState } from 'react';
import { FaPalette, FaImage, FaFont, FaHome } from "react-icons/fa";
import Toast from '../Toast';
import { useNavigate } from "react-router-dom";
const menu = [

    { label: "Color", key: "color", icon: <FaPalette /> },
    { label: "Img", key: "img", icon: <FaImage /> },
    { label: "Text", key: "text", icon: <FaFont /> }
];

const SidebarDesign = () => {
    const [activeTab, setActiveTab] = useState("color");
    const [selectedColor, setSelectedColor] = useState("#ff0000");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [inputText, setInputText] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const navigate = useNavigate();
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
            <div style={{ marginBottom: 12 }}>🎨 <strong>Chọn màu</strong></div>
            <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                    setSelectedColor(e.target.value);
                    setToast({ show: true, message: `Đã chọn màu: ${e.target.value}`, type: "info" });
                }}
                style={{ width: "100%", height: 40, border: "none", borderRadius: 4 }}
            />
            <div style={{ marginTop: 10 }}>Mã màu: {selectedColor}</div>
        </>
    );

    const renderImgPanel = () => (
        <>
            <div style={{ marginBottom: 12, color: "#fff" }}>
                🖼️ <strong>Tải ảnh</strong>
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
            <div style={{ marginBottom: 12 }}>🔤 <strong>Nhập chữ</strong></div>
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
                    width: 280,
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

export default SidebarDesign;