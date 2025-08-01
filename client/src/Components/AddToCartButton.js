import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Modal, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getSizesByDesignId } from "../api/Size/size.api";
import { addToCart } from "../api/Cart/cart.api";
import html2canvas from "html2canvas";

const AddToCartButton = ({
  frontContainerRef,    // 👉 ref mặt trước từ TShirtDesign
  backContainerRef,     // 👉 ref mặt sau từ TShirtDesign
  design,               // 👉 object thiết kế
  selectedColor,         // 👉 màu áo đang chọn
  productId
}) => {
  const { id } = useParams();
  const location = useLocation();
  const isDesignPage = location.pathname.includes("/design");

  const [availableSizes, setAvailableSizes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  // 🟢 Lấy size theo thiết kế (designId)
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizes = await getSizesByDesignId(id);
        setAvailableSizes(sizes);
      } catch (err) {
        console.error("❌ Lỗi khi lấy size:", err);
        alert("❌ Lỗi khi lấy size sản phẩm!");
      }
    };
    if (id) fetchSizes();
  }, [id]);

  // 📸 Hàm chụp Base64
  const captureDesignAsBase64 = async (containerRef) => {
    if (!containerRef?.current) return null;

    // ✅ Lưu trạng thái hiển thị cũ
    const prevDisplay = containerRef.current.style.display;

    // ✅ Nếu bị ẩn, tạm bật lên
    if (prevDisplay === "none") {
      containerRef.current.style.display = "block";
    }

    // ✅ Ẩn border (nếu có)
    const overlayEl = containerRef.current.querySelector(".position-absolute");
    const prevBorder = overlayEl?.style.border;
    if (overlayEl) overlayEl.style.border = "none";

    // ✅ Chụp canvas
    const canvas = await html2canvas(containerRef.current, {
      useCORS: true,
      backgroundColor: null,
    });

    // ✅ Khôi phục border
    if (overlayEl) overlayEl.style.border = prevBorder;

    // ✅ Khôi phục display
    containerRef.current.style.display = prevDisplay;

    return canvas.toDataURL("image/png");
  };

  // ✅ Chọn size
  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // ✅ Nhập số lượng
  const handleQuantityChange = (size, value) => {
    setQuantities((prev) => ({
      ...prev,
      [size]: Number(value),
    }));
  };

  // ✅ Khi nhấn xác nhận
  const MAX_QUANTITY = 10000;

  const handleConfirm = async () => {
    try {
      if (selectedSizes.length === 0) {
        alert("⚠️ Vui lòng chọn ít nhất một size!");
        return;
      }

      // 🚨 Kiểm tra số lượng tối thiểu
      const invalidQuantity = selectedSizes.some(size => !quantities[size] || quantities[size] < 50);
      if (invalidQuantity) {
        alert("🚨 Mỗi size phải nhập tối thiểu 50 sản phẩm!");
        return;
      }

      // 🚨 Kiểm tra số lượng tối đa
      const tooLargeQuantity = selectedSizes.some(size => quantities[size] > MAX_QUANTITY);
      if (tooLargeQuantity) {
        alert(`🚨 Mỗi size chỉ được đặt tối đa ${MAX_QUANTITY} sản phẩm!`);
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;
      if (!userId) {
        alert("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!");
        return;
      }

      setLoading(true);

      let frontImageBase64 = null;
      let backImageBase64 = null;
      if (isDesignPage) {
        if (frontContainerRef) frontImageBase64 = await captureDesignAsBase64(frontContainerRef);
        if (backContainerRef) backImageBase64 = await captureDesignAsBase64(backContainerRef);
      }

      // 📝 Gộp tất cả item vào 1 request (nếu backend hỗ trợ)
      const payload = selectedSizes.map(size => ({
        manguoidung: userId,
        masanpham: productId,
        soluong: quantities[size],
        size,
        mausac: selectedColor || "#000000",
        isThietKe: isDesignPage,
        madesign: isDesignPage ? id : null,
        previewFront: isDesignPage ? frontImageBase64 : null,
        previewBack: isDesignPage ? backImageBase64 : null,
      }));

      console.log("🛒 Payload gửi:", payload);

      for (const item of payload) {
        await addToCart(item);
      }

      alert("🎉 Đã thêm vào giỏ hàng!");
      handleClose();

    } catch (err) {
      console.error("❌ [handleConfirm] Lỗi:", err.message || err);
      alert("❌ Lỗi khi thêm vào giỏ hàng!");
    } finally {
      setLoading(false);
    }
  };


  // ✅ Mở/đóng modal
  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setSelectedSizes([]);
    setQuantities({});
    setShowModal(false);
  };
  return (
    <>
      {/* 🛒 Nút giỏ hàng */}
      <OverlayTrigger placement="top" overlay={<Tooltip>Thêm vào giỏ hàng</Tooltip>}>
        <button
          className="btn btn-outline-success mt-2"
          onClick={handleOpen}
          style={{ outline: "2px solid #198754", outlineOffset: "2px" }}
        >
          🛒
        </button>
      </OverlayTrigger>

      {/* 📦 Modal chọn size & số lượng */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn Size và Số lượng</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {availableSizes.length > 0 ? (
              availableSizes.map((size) => (
                <div
                  key={size}
                  className="mb-3 border-bottom pb-2"
                  style={{ outline: "1px dashed #ccc", padding: "10px" }}
                >
                  <Form.Check
                    type="checkbox"
                    label={`Size ${size}`}
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />
                  {selectedSizes.includes(size) && (
                    <Form.Control
                      className="mt-2"
                      type="number"
                      placeholder="Số lượng tối thiểu 50"
                      min={50}
                      style={{ outline: "1px solid #ccc" }}
                      value={quantities[size] || ""}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                    />
                  )}
                </div>
              ))
            ) : (
              <p>⚠️ Không có size nào khả dụng.</p>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="outline-success" onClick={handleConfirm}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddToCartButton;
