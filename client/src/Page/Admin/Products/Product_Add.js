import React, { useEffect, useState } from "react";
import axios from "axios";
import { colors } from "../../../config/colors";

const ProductAdd = () => {
  const [availableSizes, setAvailableSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",
    theloai: "",
    mota: "",
    giasanphamRaw: "", // giá trị thô (dạng số)
  });

  // Lấy dữ liệu size và danh mục khi component mount
  useEffect(() => {
    axios
      .get("http://localhost:4000/admin/products/sizes")
      .then((res) => setAvailableSizes(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách size:", err));

    axios
      .get("http://localhost:4000/admin/getallcategories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));
  }, []);

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      return exists
        ? prev.filter((s) => s.size !== size)
        : [...prev, { size, quantity: 1 }];
    });
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleQuantityChange = (size, value) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 0) return;

    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity } : s))
    );
  };
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Xử lý khi người dùng nhập giá
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ""); // loại bỏ tất cả ký tự không phải số
    const formatted = formatCurrency(raw);
    setForm((prev) => ({
      ...prev,
      giasanpham: formatted,
      giasanphamRaw: raw,
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.tensanpham.trim() ||
      !form.giasanpham ||
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

    const dataToSend = {
      ...form,
      kichthuoc: selectedSizes.map((s) => ({
        size: s.size,
        soluong: s.quantity,
      })),
      mau: selectedColors,
    };

    setPreviewData(dataToSend);
  };

  const handleConfirmSend = () => {
    if (!previewData) return;

    axios
      .post("http://localhost:4000/admin/products", previewData)
      .then(() => {
        alert("Thêm sản phẩm thành công!");
        setForm({
          tensanpham: "",
          giasanpham: "",
          theloai: "",
          mota: "",
        });
        setSelectedSizes([]);
        setSelectedColors([]);
        setPreviewData(null);
      })
      .catch((err) => {
        console.error("Lỗi khi gửi sản phẩm:", err);
        alert("Thêm sản phẩm thất bại. Vui lòng thử lại.");
      });
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
            value={form.giasanpham}
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
          ></textarea>
        </div>

        {/* Size */}
        <div className="mb-3">
          <label className="form-label fw-bold">Chọn Size:</label>
          <div className="d-flex flex-wrap gap-2 border p-3 rounded">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.some((s) => s.size === size.size);
              return (
                <button
                  type="button"
                  key={size._id}
                  className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => toggleSize(size.size)}
                >
                  {size.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Số lượng từng size */}
        {selectedSizes.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Số lượng theo size:</label>
            {selectedSizes.map(({ size, quantity }) => (
              <div key={size} className="d-flex align-items-center gap-3 mb-2" style={{ maxWidth: "300px" }}>
                <span style={{ width: "50px" }}>{size}</span>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(size, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Màu sắc (theo tên) */}
        <div className="mb-3">
          <label className="form-label fw-bold">Chọn Màu (Tên):</label>
          <div className="d-flex flex-wrap gap-2 p-3 border rounded mb-2">
            {colors.map(({ color }) => {
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => toggleColor(color)}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Màu sắc (ô màu) */}
        <div className="mb-3">
          <label className="form-label fw-bold">Chọn Màu (Ô màu):</label>
          <div className="d-flex flex-wrap gap-3">
            {colors.map(({ color, code }) => {
              const isSelected = selectedColors.includes(color);
              return (
                <div
                  key={color}
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

        {/* Nút xem trước */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-success px-5">
            Xem thông tin sản phẩm
          </button>
        </div>
      </form>

      {/* Hiển thị xem trước sản phẩm */}
      {previewData && (
        <div className="mt-4 p-4 bg-light border rounded">
          <h5>Xem trước dữ liệu gửi:</h5>
          <pre style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "4px" }}>
            {JSON.stringify(previewData, null, 2)}
          </pre>

          <div className="text-center mt-3">
            <button className="btn btn-primary me-3" onClick={handleConfirmSend}>
              Xác nhận gửi
            </button>
            <button className="btn btn-secondary" onClick={() => setPreviewData(null)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdd;
