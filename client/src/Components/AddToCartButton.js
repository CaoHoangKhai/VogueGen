import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { getSizesByDesignId } from "../api/Size/size.api";

const AddToCartButton = ({ onAddToCart, showToast }) => {
    const { id } = useParams();
    const location = useLocation();
    const isDesignPage = location.pathname.includes("/design");

    const [availableSizes, setAvailableSizes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const fetchSizes = async () => {
            try {
                const sizes = await getSizesByDesignId(id);
                setAvailableSizes(sizes);
            } catch (err) {
                console.error("Lỗi khi lấy size:", err);
                showToast?.("Lỗi khi lấy size sản phẩm!", "error");
            }
        };
        if (id) fetchSizes();
    }, [id, showToast]);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setSelectedSizes([]);
        setQuantities({});
        setShowModal(false);
    };

    const handleSizeChange = (size) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const handleQuantityChange = (size, value) => {
        setQuantities((prev) => ({
            ...prev,
            [size]: Number(value),
        }));
    };

    const handleConfirm = () => {
        if (selectedSizes.length === 0) {
            showToast?.("Vui lòng chọn ít nhất một size!", "warning");
            return;
        }

        const invalidQuantity = selectedSizes.some(
            (size) => !quantities[size] || quantities[size] < 1
        );
        if (invalidQuantity) {
            showToast?.("Vui lòng nhập số lượng hợp lệ cho từng size!", "warning");
            return;
        }

        const selectedItems = selectedSizes.map((size) => {
            const item = {
                size,
                quantity: quantities[size],
                mausac: "#000000",
            };

            if (isDesignPage) {
                item.madesign = id;
                item.masanpham = "ID_SẢN_PHẨM_THIẾT_KẾ";
            } else {
                item.masanpham = id;
            }

            return item;
        });

        selectedItems.forEach((item) => {
            onAddToCart?.(item);
        });

        showToast?.("🎉 Đã thêm vào giỏ hàng!", "success");
        handleClose();
    };

    return (
        <>
            <button className="btn btn-success mt-2" onClick={handleOpen}>
                🛒
            </button>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chọn Size và Số lượng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {availableSizes.length > 0 ? (
                            availableSizes.map((size) => (
                                <div key={size} className="mb-3 border-bottom pb-2">
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
                                            placeholder="Số lượng"
                                            min={1}
                                            value={quantities[size] || ""}
                                            onChange={(e) =>
                                                handleQuantityChange(size, e.target.value)
                                            }
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>Không có size nào khả dụng.</p>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={handleConfirm}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddToCartButton;
