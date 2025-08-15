import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProductById,
  updateProduct,
  getImagesByColor,
  deleteProduct
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

    const loadProduct = async () => {
      try {
        const product = await getProductById(id);
        if (!product) return;

        // Basic form fields
        setForm({
          tensanpham: product.tensanpham || "",
          giasanpham: product.giasanpham || "",
          giasanphamRaw: new Intl.NumberFormat("vi-VN").format(product.giasanpham || 0),
          theloai: product.theloai || "",
          mota: product.mota || "",
          gioitinh: product.gioitinh || "",
        });

        // ==== SIZES: lấy array string từ product.kichthuoc (object array) ====
        setSelectedSizes((product.kichthuoc || []).map((s) => s.size));

        // ==== COLORS: normalize sang mảng mã màu string (ví dụ "#BEBEBE") ====
        const colorCodes = (product.mausanpham || []).map((c) => (typeof c === "string" ? c : (c.mau || c)));
        setSelectedColors(colorCodes);
        setSelectedColor(colorCodes[0] || "");

        // ==== LOAD IMAGES THEO MÀU (dùng colorCodes) ====
        if (colorCodes.length > 0) {
          const imgMap = {};

          // gọi song song các request
          await Promise.all(
            colorCodes.map(async (colorCode) => {
              try {
                const imgs = await getImagesByColor(product._id, colorCode);
                imgMap[colorCode] = {};

                // normalize từng ảnh về .url
                (imgs || []).forEach((img) => {
                  const url =
                    img.url ||
                    img.path ||
                    img.src ||
                    img.imageUrl ||
                    img.link ||
                    (img.data && img.contentType ? `data:${img.contentType};base64,${img.data}` : null);

                  const vitri = img.vitri || img.position || "extra";

                  if (!imgMap[colorCode][vitri]) imgMap[colorCode][vitri] = [];
                  imgMap[colorCode][vitri].push({
                    ...img,
                    url, // chắc chắn có trường url (hoặc null)
                    isOld: true,
                  });
                });
              } catch (err) {
                console.error("[loadProduct] Lỗi load images for color", colorCode, err);
                imgMap[colorCode] = {}; // giữ key để UI không crash
              }
            })
          );

          setImagesByColor(imgMap);
        } else {
          setImagesByColor({});
        }
      } catch (err) {
        console.error("❌ Lỗi load sản phẩm:", err);
      }
    };

    loadProduct();
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
  // Thay thế toàn bộ hàm handleSubmit hiện tại bằng đoạn này
  const handleSubmit = async (e) => {
    e.preventDefault();

    // disable submit button khi đang gửi
    setToast({ show: false, message: "", type: "" });
    let isSending = true;
    try {
      // build FormData
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

      console.groupCollapsed("📝 [handleSubmit] Dữ liệu chuẩn bị gửi");
      console.log("📌 tensanpham:", form.tensanpham);
      console.log("💰 giasanpham:", form.giasanpham);
      console.log("📂 theloai:", form.theloai);
      console.log("📝 mota:", form.mota);
      console.log("📏 sizes:", selectedSizes);
      console.log("🎨 colors:", selectedColors);
      console.log("🚻 gioitinh:", form.gioitinh);
      console.log("🗑 deletedImages:", deletedImageIds);

      // Append files and metadata
      for (const colorCode of selectedColors) {
        const colorImages = imagesByColor[colorCode] || {};
        for (const position of positions) {
          const imgs = colorImages[position] || [];
          for (const img of imgs) {
            if (!img.isOld && img.file) {
              const thisIndex = index;

              // append file and its metadata using index
              formData.append(`images[${thisIndex}]`, img.file);
              formData.append(`positions[${thisIndex}]`, position);
              formData.append(`colors[${thisIndex}]`, colorCode);

              console.groupCollapsed(`📷 Ảnh mới #${thisIndex}`);
              console.log("name:", img.file.name);
              console.log("size:", img.file.size);
              console.log("type:", img.file.type);
              console.log("position:", position);
              console.log("colorCode:", colorCode);

              // optional: preview length (async)
              try {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target.result;
                  console.log("base64 length:", dataUrl.length);
                  console.groupEnd();
                };
                reader.onerror = (er) => {
                  console.warn("⚠️ FileReader error for image preview", er);
                  console.groupEnd();
                };
                reader.readAsDataURL(img.file);
              } catch (err) {
                console.warn("⚠️ Không thể đọc file để preview:", err);
                console.groupEnd();
              }

              index++;
            }
          }
        }
      }

      console.log(`📦 Tổng số ảnh mới gửi: ${index}`);
      console.groupEnd();

      // gọi API updateProduct - hàm bạn đã import
      console.log(`[handleSubmit] 🚀 Gọi API updateProduct với id=${id} ...`);
      setToast({ show: true, message: "Đang gửi dữ liệu...", type: "info" });

      const res = await updateProduct(id, formData);

      // xử lý response
      if (res && (res.success || res.message || res.id)) {
        console.log("[handleSubmit] ✅ updateProduct response:", res);
        setToast({ show: true, message: "✅ Cập nhật sản phẩm thành công!", type: "success" });
        try {
          const refreshed = await getProductById(id);
          if (refreshed) {
            setForm({
              tensanpham: refreshed.tensanpham || "",
              giasanpham: refreshed.giasanpham || "",
              giasanphamRaw: new Intl.NumberFormat("vi-VN").format(refreshed.giasanpham || 0),
              theloai: refreshed.theloai || "",
              mota: refreshed.mota || "",
              gioitinh: refreshed.gioitinh || "",
            });
            setSelectedSizes((refreshed.kichthuoc || []).map((s) => s.size));
            const colorCodes = (refreshed.mausanpham || []).map((c) => (typeof c === "string" ? c : (c.mau || c)));
            setSelectedColors(colorCodes);
            setSelectedColor(colorCodes[0] || "");
            // reload images if needed (you could reuse loadProduct logic)
          }
        } catch (errRefresh) {
          console.warn("⚠️ Không thể refresh product sau khi update:", errRefresh);
        }
      } else {
        console.error("[handleSubmit] ❌ updateProduct trả về lỗi:", res);
        setToast({ show: true, message: `❌ Lỗi khi cập nhật: ${res?.error || res?.message || "Không xác định"}`, type: "error" });
      }
    } catch (err) {
      console.error("❌ Lỗi update sản phẩm:", err);
      setToast({ show: true, message: `❌ Lỗi khi cập nhật sản phẩm: ${err?.message || err}`, type: "error" });
    } finally {
      isSending = false;
    }
  };

  // ====================== XÓA SẢN PHẨM ======================
  const handleDeleteProduct = async () => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!"
    );
    if (!confirmDelete) return;

    setToast({ show: true, message: "Đang xóa sản phẩm...", type: "info" });

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        setToast({ show: true, message: "✅ Đã xóa sản phẩm thành công!", type: "success" });
        // Chuyển hướng về danh sách sản phẩm sau khi xóa
        setTimeout(() => {
          window.location.href = "/admin/products"; // hoặc dùng navigate nếu react-router-dom v6
        }, 1200);
      } else {
        setToast({
          show: true,
          message: `❌ Xóa sản phẩm thất bại: ${res.error || res.message}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error("❌ Lỗi xóa sản phẩm:", err);
      setToast({ show: true, message: `❌ Lỗi xóa sản phẩm: ${err?.message || err}`, type: "error" });
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
            <option value="be-trai">Bé trai</option>
            <option value="be-gai">Bé gái</option>
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
                  className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-secondary"}`}
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
        <div className="row g-2 mb-4">
          <div className="col-7">
            <button
              type="submit"
              className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
            >
              💾 Cập nhật sản phẩm
            </button>
          </div>
          <div className="col-3">
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="btn btn-danger btn-lg w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
            >
              🗑 Xóa sản phẩm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductDetail;
