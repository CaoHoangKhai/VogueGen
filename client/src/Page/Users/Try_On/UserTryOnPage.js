import React, { useEffect, useState } from "react";
import { getTryOnImagesByUser, deleteTryOnImage } from "../../../api/TryOn/tryon.api";
import Toast from "../../../Components/Toast";

const UserTryOnPage = () => {
  const [tryOnImages, setTryOnImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Lấy manguoidung từ localStorage
  const userData = localStorage.getItem("user");
  const manguoidung = userData ? JSON.parse(userData)._id : "";

  useEffect(() => {
    if (!manguoidung) {
      console.warn("No user ID found in localStorage");
      setLoading(false);
      return;
    }

    const fetchTryOnImages = async () => {
      try {
        const images = await getTryOnImagesByUser(manguoidung);
        setTryOnImages(images);
      } catch (error) {
        console.error("Error fetching try-on images:", error);
        setToast({ show: true, message: "Lỗi khi tải ảnh try-on", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchTryOnImages();
  }, [manguoidung]);

  const handleDelete = async (id) => {
    // Dùng confirm của browser vẫn tốt, hoặc bạn có thể làm Toast confirm riêng nếu cần
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này không?")) return;

    try {
      await deleteTryOnImage(id);
      setTryOnImages((prev) => prev.filter((img) => img._id !== id));
      setToast({ show: true, message: "Xóa ảnh thành công", type: "success" });
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      setToast({ show: true, message: "Xóa ảnh thất bại. Vui lòng thử lại.", type: "error" });
    }
  };

  const handleDownload = (base64Data, id) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `tryon_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        className="try-on-gallery"
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        {tryOnImages.map((image) => (
          <div
            key={image._id}
            style={{
              position: "relative",
              width: 150,
              border: "1px solid #ccc",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <img
              src={image.data.image_base64}
              alt={`TryOn ${image._id}`}
              style={{ width: "100%", display: "block" }}
            />

            {/* Nút Xóa */}
            <button
              onClick={() => handleDelete(image._id)}
              style={{
                position: "absolute",
                top: 5,
                left: 5,
                backgroundColor: "rgba(244, 67, 54, 0.8)",
                border: "none",
                color: "white",
                padding: "3px 6px",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: 12,
              }}
              title="Xóa ảnh"
            >
              Xóa
            </button>

            {/* Nút Tải xuống */}
            <button
              onClick={() => handleDownload(image.data.image_base64, image._id)}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "rgba(76, 175, 80, 0.8)",
                border: "none",
                color: "white",
                padding: "3px 6px",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: 12,
              }}
              title="Tải ảnh"
            >
              Tải xuống
            </button>
          </div>
        ))}
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default UserTryOnPage;
