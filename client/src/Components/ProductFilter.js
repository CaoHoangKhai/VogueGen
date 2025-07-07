import React, { useEffect, useState } from "react";
import { getAllSizes } from "../api/Size/size.api";
import { colors as predefinedColors } from "../config/colors";
function PriceFilter({ selectedRange, onChange, priceRange }) {
    const [minInput, setMinInput] = useState("");
    const [maxInput, setMaxInput] = useState("");

    const formatCurrencyInput = (value) =>
        new Intl.NumberFormat("vi-VN").format(value);

    // Format lại input từ props mỗi khi props thay đổi
    useEffect(() => {
        setMinInput(formatCurrencyInput(selectedRange.min));
        setMaxInput(formatCurrencyInput(selectedRange.max));
    }, [selectedRange]);

    const handleInputChange = (setter) => (e) => {
        let value = e.target.value.replace(/[^\d]/g, ""); // Bỏ ký tự không phải số
        if (value === "") {
            setter(""); // Cho phép xóa hết
        } else {
            setter(formatCurrencyInput(value));
        }
    };

    const handleBlur = (type, value) => {
        const raw = value.replace(/[^\d]/g, ""); // Bỏ dấu chấm để parse số
        let fallback = type === "min" ? priceRange.min : priceRange.max;

        if (raw === "" || parseInt(raw, 10) === 0) {
            onChange(type, fallback);
            if (type === "min") setMinInput(formatCurrencyInput(fallback));
            else setMaxInput(formatCurrencyInput(fallback));
            return;
        }

        const num = parseInt(raw, 10);
        if (!isNaN(num)) {
            onChange(type, num);
        }
    };

    return (
        <div className="mb-4">
            <label className="form-label fw-bold">💰 Khoảng giá</label>

            <div className="d-flex gap-3 align-items-end">
                <div className="flex-fill">
                    <label className="form-label small">Từ (₫)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={minInput}
                        onChange={handleInputChange(setMinInput)}
                        onBlur={() => handleBlur("min", minInput)}
                        inputMode="numeric"
                        placeholder={formatCurrencyInput(priceRange.min)}
                    />
                </div>
                <span>—</span>
                <div className="flex-fill">
                    <label className="form-label small">Đến (₫)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={maxInput}
                        onChange={handleInputChange(setMaxInput)}
                        onBlur={() => handleBlur("max", maxInput)}
                        inputMode="numeric"
                        placeholder={formatCurrencyInput(priceRange.max)}
                    />
                </div>
            </div>

            {selectedRange.min > selectedRange.max && (
                <div className="text-danger small mt-2">
                    ⚠ Giá tối thiểu không được lớn hơn giá tối đa!
                </div>
            )}
        </div>
    );
};

// 🔹 Bộ lọc theo màu
function ColorFilter({ availableColors, selectedColors, onToggle }) {
    return (
        <div className="mb-4">
            <label className="form-label fw-bold">🎨 Màu sắc</label>
            <div className="d-flex flex-wrap gap-2">
                {availableColors.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                        <div
                            key={color}
                            title={color}
                            onClick={() => onToggle(color)}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                backgroundColor: color,
                                border: isSelected ? "2px solid #0d6efd" : "1px solid #ccc",
                                boxShadow: isSelected ? "0 0 0 2px #0d6efd88" : "none",
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                position: "relative",
                            }}
                        >
                            {isSelected && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        width: 14,
                                        height: 14,
                                        backgroundColor: "#0d6efd",
                                        color: "white",
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    ✓
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// 🔹 Bộ lọc theo size
function SizeFilter({ availableSizes, selectedSizes, onToggle }) {
    return (
        <div className="mb-4">
            <label className="form-label fw-bold">📏 Kích thước</label>
            <div className="d-flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                    <button
                        key={size}
                        type="button"
                        onClick={() => onToggle(size)}
                        className={`btn btn-sm ${selectedSizes.includes(size)
                            ? "btn-primary"
                            : "btn-outline-primary"
                            }`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
    );
}

// 🔹 Component chính
function ProductFilter({ onFilterChange }) {
    const [priceRange] = useState({ min: 0, max: 1000000 });
    const [selectedRange, setSelectedRange] = useState({ min: 0, max: 1000000 });

    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);

    const [availableColors, setAvailableColors] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    // Fetch size từ API
    useEffect(() => {
        const fetchSizes = async () => {
            try {
                const data = await getAllSizes();
                const sizes = Array.isArray(data) ? data.map((s) => s.size) : [];
                setAvailableSizes(sizes);
            } catch (err) {
                console.error("Lỗi khi lấy kích thước:", err);
            }
        };
        fetchSizes();
    }, []);

    // Load màu từ config
    useEffect(() => {
        const allColorCodes = predefinedColors.map((c) => c.code);
        setAvailableColors(allColorCodes);
    }, []);

    // Cập nhật lọc
    useEffect(() => {
        onFilterChange({
            price: selectedRange,
            sizes: selectedSizes,
            colors: selectedColors,
        });
    }, [selectedRange, selectedSizes, selectedColors, onFilterChange]);

    // Handler
    const handlePriceChange = (type, value) => {
        setSelectedRange((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    const toggleSize = (size) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const toggleColor = (color) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-dark text-white text-center">
                <h5 className="mb-0">🔍 Lọc sản phẩm</h5>
            </div>
            <div className="card-body">
                <PriceFilter
                    selectedRange={selectedRange}
                    priceRange={priceRange}
                    onChange={handlePriceChange}

                />
                <ColorFilter
                    availableColors={availableColors}
                    selectedColors={selectedColors}
                    onToggle={toggleColor}
                />
                <SizeFilter
                    availableSizes={availableSizes}
                    selectedSizes={selectedSizes}
                    onToggle={toggleSize}
                />
            </div>
        </div>
    );
}

export default ProductFilter;
