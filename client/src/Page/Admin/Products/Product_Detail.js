import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colors } from "../../../config/colors";
import {
    getAllCategories,
    getAllSizes,
    getAllProducts,
    updateProduct
} from "../../../api/Admin/products.api";
import Tinymce from "../../../Components/Tinymce";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [colorImages, setColorImages] = useState({});
    const [form, setForm] = useState({
        tensanpham: "",
        giasanpham: "",
        giasanphamRaw: "",
        theloai: "",
        mota: "",
    });

    // Lấy danh mục và size
    useEffect(() => {
        getAllSizes().then(setAvailableSizes);
        getAllCategories().then(setCategories);
    }, []);

    // Lấy chi tiết sản phẩm
    useEffect(() => {
        const fetchProduct = async () => {
            const allProducts = await getAllProducts();
            const found = allProducts.find((p) => p._id === id);
            if (found) {
                setProduct(found);
                setForm({
                    tensanpham: found.tensanpham || "",
                    giasanpham: found.giasanpham ? found.giasanpham.toString() : "",
                    giasanphamRaw: found.giasanpham ? new Intl.NumberFormat("vi-VN").format(found.giasanpham) : "",
                    theloai: found.theloai || "",
                    mota: found.mota || "",
                });
                // Sizes
                setSelectedSizes(
                    found.kichthuoc?.map((sz) => ({
                        size: sz.Size,
                        quantity: sz.SoLuong,
                    })) || []
                );
                // Colors
                setSelectedColors(
                    found.mausanpham?.map((c) => {
                        const colorObj = colors.find((cl) => cl.code === c.mau);
                        return colorObj ? colorObj.color : c.mau;
                    }) || []
                );
                // Images theo màu
                const imgs = {};
                if (found.hinhanh && found.mausanpham) {
                    found.mausanpham.forEach((color) => {
                        const colorCode = color.mau;
                        const imgsForColor = found.hinhanh.filter(img => img.Mau === colorCode);
                        imgs[colorCode] = {
                            files: [],
                            previews: imgsForColor.map(img => `http://localhost:4000${img.url}`),
                            names: imgsForColor.map(img => img.TenFile),
                        };
                    });
                }
                setColorImages(imgs);
            }
        };
        fetchProduct();
    }, [id]);

    // Thêm/xóa size
    const toggleSize = (size) => {
        setSelectedSizes((prev) => {
            const exists = prev.find((s) => s.size === size);
            if (exists) {
                return prev.filter((s) => s.size !== size);
            } else {
                return [...prev, { size, quantity: 1 }];
            }
        });
    };

    // Thay đổi số lượng size
    const handleQuantityChange = (size, value) => {
        if (value === "") {
            setSelectedSizes((prev) =>
                prev.map((s) => (s.size === size ? { ...s, quantity: "" } : s))
            );
            return;
        }
        const quantity = parseInt(value, 10);
        if (isNaN(quantity) || quantity < 0) {
            return;
        }
        setSelectedSizes((prev) =>
            prev.map((s) => (s.size === size ? { ...s, quantity } : s))
        );
    };

    const handleQuantityBlur = (size) => {
        setSelectedSizes((prev) =>
            prev.map((s) => {
                if (s.size === size) {
                    if (s.quantity === "" || isNaN(s.quantity) || s.quantity < 1) {
                        return { ...s, quantity: 1 };
                    }
                }
                return s;
            })
        );
    };

    // Thêm/xóa màu
    const toggleColor = (color) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
        // Nếu bỏ chọn màu thì xóa ảnh của màu đó
        const colorObj = colors.find((c) => c.color === color);
        if (colorImages[colorObj.code]) {
            setColorImages((prev) => {
                const newObj = { ...prev };
                delete newObj[colorObj.code];
                return newObj;
            });
        }
    };

    // Chọn ảnh cho từng màu
    const handleColorImageChange = (colorCode, e) => {
        const files = Array.from(e.target.files);
        setColorImages((prev) => {
            const prevFiles = prev[colorCode]?.files || [];
            const prevPreviews = prev[colorCode]?.previews || [];
            const prevNames = prev[colorCode]?.names || [];
            return {
                ...prev,
                [colorCode]: {
                    files: prevFiles.concat(files),
                    previews: prevPreviews.concat(files.map((file) => URL.createObjectURL(file))),
                    names: prevNames.concat(files.map((file) => file.name)),
                },
            };
        });
    };

    // Xóa ảnh của một màu theo index
    const handleRemoveColorImage = (colorCode, idx) => {
        setColorImages((prev) => {
            const { files, previews, names } = prev[colorCode];
            return {
                ...prev,
                [colorCode]: {
                    files: files.filter((_, i) => i !== idx),
                    previews: previews.filter((_, i) => i !== idx),
                    names: names.filter((_, i) => i !== idx),
                },
            };
        });
    };

    // Định dạng tiền
    const formatCurrency = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("vi-VN").format(value);
    };

    // Thay đổi giá sản phẩm
    const handlePriceChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        const formatted = formatCurrency(raw);
        setForm((prev) => ({
            ...prev,
            giasanpham: raw,
            giasanphamRaw: formatted,
        }));
    };

    // Thay đổi các trường khác
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Lưu cập nhật sản phẩm
    const handleSave = async (e) => {
        e.preventDefault();
        if (
            !form.tensanpham.trim() ||
            !form.theloai ||
            selectedSizes.length === 0 ||
            selectedColors.length === 0
        ) {
            alert("Vui lòng nhập đầy đủ thông tin và chọn ít nhất một size và một màu.");
            return;
        }
        for (const s of selectedSizes) {
            if (s.quantity <= 0) {
                alert(`Số lượng cho size ${s.size} phải lớn hơn 0.`);
                return;
            }
        }
        for (const color of selectedColors) {
            const colorObj = colors.find((c) => c.color === color);
            const imgs = colorImages[colorObj.code];
            if (!imgs || (imgs.files.length === 0 && imgs.previews.length === 0)) {
                alert(`Vui lòng chọn ít nhất một ảnh cho màu ${color}.`);
                return;
            }
        }
        const colorsCodeSelected = selectedColors.map((colorName) => {
            const colorObj = colors.find((c) => c.color === colorName);
            return colorObj ? colorObj.code : colorName;
        });
        // Chuẩn bị dữ liệu gửi
        const formData = new FormData();
        formData.append("tensanpham", form.tensanpham);
        formData.append("giasanpham", form.giasanpham);
        formData.append("theloai", form.theloai);
        formData.append("mota", form.mota);
        formData.append("kichthuoc", JSON.stringify(selectedSizes.map((s) => ({
            size: s.size,
            soluong: s.quantity,
        }))));
        formData.append("mau", JSON.stringify(colorsCodeSelected));
        // Thêm file ảnh cho từng màu
        Object.entries(colorImages).forEach(([colorCode, { files }]) => {
            files.forEach((file) => {
                formData.append(`files_${colorCode}`, file);
            });
        });

        try {
            await updateProduct(id, formData);
            alert("Cập nhật sản phẩm thành công!");
            navigate("/admin/products");
        } catch (err) {
            console.error("Lỗi khi cập nhật sản phẩm:", err);
            alert("Cập nhật sản phẩm thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="text-center">Chỉnh Sửa Sản Phẩm</h3>
            {!product ? (
                <div>Đang tải chi tiết sản phẩm...</div>
            ) : (
                <form onSubmit={handleSave}>
                    {/* Tên sản phẩm */}
                    <div className="mb-3">
                        <label className="form-label">Tên sản phẩm *</label>
                        <input
                            type="text"
                            name="tensanpham"
                            className="form-control"
                            value={form.tensanpham}
                            onChange={handleChange}
                            placeholder="Nhập tên sản phẩm"
                        />
                    </div>
                    {/* Giá sản phẩm */}
                    <div className="mb-3">
                        <label className="form-label">Giá sản phẩm *</label>
                        <input
                            type="text"
                            name="giasanpham"
                            className="form-control"
                            value={form.giasanphamRaw}
                            onChange={handlePriceChange}
                            placeholder="Nhập giá, ví dụ: 1.000.000"
                        />
                    </div>
                    {/* Danh mục */}
                    <div className="mb-3">
                        <label className="form-label">Danh mục *</label>
                        <select
                            name="theloai"
                            className="form-select"
                            value={form.theloai}
                            onChange={handleChange}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.tendanhmuc}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Mô tả */}
                    <div className="mb-3">
                        <label className="form-label">Mô tả</label>
                        <Tinymce
                            value={form.mota}
                            onChange={val => setForm(f => ({ ...f, mota: val }))}
                        />
                    </div>
                    {/* Chọn Size */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Chọn Size:</label>
                        <div className="d-flex flex-wrap gap-2 border p-3 rounded">
                            {availableSizes.map((size) => {
                                const isSelected = selectedSizes.some((s) => s.size === size.size);
                                return (
                                    <button
                                        key={size._id}
                                        type="button"
                                        className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => toggleSize(size.size)}
                                    >
                                        {size.size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Nhập số lượng theo size */}
                    {selectedSizes.length > 0 && (
                        <div className="mb-4">
                            <label className="form-label fw-bold mb-3">Số lượng theo size:</label>
                            {selectedSizes.map(({ size, quantity }) => (
                                <div
                                    key={size}
                                    className="d-flex align-items-center mb-3 p-2 border rounded"
                                    style={{ maxWidth: "320px", backgroundColor: "#f8f9fa" }}
                                >
                                    <span className="me-3" style={{ minWidth: "60px" }}>
                                        Size {size}:
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(size, e.target.value)}
                                        onBlur={() => handleQuantityBlur(size)}
                                        className="form-control"
                                        style={{ maxWidth: "80px" }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Chọn màu */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Chọn Màu:</label>
                        <div className="d-flex flex-wrap gap-2">
                            {colors.map(({ color, code }) => {
                                const isSelected = selectedColors.includes(color);
                                return (
                                    <button
                                        key={code}
                                        type="button"
                                        className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                                        onClick={() => toggleColor(color)}
                                    >
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: 18,
                                                height: 18,
                                                borderRadius: 4,
                                                backgroundColor: code,
                                                border: "1px solid #ccc",
                                                marginRight: 6,
                                                verticalAlign: "middle"
                                            }}
                                        />
                                        {color}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            {colors.map(({ color, code }) => {
                                const isSelected = selectedColors.includes(color);
                                return (
                                    <div
                                        key={code}
                                        onClick={() => toggleColor(color)}
                                        title={color}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "4px",
                                            backgroundColor: code,
                                            cursor: "pointer",
                                            border: isSelected ? "3px solid #007bff" : "1px solid #ccc",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    {/* Chọn ảnh cho từng màu */}
                    {selectedColors.map((color) => {
                        const colorObj = colors.find((c) => c.color === color);
                        const colorCode = colorObj.code;
                        return (
                            <div key={colorCode} className="mb-3">
                                <label className="form-label">
                                    Ảnh cho màu <span>{color}</span> *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    multiple
                                    onChange={(e) => handleColorImageChange(colorCode, e)}
                                />
                                {colorImages[colorCode] && colorImages[colorCode].previews.length > 0 && (
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        {colorImages[colorCode].previews.map((src, idx) => (
                                            <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                                                <img
                                                    src={src}
                                                    alt={`Preview ${idx + 1}`}
                                                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                                                />
                                                <div style={{ fontSize: 12, color: "#555", marginTop: 2, textAlign: "center" }}>
                                                    {/* {colorImages[colorCode].names[idx]} */}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveColorImage(colorCode, idx)}
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        right: 0,
                                                        background: "rgba(255,0,0,0.7)",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        width: 22,
                                                        height: 22,
                                                        cursor: "pointer",
                                                        fontWeight: "bold",
                                                        lineHeight: "18px",
                                                        padding: 0,
                                                    }}
                                                    title="Xóa ảnh"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <button type="submit" className="btn btn-success">
                        Lưu sản phẩm
                    </button>
                </form>
            )}
        </div>
    );
};

export default ProductDetail;