import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getDesignDetail, getImagesByColor, saveDesign } from "../../api/Design/design.api";
import { addToCart } from "../../api/Cart/cart.api";
import LeftSidebarDesign from "../../Components/Sidebar/LeftSidebarDesign";
import { Rnd } from "react-rnd";
import { BASE_URL_UPLOAD_DESIGN } from "../../api/TryOn/tryon.api";
import html2canvas from "html2canvas";

const toolBtnStyle = {
    fontSize: 10,
    padding: "2px 4px",
    borderRadius: 3,
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    cursor: "pointer"
};

const TankTopsDesign = () => {
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
    const frontImage = images.find(img => img.vitri === "front") || null;
    const [exportedBase64, setExportedBase64] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [frontPreviewUrl, setFrontPreviewUrl] = useState(null);
    const [loadingGenerate, setLoadingGenerate] = useState(false);
    const [tryOnPreviewUrls, setTryOnPreviewUrls] = useState([]);

    const handleGenerateTryOnImages = async () => {
        if (!frontPreviewUrl) return;

        setLoadingGenerate(true);

        try {
            const res = await fetch("https://1ef57d7a7c99.ngrok-free.app/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image_base64: frontPreviewUrl, // Gửi chuỗi base64
                }),
            });

            const data = await res.json();
            if (data.file_url) {
                setTryOnPreviewUrls((prev) => [...prev, data.file_url]);
            }
        } catch (err) {
            console.error("❌ Lỗi gửi base64:", err);
        } finally {
            setLoadingGenerate(false);
        }
    };

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
                    console.log("🔎 overlaysMap:", map); // <-- Thêm dòng này để log overlaysMap
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

    const handleAddToCart = async ({ id, size, quantity }) => {
        console.log("✅ Thiết kế lấy được từ API:", design);
        console.log("✅ masanpham trong design:", design?.masanpham);

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id;
            console.log("[handleAddToCart] userId:", userId);

            if (!userId) {
                console.warn("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!");
                return;
            }

            if (!design || !design._id || !design.masanpham) {
                console.error("[handleAddToCart] Thiết kế chưa sẵn sàng hoặc thiếu thông tin sản phẩm:", design);
                return;
            }

            if (!size || !selectedColor) {
                console.warn("[handleAddToCart] Chưa chọn size hoặc màu:", {
                    selectedSize: size,
                    selectedColor,
                });
                return;
            }

            const cartItem = {
                manguoidung: userId,
                masanpham: design.masanpham,
                soluong: quantity || 1,
                size: size,
                mausac: selectedColor,
                isThietKe: true,
                mathietke: design._id,
            };

            console.log("[handleAddToCart] Dữ liệu gửi đi:", cartItem);

            const res = await addToCart(cartItem);
            console.log("[handleAddToCart] Phản hồi từ server:", res);

            // Kiểm tra theo đúng format server trả về
            if (res?.success) {
                console.log("🛒 Đã thêm thiết kế vào giỏ hàng!");
            } else {
                console.error(`❌ Không thể thêm vào giỏ hàng: ${res?.message || "Lỗi không xác định"}`);
            }
        } catch (err) {
            console.error("[handleAddToCart] Lỗi khi gọi API:", err.message || err);
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

            updated[i] = {
                ...current,
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
            };

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


    const handleExportImage = async (callback) => {
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

            // Tải về
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = `design-${design?._id || "export"}.${exportFormat}`;
            link.click();

            // Callback trả ảnh về cho LeftSidebarDesign
            if (typeof callback === "function") {
                callback(dataURL);
            }

            // Lưu state để truyền cho prop previewImage
            setExportedBase64(dataURL);

        } catch (error) {
            console.error("❌ Lỗi khi xuất ảnh:", error);
        } finally {
            overlayEl.style.border = prevBorder;
        }
    };

    const exportDesignAsBase64 = async ({ format = "png" } = {}) => {
        if (!containerRef.current || !overlayZoneRef.current) return null;

        const overlayEl = overlayZoneRef.current;
        const prevBorder = overlayEl.style.border;

        try {
            overlayEl.style.border = "none";

            const canvas = await html2canvas(containerRef.current, {
                useCORS: true,
                backgroundColor: null,
            });

            let mimeType = "image/png";
            if (format === "jpeg") mimeType = "image/jpeg";
            else if (format === "webp") mimeType = "image/webp";

            return canvas.toDataURL(mimeType);
        } catch (err) {
            console.error("❌ Lỗi xuất base64:", err);
            return null;
        } finally {
            overlayEl.style.border = prevBorder;
        }
    };

    const handleRequestPreview = async () => {
        if (!containerRef.current || !overlayZoneRef.current) return;

        const overlayEl = overlayZoneRef.current;
        const prevBorder = overlayEl.style.border;
        overlayEl.style.border = "none";

        const canvas = await html2canvas(containerRef.current, {
            useCORS: true,
            backgroundColor: null,
        });

        overlayEl.style.border = prevBorder;

        const imageUrl = canvas.toDataURL("image/png");
        setFrontPreviewUrl(imageUrl); // 👉 Gán ảnh preview tại đây
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2 border-end">
                    <LeftSidebarDesign
                        designId={id}
                        frontImage={frontImage}
                        overlays={Array.isArray(overlaysMap["front"]) ? overlaysMap["front"] : []}
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
                        onAddToCart={handleAddToCart}
                        onExportDesign={exportDesignAsBase64}
                        onRequestPreview={handleRequestPreview}

                    />
                    {showPreviewModal && (
                        <div className="modal-backdrop">
                            <div className="modal-content">
                                <img src={previewImage} alt="Preview" />
                                <button onClick={() => setShowPreviewModal(false)}>Đóng</button>
                            </div>
                        </div>
                    )}
                    {frontPreviewUrl && (
                        <>
                            {/* Modal backdrop */}
                            <div className="modal-backdrop fade show"></div>

                            {/* Modal */}
                            <div
                                className="modal fade show"
                                style={{ display: "block" }}
                                tabIndex="-1"
                                role="dialog"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Xem trước thiết kế (Mặt trước)</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setFrontPreviewUrl(null)}
                                            ></button>
                                        </div>

                                        <div className="modal-body text-center">
                                            {/* Ảnh mặt trước */}
                                            <img
                                                src={frontPreviewUrl}
                                                alt="Front Preview"
                                                style={{
                                                    maxWidth: "50%",
                                                    height: "auto",
                                                    maxHeight: "50vh",
                                                    objectFit: "contain",
                                                }}
                                            />

                                            {/* Ảnh thử áo */}
                                            {tryOnPreviewUrls.length > 0 && (
                                                <div className="mt-4">
                                                    <h6>Kết quả thử áo:</h6>
                                                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-2">
                                                        {tryOnPreviewUrls.map((url, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={url}
                                                                alt={`TryOn ${idx}`}
                                                                style={{
                                                                    maxWidth: "200px",
                                                                    maxHeight: "250px",
                                                                    objectFit: "contain",
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="modal-footer d-flex justify-content-between">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setFrontPreviewUrl(null)}
                                            >
                                                Đóng
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={handleGenerateTryOnImages}
                                                disabled={loadingGenerate}
                                            >
                                                {loadingGenerate ? "Đang xử lý..." : "👕 SINH ẢNH THỬ ÁO"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
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
                                    const isText = ov.type === "text";
                                    const textContent = ov.content?.text || "";
                                    const textColor = ov.content?.color || "#000";
                                    const fontFamily = ov.content?.fontFamily || "Arial";
                                    const fontWeight = ov.content?.fontWeight || "normal";
                                    const fontStyle = ov.content?.fontStyle || "normal";
                                    const fontSize = ov.fontSize || 20;

                                    // 🔹 Tính width/height khít với text (chỉ lần đầu hoặc khi chưa có width/height trong state)
                                    let textWidth = 150, textHeight = 50;
                                    if (isText && typeof window !== "undefined") {
                                        const canvas = document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        ctx.font = `${fontWeight} ${fontStyle} ${fontSize}px ${fontFamily}`;
                                        textWidth = ctx.measureText(textContent).width + 10;
                                        textHeight = fontSize * 1.2 + 10;
                                    }

                                    const isSelected = selectedOverlayIndex === i;
                                    const scale = 1;

                                    return (
                                        <Rnd
                                            key={i}
                                            size={{
                                                width: isText ? (ov.width || textWidth) : (ov.width || 100),
                                                height: isText ? (ov.height || textHeight) : (ov.height || 100)
                                            }}
                                            position={{ x: ov.x || 0, y: ov.y || 0 }}
                                            onDragStop={(e, d) => handleDragStop(i, d)}
                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                handleResizeStop(i, ref, position);
                                            }}
                                            bounds="parent"
                                            enableResizing={true}
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
                                                {/* 🔹 Nút copy & delete */}
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

                                                {/* 🔹 Render text hoặc image */}
                                                {isText ? (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            userSelect: "none",
                                                            pointerEvents: "none",
                                                            overflow: "visible",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                fontSize: `${ov.fontSize || 24}px`,
                                                                fontFamily,
                                                                fontWeight,
                                                                fontStyle,
                                                                color: textColor,
                                                                whiteSpace: "nowrap",
                                                                transform: `scale(${(ov.width || 150) / (textContent.length * (ov.fontSize || 24) * 0.6)}, ${(ov.height || 50) / ((ov.fontSize || 24) * 1.2)})`,
                                                                transformOrigin: "center center", // ✅ scale từ giữa
                                                            }}
                                                        >
                                                            {textContent}
                                                        </span>
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
        </div>
    );
};
export default TankTopsDesign;