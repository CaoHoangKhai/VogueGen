import { useParams, useLocation } from "react-router-dom";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { getDesignDetail, getImagesByColor, saveDesign } from "../../api/Design/design.api";
import { addToCart } from "../../api/Cart/cart.api";
import LeftSidebarDesign from "../../Components/Sidebar/LeftSidebarDesign";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { getProductSizesFromDesignId } from "../../api/Design/design.api";
import { getDesignFrame } from "../../config/design";

const TShirtDesign = () => {
    // const { productType, id } = useParams();
    const [design, setDesign] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const containerRef = useRef();
    const overlayZoneRef = useRef();
    const [exportFormat, setExportFormat] = useState("png");
    const [savedInfo, setSavedInfo] = useState(null);
    const frontImage = images.find(img => img.vitri === "front") || null;
    const [exportedBase64, setExportedBase64] = useState(null);
    const [frontPreviewUrl, setFrontPreviewUrl] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);

    const location = useLocation();
    const { id } = useParams();
    const productType = location.pathname.split("/")[2];

    const frontContainerRef = useRef(null);
    const backContainerRef = useRef(null);

    const [overlaysMap, setOverlaysMap] = useState({
        front: [],
        back: [],
    });
    const containerRefs = useRef({});
    const overlayZoneRefs = useRef({});

    const [selectedOverlay, setSelectedOverlay] = useState({ side: null, index: null });

    useEffect(() => {
        // Khi load images hoặc đổi màu → mặc định chọn front
        const firstFront = images.find(
            (img) => img.vitri.trim().toLowerCase() === "front" && img.mau === selectedColor
        );
        if (firstFront) setSelectedImage(firstFront);
    }, [images, selectedColor]);

    useEffect(() => {
        if (!id) return;

        const fetchSizes = async () => {
            try {
                const res = await getProductSizesFromDesignId(id);
                if (res.success && res.data) {
                    console.log("✅ Size lấy được từ API:", res.data.sizes);
                    setAvailableSizes(res.data.sizes);   // ⬅ Lưu size vào state
                } else {
                    console.warn("⚠️ Không tìm thấy size cho thiết kế:", id);
                    setAvailableSizes([]);
                }
            } catch (err) {
                console.error("❌ Lỗi khi gọi API size:", err);
                setAvailableSizes([]);
            }
        };

        fetchSizes();
    }, [id]);

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

    const handleAddToCart = async ({ size, quantity }) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id;

            if (!userId) {
                console.warn("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!");
                return;
            }

            if (!design || !design._id || !design.masanpham) {
                console.error("[handleAddToCart] Thiết kế chưa sẵn sàng hoặc thiếu thông tin sản phẩm:", design);
                return;
            }

            if (!size || !selectedColor) {
                console.warn("[handleAddToCart] Chưa chọn size hoặc màu:", { selectedSize: size, selectedColor });
                return;
            }

            if (!(quantity > 50)) {
                console.warn("[handleAddToCart] Chọn số lượng tối thiểu 50:", { soluong: quantity || 50 });
                return;
            }

            // 🟢 1️⃣ Bắt buộc UI hiển thị mặt FRONT trước khi chụp
            await new Promise((resolve) => {
                setSelectedImage(() => {
                    // 🔍 Lấy đúng ảnh front từ images theo màu đang chọn
                    const frontImg = images.find(
                        (img) => img.vitri === "front" && img.mau === selectedColor
                    );
                    return frontImg || null;
                });

                // ⏳ Đợi React render (2 frame để browser update UI hoàn tất)
                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                });
            });

            // ✅ 2️⃣ Chụp FRONT
            const frontCanvas = await html2canvas(frontContainerRef.current, {
                useCORS: true,
                backgroundColor: null,
            });
            const frontImageBase64 = frontCanvas.toDataURL("image/png");

            // ✅ 3️⃣ Chụp BACK (mặt sau vẫn chụp được dù đang bị ẩn)
            const backCanvas = await html2canvas(backContainerRef.current, {
                useCORS: true,
                backgroundColor: null,
            });
            const backImageBase64 = backCanvas.toDataURL("image/png");

            // 📦 4️⃣ Tạo dữ liệu gửi API
            const cartItem = {
                manguoidung: userId,
                masanpham: design.masanpham,
                soluong: quantity || 50,
                size,
                mausac: selectedColor,
                isThietKe: true,
                mathietke: design._id,
                designImages: {
                    front: frontImageBase64,
                    back: backImageBase64,
                },
            };

            console.log("[handleAddToCart] 🛍 Dữ liệu gửi đi:", cartItem);

            // 🚀 5️⃣ Gọi API thêm vào giỏ hàng
            const res = await addToCart(cartItem);
            console.log("[handleAddToCart] ✅ Phản hồi từ server:", res);

            if (res?.success) {
                console.log("🛒 Đã thêm thiết kế vào giỏ hàng!");
            } else {
                console.error(`❌ Không thể thêm vào giỏ hàng: ${res?.message || "Lỗi không xác định"}`);
            }
        } catch (err) {
            console.error("[handleAddToCart] ❌ Lỗi khi gọi API:", err.message || err);
        }
    };


    const addOverlay = (overlay) => {
        if (!selectedImage?.vitri) return;

        setOverlaysMap((prev) => ({
            ...prev,
            [selectedImage.vitri]: [...(prev[selectedImage.vitri] || []), overlay],
        }));
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            let clickedInsideAnyContainer = false;
            let clickedInsideOverlayZone = false;

            // ✅ Lặp qua tất cả container
            Object.values(containerRefs.current).forEach((container) => {
                if (container?.contains(e.target)) {
                    clickedInsideAnyContainer = true;
                }
            });

            // ✅ Lặp qua tất cả overlay zones
            Object.values(overlayZoneRefs.current).forEach((zone) => {
                if (zone?.contains(e.target)) {
                    clickedInsideOverlayZone = true;
                }
            });

            // ✅ Logic reset overlay selection
            if (clickedInsideAnyContainer && !clickedInsideOverlayZone) {
                setSelectedOverlay({ side: null, index: null });  // reset khi click trong ảnh nhưng ngoài overlay
            }
            if (!clickedInsideAnyContainer) {
                setSelectedOverlay({ side: null, index: null });  // reset khi click ngoài vùng ảnh
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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


    const handleExportImage = async (format, callback) => {
        if (!containerRef.current || !overlayZoneRef.current) return;

        const overlayEl = overlayZoneRef.current;
        const prevBorder = overlayEl.style.border;

        try {
            overlayEl.style.border = "none";

            // ✅ Nếu xuất JPEG/WebP thì set background trắng vì JPEG/WebP không hỗ trợ trong suốt
            const bgColor = (format === "jpeg" || format === "webp") ? "#ffffff" : null;

            const canvas = await html2canvas(containerRef.current, {
                useCORS: true,
                backgroundColor: bgColor,
            });

            // ✅ Chọn đúng định dạng ảnh
            let mimeType = "image/png";
            if (format === "jpeg") mimeType = "image/jpeg";
            else if (format === "webp") mimeType = "image/webp";

            const dataURL = canvas.toDataURL(mimeType, 1.0);

            // ✅ Tải về
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = `design-${design?._id || "export"}.${format}`;
            link.click();

            // ✅ Callback trả ảnh về cho LeftSidebarDesign (nếu có)
            if (typeof callback === "function") {
                callback(dataURL);
            }

            // ✅ Lưu state để hiển thị preview
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
        if (!frontContainerRef.current) return;

        // 1️⃣ Clone DOM
        const clone = frontContainerRef.current.cloneNode(true);

        // 2️⃣ Xóa border dashed & nút
        clone.querySelectorAll("button").forEach((btn) => btn.remove());
        clone.querySelectorAll(".position-absolute").forEach((el) => (el.style.border = "none"));

        // 3️⃣ Ẩn clone (đặt ngoài màn hình)
        clone.style.position = "absolute";
        clone.style.top = "-9999px";
        document.body.appendChild(clone);

        // 4️⃣ Chụp clone
        const canvas = await html2canvas(clone, { useCORS: true, backgroundColor: null, scale: 2 });

        // 5️⃣ Xóa clone
        document.body.removeChild(clone);

        setFrontPreviewUrl(canvas.toDataURL("image/png"));
    };

    const handleCopyOverlay = (index, side) => {
        setOverlaysMap((prev) => {
            const current = [...(prev[side] || [])];
            const copy = {
                ...current[index],
                x: (current[index].x || 0) + 10,
                y: (current[index].y || 0) + 10,
            };
            return { ...prev, [side]: [...current, copy] };
        });
    };

    const handleDeleteOverlay = (index, side) => {
        setOverlaysMap((prev) => {
            const current = [...(prev[side] || [])];
            const updated = current.filter((_, i) => i !== index);
            return { ...prev, [side]: updated };
        });
        setSelectedOverlay({ side: null, index: null });
    };

    // 🖼 Upload image overlay (Base64)
    const handleImageUpload = (imgBase64) => {
        const img = new Image();
        img.onload = () => {
            const overlayZone = overlayZoneRef.current;
            if (!overlayZone) return;

            const overlayWidth = overlayZone.offsetWidth;
            const overlayHeight = overlayZone.offsetHeight;

            const aspectRatio = img.width / img.height;

            let width = overlayWidth * 0.8;
            let height = width / aspectRatio;

            if (height > overlayHeight * 0.8) {
                height = overlayHeight * 0.8;
                width = height * aspectRatio;
            }

            addOverlay({
                type: "image",
                content: imgBase64, // ✅ Base64 đảm bảo load được
                x: (overlayWidth - width) / 2,
                y: (overlayHeight - height) / 2,
                width,
                height,
            });
        };
        img.src = imgBase64;
    };
    // 📦 Style cho button copy/delete
    const copyDeleteBtnStyle = (side) => ({
        position: "absolute",
        top: -12,
        [side]: -12,
        zIndex: 9999, // 🔥 cao hơn overlay
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: 26,
        height: 26,
        cursor: "pointer",
        pointerEvents: "auto",
    });

    // 📦 Style text overlay
    const textContainerStyle = {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    };

    const getTextStyle = (ov) => ({
        fontSize: `${ov.fontSize || 20}px`,
        fontFamily: ov.content?.fontFamily || "Arial",
        fontWeight: ov.content?.fontWeight || "normal",
        fontStyle: ov.content?.fontStyle || "normal",
        color: ov.content?.color || "#000",
        whiteSpace: "nowrap",
    });

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
                        // onExportFormatChange={(format) => handleExportImage(format)}
                        onSaveDesign={handleSaveDesign}
                        onAddToCart={handleAddToCart}
                        onExportDesign={exportDesignAsBase64}
                        frontContainerRef={frontContainerRef}
                        backContainerRef={backContainerRef}
                        onRequestPreview={handleRequestPreview}
                    />
                </div>

                <div
                    className="col-md-9 d-flex justify-content-center align-items-center"
                    style={{ minHeight: "80vh", position: "relative" }}
                >
                    {selectedImage ? (
                        <>
                            {["front", "right", "left", "back", "bottom"].map((side) => {
                                // 🔍 Tìm ảnh tương ứng với từng mặt & màu
                                const currentImage = images.find(
                                    (img) => img.vitri === side && img.mau === selectedColor
                                );

                                if (!currentImage) return null;

                                // ✅ Chỉ front, right, left cho phép design
                                const isDesignable = ["front", "right", "left"].includes(side);

                                return (
                                    <div
                                        key={side}
                                        className="position-relative"
                                        style={{
                                            maxHeight: "90vh",
                                            width: "fit-content",
                                            display: selectedImage?.vitri === side ? "block" : "none",
                                        }}
                                    >
                                        {/* 🖼 Ảnh chính */}
                                        <img
                                            src={`data:${currentImage.contentType};base64,${currentImage.data}`}
                                            alt={side}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "90vh",
                                                display: "block",
                                                pointerEvents: "none",
                                                userSelect: "none",
                                                position: "relative",
                                                zIndex: 2,
                                            }}
                                        />

                                        {/* 🎨 Vùng overlay */}
                                        {isDesignable && (
                                            <div
                                                ref={overlayZoneRef}
                                                className="position-absolute"
                                                style={{
                                                    ...getDesignFrame(productType, side),
                                                    zIndex: 3,
                                                    pointerEvents: "auto",
                                                }}
                                            >
                                                {(overlaysMap[side] || []).map((ov, i) => {
                                                    const isText = ov.type === "text";
                                                    const isSelected =
                                                        selectedOverlay.side === side &&
                                                        selectedOverlay.index === i;

                                                    return (
                                                        <Rnd
                                                            key={`${side}-${i}`}
                                                            position={{
                                                                x: ov.x || 0,
                                                                y: ov.y || 0,
                                                            }}
                                                            size={{
                                                                width: ov.width || (isText ? 150 : 100),
                                                                height: ov.height || (isText ? 50 : 100),
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOverlay({ side, index: i });
                                                            }}
                                                            onDragStop={(e, d) => {
                                                                setOverlaysMap((prev) => {
                                                                    const updated = [...(prev[side] || [])];
                                                                    updated[i] = { ...updated[i], x: d.x, y: d.y };
                                                                    return { ...prev, [side]: updated };
                                                                });
                                                            }}
                                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                                setOverlaysMap((prev) => {
                                                                    const updated = [...(prev[side] || [])];
                                                                    updated[i] = {
                                                                        ...updated[i],
                                                                        width: ref.offsetWidth,
                                                                        height: ref.offsetHeight,
                                                                        ...position,
                                                                    };
                                                                    if (isText) {
                                                                        updated[i].fontSize = Math.max(8, Math.round(ref.offsetHeight * 0.8));
                                                                    }
                                                                    return { ...prev, [side]: updated };
                                                                });
                                                            }}
                                                            bounds="parent"
                                                            enableResizing
                                                            style={{
                                                                zIndex: 4,
                                                                border: isSelected ? "2px dashed #00bcd4" : "none",
                                                                transition: "border 0.2s ease",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    position: "relative",
                                                                }}
                                                            >
                                                                {/* 📄 COPY & ❌ DELETE */}
                                                                {isSelected && (
                                                                    <>
                                                                        <button
                                                                            onMouseDown={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCopyOverlay(i, side); // ✅ copy theo side
                                                                            }}
                                                                            style={copyDeleteBtnStyle("left")}
                                                                        >
                                                                            📄
                                                                        </button>

                                                                        <button
                                                                            onMouseDown={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteOverlay(i, side); // ✅ delete theo side
                                                                            }}
                                                                            style={copyDeleteBtnStyle("right")}
                                                                        >
                                                                            ❌
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* ✍️ TEXT hoặc IMAGE */}
                                                                {isText ? (
                                                                    <div style={textContainerStyle}>
                                                                        <span style={getTextStyle(ov)}>
                                                                            {ov.content?.text || ""}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        crossOrigin="anonymous"
                                                                        src={ov.content}
                                                                        alt="overlay-img"
                                                                        draggable={false}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "contain",
                                                                            pointerEvents: "auto",
                                                                        }}
                                                                        onError={(e) => {
                                                                            console.warn("❌ Lỗi load overlay:", ov.content);
                                                                            e.target.src = "/fallback.png";
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </Rnd>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div>⚠️ Không có ảnh phù hợp với màu được chọn</div>
                    )}
                </div>

                {/* 👉 THANH BÊN CHỌN FRONT / BACK */}
                <div className="col-md-1 border-start d-flex flex-column align-items-center">
                    <h6 className="mt-3 mb-2">Mẫu</h6>

                    {["front", "right", "left", "back", "bottom"].map((side) => {
                        const img = images.find(
                            (i) => i.vitri.trim().toLowerCase() === side && i.mau === selectedColor
                        );
                        if (!img) return null;

                        const isSelected = selectedImage?.vitri === img.vitri;

                        return (
                            <div
                                key={img._id}
                                onClick={() => setSelectedImage(img)}
                                style={{
                                    cursor: "pointer",
                                    marginBottom: 8,
                                    border: isSelected ? "2px solid #00bcd4" : "1px solid #ccc",
                                    padding: 2,
                                    borderRadius: 4,
                                }}
                            >
                                <img
                                    src={`data:${img.contentType};base64,${img.data}`}
                                    alt={img.vitri || ""}
                                    style={{ width: 60, height: 80, objectFit: "cover" }}
                                />
                                <div className="small text-muted text-center mt-1">{img.vitri}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default TShirtDesign;