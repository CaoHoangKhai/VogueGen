import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductById,
  // updateProduct,
  getImagesByColor
} from "../../../api/Product/product.api";
import { getAllSizes } from "../../../api/Size/size.api";
import { getAllCategories } from "../../../api/Category/category.api";
import Tinymce from "../../../Components/Tinymce";
import Toast from "../../../Components/Toast";
import { colors } from "../../../config/colors";

const AdminProductDetail = () => {
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  // ✅ State sản phẩm
  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: "",
    giasanphamRaw: "",
    theloai: "",
    mota: "",
    gioitinh: "",
  });

  // ✅ State hỗ trợ
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [imagesByColor, setImagesByColor] = useState({});
  const [deletedImageIds, setDeletedImageIds] = useState([]); // lưu ảnh cũ bị xóa

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ✅ Map danh mục → danh sách vị trí ảnh
  const imagePositionsByCategory = {
    "t-shirts": ["front", "back", "extra"],
    "longsleeves": ["front", "back", "extra"],
    "tank-tops": ["front", "back", "extra"],
    "polo-shirts": ["front", "back", "extra"],
    "hoodie": ["front", "back", "extra"],
    "hats": ["front", "right", "left", "back", "bottom"]
  };

  // ====================== LOAD DANH MỤC & SIZE ======================
  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
    getAllSizes().then(setAvailableSizes).catch(console.error);
  }, []);

  // ====================== LOAD PRODUCT DETAIL ======================
  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then((product) => {
        if (!product) return;
        // Đổ dữ liệu vào state
        setForm({
          tensanpham: product.tensanpham || "",
          giasanpham: product.giasanpham || "",
          giasanphamRaw: new Intl.NumberFormat("vi-VN").format(product.giasanpham || 0),
          theloai: product.theloai || "",
          mota: product.mota || "",
          gioitinh: product.gioitinh || "",
        });
        setSelectedSizes(product.kichthuoc || []);
        setSelectedColors(product.mausanpham || []);
        if (product.mausanpham && product.mausanpham.length > 0) {
          setSelectedColor(product.mausanpham[0]);
        }

        // Load ảnh theo màu
        if (product.mausanpham?.length) {
          const imgMap = {};
          Promise.all(
            product.mausanpham.map((code) =>
              getImagesByColor(product._id, code).then((imgs) => {
                imgMap[code] = {};
                imgs.forEach((img) => {
                  if (!imgMap[code][img.vitri]) {
                    imgMap[code][img.vitri] = [];
                  }
                  imgMap[code][img.vitri].push({
                    ...img,
                    isOld: true, // đánh dấu ảnh cũ
                  });
                });
              })
            )
          ).then(() => setImagesByColor(imgMap));
        }
      })
      .catch((err) => console.error("❌ Lỗi load sản phẩm:", err));
  }, [id]);

  // ====================== FUNCTION ======================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getPositions = () => {
    const slug = categories.find((c) => c._id === form.theloai)?.slug;
    return imagePositionsByCategory[slug] || [];
  };

  const handleImageChangeByPosition = (e, position) => {
    const files = Array.from(e.target.files);
    if (!selectedColor || files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImagesByColor((prev) => {
      const currentColorImages = prev[selectedColor] || {};
      return {
        ...prev,
        [selectedColor]: {
          ...currentColorImages,
          [position]: position === "extra"
            ? [...(currentColorImages[position] || []), ...newImages]
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

      const imgToRemove = colorImages[position][index];
      if (imgToRemove?.isOld && imgToRemove._id) {
        setDeletedImageIds((prevDel) => [...prevDel, imgToRemove._id]);
      }

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

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      const exists = prev.includes(size);
      return exists ? prev.filter((s) => s !== size) : [...prev, size];
    });
  };

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

  // ====================== SUBMIT UPDATE ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("tensanpham", form.tensanpham);
    formData.append("giasanpham", form.giasanpham);
    formData.append("theloai", form.theloai);
    formData.append("mota", form.mota);
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("colors", JSON.stringify(selectedColors));
    formData.append("gioitinh", form.gioitinh);
    formData.append("deletedImages", JSON.stringify(deletedImageIds));

    let index = 0;
    const positions = getPositions();

    for (const colorCode of selectedColors) {
      const colorImages = imagesByColor[colorCode] || {};
      for (const position of positions) {
        const imgs = colorImages[position] || [];
        for (const img of imgs) {
          if (!img.isOld) {
            // chỉ append ảnh mới
            formData.append(`images[${index}]`, img.file);
            formData.append(`positions[${index}]`, position);
            formData.append(`colors[${index}]`, colorCode);
            index++;
          }
        }
      }
    }

    try {
      // await updateProduct(id, formData);
      setToast({ show: true, message: "✅ Cập nhật sản phẩm thành công!", type: "success" });
    } catch (err) {
      console.error("❌ Lỗi update sản phẩm:", err);
      setToast({ show: true, message: "❌ Lỗi cập nhật sản phẩm", type: "error" });
    }
  };

  // ====================== UI RENDER IMAGE SECTION ======================
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
              key={selectedColor + "-" + position}
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
                    src={img.isOld ? img.url : img.url}
                    alt="preview"
                    className="img-thumbnail"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(position, index)}
                    className="btn btn-danger btn-sm position-absolute"
                    style={{
                      top: 5,
                      right: 5,
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      padding: 0,
                      fontSize: 14,
                    }}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ====================== RENDER ======================
  return (
    <div className="container">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h3 className="text-center">✏️ Chỉnh Sửa Sản Phẩm</h3>

      <form onSubmit={handleSubmit}>
        {/* Input tên */}
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

        {/* Giá */}
        <div className="mb-3">
          <label className="form-label">Giá sản phẩm *</label>
          <input
            type="text"
            name="giasanphamRaw"
            className="form-control"
            value={form.giasanphamRaw}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setForm((prev) => ({
                ...prev,
                giasanpham: raw,
                giasanphamRaw: new Intl.NumberFormat("vi-VN").format(raw),
              }));
            }}
            placeholder="Nhập giá"
            required
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

        {/* Giới tính */}
        <div className="mb-3">
          <label className="form-label">Giới tính</label>
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
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* Mô tả */}
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          {form.mota !== "" ? (
            <Tinymce
              value={form.mota}
              placeholder="Nhập mô tả sản phẩm"
              onChange={(val) => setForm((f) => ({ ...f, mota: val }))}
            />
          ) : (
            <p className="text-muted">⏳ Đang tải mô tả...</p>
          )}
        </div>



        {/* Size */}
        <div className="mb-3">
          <label className="form-label fw-bold">Chọn Size:</label>
          <div className="d-flex flex-wrap gap-2 border p-3 rounded">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.includes(size.size);
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

        {/* Màu */}
        <div className="mb-4">
          <label className="form-label fw-bold">Chọn Màu & Ảnh:</label>
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
                  title="Bật/tắt màu"
                >
                  {color}
                </button>
              );
            })}
          </div>

          {/* ô màu */}
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
        </div>

        {/* Render ảnh */}
        {selectedColor ? (
          <>
            {getPositions().map((pos) => {
              const labelMap = {
                front: "Mặt Trước",
                back: "Mặt Sau",
                extra: "Phụ",
                right: "Bên Phải",
                left: "Bên Trái",
                bottom: "Mặt Dưới",
              };
              return renderImageUploadSection(pos, labelMap[pos] || pos);
            })}
          </>
        ) : (
          <div className="alert alert-info">
            🖌 Hãy chọn màu trước để hiển thị khung upload ảnh.
          </div>
        )}

        <hr />
        <button
          type="submit"
          className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 mb-4"
        >
          💾 Cập nhật sản phẩm
        </button>
      </form>
    </div>
  );
};

export default AdminProductDetail;
