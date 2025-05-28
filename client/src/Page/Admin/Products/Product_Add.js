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
    theloai: "",
    mota: "",
    soluong: "",
  });

  // Lấy danh sách size và danh mục khi component mount
  useEffect(() => {
    axios
      .get("http://localhost:4000/admin/products/sizes")
      .then((res) => setAvailableSizes(res.data))
      .catch((err) => console.error("Lỗi lấy size:", err));

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
      !form.soluong ||
      selectedSizes.length === 0 ||
      selectedColors.length === 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin, chọn ít nhất một size và một màu.");
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
        mau: "",
        chatlieu: "",
      })),
      mau: selectedColors,
    };

    axios
      .post("http://localhost:4000/admin/products", dataToSend)
      .then(() => {
        alert("Thêm sản phẩm thành công!");
        setForm({
          tensanpham: "",
          giasanpham: "",
          theloai: "",
          mota: "",
          soluong: "",
        });
        setSelectedSizes([]);
        setSelectedColors([]);
      })
      .catch((err) => {
        console.error("Lỗi thêm sản phẩm:", err);
        alert("Lỗi khi thêm sản phẩm, vui lòng thử lại.");
      });
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center">Thêm Sản Phẩm</h3>
      <form onSubmit={handleSubmit}>
        {/* Tên sản phẩm */}
        <div className="mb-3">
          <label className="form-label">
            Tên sản phẩm <span className="text-danger">*</span>
          </label>
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
          <label className="form-label">
            Giá sản phẩm <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            name="giasanpham"
            className="form-control"
            value={form.giasanpham}
            onChange={handleChange}
            min="0"
            placeholder="Nhập giá bán cho sản phẩm"
          />
        </div>

        {/* Thể loại - dropdown */}
        <div className="mb-3">
          <label className="form-label">
            Thể loại <span className="text-danger">*</span>
          </label>
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

        {/* Chọn size */}
        <div className="mb-3">
          <label className="form-label fw-bold mb-2">Chọn Size:</label>
          <div className="d-flex flex-wrap gap-2 p-3 rounded border">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.some((s) => s.size === size.size);
              return (
                <button
                  key={size._id}
                  type="button"
                  className={`btn btn-sm rounded border ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => toggleSize(size.size)}
                >
                  {size.size}
                </button>
              );
            })}
          </div>
          {selectedSizes.length === 0 && (
            <div className="form-text text-danger mt-1">
              Vui lòng chọn ít nhất một size.
            </div>
          )}
        </div>

        {/* Nhập số lượng theo size */}
        {selectedSizes.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-bold mb-2">Nhập số lượng theo size:</label>
            {selectedSizes.map(({ size, quantity }) => (
              <div key={size} className="d-flex align-items-center gap-3 mb-2" style={{ maxWidth: "300px" }}>
                <span style={{ minWidth: "50px" }}>{size}</span>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(size, e.target.value)}
                  placeholder={`Số lượng size ${size}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Chọn màu (Tên) */}
        <div className="mb-3">
          <label className="form-label fw-bold mb-2">Chọn Màu (Tên màu):</label>
          <div className="d-flex flex-wrap gap-2 p-3 rounded border mb-4">
            {colors.map(({ color }) => {
              const isSelected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  className={`btn btn-sm rounded border ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => toggleColor(color)}
                >
                  {color}
                </button>
              );
            })}
          </div>
          {selectedColors.length === 0 && (
            <div className="form-text text-danger">Vui lòng chọn ít nhất một màu.</div>
          )}
        </div>

        {/* Chọn màu (Ô màu) */}
        <div className="mb-3">
          <label className="form-label fw-bold mb-2">Chọn Màu (Ô màu):</label>
          <div className="d-flex flex-wrap gap-3">
            {colors.map(({ color, code }) => {
              const isSelected = selectedColors.includes(color);
              return (
                <div
                  key={color}
                  onClick={() => toggleColor(color)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    backgroundColor: code,
                    cursor: "pointer",
                    border: isSelected ? "3px solid #000" : "1px solid #ccc",
                  }}
                  title={color}
                />
              );
            })}
          </div>
        </div>

        {/* Nút submit */}
        <div className="text-center">
          <button type="submit" className="btn btn-success mt-3">
            Thêm sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;
