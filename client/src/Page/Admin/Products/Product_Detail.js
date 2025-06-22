import React, { useEffect, useState } from "react";
import { getAllSizes, getAllCategories, getProductById, updateProduct } from "../../../api/Admin/products.api";
import { useParams, useNavigate } from "react-router-dom";
import Tinymce from "../../../Components/Tinymce";
import { colors } from "../../../config/colors";
import Toast from "../../../Components/Toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [images, setImages] = useState([]); // Ảnh mới [{file, url}]
  const [productImages, setProductImages] = useState([]); // Ảnh cũ [{_id, url, ...}]
  const [deletedImageIds, setDeletedImageIds] = useState([]); // _id ảnh cũ đã chọn xóa
  const [lockedSizes, setLockedSizes] = useState([]);
  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: 0,
    giasanphamRaw: "",
    theloai: "",
    mota: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Lấy danh sách size và danh mục
  useEffect(() => {
    getAllCategories()
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Lấy danh mục lỗi:", err));
    getAllSizes()
      .then((data) => {
        if (Array.isArray(data)) setAvailableSizes(data);
      })
      .catch((err) => console.error("Lấy size lỗi:", err));
  }, []);

  // Lấy sản phẩm theo id
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = await getProductById(id);
        if (product && product._id) {
          setForm({
            tensanpham: product.tensanpham || "",
            giasanphamRaw: product.giasanpham
              ? new Intl.NumberFormat("vi-VN").format(product.giasanpham)
              : "",
            giasanpham: product.giasanpham || 0,
            theloai: product.theloai || "",
            mota: product.mota || "",
          });
          if (Array.isArray(product.kichthuoc)) {
            setSelectedSizes(product.kichthuoc.map((item) => ({
              size: item.size,
            })));
            setLockedSizes(product.kichthuoc.map((item) => item.size));
          } else {
            setSelectedSizes([]);
            setLockedSizes([]);
          }
          if (Array.isArray(product.mausanpham)) {
            setSelectedColors(product.mausanpham);
          } else {
            setSelectedColors([]);
          }
          if (Array.isArray(product.hinhanh)) {
            setProductImages(product.hinhanh);
          } else {
            setProductImages([]);
          }
          setError(null);
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        setError("Lỗi khi lấy sản phẩm: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  function inputPriceProduct() {
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
      setSelectedSizes((prev) =>
        prev.map((s) =>
          s.size === size
            ? { ...s, soluong: value === "" ? "" : parseInt(value, 10) }
            : s
        )
      );
    };
    const handleQuantityBlur = (size) => {
      setSelectedSizes((prev) =>
        prev.map((s) => {
          if (s.size === size) {
            const num = parseInt(s.soluong, 10);
            if (isNaN(num) || num < 1) return { ...s, soluong: 1 };
            return { ...s, soluong: num };
          }
          return s;
        })
      );
    };
    const toggleSize = (size) => {
      if (lockedSizes.includes(size)) return;
      setSelectedSizes((prev) => {
        const exists = prev.find((s) => s.size === size);
        if (exists) {
          return prev.filter((s) => s.size !== size);
        } else {
          return [...prev, { size, soluong: 1 }];
        }
      });
    };
    return (
      <div className="mb-3">
        <label className="form-label fw-bold">Chọn Size:</label>
        <div className="d-flex flex-wrap gap-2 border p-3 rounded">
          {availableSizes.map((size) => {
            const isSelected = selectedSizes.some((s) => s.size === size.size);
            return (
              <button
                key={size._id}
                type="button"
                className={`btn btn-sm ${lockedSizes.includes(size.size)
                  ? "btn-secondary disabled"
                  : isSelected
                    ? "btn-primary"
                    : "btn-outline-secondary"
                  }`}
                onClick={() => toggleSize(size.size)}
              >
                {size.size}
              </button>
            );
          })}
        </div>
        {/* {selectedSizes.length > 0 && (
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
        )} */}
      </div>
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
            const isSelected = selectedColors.includes(code);
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

  // Xử lý ảnh sản phẩm (cũ, mới, xóa)
  function getImgProduct() {
    // Thêm ảnh mới
    const handleImageChange = (e) => {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    };

    // Xóa ảnh mới
    const removeNewImage = (index) => {
      setImages((prev) => {
        URL.revokeObjectURL(prev[index].url);
        return prev.filter((_, i) => i !== index);
      });
    };

    // Xóa ảnh cũ: lưu _id vào deletedImageIds, ẩn khỏi giao diện
    const removeOldImage = (index) => {
      setProductImages((prev) => {
        const img = prev[index];
        if (img && img._id) {
          setDeletedImageIds((ids) => [...ids, img._id]);
        }
        return prev.filter((_, i) => i !== index);
      });
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
          <span className="text-secondary fs-6">Kéo & thả hoặc bấm để chọn ảnh</span>
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
        {/* Ảnh cũ */}
        {productImages.length > 0 && (
          <div>
            <label className="form-label fw-semibold mb-2">Ảnh sản phẩm hiện có:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {productImages.map((img, index) => (
                <div key={img._id || index} style={{ position: "relative" }}>
                  <img
                    src={img.url || img}
                    alt={`Ảnh sản phẩm ${index + 1}`}
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeOldImage(index)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                    }}
                    title="Xóa ảnh"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Ảnh mới */}
        {images.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label className="form-label fw-semibold mb-2">Ảnh sản phẩm mới thêm:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {images.map((img, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={img.url}
                    alt={`Ảnh mới ${index + 1}`}
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
                    }}
                    title="Xóa ảnh"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Ảnh đã chọn xóa */}
        {/* {deletedImageIds.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label className="form-label fw-semibold mb-2 text-danger">Ảnh sẽ xóa khi lưu:</label>
            <div>
              {deletedImageIds.map((id, idx) => (
                <span key={id} className="badge bg-danger me-2">
                  ID: {id}
                </span>
              ))}
            </div>
          </div>
        )} */}
        {/* Input thêm ảnh mới */}
        {/* <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="d-none"
        />
        <label htmlFor="fileInput" className="btn btn-outline-primary mt-3">
          Thêm ảnh mới
        </label> */}
      </div>
    );
  }

  // Chuẩn hóa dữ liệu trước khi gửi (preview)
  function getNormalizedProductData() {
    const newImages = images.map(img => img.file?.name || "");
    // Đảm bảo mỗi ảnh cũ còn lại đều có tenfile
    const oldImages = productImages.map(img => ({
      _id: img._id,
      url: img.url,
      tenfile: img.tenfile,
    }));
    return {
      tensanpham: form.tensanpham,
      giasanpham: Number(form.giasanpham),
      theloai: form.theloai,
      mota: form.mota,
      kichthuoc: selectedSizes.map(s => ({ size: s.size })),
      mausanpham: selectedColors,
      hinhanh: {
        old: oldImages,
        new: newImages,
        delete: deletedImageIds,
      },
    };
  }

  // Hiển thị JSON preview
  function renderPreviewJson() {
    const previewData = getNormalizedProductData();
    return (
      <div className="mb-4">
        <label className="form-label fw-bold">Xem trước dữ liệu JSON sẽ gửi lên:</label>
        <pre
          style={{
            background: "#f6f8fa",
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 16,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {JSON.stringify(previewData, null, 2)}
        </pre>
      </div>
    );
  }

  // Submit cập nhật sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const price = parseInt(form.giasanpham, 10);
      if (isNaN(price) || price <= 0) {
        setError("Giá sản phẩm không hợp lệ");
        showToast("Giá sản phẩm không hợp lệ", "danger");
        setLoading(false);
        return;
      }
      const kichthuoc = selectedSizes.map(({ size }) => ({ size }));


      const mausanpham = selectedColors;

      const formData = new FormData();
      formData.append("tensanpham", form.tensanpham);
      formData.append("giasanpham", price);
      formData.append("theloai", form.theloai);
      formData.append("mota", form.mota);
      formData.append("kichthuoc", JSON.stringify(kichthuoc));
      formData.append("mausanpham", JSON.stringify(mausanpham));
      formData.append("hinhanhCu", JSON.stringify(
        productImages.map(img => ({
          _id: img._id,
          url: img.url,
          tenfile: img.tenfile,
        }))
      ));
      formData.append("hinhanhXoa", JSON.stringify(deletedImageIds)); // Ảnh cũ bị xóa

      images.forEach(({ file }) => {
        formData.append("hinhanhMoi", file);
      });

      const response = await updateProduct(id, formData);
      if (response.success) {
        showToast("Cập nhật sản phẩm thành công", "success");
      } else {
        setError(response.message || "Cập nhật thất bại");
        showToast(response.message || "Cập nhật thất bại", "danger");
      }
    } catch (err) {
      setError("Lỗi khi cập nhật: " + err.message);
      showToast("Lỗi khi cập nhật: " + err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      <h3 className="text-center">Chi tiết sản phẩm</h3>
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          {renderPreviewJson()}
          {inputNameProduct()}
          {inputPriceProduct()}
          {inputCategoryProduct()}
          {inputDescriptionProduct()}
          {inputSizeProduct()}
          {getColorProduct()}
          {getImgProduct()}
          <button type="submit" className="btn btn-primary">
            Lưu
          </button>
        </form>
      )}
    </div>
  );
};

export default ProductDetail;