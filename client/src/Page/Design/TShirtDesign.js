import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getDesignDetail, getImagesByColor, saveDesign } from "../../api/Design/design.api";
import LeftSidebarDesign from "../../Components/Sidebar/LeftSidebarDesign";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
const toolBtnStyle = {
    fontSize: 10,
    padding: "2px 4px",
    borderRadius: 3,
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    cursor: "pointer"
};

const DesignPage = () => {
    const { id } = useParams();
    const [design, setDesign] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [overlaysMap, setOverlaysMap] = useState({});
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedOverlayIndex, setSelectedOverlayIndex] = useState(null);
    const containerRef = useRef();
    const overlayZoneRef = useRef();
    const [exportFormat, setExportFormat] = useState("png"); // mặc định PNG
    const [savedInfo, setSavedInfo] = useState(null); // dùng để hiển thị kết quả đã lưu

    useEffect(() => {
        if (!id) return;
        const fetchDesign = async () => {
            const res = await getDesignDetail(id);
            if (res.success) {
                console.log("✅ Thiết kế lấy được từ API:", res.design);
                console.log("🎨 Màu:", res.design?.mau);
                console.log("🧩 Overlays:", res.overlays);

                setDesign(res.design);
                setSelectedColor(res.design?.mau);

                // Gán overlays trả về vào overlaysMap
                if (res.overlays && Array.isArray(res.overlays)) {
                    const map = {};
                    res.overlays.forEach(item => {
                        map[item.vitri] = item.overlays || [];
                    });
                    setOverlaysMap(map);
                }
            } else {
                console.error("❌ Không thể lấy dữ liệu thiết kế");
            }
        };
        fetchDesign();
    }, [id]);

    useEffect(() => {
        if (!selectedColor || !design?.masanpham) return;

        const fetchImages = async () => {
            try {
                const res = await getImagesByColor(design.masanpham, selectedColor);
                if (Array.isArray(res) && res.length > 0) {
                    setImages(res);
                    setSelectedImage((prev) => {
                        const stillValid = res.find(img => img.vitri === prev?.vitri);
                        return stillValid || res[0];
                    });
                } else {
                    setImages([]);
                    setSelectedImage(null);
                }
            } catch (error) {
                console.error("❌ Lỗi khi gọi ảnh theo màu:", error);
            }
        };

        fetchImages();
    }, [selectedColor, design]);

    const handleSaveDesign = async () => {
        if (!design?._id || !selectedColor) {
            // alert("Thiếu thông tin thiết kế hoặc màu sắc");
            return;
        }

        const overlays = Object.entries(overlaysMap).map(([vitri, ovs]) => ({
            vitri,
            overlays: ovs
        }));

        const savedData = {
            madesign: design._id,
            ten: design.ten,
            mau: selectedColor,
            overlays
        };

        console.log("📤 Gửi dữ liệu lên server:", savedData);

        try {
            const res = await saveDesign(savedData);
            console.log("✅ Server trả về:", res);

            if (res.success) {
                setSavedInfo(savedData); // Nếu bạn muốn hiện lại thông tin đã lưu
                // alert("💾 Thiết kế đã được lưu!", "success");
            } else {
                console.error("❌ Lỗi khi lưu:", res.message);
                alert("❌ Lưu thiết kế thất bại: " + res.message, "error");
            }
        } catch (err) {
            console.error("❌ Lỗi khi gọi API:", err);
            // alert("⚠️ Có lỗi xảy ra khi lưu thiết kế", "error");
        }
    };


    const addOverlay = (overlay) => {
        const vitri = selectedImage?.vitri;
        if (!vitri) return;
        setOverlaysMap((prev) => ({
            ...prev,
            [vitri]: [...(prev[vitri] || []), overlay],
        }));
    };

    const handleDragStop = (i, d) => {
        const vitri = selectedImage?.vitri;
        setSelectedOverlayIndex(i);
        setOverlaysMap((prev) => {
            const updated = [...(prev[vitri] || [])];
            updated[i] = { ...updated[i], x: d.x, y: d.y };
            return { ...prev, [vitri]: updated };
        });
    };

    const handleResizeStop = (i, ref, position) => {
        const vitri = selectedImage?.vitri;
        setSelectedOverlayIndex(i);

        setOverlaysMap((prev) => {
            const updated = [...(prev[vitri] || [])];
            const current = updated[i];

            const newWidth = ref.offsetWidth;

            if (current.type === "text") {
                const baseFontSize = current.initialFontSize || current.fontSize || 24;
                const initialWidth = current.initialWidth || current.width || 150;

                if (!current.initialWidth || !current.initialFontSize) {
                    updated[i] = {
                        ...current,
                        initialWidth: newWidth,
                        initialFontSize: baseFontSize,
                    };
                    return { ...prev, [vitri]: updated };
                }

                const scale = Math.max(newWidth / initialWidth, 0.3);
                const newFontSize = baseFontSize * scale;
                const newHeight = newFontSize * 1.2; // hoặc tune theo thiết kế bạn

                updated[i] = {
                    ...current,
                    x: position.x,
                    y: position.y,
                    width: newWidth,
                    height: newHeight,
                    fontSize: newFontSize,
                    initialWidth,
                    initialFontSize: baseFontSize,
                };
            } else {
                updated[i] = {
                    ...current,
                    x: position.x,
                    y: position.y,
                    width: newWidth,
                    height: ref.offsetHeight
                };
            }

            return { ...prev, [vitri]: updated };
        });
    };

    const handleDeleteOverlay = (index) => {
        const vitri = selectedImage?.vitri;
        setOverlaysMap((prev) => {
            const updated = [...(prev[vitri] || [])];
            updated.splice(index, 1);
            return { ...prev, [vitri]: updated };
        });
        setSelectedOverlayIndex(null);
    };

    const handleCopyOverlay = (index) => {
        const vitri = selectedImage?.vitri;
        setOverlaysMap((prev) => {
            const updated = [...(prev[vitri] || [])];
            const original = updated[index];
            const copy = {
                ...original,
                x: (original.x || 0) + 20,
                y: (original.y || 0) + 20,
            };
            updated.push(copy);
            return { ...prev, [vitri]: updated };
        });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInContainer = containerRef.current?.contains(e.target);
            const isInOverlayZone = overlayZoneRef.current?.contains(e.target);

            // ✅ Nếu click trong ảnh (container) nhưng không phải vùng thiết kế → tắt chọn
            if (isInContainer && !isInOverlayZone) {
                setSelectedOverlayIndex(null);
            }

            // ✅ Nếu click ngoài cả vùng ảnh → cũng tắt
            if (!isInContainer) {
                setSelectedOverlayIndex(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleImageUpload = (imgBase64) => {
        const img = new Image();
        img.onload = () => {
            const overlayZone = overlayZoneRef.current;
            if (!overlayZone) return;

            const overlayWidth = overlayZone.offsetWidth;
            const overlayHeight = overlayZone.offsetHeight;

            const aspectRatio = img.width / img.height;

            let width = overlayWidth * 0.8; // scale ảnh vừa 80% vùng thiết kế
            let height = width / aspectRatio;

            // Nếu cao vượt quá vùng thiết kế thì scale lại
            if (height > overlayHeight * 0.8) {
                height = overlayHeight * 0.8;
                width = height * aspectRatio;
            }

            addOverlay({
                type: "image",
                content: imgBase64,
                x: (overlayWidth - width) / 2,
                y: (overlayHeight - height) / 2,
                width,
                height
            });
        };
        img.src = imgBase64;
    };
    const loadDesignImages = async () => {
        if (!design || !design.masanpham || !selectedColor) return;
        try {
            const res = await getImagesByColor(design.masanpham, selectedColor);
            if (Array.isArray(res) && res.length > 0) {
                setImages(res);
                setSelectedImage(res[0]);
            }
        } catch (error) {
            console.error("❌ Lỗi khi load lại ảnh thiết kế:", error);
        }
    };

    const handleExportImage = async () => {
        if (!containerRef.current || !overlayZoneRef.current) return;

        const overlayEl = overlayZoneRef.current;
        const prevBorder = overlayEl.style.border;

        try {
            overlayEl.style.border = "none";

            const canvas = await html2canvas(containerRef.current, {
                useCORS: true,
                backgroundColor: null,
            });

            let mimeType = "image/png";
            if (exportFormat === "jpeg") mimeType = "image/jpeg";
            else if (exportFormat === "webp") mimeType = "image/webp";

            const dataURL = canvas.toDataURL(mimeType);

            const link = document.createElement("a");
            link.href = dataURL;
            link.download = `design-${design?._id || "export"}.${exportFormat}`;
            link.click();
        } catch (error) {
            console.error("❌ Lỗi khi xuất ảnh:", error);
        } finally {
            overlayEl.style.border = prevBorder;
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2 border-end">
                    <LeftSidebarDesign
                        designId={id}
                        productId={design?.masanpham}
                        onColorChange={(color) => setSelectedColor(color)}
                        onImageUpload={handleImageUpload}
                        onTextChange={(textObj) =>
                            addOverlay({
                                type: "text",
                                content: textObj,
                                x: 100,
                                y: 100,
                                width: 150,
                                height: 50,
                                fontSize: 24,
                                initialWidth: 150,
                                initialFontSize: 24
                            })
                        }
                        onLoadDesignImages={loadDesignImages}
                        onExportImages={handleExportImage}
                        exportFormat={exportFormat}
                        onExportFormatChange={setExportFormat}
                        onSaveDesign={handleSaveDesign}
                    />

                </div>

                <div className="col-md-9 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    {selectedImage ? (
                        <div
                            ref={containerRef}
                            className="position-relative"
                            style={{ maxHeight: "90vh", width: "fit-content" }}
                        >
                            <img
                                src={`data:${selectedImage.contentType};base64,${selectedImage.data}`}
                                alt={selectedImage.vitri}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "90vh",
                                    display: "block",
                                    pointerEvents: "none",   // ✅ Vô hiệu hoá chuột
                                    userSelect: "none",      // ✅ Không cho bôi đen ảnh
                                }}
                            />

                            <div
                                ref={overlayZoneRef}
                                className="position-absolute"
                                onClick={() => setSelectedOverlayIndex(null)}
                                style={{
                                    top: "20%",
                                    left: "30%",
                                    width: "40%",
                                    height: "50%",
                                    border: "2px dashed #00bcd4",
                                    zIndex: 10,
                                    overflow: "hidden"
                                }}
                            >
                                {(overlaysMap[selectedImage?.vitri] || []).map((ov, i) => {
                                    const scale = Math.max((ov.width || 100) / 150, 0.1); // scale size nút tool
                                    const isSelected = selectedOverlayIndex === i;

                                    const isText = ov.type === "text";
                                    const textContent = ov.content?.text || "";
                                    const textColor = ov.content?.color || "#000";
                                    const fontFamily = ov.content?.fontFamily || "Arial";
                                    const fontWeight = ov.content?.fontWeight || "normal";
                                    const fontStyle = ov.content?.fontStyle || "normal";
                                    const fontSize = ov.fontSize || 20;

                                    return (
                                        <Rnd
                                            key={i}
                                            size={{ width: ov.width || 100, height: ov.height || 100 }}
                                            position={{ x: ov.x || 0, y: ov.y || 0 }}
                                            onDragStop={(e, d) => handleDragStop(i, d)}
                                            onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(i, ref, position)}
                                            bounds="parent"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOverlayIndex(i);
                                            }}
                                            enableResizing={
                                                isText
                                                    ? {
                                                        top: true,
                                                        right: true,
                                                        bottom: true,
                                                        left: true,
                                                        topRight: false,
                                                        bottomRight: false,
                                                        bottomLeft: false,
                                                        topLeft: false,
                                                    }
                                                    : true
                                            }
                                            minWidth={40}
                                            minHeight={30}
                                            style={{
                                                zIndex: 20,
                                                border: isSelected ? "2px dashed #00bcd4" : "none",
                                                transition: "border 0.2s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    position: "relative",
                                                }}
                                            >
                                                {isSelected && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyOverlay(i);
                                                            }}
                                                            style={{
                                                                ...toolBtnStyle,
                                                                position: "absolute",
                                                                top: -10,
                                                                left: -10,
                                                                zIndex: 30,
                                                                transform: `scale(${scale})`,
                                                                transformOrigin: "top left",
                                                            }}
                                                        >
                                                            📄
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOverlay(i);
                                                            }}
                                                            style={{
                                                                ...toolBtnStyle,
                                                                position: "absolute",
                                                                top: -10,
                                                                right: -10,
                                                                zIndex: 30,
                                                                transform: `scale(${scale})`,
                                                                transformOrigin: "top right",
                                                            }}
                                                        >
                                                            ❌
                                                        </button>
                                                    </>
                                                )}

                                                {isText ? (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            textAlign: "center",
                                                            overflow: "hidden",
                                                            userSelect: "none",
                                                            pointerEvents: "none",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "inline-block",
                                                                color: textColor,
                                                                fontFamily,
                                                                fontWeight,
                                                                fontStyle,
                                                                fontSize: `${fontSize}px`,
                                                                lineHeight: `${fontSize * 1.2}px`,
                                                                whiteSpace: "pre", // hoặc "normal"
                                                                userSelect: "none",
                                                                pointerEvents: "none",
                                                            }}
                                                        >
                                                            {textContent}
                                                        </div>

                                                    </div>
                                                ) : (
                                                    <img
                                                        src={ov.content}
                                                        alt={`overlay-${i}`}
                                                        style={{
                                                            maxWidth: "100%",
                                                            maxHeight: "100%",
                                                            objectFit: "contain",
                                                            userSelect: "none",
                                                            pointerEvents: "none",
                                                            display: "block",
                                                            margin: "auto",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </Rnd>

                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div>⚠️ Không có ảnh phù hợp với màu được chọn</div>
                    )}
                </div>

                <div className="col-md-1 border-start d-flex flex-column align-items-center">
                    <h6 className="mt-3 mb-2">Mẫu</h6>
                    {images.map((img) => (
                        <div key={img._id || img.vitri + img.mau} onClick={() => setSelectedImage(img)} style={{ cursor: "pointer", marginBottom: 8, border: selectedImage?.vitri === img.vitri ? "2px solid #00bcd4" : "1px solid #ccc", padding: 2, borderRadius: 4 }}>
                            <img src={`data:${img.contentType};base64,${img.data}`} alt={img.vitri} style={{ width: 60, height: 80, objectFit: "cover" }} />
                            <div className="small text-muted text-center">{img.vitri}</div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={handleSaveDesign}>💾 Lưu thiết kế</button>
        </div>
    );
};
export default DesignPage;