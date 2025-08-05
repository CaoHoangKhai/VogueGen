import React, { useEffect, useState } from "react";
import { createProduct } from "../../../api/Admin/products.api";
import { getAllSizes } from "../../../api/Size/size.api";
import { getAllCategories } from "../../../api/Category/category.api";

import Tinymce from "../../../Components/Tinymce";
import { colors } from "../../../config/colors";
import Toast from "../../../Components/Toast";

const ProductAdd = () => {
  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedColor, setSelectedColor] = useState("");
  const [imagesByColor, setImagesByColor] = useState({});

  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",
    giasanphamRaw: "",
    theloai: "",
    mota: "",
    gioitinh: "",
  });

  // ✅ Map danh mục → danh sách vị trí ảnh
  const imagePositionsByCategory = {
    "t-shirts": ["front", "back", "extra"],
    "longsleeves": ["front", "back", "extra"],
    "tank-tops": ["front", "back", "extra"],
    "polo-shirts": ["front", "back", "extra"],
    "hoodie": ["front", "back", "extra"],
    // sau này nếu có mũ hoặc phụ kiện
    "hats": ["front", "right", "left", "back", "bottom"]
  };

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

  // ✅ Helper: lấy positions dựa theo danh mục đã chọn
  const getPositions = () => {
    const slug = categories.find((c) => c._id === form.theloai)?.slug;
    return imagePositionsByCategory[slug] || [];
  };

  const isFormValid = () => {
    // Lấy danh sách vị trí ảnh, loại bỏ 'extra' nếu có
    const positions = getPositions().filter((pos) => pos !== "extra");

    const hasValidImagesForAllColors = selectedColors.every((code) => {
      const colorSet = imagesByColor[code] || {};
      return positions.every((pos) => (colorSet[pos] || []).length === 1);
    });

    return (
      form.tensanpham.trim() &&
      form.giasanpham.trim() &&
      form.theloai &&
      selectedSizes.length > 0 &&
      selectedColors.length > 0 &&
      hasValidImagesForAllColors
    );
  };

  const getMissingImagesByColor = () => {
    // Lấy danh sách vị trí bắt buộc (loại bỏ "extra")
    const requiredPositions = getPositions().filter(pos => pos !== "extra");

    const result = [];

    selectedColors.forEach((code) => {
      const imgs = imagesByColor[code] || {};
      const missing = requiredPositions.filter(
        (pos) => !(imgs[pos] && imgs[pos].length === 1)
      );

      if (missing.length > 0) {
        result.push({
          colorCode: code,
          colorName: colors.find((c) => c.code === code)?.color || code,
          missingPositions: missing,
        });
      }
    });

    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setToast({
        show: true,
        message: "Vui lòng điền đầy đủ thông tin và chọn size, màu, ảnh.",
        type: "error"
      });
      return;
    }

    const formData = new FormData();
    formData.append("tensanpham", form.tensanpham);
    formData.append("giasanpham", form.giasanpham);
    formData.append("theloai", form.theloai);
    formData.append("mota", form.mota);
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("colors", JSON.stringify(selectedColors));
    formData.append("gioitinh", form.gioitinh);

    let index = 0;
    const positions = getPositions();

    for (const colorCode of selectedColors) {
      const colorImages = imagesByColor[colorCode] || {};
      for (const position of positions) {
        const imgs = colorImages[position] || [];
        for (const img of imgs) {
          formData.append(`images[${index}]`, img.file);
          formData.append(`positions[${index}]`, position);
          formData.append(`colors[${index}]`, colorCode);
          index++;
        }
      }
    }

    try {
      await createProduct(formData);
      setToast({ show: true, message: "Tạo sản phẩm thành công!", type: "success" });
      setForm({
        tensanpham: "",
        giasanpham: "",
        giasanphamRaw: "",
        theloai: "",
        mota: "",
        gioitinh: "",
      });
      setSelectedSizes([]);
      setSelectedColors([]);
      setImagesByColor({});
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error);
      alert("Có lỗi xảy ra khi tạo sản phẩm.");
    }
  };

  const handleImageChangeByPosition = (e, position) => {
    const files = Array.from(e.target.files);
    if (!selectedColor || files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImagesByColor((prev) => {
      const currentColorImages = prev[selectedColor] || { front: [], back: [], extra: [] };
      return {
        ...prev,
        [selectedColor]: {
          ...currentColorImages,
          [position]: position === "extra"
            ? [...currentColorImages[position], ...newImages]
            : [newImages[0]],
        },
      };
    });
  };

  const removeImage = (position, index) => {
    if (!selectedColor) return;
    setImagesByColor((prev) => {
      const colorImages = prev[selectedColor];
      if (!colorImages) return prev;

      const updatedPositionImages = colorImages[position].filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedColor]: {
          ...colorImages,
          [position]: updatedPositionImages,
        },
      };
    });
  };

  const renderImageUploadSection = (position, label) => {
    const images = (selectedColor && imagesByColor[selectedColor]?.[position]) || [];
    return (
      <div className="mb-4">
        <div className="row align-items-center mb-2">
          <div className="col-sm-2">
            <label className="col-form-label fw-semibold">Ảnh {label}</label>
          </div>
          <div className="col-sm-10">
            <input
              key={selectedColor + '-' + position}
              type="file"
              accept="image/*"
              multiple={position === "extra"}
              onChange={(e) => {
                handleImageChangeByPosition(e, position);
                e.target.value = "";
              }}
              className="form-control"
              disabled={!selectedColor}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2"></div>
          <div className="col-sm-10">
            <div className="row g-2">
              {images.map((img, index) => (
                <div className="col-4 col-md-2 position-relative" key={index}>
                  <img
                    src={img.url}
                    alt="preview"
                    className="img-thumbnail"
                    style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 4 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(position, index)}
                    className="btn btn-danger btn-sm position-absolute"
                    style={{
                      top: 5, right: 5, borderRadius: "50%",
                      width: 24, height: 24, padding: 0, fontSize: 14
                    }}
                    title="Xóa ảnh"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ====== các input field giữ nguyên ======
  const inputNameProduct = () => (
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

  const inputPriceProduct = () => {
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
  };

  const inputGenderProduct = () => {
    const selectedCategory = categories.find((c) => c._id === form.theloai);
    const isHat = selectedCategory?.slug === "hats"; // 👈 check slug danh mục

    if (isHat) {
      // Nếu là mũ, set mặc định unisex và ẩn UI chọn giới tính
      if (form.gioitinh !== "unisex") {
        setForm((prev) => ({ ...prev, gioitinh: "unisex" }));
      }
      return (
        <div className="mb-3">
          <label className="form-label">Giới tính</label>
          <input type="text" className="form-control" value="Unisex" disabled />
        </div>
      );
    }

    // Nếu không phải mũ → hiển thị chọn giới tính như bình thường
    return (
      <div className="mb-3">
        <label className="form-label">Giới tính *</label>
        <select
          name="gioitinh"
          className="form-select"
          value={form.gioitinh}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="nam">Nam</option>
          <option value="nu">Nữ</option>
          <option value="be-trai">Bé trai</option>
          <option value="be-gai">Bé gái</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>
    );
  };


  const inputCategoryProduct = () => (
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

  const inputDescriptionProduct = () => (
    <div className="mb-3">
      <label className="form-label">Mô tả</label>
      <Tinymce
        value={form.mota}
        placeholder="Nhập mô tả sản phẩm"
        onChange={(val) => setForm((f) => ({ ...f, mota: val }))}
      />
    </div>
  );

  const inputSizeProduct = () => {
    const toggleSize = (size) => {
      setSelectedSizes((prev) => {
        const exists = prev.includes(size);
        return exists ? prev.filter((s) => s !== size) : [...prev, size];
      });
    };


    return (
      <div className="mb-3">
        <label className="form-label fw-bold">Chọn Size:</label>
        <div className="d-flex flex-wrap gap-2 border p-3 rounded">
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.includes(size.size);
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
    );
  };

  const getColorProduct = () => {
    const toggleColor = (code) => {
      setSelectedColors((prev) =>
        prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      );
      if (selectedColor === code) {
        setSelectedColor("");
      }
    };

    const handleSelectColor = (code) => {
      if (!selectedColors.includes(code)) return;
      setSelectedColor(code === selectedColor ? "" : code);
    };

    return (
      <div className="mb-4">
        <label className="form-label fw-bold">Chọn Màu Sản Phẩm & Ảnh:</label>

        {/* Dòng 1: tên màu */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {colors.map(({ color, code }) => {
            const isSelected = selectedColors.includes(code);
            const isActive = selectedColor === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleColor(code)}
                className={`btn btn-sm ${isActive
                  ? "btn-primary"
                  : isSelected
                    ? "btn-outline-secondary"
                    : "btn-light"
                  }`}
                style={{
                  borderWidth: isActive ? 2 : 1,
                  fontWeight: isSelected ? "bold" : "normal",
                  borderColor: code,
                  minWidth: 100,
                }}
                title="Click để bật/tắt màu"
              >
                {color}
              </button>
            );
          })}
        </div>

        {/* Dòng 2: ô màu */}
        <div className="d-flex flex-wrap gap-2">
          {colors.map(({ code }) => {
            const isSelected = selectedColors.includes(code);
            const isActive = selectedColor === code;
            return (
              <div
                key={code}
                title={code}
                onClick={() => handleSelectColor(code)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: code,
                  cursor: isSelected ? "pointer" : "not-allowed",
                  opacity: isSelected ? 1 : 0.4,
                  border: isActive
                    ? "3px solid #0d6efd"
                    : isSelected
                      ? "2px solid #6c757d"
                      : "1px dashed #ccc",
                  boxShadow: isActive ? "0 0 0 2px #b6d4fe" : "none",
                }}
              />
            );
          })}
        </div>

        <div className="form-text mt-2">
          - Click vào tên màu để thêm/bỏ màu sản phẩm. <br />
          - Click vào ô màu bên dưới (nếu được bật) để chọn ảnh cần upload.
        </div>
      </div>
    );
  };

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
        {inputGenderProduct()}
        {inputDescriptionProduct()}
        {inputSizeProduct()}
        {getColorProduct()}

        {selectedColor ? (
          <>
            {getPositions().map((pos) => {
              const labelMap = {
                front: "Mặt Trước",
                back: "Mặt Sau",
                extra: "Phụ",
                right: "Bên Phải",
                left: "Bên Trái",
                bottom: "Mặt Dưới"
              };
              return renderImageUploadSection(pos, labelMap[pos] || pos);
            })}
          </>
        ) : (
          <div className="alert alert-info">Hãy chọn màu trước để thêm ảnh tương ứng.</div>
        )}

        {getMissingImagesByColor().length > 0 && (
          <div className="alert alert-danger mt-3">
            <strong>Các màu chưa đủ ảnh (bắt buộc):</strong>
            <ul className="mb-0">
              {getMissingImagesByColor().map((item, idx) => (
                <li key={idx}>
                  <strong>{item.colorName}</strong>: thiếu {item.missingPositions.join(", ")}
                </li>
              ))}
            </ul>
            <div className="mt-2 text-muted small">
              * Vị trí <strong>extra</strong> là tùy chọn, không bắt buộc.
            </div>
          </div>
        )}

        <hr />

        <button
          type="submit"
          className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 mb-4"
          disabled={!isFormValid()}
        >
          <i className="bi bi-plus-circle-fill"></i>
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;
