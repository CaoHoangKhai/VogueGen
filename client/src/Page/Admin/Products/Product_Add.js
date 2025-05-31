import React, { useEffect, useState } from "react";
import axios from "axios";
import { colors } from "../../../config/colors";

const ProductAdd = () => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",
    giasanphamRaw: "",
    theloai: "",
    mota: "",
  });
  const [previewData, setPreviewData] = useState(null);

  // State cho nhiều ảnh
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/admin/products/sizes")
      .then((res) => setAvailableSizes(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách size:", err));

    axios
      .get("http://localhost:4000/admin/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

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

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

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

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCurrency(raw);
    setForm((prev) => ({
      ...prev,
      giasanpham: raw,
      giasanphamRaw: formatted,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Khi chọn file mới, reset toàn bộ ảnh và tên file (không cộng dồn)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    setImageNames(files.map((file) => file.name));
    setImageFiles(files);
  };

  // Xóa ảnh theo index
  const handleRemoveImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageNames((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
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
    if (imageFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh sản phẩm.");
      return;
    }
    const colorsCodeSelected = selectedColors.map((colorName) => {
      const colorObj = colors.find((c) => c.color === colorName);
      return colorObj ? colorObj.code : colorName;
    });
    const dataToSend = {
      ...form,
      kichthuoc: selectedSizes.map((s) => ({
        size: s.size,
        soluong: s.quantity,
      })),
      mau: colorsCodeSelected,
      // Không cần trường anh ở đây, sẽ gửi file thực ở bước xác nhận
    };
    setPreviewData(dataToSend);
  };

  // Gửi sản phẩm, upload file thực
  const handleConfirmSend = async () => {
    if (!previewData) {
      alert("Chưa có dữ liệu để gửi, vui lòng xem trước sản phẩm trước.");
      return;
    }
    const formData = new FormData();
    formData.append("tensanpham", previewData.tensanpham);
    formData.append("giasanpham", previewData.giasanpham);
    formData.append("theloai", previewData.theloai);
    formData.append("mota", previewData.mota);
    formData.append("ngaythem", previewData.ngaythem || new Date().toISOString());
    formData.append("kichthuoc", JSON.stringify(previewData.kichthuoc));
    formData.append("mau", JSON.stringify(previewData.mau));
    imageFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.post("http://localhost:4000/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Thêm sản phẩm thành công!");
      setForm({
        tensanpham: "",
        giasanpham: "",
        giasanphamRaw: "",
        theloai: "",
        mota: "",
      });
      setSelectedSizes([]);
      setSelectedColors([]);
      setPreviewData(null);
      setImagePreviews([]);
      setImageNames([]);
      setImageFiles([]);
    } catch (err) {
      console.error("Lỗi khi gửi sản phẩm:", err);
      alert("Thêm sản phẩm thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">Thêm Sản Phẩm</h3>
      <form onSubmit={handleSubmit}>
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
          <textarea
            name="mota"
            className="form-control"
            rows={3}
            value={form.mota}
            onChange={handleChange}
            placeholder="Mô tả sản phẩm"
          />
        </div>
        {/* Ảnh sản phẩm */}
        <div className="mb-3">
          <label className="form-label">Ảnh sản phẩm *</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            multiple
            onChange={handleImageChange}
          />
          {imagePreviews.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {imagePreviews.map((src, idx) => (
                <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                  />
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2, textAlign: "center" }}>
                    {imageNames[idx]}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
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
                  }}
                />
              );
            })}
          </div>
        </div>
        <button type="submit" className="btn btn-success">
          Xem trước sản phẩm
        </button>
      </form>
      {/* Preview dữ liệu */}
      {previewData && (
        <div className="mt-5 p-4 border rounded bg-light">
          <h4>Thông tin sản phẩm xem trước:</h4>
          <pre>{JSON.stringify(previewData, null, 2)}</pre>
          {imagePreviews.length > 0 && (
            <div className="mb-3 d-flex gap-2 flex-wrap">
              <strong>Ảnh xem trước:</strong>
              {imagePreviews.map((src, idx) => (
                <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                  />
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2, textAlign: "center" }}>
                    {imageNames[idx]}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
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
          <button onClick={handleConfirmSend} className="btn btn-primary mt-3">
            Xác nhận thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductAdd;