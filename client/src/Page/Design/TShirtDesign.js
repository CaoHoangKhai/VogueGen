import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDesignById, saveUserDesign, getUserDesignById } from "../../api/Design/design.api";
import { FaPalette, FaImage, FaFont, FaDownload, FaHome } from "react-icons/fa";
import { colors } from "../../config/colors";
import html2canvas from "html2canvas";
import Toast from "../../Components/Toast";
import { useNavigate } from "react-router-dom";


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

    // const [uploadedImg, setUploadedImg] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [inputText, setInputText] = useState("");
    const [fontFamily, setFontFamily] = useState("Arial");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [activeTab, setActiveTab] = useState("color");
    const [selectedSide, setSelectedSide] = useState("front"); // hoặc "back"
    const [showHelpers, setShowHelpers] = useState(true);
    const [selectedImageId, setSelectedImageId] = useState(null);

    const canvasWrapperRef = useRef();
    const textAreaRef = useRef();
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    });
    const navigate = useNavigate();


    const [selectedImgs, setSelectedImgs] = useState({
        front: null,
        back: null
    });

    const menu = [
        { label: "Home", key: "home", icon: <FaHome /> },         // 🆕 Thêm dòng này
        { label: "Color", key: "color", icon: <FaPalette /> },
        { label: "Image", key: "img", icon: <FaImage /> },
        { label: "Text", key: "text", icon: <FaFont /> },
        { label: "Export", key: "export", icon: <FaDownload /> },
    ];

    const handleSaveUserDesign = async () => {
        try {
            const payload = {
                designId: id,
                tshirtColor: selectedColor,
                designData: designData
            };

            const result = await saveUserDesign(payload);

            if (result?.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "✅ Thiết kế đã được lưu thành công!"
                });
            } else {
                setToast({ type: "error", message: `❌ Không thể lưu thiết kế: ${result?.message}` });
            }
        } catch (error) {
            console.error("Lỗi khi lưu thiết kế:", error);
            setToast({
                show: true,
                type: "error",
                message: "❌ Đã xảy ra lỗi khi lưu thiết kế."
            });
        }
    };

    useEffect(() => {
        const fetchDesign = async () => {
            try {
                const data = await getDesignById(id);
                setDesign(data);
                if (data?.hinhanh_mau?.length > 0) {
                    const frontImg = data.hinhanh_mau.find(img => img.position === "front");
                    const backImg = data.hinhanh_mau.find(img => img.position === "back");

                    setSelectedImgs({
                        front: frontImg?.url || null,
                        back: backImg?.url || null
                    });
                }

            } catch {
                setDesign(null);
            }
        };
        fetchDesign();
    }, [id]);

    useEffect(() => {
        const fetchUserDesign = async () => {
            try {
                const result = await getUserDesignById(id); // id từ useParams
                if (result?.success) {
                    setDesignData(result.designData);       // chứa front + back
                    setSelectedColor(result.tshirtColor);   // màu áo
                }
            } catch (error) {
                console.error("Lỗi khi tải thiết kế người dùng:", error);
            }
        };

        fetchUserDesign();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Nếu click ngoài vùng canvas (không nằm trong wrapper)
            if (canvasWrapperRef.current && !canvasWrapperRef.current.contains(e.target)) {
                setDesignData((prev) => ({
                    ...prev,
                    [selectedSide]: {
                        ...prev[selectedSide],
                        texts: prev[selectedSide].texts.map((t) => ({ ...t, selected: false })),
                        images: prev[selectedSide].images.map((img) => ({ ...img, selected: false }))
                    }
                }));
                setSelectedImageId(null); // ✅ xoá ảnh đang chọn
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [selectedSide]);




    const handleExportImage = async (format = "png") => {
        if (!canvasWrapperRef.current) return;

        try {
            setShowHelpers(false);
            await new Promise((resolve) => setTimeout(resolve, 150));

            const canvas = await html2canvas(canvasWrapperRef.current, {
                backgroundColor: null,
                useCORS: true,
                scale: 2
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
            link.setAttribute("download", `design_${selectedSide}.${format}`); // ✅ Bắt buộc có .png
            link.setAttribute("type", mimeType); // 👍 optional nhưng nên có
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Lỗi khi xuất ảnh:", error);
        } finally {
            setShowHelpers(true);
        }
    };





    const [designData, setDesignData] = useState({
        front: { texts: [], images: [] },
        back: { texts: [], images: [] }
    });
    const handleSelectBgImage = (img) => {
        setSelectedImgs(prev => ({
            ...prev,
            [img.position]: img.url
        }));
    };

    // const handleSelectImg = (img) => {
    //     const newImage = {
    //         id: Date.now(),
    //         src: img.url,
    //         position: { x: 100, y: 100 },
    //         size: { width: 150, height: 150 },
    //         selected: false,
    //         rotation: 0, // mới: xoay
    //         crop: null   // nếu sau này bạn thêm cropping
    //     };

    //     setDesignData((prev) => ({
    //         ...prev,
    //         [selectedSide]: {
    //             ...prev[selectedSide],
    //             images: [...prev[selectedSide].images, newImage]
    //         }
    //     }));
    // };


    const selectImage = (id) => {
        setSelectedImageId(id); // ✅ mới
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                images: prev[selectedSide].images.map((img) => ({
                    ...img,
                    selected: img.id === id
                }))
            }
        }));
    };
    const ControlButton = ({ onClick, pos, title, icon }) => {
        const [vPos, hPos] = pos.split("-");

        const style = {
            position: "absolute",
            width: 28,
            height: 28,
            fontSize: 14,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            zIndex: 11,
        };

        // Căn sát mép trong, thay vì top/left = 0
        const spacing = 4;

        if (vPos === "top") {
            style.top = spacing;
        } else if (vPos === "bottom") {
            style.bottom = spacing;
        }

        if (hPos === "left") {
            style.left = spacing;
        } else if (hPos === "right") {
            style.right = spacing;
        } else if (hPos === "center") {
            style.left = "50%";
            style.transform = "translateX(-50%)";
        }

        return (
            <button onClick={onClick} style={style} title={title}>
                {icon}
            </button>
        );
    };




    const deleteImage = (id) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                images: prev[selectedSide].images.filter((img) => img.id !== id)
            }
        }));
    };

    const cloneImage = (id) => {
        setDesignData((prev) => {
            const img = prev[selectedSide].images.find((i) => i.id === id);
            if (!img) return prev;

            const newImg = {
                ...img,
                id: Date.now(),
                position: { x: img.position.x + 20, y: img.position.y + 20 },
                selected: false
            };

            return {
                ...prev,
                [selectedSide]: {
                    ...prev[selectedSide],
                    images: [...prev[selectedSide].images, newImg]
                }
            };
        });
    };

    const resizeImage = (id, delta) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                images: prev[selectedSide].images.map((img) =>
                    img.id === id
                        ? {
                            ...img,
                            size: {
                                width: img.size.width + delta,
                                height: img.size.height + delta
                            }
                        }
                        : img
                )
            }
        }));
    };

    const handleUploadImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const newImage = {
                id: Date.now(),
                src: reader.result,
                position: { x: 100, y: 100 },
                size: { width: 150, height: 150 },
                selected: false,
            };

            setDesignData((prev) => ({
                ...prev,
                [selectedSide]: {
                    ...prev[selectedSide],
                    images: [...prev[selectedSide].images, newImage]
                }
            }));
        };

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

    const updateImageSize = (id, updates) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                images: prev[selectedSide].images.map((img) =>
                    img.id === id
                        ? {
                            ...img,
                            size: {
                                ...img.size,
                                ...updates
                            }
                        }
                        : img
                )
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

        if (!textAreaRef.current) return;

        const bounds = textAreaRef.current.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;

        const targetText = designData[selectedSide].texts.find((t) => t.id === id);
        const startPos = targetText.position;

        // Lấy kích thước thực tế của text element thông qua DOM
        const element = document.getElementById(`text-${id}`);
        const rect = element?.getBoundingClientRect();
        const actualWidth = rect?.width || 50;
        const actualHeight = rect?.height || 55;

        const handleMouseMove = (eMove) => {
            const dx = eMove.clientX - startX;
            const dy = eMove.clientY - startY;

            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            newX = Math.max(0, Math.min(newX, bounds.width - actualWidth));
            newY = Math.max(0, Math.min(newY, bounds.height - actualHeight));

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



    const handleImageMouseDown = (e, id) => {
        e.preventDefault();

        if (!textAreaRef.current) return;

        const bounds = textAreaRef.current.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;

        const targetImg = designData[selectedSide].images.find((img) => img.id === id);
        if (!targetImg) return;

        const startPos = targetImg.position;

        const actualWidth = targetImg.size?.width || 100;
        const actualHeight = targetImg.size?.height || 100;

        const handleMouseMove = (eMove) => {
            const dx = eMove.clientX - startX;
            const dy = eMove.clientY - startY;

            let newX = startPos.x + dx;
            let newY = startPos.y + dy;

            newX = Math.max(0, Math.min(newX, bounds.width - actualWidth));
            newY = Math.max(0, Math.min(newY, bounds.height - actualHeight));

            setDesignData((prev) => {
                const updated = { ...prev };
                const image = updated[selectedSide].images.find((img) => img.id === id);
                if (image) {
                    image.position = { x: newX, y: newY };
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



    const rotateImage = (id) => {
        setDesignData((prev) => ({
            ...prev,
            [selectedSide]: {
                ...prev[selectedSide],
                images: prev[selectedSide].images.map((img) =>
                    img.id === id
                        ? { ...img, rotation: ((img.rotation || 0) + 15) % 360 }
                        : img
                )
            }
        }));
    };

    const iconStyle = (vPos, hPos) => ({
        position: "absolute",
        [vPos]: -10,   // hoặc 0 nếu bạn muốn bên trong
        [hPos]: -10,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: 20,
        height: 20,
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        zIndex: 11,
    });


    return (
        <>
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
                                className={`btn ${activeTab === item.key ? "btn-light" : "btn-dark"
                                    } mb-3 d-flex flex-column align-items-center justify-content-center`}
                                onClick={() => {
                                    if (item.key === "home") {
                                        navigate("/");
                                    } else {
                                        setActiveTab(item.key);
                                    }
                                }}
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

                                {/* Nếu có ảnh được chọn */}
                                {selectedImageId && (() => {
                                    const selectedImg = designData[selectedSide].images.find(img => img.id === selectedImageId);
                                    if (!selectedImg) return null;

                                    return (
                                        <div className="mt-4">
                                            <h6 className="mb-2 text-dark">📐 Chi tiết ảnh</h6>
                                            <img
                                                src={selectedImg.src}
                                                alt="Xem trước"
                                                className="img-fluid rounded mb-3"
                                                style={{ maxHeight: 150 }}
                                            />

                                            <div className="mb-2">
                                                <label className="form-label">Chiều rộng (px)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={selectedImg.size.width}
                                                    onChange={(e) => {
                                                        const newWidth = parseInt(e.target.value, 10);
                                                        if (!isNaN(newWidth)) {
                                                            updateImageSize(selectedImg.id, { width: newWidth });
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Chiều cao (px)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={selectedImg.size.height}
                                                    onChange={(e) => {
                                                        const newHeight = parseInt(e.target.value, 10);
                                                        if (!isNaN(newHeight)) {
                                                            updateImageSize(selectedImg.id, { height: newHeight });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
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

                                <hr className="my-3" />
                                <button
                                    className="btn btn-outline-secondary w-100 mt-2 mb-2"
                                    onClick={handleSaveUserDesign}
                                >
                                    💾 Lưu thiết kế của bạn
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Vùng thiết kế giữa (col-8) */}
                    <div className="col-12 py-4 d-flex justify-content-center align-items-start">
                        <div

                            ref={canvasWrapperRef}
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
                            {selectedImgs[selectedSide] && (
                                <img
                                    src={selectedImgs[selectedSide]}
                                    alt="Mẫu"
                                    className="position-absolute w-100 h-100"
                                    style={{ objectFit: "contain", zIndex: 1 }}
                                />
                            )}

                            {/* {uploadedImg && (
                            <img
                                src={uploadedImg}
                                alt="Upload"
                                className="position-absolute"
                                style={{ top: "35%", left: "35%", width: "30%", zIndex: 2, opacity: 0.9 }}
                            />
                        )} */}
                            <div
                                ref={textAreaRef}
                                style={{
                                    position: "absolute",
                                    top: "25%",
                                    left: "30%",
                                    width: "38%",
                                    height: "45%",
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
                                        id={`text-${item.id}`}
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
                                            zIndex: item.selected ? 10 : 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                display: "inline-block",
                                                width: "fit-content",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    border: item.selected ? "1px dashed #888" : "none",
                                                    borderRadius: 4,
                                                    padding: "8px 12px",
                                                    ...item.style,
                                                }}
                                            >
                                                <span style={{ display: "inline-block" }}>{item.text}</span>
                                            </div>

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
                                {designData[selectedSide].images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="image-element"
                                        onMouseDown={(e) => handleImageMouseDown(e, img.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectImage(img.id);
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: img.position.y,
                                            left: img.position.x,
                                            width: img.size.width,
                                            height: img.size.height,
                                            zIndex: img.selected ? 10 : 1,
                                            cursor: "move"
                                        }}
                                    >
                                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                            <img
                                                src={img.src}
                                                alt=""
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain",
                                                    transform: `rotate(${img.rotation || 0}deg)`
                                                }}
                                            />

                                            {img.selected && showHelpers && (
                                                <>
                                                    <ControlButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteImage(img.id);
                                                        }}
                                                        pos="top-left"
                                                        title="Xóa"
                                                        icon="🗑️"
                                                    />
                                                    <ControlButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            cloneImage(img.id);
                                                        }}
                                                        pos="top-right"
                                                        title="Nhân bản"
                                                        icon="📄"
                                                    />
                                                    <ControlButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            resizeImage(img.id, +20);
                                                        }}
                                                        pos="bottom-left"
                                                        title="Phóng to"
                                                        icon="➕"
                                                    />
                                                    <ControlButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            resizeImage(img.id, -10);
                                                        }}
                                                        pos="bottom-right"
                                                        title="Thu nhỏ"
                                                        icon="➖"
                                                    />
                                                    <ControlButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            rotateImage(img.id);
                                                        }}
                                                        pos="top-center"
                                                        title="Xoay"
                                                        icon="🔄"
                                                    />
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
                                    <div className="d-flex flex-column gap-2">
                                        {["front", "back"].map((side) => {
                                            const img = design.hinhanh_mau.find(i => i.position === side);
                                            if (!img) return null;

                                            return (
                                                <div
                                                    key={side}
                                                    onClick={() => {
                                                        handleSelectBgImage(img);
                                                        setSelectedSide(side);
                                                    }}
                                                    className={`rounded shadow-sm border ${selectedSide === side && selectedImgs[side] === img.url
                                                        ? "border-primary border-3"
                                                        : "border-light"
                                                        }`}
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        backgroundImage: `url(${img.url})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                        cursor: "pointer"
                                                    }}
                                                    title={side === "front" ? "Mặt trước" : "Mặt sau"}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />

        </>
    );
};

export default TShirtDesign;