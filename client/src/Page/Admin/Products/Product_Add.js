import React, { useEffect, useState } from "react";
import {
  getAllSizes,
  getAllCategories,
  createProduct
} from "../../../api/Admin/products.api";

import Tinymce from "../../../Components/Tinymce";
import { colors } from "../../../config/colors";
import Toast from "../../../Components/Toast";

const ProductAdd = () => {
  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",       // lưu giá dạng số chuỗi nguyên (ko dấu chấm)
    giasanphamRaw: "",    // giá đã format có dấu chấm phân cách
    theloai: "",
    mota: "",
  });

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Lấy danh mục lỗi:", err));

    getAllSizes()
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableSizes(data);
        }
      })
      .catch((err) => console.error("Lấy size lỗi:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      form.tensanpham.trim() &&
      form.giasanpham.trim() &&
      form.theloai &&
      selectedSizes.length > 0 &&
      selectedSizes.every((s) => s.soluong >= 1) &&
      selectedColors.length > 0 &&
      images.length > 0
    );
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setToast({ show: true, message: "Vui lòng điền đầy đủ thông tin và chọn size, màu, ảnh.", type: "error" });
      return;
    }

    // Tạo form data để gửi ảnh lên server
    const formData = new FormData();
    formData.append("tensanpham", form.tensanpham);
    formData.append("giasanpham", form.giasanpham);
    formData.append("theloai", form.theloai);
    formData.append("mota", form.mota);

    // Thêm thông tin size với số lượng, dạng JSON string
    formData.append("sizes", JSON.stringify(selectedSizes));

    // Thêm thông tin màu sắc dạng JSON string
    formData.append("colors", JSON.stringify(selectedColors));

    // Thêm ảnh (có thể nhiều file)
    images.forEach((img, i) => {
      formData.append("images", img.file);
    });

    try {
      const res = await createProduct(formData);
      setToast({ show: true, message: "Tạo sản phẩm thành công!", type: "success" });
      // Reset form
      setForm({
        tensanpham: "",
        giasanpham: "",
        giasanphamRaw: "",
        theloai: "",
        mota: "",
      });
      setSelectedSizes([]);
      setSelectedColors([]);
      setImages([]);
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error);
      alert("Có lỗi xảy ra khi tạo sản phẩm.");
    }
  };

  function inputNameProduct() {
    return (
      <div className="mb-3">
        <label className="form-label">Tên sản phẩm *</label>
        <input
          type="text"
          name="tensanpham"
          className="form-control"
          value={form.tensanpham}
          onChange={handleChange}
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>
    );
  }

  function inputPriceProduct() {
    const formatCurrency = (value) => {
      if (!value) return "";
      return new Intl.NumberFormat("vi-VN").format(value);
    };

    const handlePriceChange = (e) => {
      const raw = e.target.value.replace(/\D/g, ""); // chỉ lấy số
      const formatted = formatCurrency(raw);
      setForm((prev) => ({
        ...prev,
        giasanpham: raw,
        giasanphamRaw: formatted,
      }));
    };
    return (
      <div className="mb-3">
        <label className="form-label">Giá sản phẩm *</label>
        <input
          type="text"
          name="giasanphamRaw"
          className="form-control"
          value={form.giasanphamRaw}
          onChange={handlePriceChange}
          placeholder="Nhập giá, ví dụ: 1.000.000"
          required
        />
      </div>
    );
  }

  function inputCategoryProduct() {
    return (
      <div className="mb-3">
        <label className="form-label">Danh mục *</label>
        <select
          name="theloai"
          className="form-select"
          value={form.theloai}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.tendanhmuc}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function inputDescriptionProduct() {
    return (
      <div className="mb-3">
        <label className="form-label">Mô tả</label>
        <Tinymce
          value={form.mota}
          placeholder="Nhập mô tả sản phẩm"
          onChange={(val) => setForm((f) => ({ ...f, mota: val }))}
        />
      </div>
    );
  }

  function inputSizeProduct() {
    const handleQuantityChange = (size, value) => {
      // Cho phép giá trị rỗng để user có thể xóa tạm
      setSelectedSizes((prev) =>
        prev.map((s) =>
          s.size === size
            ? {
              ...s,
              soluong: value === "" ? "" : parseInt(value, 10), // Cho phép rỗng hoặc số
            }
            : s
        )
      );
    };

    const toggleSize = (size) => {
      setSelectedSizes((prev) => {
        const exists = prev.find((s) => s.size === size);
        if (exists) {
          return prev.filter((s) => s.size !== size);
        } else {
          return [...prev, { size, soluong: 1 }];
        }
      });
    };

    const handleQuantityBlur = (size) => {
      setSelectedSizes((prev) =>
        prev.map((s) => {
          if (s.size === size) {
            const validNumber = parseInt(s.soluong, 10);
            if (isNaN(validNumber) || validNumber < 1) {
              return { ...s, soluong: 1 }; // Đặt lại 1 nếu không hợp lệ
            }
            return { ...s, soluong: validNumber };
          }
          return s;
        })
      );
    };
    return (
      <>
        <div className="mb-3">
          <label className="form-label fw-bold">Chọn Size:</label>
          <div className="d-flex flex-wrap gap-2 border p-3 rounded">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.some((s) => s.size === size.size);
              return (
                <button
                  key={size._id}
                  type="button"
                  className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"
                    }`}
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
            {selectedSizes.map(({ size, soluong }) => (
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
                  value={soluong === "" ? "" : soluong}
                  onChange={(e) => handleQuantityChange(size, e.target.value)}
                  onBlur={() => handleQuantityBlur(size)}
                  className="form-control"
                  style={{ maxWidth: "80px" }}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  function getColorProduct() {
    const toggleColor = (code) => {
      setSelectedColors((prev) => {
        if (prev.includes(code)) {
          return prev.filter((c) => c !== code);
        } else {
          return [...prev, code];
        }
      });
    };

    return (
      <div className="mb-3">
        <label className="form-label fw-bold">Chọn Màu:</label>
        <div className="d-flex flex-wrap gap-2">
          {colors.map(({ color, code }) => {
            const isSelected = selectedColors.includes(code); // So sánh theo code
            return (
              <button
                key={code}
                type="button"
                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => toggleColor(code)}
              >
                {color}
              </button>
            );
          })}
        </div>
        <div className="d-flex gap-2 mt-3">
          {colors.map(({ color, code }) => {
            const isSelected = selectedColors.includes(code);
            return (
              <div
                key={code}
                onClick={() => toggleColor(code)}
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
    );
  }

  function getImgProduct() {
    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div>
        <label htmlFor="fileInput" className="d-block mb-3 fw-semibold">
          Ảnh sản phẩm
        </label>

        <label
          htmlFor="fileInput"
          className="d-flex flex-column align-items-center justify-content-center border border-dashed rounded p-4 text-center"
          style={{ cursor: "pointer", minHeight: "120px", borderColor: "#6c757d" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="#0d6efd"
            className="mb-3"
            viewBox="0 0 16 16"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
            <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
          </svg>
          <span className="text-secondary fs-6">
            Kéo & thả hoặc bấm để chọn ảnh
          </span>
        </label>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="d-none"
        />

        <div className="my-4 d-flex align-items-center">
          <hr className="flex-grow-1" />
        </div>

        {/* Preview ảnh theo code bạn gửi */}
        <div style={{ marginTop: 12 }}>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                width: 80,
                height: 80,
                border: "1px solid #ccc",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
                display: "inline-block",
                marginRight: 8,
                backgroundColor: "#f3f4f6",
              }}
            >
              <img
                src={img.url}
                alt={`img-${index}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 4,
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  fontWeight: "bold",
                  lineHeight: "18px",
                  textAlign: "center",
                  padding: 0,
                }}
                title="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  function ProductInfoView({ form, selectedSizes, selectedColors, images }) {
    // Hàm kiểm tra điều kiện để hiển thị JSON
    function isFormComplete() {
      return (
        form.tensanpham?.trim() &&
        form.giasanpham?.trim() &&
        form.theloai?.trim() &&
        selectedSizes.length > 0 &&
        selectedColors.length > 0 &&
        images.length > 0
      );
    }

    // Chuẩn bị dữ liệu JSON
    const productData = {
      tensanpham: form.tensanpham,
      giasanpham: Number(form.giasanpham),
      theloai: form.theloai,
      mota: form.mota,
      kichthuoc: selectedSizes.map(({ size, soluong }) => ({ size, soluong })),
      mausac: selectedColors,
      images: images.map(({ file, url }) => ({
        tenfile: file.name,
      })),
    };

    if (!isFormComplete()) {
      return (
        <div className="alert alert-warning">
          Vui lòng điền đầy đủ thông tin sản phẩm, chọn size, màu và ảnh để xem JSON.
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="form-label fw-bold">Dữ liệu JSON sản phẩm:</label>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            borderRadius: 4,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {JSON.stringify(productData, null, 2)}
        </pre>
      </div>
    );
  }


  return (
    <div className="container">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h3 className="text-center">Thêm Sản Phẩm</h3>
      <form onSubmit={handleSubmit}>
        {inputNameProduct()}
        {inputPriceProduct()}
        {inputCategoryProduct()}
        {inputDescriptionProduct()}
        {inputSizeProduct()}
        {getColorProduct()}
        {getImgProduct()}

        {/* Hiển thị dữ liệu JSON tổng hợp */}
        <ProductInfoView
          form={form}
          selectedSizes={selectedSizes}
          selectedColors={selectedColors}
          images={images}
        />

        <button
          type="submit"
          className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 mb-4"
          disabled={!isFormValid()}
        >
          <i className="bi bi-plus-circle-fill"></i> {/* icon Bootstrap */}
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;
