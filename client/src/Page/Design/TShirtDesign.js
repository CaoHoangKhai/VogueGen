import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDesignById } from "../../api/Design/design.api";
import { FaPalette, FaImage, FaFont, FaDownload } from "react-icons/fa";
import { colors } from "../../config/colors";
import html2canvas from "html2canvas";
const panelStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    marginBottom: 24
};

const sectionTitle = {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
    color: "#333"
};


const TShirtDesign = () => {
    const { id } = useParams();
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null);
    const [uploadedImg, setUploadedImg] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [texts, setTexts] = useState([]);
    const [inputText, setInputText] = useState("");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [activeTab, setActiveTab] = useState("color");
    const [selectedSide, setSelectedSide] = useState("front"); // hoặc "back"
    const [showHelpers, setShowHelpers] = useState(true);

    const canvasRef = useRef();
    const textAreaRef = useRef();
    const bounds = textAreaRef.current.getBoundingClientRect();

    const menu = [
        { label: "Color", key: "color", icon: <FaPalette /> },
        { label: "Image", key: "img", icon: <FaImage /> },
        { label: "Text", key: "text", icon: <FaFont /> },
        { label: "Export", key: "export", icon: <FaDownload /> }, // 🆕
    ];

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Chỉ giữ lại selected nếu click vào text-element
            if (!e.target.closest(".text-element")) {
                setDesignData((prev) => ({
                    ...prev,
                    [selectedSide]: {
                        ...prev[selectedSide],
                        texts: prev[selectedSide].texts.map((t) => ({ ...t, selected: false }))
                    }
                }));
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [selectedSide]);

    const handleExportImage = async (format = "png") => {
        if (!canvasRef.current) return;

        try {
            // 📴 Ẩn khung giới hạn và nút điều khiển trước khi xuất
            setShowHelpers(false);

            // ⏳ Chờ DOM cập nhật xong (rất quan trọng!)
            await new Promise((resolve) => setTimeout(resolve, 150));

            // 📸 Chụp canvas bằng html2canvas
            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: null,  // Transparent background
                useCORS: true,
                scale: 2                // Tăng độ phân giải xuất ảnh
            });

            const mimeTypes = {
                png: "image/png",
                jpeg: "image/jpeg",
                webp: "image/webp"
            };

            const mimeType = mimeTypes[format] || mimeTypes["png"];

            const dataUrl = canvas.toDataURL(mimeType);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `design_${selectedSide}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Dọn dẹp

        } catch (error) {
            console.error("Lỗi khi xuất ảnh:", error);
        } finally {
            // ✅ Hiển thị lại helper sau khi xuất
            setShowHelpers(true);
        }
    };



    const [designData, setDesignData] = useState({
        front: { texts: [], uploadedImg: null },
        back: { texts: [], uploadedImg: null }
    });
    const handleSelectImg = (img) => {
        setSelectedImg(img.url);           // ảnh được hiển thị
        setSelectedSide(img.position);     // mặt đang được thiết kế: "front" hoặc "back"
    };


    const handleUploadImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setUploadedImg(reader.result);
        reader.readAsDataURL(file);
    };

    const handleAddText = () => {
        const newText = {
            id: Date.now(),
            text: inputText,
            position: { x: 0, y: 0 },
            style: {
                fontFamily,
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                color: textColor,
                fontSize: 18
            },
            selected: false
        };

        setDesignData(prev => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                texts: [...prev[selectedSide].texts, newText]
            }
        }));

        setInputText(""); // reset input
    };


    const handleSelectText = (id) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                texts: prev[selectedSide].texts.map((t) => ({
                    ...t,
                    selected: t.id === id
                }))
            }
        }));
    };




    const handleDeleteText = (id) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                texts: prev[selectedSide].texts.filter((t) => t.id !== id)
            }
        }));
    };

    const handleCloneText = (id) => {
        setDesignData((prev) => {
            const item = prev[selectedSide].texts.find((t) => t.id === id);
            if (!item) return prev;

            const newText = {
                ...item,
                id: Date.now(),
                text: item.text,
                position: { x: item.position.x + 20, y: item.position.y + 20 },
                selected: false
            };

            return {
                ...prev,
                [selectedSide]: {
                    ...prev[selectedSide],
                    texts: [...prev[selectedSide].texts, newText]
                }
            };
        });
    };


    const handleResizeText = (id, delta) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                texts: prev[selectedSide].texts.map((t) =>
                    t.id === id
                        ? {
                            ...t,
                            style: {
                                ...t.style,
                                fontSize: (t.style.fontSize || 18) + delta
                            }
                        }
                        : t
                )
            }
        }));
    };


    const handleMouseDown = (e, id) => {
        e.preventDefault();

        const bounds = textAreaRef.current.getBoundingClientRect(); // 👈 vùng giới hạn text
        const startX = e.clientX;
        const startY = e.clientY;

        const targetText = designData[selectedSide].texts.find((t) => t.id === id);
        const startPos = targetText.position;

        const handleMouseMove = (eMove) => {
            const dx = eMove.clientX - startX;
            const dy = eMove.clientY - startY;

            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            const estimatedWidth = 55;
            const estimatedHeight = 50;

            // 👇 Giới hạn kéo không ra khỏi vùng dashed box
            newX = Math.max(0, Math.min(newX, bounds.width - estimatedWidth));
            newY = Math.max(0, Math.min(newY, bounds.height - estimatedHeight));

            setDesignData((prev) => {
                const updated = { ...prev };
                const item = updated[selectedSide].texts.find((t) => t.id === id);
                if (item) {
                    item.position = { x: newX, y: newY };
                }
                return updated;
            });
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };



    const iconStyle = (vPos, hPos) => ({
        position: "absolute",
        [vPos]: -12,
        [hPos]: -12,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: 24,
        height: 24,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        zIndex: 11
    });


    return (
        <div className="container-fluid bg-light" style={{ minHeight: "100vh" }}>
            <div className="row gx-0">
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
                    {menu.map((item) => (
                        <button
                            key={item.key}
                            className={`btn ${activeTab === item.key ? "btn-light" : "btn-dark"} mb-3 d-flex flex-column align-items-center justify-content-center`}
                            onClick={() => setActiveTab(item.key)}
                            title={item.label}
                            style={{ width: "100%", height: 64 }}
                        >
                            <div style={{ fontSize: 18 }}>{item.icon}</div>
                            <small style={{ fontSize: 10 }}>{item.label}</small>
                        </button>
                    ))}
                </div>

                {/* Panel chi tiết bên cạnh sidebar */}
                <div
                    className="col-2"
                    style={{
                        width: 240,
                        background: "#f8f9fb",
                        padding: 16,
                        position: "fixed",
                        top: 0,
                        left: 64,
                        height: "100vh",
                        overflowY: "auto",
                        zIndex: 999,
                        borderRight: "1px solid #dee2e6"
                    }}
                >
                    {activeTab === "text" && (
                        <div style={{ marginBottom: 20 }}>
                            <h6 className="mb-3 text-dark">Thêm chữ</h6>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="form-control mb-2"
                                rows={2}
                            />
                            <select
                                className="form-select mb-2"
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                            >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Tahoma">Tahoma</option>
                            </select>
                            <div className="form-check mb-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isBold}
                                    onChange={(e) => setIsBold(e.target.checked)}
                                />
                                <label className="form-check-label">In đậm</label>
                            </div>
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isItalic}
                                    onChange={(e) => setIsItalic(e.target.checked)}
                                />
                                <label className="form-check-label">In nghiêng</label>
                            </div>
                            <input
                                type="color"
                                className="form-control form-control-color mb-3"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                            />
                            <button onClick={handleAddText} className="btn btn-success w-100">
                                ➕ Thêm chữ
                            </button>
                        </div>
                    )}

                    {activeTab === "color" && (
                        <div>
                            <h6 className="mb-3 text-dark">Màu áo</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {colors.map(({ color: name, code }) => (
                                    <div
                                        key={code}
                                        onClick={() => setSelectedColor(code)}
                                        title={name}
                                        style={{
                                            width: 30,
                                            height: 30,
                                            backgroundColor: code,
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                            border: selectedColor === code ? "3px solid #000" : "1px solid #ccc"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "img" && (
                        <div>
                            <h6 className="mb-3 text-dark">Tải ảnh lên</h6>
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
                                    if (file) handleUploadImage({ target: { files: [file] } });
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#0d6efd" className="mb-3" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                                </svg>
                                <span><h5>Click để tải ảnh</h5><p>PNG, JPG, JPEG</p></span>
                            </label>
                            <input id="fileInput" type="file" accept="image/*" onChange={handleUploadImage} className="d-none" />
                            {designData[selectedSide].uploadedImg && (
                                <img src={designData[selectedSide].uploadedImg} alt="Uploaded" style={{ marginTop: 12, width: "100%", borderRadius: "8px" }} />
                            )}
                        </div>
                    )}

                    {activeTab === "export" && (
                        <div>
                            <h6 className="mb-3 text-dark">📤 Xuất ảnh thiết kế</h6>
                            <p className="text-muted" style={{ fontSize: 13 }}>Chọn định dạng và tải xuống ảnh thiết kế hiện tại.</p>

                            <button
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => handleExportImage("png")}
                            >
                                🖼️ Xuất PNG
                            </button>

                            <button
                                className="btn btn-outline-success w-100 mb-2"
                                onClick={() => handleExportImage("jpeg")}
                            >
                                📷 Xuất JPEG
                            </button>

                            <button
                                className="btn btn-outline-info w-100"
                                onClick={() => handleExportImage("webp")}
                            >
                                🌐 Xuất WebP
                            </button>

                            <div className="mt-3 text-muted" style={{ fontSize: 12 }}>
                                * Lưu ý: Ảnh sẽ không bao gồm khung giới hạn và nút điều khiển.
                            </div>
                        </div>
                    )}

                </div>

                {/* Vùng thiết kế giữa (col-8) */}
                <div className="col-12 py-4 d-flex justify-content-center align-items-start">
                    <div
                        ref={canvasRef}
                        style={{
                            width: 500,
                            height: 595,
                            backgroundColor: selectedColor,
                            position: "relative",
                            borderRadius: 12,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            overflow: "hidden"
                        }}
                    >
                        {selectedImg && (
                            <img
                                src={selectedImg}
                                alt="Mẫu"
                                className="position-absolute w-100 h-100"
                                style={{ objectFit: "contain", zIndex: 1 }}
                            />
                        )}
                        {uploadedImg && (
                            <img
                                src={uploadedImg}
                                alt="Upload"
                                className="position-absolute"
                                style={{ top: "35%", left: "35%", width: "30%", zIndex: 2, opacity: 0.9 }}
                            />
                        )}
                        <div
                            ref={textAreaRef}
                            style={{
                                position: "absolute",
                                top: "25%",
                                left: "30%",
                                width: "38%",
                                height: "43%",
                                border: showHelpers ? "2px dashed rgba(0,0,0,0.2)" : "none",
                                overflow: "hidden",
                                zIndex: 3,
                                pointerEvents: showHelpers ? "auto" : "none"  // ✅ quan trọng
                            }}
                        >
                            {designData[selectedSide].texts.map((item) => (
                                <div
                                    key={item.id}
                                    className="text-element"
                                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectText(item.id);
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: item.position.y,
                                        left: item.position.x,
                                        cursor: "move",
                                        zIndex: item.selected ? 10 : 1
                                    }}
                                >

                                    <div
                                        style={{
                                            position: "relative",
                                            padding: 8,
                                            border: item.selected ? "1px dashed #888" : "none",
                                            // background: "rgba(255,255,255,0.5)", // giúp nhìn rõ chữ nếu nền tối
                                            borderRadius: 4,
                                            ...item.style
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectText(item.id);
                                        }}
                                    >
                                        <span>{item.text}</span>

                                        {/* Các nút điều khiển 4 góc */}
                                        {item.selected && showHelpers && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteText(item.id);
                                                    }}
                                                    style={iconStyle("top", "left")}
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCloneText(item.id);
                                                    }}
                                                    style={iconStyle("top", "right")}
                                                    title="Nhân bản"
                                                >
                                                    📄
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleResizeText(item.id, +4);
                                                    }}
                                                    style={iconStyle("bottom", "left")}
                                                    title="Phóng to"
                                                >
                                                    🔍
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleResizeText(item.id, -2);
                                                    }}
                                                    style={iconStyle("bottom", "right")}
                                                    title="Thu nhỏ"
                                                >
                                                    ➖
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cột chọn ảnh mẫu (col-1) */}
                <div
                    className="col-1"
                    style={{
                        position: "fixed",
                        top: 0,
                        right: 0,
                        width: 120,
                        height: "100vh",
                        background: "#f1f3f5",
                        padding: 20,
                        overflowY: "auto",
                        zIndex: 998,
                        borderLeft: "1px solid #ccc"
                    }}
                >
                    <div style={panelStyle}>
                        <div style={sectionTitle}>Chọn mẫu</div>
                        {design?.hinhanh_mau?.length > 0 && (
                            <>
                                {/* Front */}
                                <div className="d-flex flex-column gap-2 mb-3">
                                    {design.hinhanh_mau.filter(img => img.position === "front").map((img, idx) => (
                                        <div
                                            key={`front-${idx}`}
                                            onClick={() => handleSelectImg(img)}
                                            className={`rounded shadow-sm border ${selectedImg === img.url ? "border-primary border-3" : "border-light"}`}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                backgroundImage: `url(${img.url})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                cursor: "pointer"
                                            }}
                                        />
                                    ))}
                                </div>

                                {/*Back */}
                                <div className="d-flex flex-column gap-2">
                                    {design.hinhanh_mau.filter(img => img.position === "back").map((img, idx) => (
                                        <div
                                            key={`back-${idx}`}
                                            onClick={() => handleSelectImg(img)}
                                            className={`rounded shadow-sm border ${selectedImg === img.url ? "border-primary border-3" : "border-light"}`}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                backgroundImage: `url(${img.url})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                cursor: "pointer"
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TShirtDesign;