import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../../api/Product/product.api";
import { getAllSizes } from "../../../api/Size/size.api";
import { getAllCategories } from "../../../api/Category/category.api";
import Tinymce from "../../../Components/Tinymce";
import Toast from "../../../Components/Toast";
import { colors } from "../../../config/colors";

const ProductDetail = () => {
  const { id } = useParams();

  const [form, setForm] = useState({
    tensanpham: "",
    giasanpham: 0,
    giasanphamRaw: "",
    theloai: "",
    mota: "",
  });

  const [categories, setCategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [lockedSizes, setLockedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [images, setImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
    getAllSizes().then(setAvailableSizes).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then((product) => {
        if (!product || !product._id) return setError("Không tìm thấy sản phẩm");
        setForm({
          tensanpham: product.tensanpham,
          giasanpham: product.giasanpham,
          giasanphamRaw: new Intl.NumberFormat("vi-VN").format(product.giasanpham),
          theloai: product.theloai,
          mota: product.mota,
        });
        setSelectedSizes(product.kichthuoc || []);
        setLockedSizes((product.kichthuoc || []).map((s) => s.size));
        setSelectedColors(product.mausanpham || []);
        setProductImages(product.hinhanh || []);
        setError(null);
      })
      .catch((err) => setError("Lỗi khi lấy sản phẩm: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSize = (size) => {
    if (lockedSizes.includes(size)) return;
    setSelectedSizes((prev) =>
      prev.some((s) => s.size === size)
        ? prev.filter((s) => s.size !== size)
        : [...prev, { size, soluong: 1 }]
    );
  };

  const toggleColor = (code) => {
    setSelectedColors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeOldImage = (index) => {
    setProductImages((prev) => {
      const img = prev[index];
      if (img && img._id) setDeletedImageIds((ids) => [...ids, img._id]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getNormalizedProductData = () => ({
    tensanpham: form.tensanpham,
    giasanpham: Number(form.giasanpham),
    theloai: form.theloai,
    mota: form.mota,
    kichthuoc: selectedSizes,
    mausanpham: selectedColors,
    hinhanh: {
      old: productImages,
      new: images.map((img) => img.file?.name || ""),
      delete: deletedImageIds,
    },
  });

  return (
    <div className="container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <h3 className="text-center">Chi tiết sản phẩm</h3>
      {loading ? <p>Đang tải...</p> : error ? <div className="alert alert-danger">{error}</div> : (
        <form>
          {/* <pre className="bg-light p-3 rounded">
            {JSON.stringify(getNormalizedProductData(), null, 2)}
          </pre> */}

          {/* Tên sản phẩm */}
          <div className="mb-3">
            <label className="form-label">Tên sản phẩm</label>
            <input type="text" name="tensanpham" className="form-control" value={form.tensanpham} onChange={handleChange} />
          </div>

          {/* Giá */}
          <div className="mb-3">
            <label className="form-label">Giá sản phẩm</label>
            <input
              type="text"
              name="giasanphamRaw"
              className="form-control"
              value={form.giasanphamRaw}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setForm({
                  ...form,
                  giasanpham: raw,
                  giasanphamRaw: new Intl.NumberFormat("vi-VN").format(raw),
                });
              }}
            />
          </div>

          {/* Danh mục */}
          <div className="mb-3">
            <label className="form-label">Danh mục</label>
            <select name="theloai" className="form-select" value={form.theloai} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.tendanhmuc}</option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <Tinymce value={form.mota} onChange={(val) => setForm((f) => ({ ...f, mota: val }))} />
          </div>

          {/* Size */}
          <div className="mb-3">
            <label className="form-label">Size</label>
            <div className="d-flex flex-wrap gap-2">
              {availableSizes.map((s) => {
                const isSelected = selectedSizes.some((ss) => ss.size === s.size);
                const isLocked = lockedSizes.includes(s.size);
                return (
                  <button key={s._id} type="button" className={`btn btn-sm ${isLocked ? "btn-secondary" : isSelected ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => toggleSize(s.size)} disabled={isLocked}>
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Màu sắc */}
          <div className="mb-3">
            <label className="form-label">Màu sắc</label>
            <div className="d-flex gap-2 flex-wrap">
              {colors.map(({ code, color }) => {
                const isSelected = selectedColors.includes(code);
                return (
                  <div key={code} title={color} onClick={() => toggleColor(code)} style={{
                    width: 32,
                    height: 32,
                    backgroundColor: code,
                    borderRadius: 4,
                    border: isSelected ? "3px solid #0d6efd" : "1px solid #ccc",
                    cursor: "pointer",
                  }} />
                );
              })}
            </div>
          </div>

          {/* Ảnh */}
          <div className="mb-3">
            <label className="form-label">Ảnh</label>
            <input type="file" multiple onChange={handleImageChange} className="form-control" />
            <div className="mt-3 d-flex flex-wrap gap-2">
              {productImages.map((img, idx) => (
                <div key={img._id || idx} style={{ position: "relative" }}>
                  <img src={img.url} alt="img" style={{ width: 120, height: 120, objectFit: "cover" }} />
                  <button type="button" onClick={() => removeOldImage(idx)} style={{ position: "absolute", top: 5, right: 5 }}>&times;</button>
                </div>
              ))}
              {images.map((img, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img src={img.url} alt="img" style={{ width: 120, height: 120, objectFit: "cover" }} />
                  <button type="button" onClick={() => removeNewImage(idx)} style={{ position: "absolute", top: 5, right: 5 }}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">Cập nhật sản phẩm</button>
        </form>
      )}
    </div>
  );
};

export default ProductDetail;
