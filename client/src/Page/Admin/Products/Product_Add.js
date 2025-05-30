import React, { useEffect, useState } from "react";
import axios from "axios";
import { colors } from "../../../config/colors";

const ProductAdd = () => {
  // State lưu trữ các kích thước và danh mục lấy từ server
  const [availableSizes, setAvailableSizes] = useState([]);
  const [categories, setCategories] = useState([]);

  // State lưu kích thước, màu sắc được chọn
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // State form nhập liệu và preview dữ liệu trước khi gửi
  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",      // Giá hiển thị có dấu phân cách
    giasanphamRaw: "",   // Giá thuần số để gửi server
    theloai: "",
    mota: "",
  });
  const [previewData, setPreviewData] = useState(null);

  // Lấy dữ liệu kích thước và danh mục khi component mount
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

  // Chọn / bỏ chọn size, mặc định quantity 1 khi chọn mới
  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) {
        // Bỏ chọn size
        return prev.filter((s) => s.size !== size);
      } else {
        // Thêm size với số lượng mặc định 1
        return [...prev, { size, quantity: 1 }];
      }
    });
  };

  // Chọn / bỏ chọn màu (theo tên)
  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Thay đổi số lượng theo từng size, chỉ nhận số >= 0
  const handleQuantityChange = (size, value) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 0) return;
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity } : s))
    );
  };

  // Format số thành chuỗi định dạng VNĐ có dấu chấm ngăn cách hàng nghìn
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Xử lý nhập giá sản phẩm, chỉ giữ số, tự format khi nhập
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCurrency(raw);
    setForm((prev) => ({
      ...prev,
      giasanphamRaw: formatted,
      giasanpham: raw,
    }));
  };

  // Xử lý thay đổi các trường input khác
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form để hiển thị preview
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (
      !form.tensanpham.trim() ||
      !form.giasanphamRaw ||
      !form.theloai ||
      selectedSizes.length === 0 ||
      selectedColors.length === 0
    ) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn ít nhất một size và một màu.");
      return;
    }

    // Kiểm tra số lượng từng size > 0
    for (const s of selectedSizes) {
      if (s.quantity <= 0) {
        alert(`Số lượng cho size ${s.size} phải lớn hơn 0.`);
        return;
      }
    }

    // Chuẩn bị dữ liệu preview
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

  // Xác nhận gửi dữ liệu lên server
  const handleConfirmSend = () => {
    if (!previewData) return;

    axios
      .post("http://localhost:4000/admin/products", previewData)
      .then(() => {
        alert("Thêm sản phẩm thành công!");
        // Reset form và trạng thái
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
          <div className="mb-3">
            <label className="form-label">Số lượng theo size:</label>
            {selectedSizes.map(({ size, quantity }) => (
              <div
                key={size}
                className="d-flex align-items-center gap-3 mb-2"
                style={{ maxWidth: "300px" }}
              >
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

        {/* Chọn màu sắc (tên) */}
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

        {/* Chọn màu sắc (ô màu) */}
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

        {/* Nút Xem trước */}
        <div className="text-center mt-4">
          <button type="submit" className="btn btn-success px-5">
            Xem Trước
          </button>
        </div>
      </form>

      {/* Bảng xem trước sản phẩm */}
      {previewData && (
        <div className="mt-5">
          <h4 className="text-center mb-4">Xem trước sản phẩm</h4>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Tên sản phẩm</th>
                <td>{previewData.tensanpham}</td>
              </tr>
              <tr>
                <th>Giá</th>
                <td>{formatCurrency(previewData.giasanphamRaw)} VNĐ</td>
              </tr>
              <tr>
                <th>Danh mục</th>
                <td>{categories.find((cat) => cat._id === previewData.theloai)?.tendanhmuc || "Không rõ"}</td>
              </tr>
              <tr>
                <th>Mô tả</th>
                <td>{previewData.mota || "Không có mô tả"}</td>
              </tr>
              <tr>
                <th>Kích thước và số lượng</th>
                <td>
                  {previewData.kichthuoc.map(({ size, soluong }) => (
                    <div key={size}>
                      Size {size}: {soluong}
                    </div>
                  ))}
                </td>
              </tr>
              <tr>
                <th>Màu sắc</th>
                <td>{previewData.mau.join(", ")}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center">
            <button className="btn btn-primary" onClick={handleConfirmSend}>
              Xác nhận gửi sản phẩm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdd;
