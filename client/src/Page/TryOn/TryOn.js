import React, { useState } from "react";
import { BASE_URL_TRY_ON } from "../../api/TryOn/tryon.api";

function TryOnForm() {
  const [humanFile, setHumanFile] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState(null);

  const handleTryOn = async () => {
    if (!humanFile || !clothFile) {
      setError("Vui lòng chọn cả ảnh người và ảnh áo.");
      return;
    }

    setLoading(true);
    setError("");
    setResultImageUrl(null);
    setElapsedTime(null);

    const start = Date.now();

    try {
      const formData = new FormData();
      formData.append("human_img", humanFile);
      formData.append("cloth_img", clothFile);
      formData.append("description", "");

      const response = await fetch(BASE_URL_TRY_ON, {
        method: "POST",
        body: formData,
      });

      const end = Date.now();
      setElapsedTime(end - start); // Cập nhật luôn thời gian

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Server lỗi.");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setResultImageUrl(imageUrl); // ✅ HIỆN ẢNH NGAY
    } catch (err) {
      setError("Lỗi khi tạo ảnh: " + err.message);
    } finally {
      setLoading(false); // Tắt loading sau cùng
    }
  };

  const IMAGE_SIZE = 360;

  const renderUploadBox = (file, setFile, label) => (
    <div className="text-center mb-4">
      <p className="fw-bold">{label}</p>
      <label
        style={{
          display: "inline-block",
          width: `${IMAGE_SIZE}px`,
          height: `${IMAGE_SIZE}px`,
          border: "2px dashed #bbb",
          borderRadius: "12px",
          background: "#fdfdfd",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#f0f0f0",
            }}
          />
        ) : (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              height: "100%",
              fontSize: 32,
              color: "#999",
            }}
          >
            <div>📤</div>
            <div style={{ fontSize: 14 }}>Tải lên</div>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">🧥 Virtual Try-On Demo</h3>

      <div className="row text-center justify-content-center">
        <div className="col-md-4">{renderUploadBox(humanFile, setHumanFile, "🧍 Ảnh người")}</div>
        <div className="col-md-4">{renderUploadBox(clothFile, setClothFile, "👕 Ảnh áo")}</div>
        <div className="col-md-4">
          <p className="fw-bold mb-2">🖼️ Kết quả</p>
          <div
            className={`d-flex align-items-center justify-content-center ${loading ? "loading-border" : ""}`}
            style={{
              width: `${IMAGE_SIZE}px`,
              height: `${IMAGE_SIZE}px`,
              border: "2px dashed #ccc",
              borderRadius: 12,
              background: "#f7f7f7",
              margin: "0 auto",
              padding: 10,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div className="text-muted">Đang xử lý...</div>
            ) : resultImageUrl ? (
              <img
                src={resultImageUrl}
                alt="Try-On Result"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 12,
                }}
              />
            ) : (
              <div className="text-muted">{error ? error : "Chưa có ảnh"}</div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary px-4 py-2"
          onClick={handleTryOn}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Tạo ảnh Try-On"}
        </button>
        {elapsedTime !== null && (
          <p className="mt-2 text-muted">
            ⏱️ Thời gian xử lý: <strong>{(elapsedTime / 1000).toFixed(1)} giây</strong>
          </p>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>

      <style>
        {`
          .loading-border::after {
            content: "";
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(0,0,0,0.05), rgba(255,255,255,0.1));
            animation: loadingScan 1.2s infinite linear;
            z-index: 2;
          }

          @keyframes loadingScan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
}

export default TryOnForm;
