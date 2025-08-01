import { useParams, useLocation } from "react-router-dom";
import React from "react";
import { useEffect, useState, useRef } from "react";
import { getDesignDetail, getImagesByColor, saveDesign } from "../../api/Design/design.api";
import { addToCart } from "../../api/Cart/cart.api";
import LeftSidebarDesign from "../../Components/Sidebar/LeftSidebarDesign";
import { Rnd } from "react-rnd";
import { BASE_URL_UPLOAD_DESIGN } from "../../api/TryOn/tryon.api";
import html2canvas from "html2canvas";
import { getProductSizesFromDesignId } from "../../api/Design/design.api";
import { getDesignFrame } from "../../config/design";
const toolBtnStyle = {
    fontSize: 10,
    padding: "2px 4px",
    borderRadius: 3,
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    cursor: "pointer"
};

const TShirtDesign = () => {
    // const { productType, id } = useParams();
    const [design, setDesign] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
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
    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const location = useLocation();
    const { id } = useParams();
    const productType = location.pathname.split("/")[2];
    const frontImgRef = useRef(null);
    const backImgRef = useRef(null);
    const frontContainerRef = useRef(null);
    const backContainerRef = useRef(null);
    const [overlaysMap, setOverlaysMap] = useState({
        front: [],
        back: [],
    });
    const views = ["front", "right", "left", "back", "bottom"];
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

    const handleGenerateTryOnImages = async () => {
        if (!frontPreviewUrl) return;
        setLoadingGenerate(true);

        try {
            const payload = {
                image_base64: frontPreviewUrl,
                gioitinh: design?.gioitinh || "unisex",
                design_id: design?._id,
                colorcloth: design?.mau,
                size: selectedSize, // ✅ gửi luôn size đã chọn
            };

            // 🔍 Log ra để xem trước khi gửi
            console.log("📤 Payload gửi lên API:", payload);

            const res = await fetch(`${BASE_URL_UPLOAD_DESIGN}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("✅ [HANDLE GENERATE] Kết quả trả về:", data);

            if (data.success && Array.isArray(data.results)) {
                setTryOnPreviewUrls(data.results);
            } else {
                alert("❌ Không có ảnh try-on trả về");
            }
        } catch (err) {
            console.error("❌ [HANDLE GENERATE] Lỗi gửi base64:", err);
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

    const handleAddToCart = async ({ id, size, quantity, frontImageBase64, backImageBase64 }) => {
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

            const cartItem = {
                manguoidung: userId,
                masanpham: design.masanpham,
                soluong: quantity || 50,
                size,
                mausac: selectedColor,
                isThietKe: true,
                mathietke: design._id,

                // 👇 Thêm Base64 vào cartItem
                designImages: {
                    front: frontImageBase64,
                    back: backImageBase64,
                },
            };

            console.log("[handleAddToCart] Dữ liệu gửi đi:", cartItem);

            const res = await addToCart(cartItem);
            console.log("[handleAddToCart] Phản hồi từ server:", res);

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
        if (!selectedImage?.vitri) return;

        setOverlaysMap((prev) => ({
            ...prev,
            [selectedImage.vitri]: [...(prev[selectedImage.vitri] || []), overlay],
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



    // 📐 Resize overlay
    const handleResizeStop = (i, ref, position) => {
        const side = selectedImage?.vitri;
        if (!side) return;

        setSelectedOverlayIndex(i);

        setOverlaysMap((prev) => {
            const updated = [...(prev[side] || [])];
            const current = updated[i];

            updated[i] = {
                ...current,
                x: position.x,
                y: position.y,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
            };

            return { ...prev, [side]: updated };
        });
    };

    // 📄 Copy overlay
    const handleCopyOverlay = (index) => {
        const side = "front"; // 👉 vì block này đang render mặt front
        setOverlaysMap(prev => {
            const currentOverlays = [...(prev[side] || [])];
            const copy = {
                ...currentOverlays[index],
                x: (currentOverlays[index].x || 0) + 10,
                y: (currentOverlays[index].y || 0) + 10,
            };
            return { ...prev, [side]: [...currentOverlays, copy] };
        });
    };

    // ❌ Delete overlay
    const handleDeleteOverlay = (index) => {
        const side = "front";
        setOverlaysMap(prev => {
            const currentOverlays = [...(prev[side] || [])];
            const newOverlays = currentOverlays.filter((_, i) => i !== index);
            return { ...prev, [side]: newOverlays };
        });
        setSelectedOverlayIndex(null);
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

    // 📦 Style ảnh overlay
    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    };


    // 📸 Chụp base64 toàn bộ vùng thiết kế (front/back)
    const captureDesignAsBase64 = async (containerRef) => {
        if (!containerRef.current) return null;

        const overlayEl = containerRef.current.querySelector(".position-absolute");
        const prevBorder = overlayEl?.style.border;
        if (overlayEl) overlayEl.style.border = "none";

        const canvas = await html2canvas(containerRef.current, {
            useCORS: true,
            backgroundColor: null,
        });

        if (overlayEl) overlayEl.style.border = prevBorder;

        return canvas.toDataURL("image/png");
    };

    // 📸 Chụp theo mặt (front hoặc back)
    const captureDesignSide = async (side) => {
        if (!containerRef.current) return null;

        // Tạm ẩn mặt không cần chụp
        if (side === "front") {
            if (backImgRef.current) backImgRef.current.style.opacity = "0";
            if (frontImgRef.current) frontImgRef.current.style.opacity = "1";
        } else {
            if (frontImgRef.current) frontImgRef.current.style.opacity = "0";
            if (backImgRef.current) backImgRef.current.style.opacity = "1";
        }

        // Chụp canvas
        const canvas = await html2canvas(containerRef.current, {
            useCORS: true,
            backgroundColor: null,
        });

        // Khôi phục opacity
        if (frontImgRef.current) frontImgRef.current.style.opacity = "";
        if (backImgRef.current) backImgRef.current.style.opacity = "";

        return canvas.toDataURL("image/png");
    };

    const captureFrontImage = async () => {
        if (!frontContainerRef?.current) return null;

        const canvas = await html2canvas(frontContainerRef.current, {
            useCORS: true,
            backgroundColor: null,
            scale: 2, // ảnh rõ hơn
        });

        return canvas.toDataURL("image/png");
    };
    const handleOpenModal = async () => {
        const capturedImage = await captureFrontImage();   // 👈 chụp ảnh front ngay khi mở
        setFrontPreviewUrl(capturedImage);
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
                        // onExportFormatChange={(format) => handleExportImage(format)}
                        onSaveDesign={handleSaveDesign}
                        onAddToCart={handleAddToCart}
                        onExportDesign={exportDesignAsBase64}
                        frontContainerRef={frontContainerRef}
                        backContainerRef={backContainerRef}
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
                                            <h5 className="modal-title">Xem trước thiết kế & Thử áo</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setFrontPreviewUrl(null)}
                                            ></button>
                                        </div>

                                        <div className="modal-body">
                                            <div className="row">
                                                {/* 📌 CỘT 3: Ảnh áo */}
                                                <div className="col-3 text-center border-end">
                                                    <h6 className="mb-3">👕 Ảnh thiết kế</h6>
                                                    <img
                                                        src={frontPreviewUrl}
                                                        alt="Front Preview"
                                                        style={{
                                                            width: "100%",
                                                            height: "auto",
                                                            maxHeight: "50vh",
                                                            objectFit: "contain",
                                                            borderRadius: "8px",
                                                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                                                        }}
                                                    />

                                                    {/* 🔽 SIZE SELECTOR (radio - chỉ chọn 1) */}
                                                    <div className="mt-3">
                                                        <h6>📏 Chọn Size</h6>

                                                        {availableSizes.length > 0 ? (
                                                            <div className="btn-group" role="group" aria-label="Chọn Size">
                                                                {availableSizes.map((size) => (
                                                                    <React.Fragment key={size}>
                                                                        <input
                                                                            type="radio"
                                                                            className="btn-check"
                                                                            id={`size-${size}`}
                                                                            name="size-options"   // 👈 Cùng name -> chỉ chọn 1
                                                                            value={size}
                                                                            checked={selectedSize === size}
                                                                            onChange={() => setSelectedSize(size)}
                                                                        />
                                                                        <label
                                                                            className={`btn btn-outline-primary ${selectedSize === size ? "active" : ""}`}
                                                                            htmlFor={`size-${size}`}
                                                                            style={{ minWidth: 50 }}
                                                                        >
                                                                            {size}
                                                                        </label>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted mt-2">⚠️ Không có size khả dụng.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 📌 CỘT 7: Kết quả thử áo */}
                                                <div className="col-9">
                                                    <h6 className="text-center mb-3">✨ Kết quả thử áo</h6>

                                                    <div className="d-flex flex-wrap justify-content-start gap-3">
                                                        {loadingGenerate ? (
                                                            <div className="w-100 text-center my-4">
                                                                <div className="spinner-border text-primary" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <p className="mt-2 text-primary fw-bold">
                                                                    ⏳ Đang sinh ảnh try-on...
                                                                </p>
                                                            </div>
                                                        ) : tryOnPreviewUrls.length > 0 ? (
                                                            tryOnPreviewUrls.map((item, idx) => (
                                                                <div key={idx} className="text-center">
                                                                    <img
                                                                        src={item.image_base64}
                                                                        alt={`TryOn ${idx}`}
                                                                        style={{
                                                                            maxWidth: "150px",
                                                                            maxHeight: "220px",
                                                                            objectFit: "contain",
                                                                            borderRadius: "6px",
                                                                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                                                                        }}
                                                                    />
                                                                    <p
                                                                        className="mt-2 text-muted"
                                                                        style={{ fontSize: "14px" }}
                                                                    >
                                                                        👕 {item.model.replace(".jpg", "")}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted">Chưa có kết quả thử áo.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
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
                                                disabled={loadingGenerate || !selectedSize} // ⛔ Không cho bấm nếu chưa chọn size
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
                        <>
                            {views.map((view) => (
                                <div
                                    key={view}
                                    ref={
                                        view === "front"
                                            ? frontContainerRef
                                            : view === "back"
                                                ? backContainerRef
                                                : null
                                    }
                                    className="position-relative"
                                    style={{
                                        maxHeight: "90vh",
                                        width: "fit-content",
                                        display: selectedImage?.vitri === view ? "block" : "none",
                                    }}
                                >
                                    {/* 🖼 Ảnh chính cho từng góc */}
                                    <img
                                        src={`data:${images.find((img) => img.vitri === view && img.mau === selectedColor)?.contentType
                                            };base64,${images.find((img) => img.vitri === view && img.mau === selectedColor)?.data
                                            }`}
                                        alt={view}
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

                                    {/* 🎨 OVERLAY cho từng góc */}
                                    <div
                                        className="position-absolute"
                                        style={{
                                            ...getDesignFrame(productType, view),
                                            zIndex: 3,
                                            pointerEvents: "auto",
                                        }}
                                    >
                                        {(overlaysMap[view] || []).map((ov, i) => {
                                            const isText = ov.type === "text";
                                            const isSelected = selectedOverlayIndex === i;

                                            return (
                                                <Rnd
                                                    key={`${view}-${i}`}
                                                    size={{
                                                        width: isText ? ov.width || 150 : ov.width || 100,
                                                        height: isText ? ov.height || 50 : ov.height || 100,
                                                    }}
                                                    position={{ x: ov.x || 0, y: ov.y || 0 }}
                                                    onDragStop={(e, d) => {
                                                        setOverlaysMap((prev) => {
                                                            const updated = [...(prev[view] || [])];
                                                            updated[i] = { ...updated[i], x: d.x, y: d.y };
                                                            return { ...prev, [view]: updated };
                                                        });
                                                    }}
                                                    onResizeStop={(e, direction, ref, delta, position) => {
                                                        setOverlaysMap((prev) => {
                                                            const updated = [...(prev[view] || [])];
                                                            updated[i] = {
                                                                ...updated[i],
                                                                width: ref.offsetWidth,
                                                                height: ref.offsetHeight,
                                                                ...position,
                                                            };
                                                            if (isText) {
                                                                updated[i].fontSize = Math.max(
                                                                    8,
                                                                    Math.round(ref.offsetHeight * 0.8)
                                                                );
                                                            }
                                                            return { ...prev, [view]: updated };
                                                        });
                                                    }}
                                                    bounds="parent"
                                                    enableResizing={true}
                                                    style={{
                                                        zIndex: 4,
                                                        border: isSelected ? "2px dashed #00bcd4" : "none",
                                                        transition: "border 0.2s ease",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOverlayIndex(i);
                                                    }}
                                                >
                                                    <div style={{ width: "100%", height: "100%", position: "relative" }}>
                                                        {/* 📄 COPY & ❌ DELETE */}
                                                        {isSelected && (
                                                            <>
                                                                <button
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyOverlay(i);
                                                                    }}
                                                                    style={copyDeleteBtnStyle("left")}
                                                                >
                                                                    📄
                                                                </button>

                                                                <button
                                                                    onMouseDown={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteOverlay(i);
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
                                                                <span style={getTextStyle(ov)}>{ov.content?.text || ""}</span>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                crossOrigin="anonymous"
                                                                src={ov.content}
                                                                alt="overlay-img"
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
                                </div>
                            ))}
                        </>
                    ) : (
                        <div>⚠️ Không có ảnh phù hợp với màu được chọn</div>
                    )}
                </div>

                {/* 👉 THANH BÊN CHỌN FRONT / BACK */}
                <div className="col-md-1 border-start d-flex flex-column align-items-center">
                    <h6 className="mt-3 mb-2">Mẫu</h6>

                    {views.map((side) => {
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
