import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTshirt, FaPalette, FaImage, FaFont, FaHome, FaDownload } from "react-icons/fa";
import Toast from "../Toast";
import { colors } from "../../config/colors";
import { getColorByDesignId } from "../../api/Design/design.api";
import AddToCartButton from "../AddToCartButton";
// Danh sách menu sidebar
const menu = [
    { label: "Color", key: "color", icon: <FaPalette /> },
    { label: "Image", key: "img", icon: <FaImage /> },
    { label: "Text", key: "text", icon: <FaFont /> },
    { label: "Export", key: "export", icon: <FaDownload /> },
];

const LeftSidebarDesign = ({
    designId,
    onColorChange,
    onImageUpload,
    onTextChange,
    onExportImages,
    exportFormat,
    onExportFormatChange,
    LeftSidebarDesign,
    onSaveDesign,
    onAddToCart,
    onPanelChange,
    onRequestPreview,
    frontContainerRef,
    backContainerRef,
    productId
}) => {

    const navigate = useNavigate();
    const colorRef = useRef();

    // State chính
    const [activeTab, setActiveTab] = useState("color");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [inputText, setInputText] = useState("");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [allowedColors, setAllowedColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [isColorLoaded, setIsColorLoaded] = useState(false);

    // Toast
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const showToast = (message, type = "info") => {
        setToast({ show: true, message, type });
    };

    // ===================== COLOR =====================
    const toggleColor = (code) => {
        const upperCode = code.toUpperCase();
        if (!allowedColors.includes(upperCode)) {
            console.warn("⛔ Không nằm trong danh sách cho phép:", upperCode);
            return;
        }

        // console.log("✅ Màu đang chọn:", upperCode);
        setSelectedColor(upperCode);
        onColorChange?.(upperCode);
    };

    useEffect(() => {
        if (!designId || isColorLoaded) return;

        const fetchAllowedColor = async () => {
            try {
                const res = await getColorByDesignId(designId);
                if (res.success) {
                    const allowed = res.colors.map(c => c.toUpperCase());
                    const defaultColor = res.color.toUpperCase();
                    setAllowedColors(allowed);
                    setSelectedColor(defaultColor);
                    onColorChange?.(defaultColor);
                    setIsColorLoaded(true); // ✅ chỉ gọi 1 lần
                }
            } catch (err) {
                console.error("❌ Lỗi gọi API:", err);
            }
        };

        fetchAllowedColor();
    }, [designId, isColorLoaded, onColorChange]);


    const renderColorPanel = () => (
        <>
            <div className="text-center mb-2"><strong>Chọn màu</strong></div>
            <hr />
            <div className="d-flex gap-2 mt-3 flex-wrap" ref={colorRef}>
                {colors.map(({ color, code }) => {
                    const upperCode = code.toUpperCase(); // 🔁 chuẩn hóa
                    const isSelected = selectedColor === upperCode;
                    const isAllowed = allowedColors.includes(upperCode);

                    return (
                        <div
                            key={upperCode}
                            title={isAllowed ? color : "Không khả dụng"}
                            onClick={() => toggleColor(upperCode)} // 👈 PHẢI dùng upperCode
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                backgroundColor: upperCode, // ✅ dùng upper để đồng bộ hiển thị
                                cursor: isAllowed ? "pointer" : "not-allowed",
                                border: isSelected ? "3px solid #007bff" : "1px solid #ccc",
                                boxShadow: isSelected ? "0 0 6px #007bff55" : "none",
                                opacity: isAllowed ? 1 : 0.3
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
    // ===================== IMAGE =====================
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.type)) {
            showToast("Chỉ chấp nhận ảnh .jpg, .jpeg hoặc .png", "error");
            return e.target.value = null; // ✅ Reset sau khi lỗi
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast("Dung lượng ảnh vượt quá 2MB!", "error");
            return e.target.value = null; // ✅ Reset sau khi lỗi
        }

        const reader = new FileReader();
        reader.onload = () => {
            setUploadedImage(reader.result);
            onImageUpload?.(reader.result);
            showToast("Tải ảnh thành công!", "success");
            e.target.value = null; // ✅ Reset để có thể chọn lại cùng một file
        };
        reader.readAsDataURL(file);
    };

    const renderImagePanel = () => (
        <>
            <div className="text-center mb-2"><strong>Tải ảnh</strong></div>
            <label
                htmlFor="fileInput"
                className="d-flex flex-column align-items-center justify-content-center text-center"
                style={{
                    cursor: "pointer",
                    minHeight: 120,
                    border: "2px dashed #6c757d",
                    borderRadius: 12,
                    padding: 20,
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
                <span>
                    <h5>Click để tải ảnh</h5>
                    <p>PNG, JPG, JPEG</p>
                </span>
            </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
            {/* {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="img-fluid mt-3 rounded" />} */}
        </>
    );

    // ===================== TEXT =====================
    const handleAddText = () => {
        if (!inputText.trim()) return showToast("Vui lòng nhập nội dung chữ.", "warning");

        onTextChange?.({
            text: inputText,
            fontFamily,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            color: textColor
        });

        showToast("Đã thêm chữ vào thiết kế.", "success");
        setInputText("");
    };

    const predefinedColors = [
        "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
        "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#FFA500"
    ];

    const fonts = [
        { label: "Arial", value: "Arial, sans-serif" },
        { label: "Times New Roman", value: "'Times New Roman', serif" },
        { label: "Courier New", value: "'Courier New', monospace" },
        { label: "Verdana", value: "Verdana, sans-serif" },
        { label: "Tahoma", value: "Tahoma, sans-serif" }
    ];

    const renderColorSwatches = () => (
        <div className="d-flex flex-wrap gap-2">
            {predefinedColors.map((color) => (
                <div
                    key={color}
                    title={color}
                    onClick={() => setTextColor(color)}
                    className="rounded-circle border border-light"
                    style={{
                        backgroundColor: color,
                        width: 30,
                        height: 30,
                        cursor: "pointer",
                        boxShadow: textColor === color ? "0 0 0 3px #fff inset" : ""
                    }}
                />
            ))}
        </div>
    );

    const renderTextPanel = () => (
        <div className="card bg-dark text-light border-secondary shadow-sm rounded-3 p-3">
            <h5 className="text-center mb-3">🎨 Thêm Chữ Vào Thiết Kế</h5>

            <div className="mb-3">
                <label className="form-label">Nội dung</label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="form-control"
                    rows={2}
                    placeholder="Nhập chữ..."
                    style={{
                        fontFamily,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        color: textColor,
                        backgroundColor: textColor.toLowerCase() === "#ffffff" ? "#333" : "#fff",  // 🆕 nền đổi khi chữ trắng
                        border: "1px solid #ccc"
                    }}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Phông chữ</label>
                <select
                    className="form-select"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                >
                    {fonts.map((font) => (
                        <option
                            key={font.label}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                        >
                            {font.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row mb-3">
                <div className="col">
                    <div className="row mb-3">
                        <div className="col">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isBold}
                                    onChange={(e) => setIsBold(e.target.checked)}
                                    id="boldCheck"
                                />
                                <label className="form-check-label" htmlFor="boldCheck">In đậm</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isItalic}
                                    onChange={(e) => setIsItalic(e.target.checked)}
                                    id="italicCheck"
                                />
                                <label className="form-check-label" htmlFor="italicCheck">In nghiêng</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Màu chữ</label>
                    {renderColorSwatches()}
                    <input
                        type="color"
                        className="form-control form-control-color mt-2"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                    />
                </div>
            </div>
            <button
                onClick={handleAddText}
                className="btn btn-success w-100"
            >
                ➕ Thêm chữ
            </button>
        </div>
    );

    // ===================== EXPORT =====================
    const renderExportPanel = () => (
        <div className="text-center text-light">
            <h6 className="mb-3">📤 Xuất ảnh thiết kế</h6>
            <p className="text-white" style={{ fontSize: 13 }}>
                Chọn định dạng và tải xuống ảnh thiết kế hiện tại.
            </p>

            <button
                className="btn btn-outline-primary w-100 mb-2"
                onClick={() => onExportImages?.("png")}
            >
                🖼️ Xuất PNG
            </button>
            <button
                className="btn btn-outline-success w-100 mb-2"
                onClick={() => onExportImages?.("jpeg")}
            >
                📷 Xuất JPEG
            </button>
            <button
                className="btn btn-outline-info w-100"
                onClick={() => onExportImages?.("webp")}
            >
                🌐 Xuất WebP
            </button>

            <div className="mt-3 text-light" style={{ fontSize: 12 }}>
                * Lưu ý: Ảnh sẽ không bao gồm khung giới hạn và nút điều khiển.
            </div>

        </div>


    );
    // ===================== MAIN =====================
    const renderMenuButton = (item) => {
        const isActive = activeTab === item.key;
        return (
            <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                title={item.label}
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
            >
                <span style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</span>
                <span style={{ fontSize: 13 }}>{item.label}</span>
            </button>
        );
    };
    return (
        <>
            {/* Toast hiển thị thông báo */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* Sidebar bên trái */}
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
                }}
            >
                {/* Nút về trang chính */}
                <button
                    onClick={() => navigate("/")}
                    title="Về trang chính"
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
                        cursor: "pointer",
                    }}
                >
                    <FaHome />
                </button>

                {/* Các menu như màu, hình, text, export */}
                {menu.map(renderMenuButton)}
                {/* Khu vực nút cuối cùng */}

                <div
                    style={{

                        marginBottom: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    {/* Lưu thiết kế */}
                    <button
                        onClick={() => {
                            onSaveDesign?.();
                            showToast("💾 Thiết kế đã được lưu!", "success");
                        }}
                        title="Lưu thiết kế"
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            cursor: "pointer",
                        }}
                    >
                        💾
                    </button>

                    {/* Thêm vào giỏ hàng xét thểm điều kiện số lượng phải 50 */}
                    <AddToCartButton
                        frontContainerRef={frontContainerRef}   // 👈 TRUYỀN TIẾP REF
                        backContainerRef={backContainerRef}     // 👈 TRUYỀN TIẾP REF
                        selectedColor={selectedColor}
                        productId={productId}
                    />


                    <button
                        onClick={onRequestPreview}
                        className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 rounded mt-2"
                    >
                        <FaTshirt size={18} />

                    </button>

                </div>
            </div>

            {/* Sidebar bên phải */}
            <div
                style={{
                    width: 325,
                    background: "#2b2f38",
                    padding: 14,
                    borderRadius: "0 8px 8px 0",
                    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                    position: "fixed",
                    top: 0,
                    left: 64,
                    height: "100vh",
                    zIndex: 999,
                    color: "#fff",
                }}
            >
                {activeTab === "color" && renderColorPanel()}
                {activeTab === "img" && renderImagePanel()}
                {activeTab === "text" && renderTextPanel()}
                {activeTab === "export" && renderExportPanel()}
            </div>
        </>
    );
};

export default LeftSidebarDesign;