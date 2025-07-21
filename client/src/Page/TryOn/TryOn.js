import React, { useState, useRef } from "react";
import { BASE_URL_TRY_ON } from "../../api/TryOn/tryon.api";

// Ảnh demo người & áo
const demoHumans = [
  { src: "http://localhost:4000/images/try_on/human/demo_human_0.jpg" },
  { src: "http://localhost:4000/images/try_on/human/demo_human_1.jpg" },
];

const demoClothes = [
  { src: "http://localhost:4000/images/try_on/cloth/demo_cloth_0.jpg" },
  { src: "http://localhost:4000/images/try_on/cloth/demo_cloth_1.jpg" },
];

// Kết quả demo tương ứng với tổ hợp human + cloth
const demoResults = {
  "demo_human_0.jpg|demo_cloth_0.jpg": "http://localhost:4000/images/try_on/result/0_0.jpg",
  "demo_human_0.jpg|demo_cloth_1.jpg": "http://localhost:4000/images/try_on/result/0_1.jpg",
  "demo_human_1.jpg|demo_cloth_0.jpg": "http://localhost:4000/images/try_on/result/1_0.jpg",
  "demo_human_1.jpg|demo_cloth_1.jpg": "http://localhost:4000/images/try_on/result/1_1.jpg",
  // ... thêm nếu có
};

const MAX_SCAN_TIME = 20000;
const MAX_SCAN_SECONDS = MAX_SCAN_TIME / 1000;

const IMAGE_SIZE = 360;

function TryOnForm() {
  const [humanFile, setHumanFile] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState(null);
  const [scanPercent, setScanPercent] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState(false);
  const [humanDemoName, setHumanDemoName] = useState("");
  const [clothDemoName, setClothDemoName] = useState("");

  const scanIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const startScan = () => {
    startTimeRef.current = Date.now();
    scanIntervalRef.current = setInterval(() => {
      const percent = Math.min(((Date.now() - startTimeRef.current) / MAX_SCAN_TIME) * 100, 100);
      setScanPercent(percent);
    }, 100);

    timeoutRef.current = setTimeout(() => {
      setWaitingMessage(true);
    }, MAX_SCAN_TIME);
  };

  const stopScan = () => {
    clearInterval(scanIntervalRef.current);
    clearTimeout(timeoutRef.current);
    setScanPercent(100);
    setWaitingMessage(false);
  };

  const fetchImageAsFile = async (url, name, isHuman = false) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], name, { type: blob.type });
    isHuman ? setHumanDemoName(name) : setClothDemoName(name);
    return file;
  };

  const handleTryOn = async () => {
    if (!humanFile || !clothFile) {
      setError("Vui lòng chọn cả ảnh người và ảnh áo.");
      return;
    }

    const demoKey = `${humanDemoName}|${clothDemoName}`;
    if (demoResults[demoKey]) {
      // Nếu là ảnh demo đã có sẵn kết quả → vẫn loading 20s
      setLoading(true);
      setError("");
      setElapsedTime(null);
      setResultImageUrl(null);
      setScanPercent(0);
      setWaitingMessage(false);
      startScan();

      setTimeout(() => {
        stopScan();
        setResultImageUrl(demoResults[demoKey]);
        setElapsedTime(MAX_SCAN_TIME);
        setLoading(false);
      }, MAX_SCAN_TIME);
      return;
    }

    // Không phải ảnh demo → gọi API
    setLoading(true);
    setError("");
    setElapsedTime(null);
    setResultImageUrl(null);
    setScanPercent(0);
    setWaitingMessage(false);
    startScan();

    const start = Date.now();
    try {
      const formData = new FormData();
      formData.append("human_img", humanFile);
      formData.append("cloth_img", clothFile);
      formData.append("description", "");

      const res = await fetch(BASE_URL_TRY_ON, {
        method: "POST",
        body: formData,
      });

      const end = Date.now();
      const duration = end - start;
      const delay = Math.max(0, MAX_SCAN_TIME - duration);
      setElapsedTime(duration);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Lỗi không xác định.");
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);

      setTimeout(() => {
        stopScan();
        setResultImageUrl(imageUrl);
        setLoading(false);
      }, delay);
    } catch (err) {
      stopScan();
      setError("Lỗi khi xử lý ảnh: " + err.message);
      setLoading(false);
    }
  };

  const renderUploadBox = (file, setFile, label, demos, type) => (
    <div className="text-center mb-4">
      <p className="fw-bold">{label}</p>
      <label
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          display: "inline-block",
          border: "2px dashed #bbb",
          borderRadius: 12,
          background: "#fefefe",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            if (type === "human") setHumanDemoName("");
            else setClothDemoName("");
          }}
          style={{ display: "none" }}
        />
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#f8f9fa",
            }}
          />
        ) : (
          <div
            className="d-flex flex-column align-items-center justify-content-center"
            style={{ height: "100%", fontSize: 30, color: "#aaa" }}
          >
            📤 <span style={{ fontSize: 14 }}>Tải lên</span>
          </div>
        )}
      </label>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
        {demos.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={`demo-${type}-${i}`}
            onClick={() =>
              fetchImageAsFile(img.src, `demo_${type}_${i}.jpg`, type === "human").then(setFile)
            }
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              borderRadius: 8,
              background: "#f7f7f7",
              border: "2px solid #ddd",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">🧥 Virtual Try-On Demo</h3>

      <div className="row text-center justify-content-center">
        <div className="col-md-4">{renderUploadBox(humanFile, setHumanFile, "🧍 Ảnh người", demoHumans, "human")}</div>
        <div className="col-md-4">{renderUploadBox(clothFile, setClothFile, "👕 Ảnh áo", demoClothes, "cloth")}</div>
        <div className="col-md-4">
          <p className="fw-bold mb-2">🖼️ Kết quả</p>
          <div
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              position: "relative",
              border: "2px dashed #ccc",
              borderRadius: 12,
              background: "#f7f7f7",
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            {loading && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${scanPercent}%`,
                    height: "100%",
                    background: "rgba(0, 123, 255, 0.1)",
                    transition: "width 0.1s linear",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 10,
                    zIndex: 2,
                    background: "rgba(255,255,255,0.85)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: "#333",
                  }}
                >
                  {(scanPercent * (MAX_SCAN_SECONDS / 100)).toFixed(1)}s / {MAX_SCAN_SECONDS.toFixed(1)}s
                </div>
              </>
            )}
            <div
              className="d-flex align-items-center justify-content-center h-100 w-100"
              style={{ position: "relative", zIndex: 2 }}
            >
              {loading ? (
                <div className="text-muted">
                  Đang xử lý...
                  {waitingMessage && (
                    <div className="mt-1 text-warning small">
                      Ảnh đang trong quá trình xử lý, vui lòng đợi...
                    </div>
                  )}
                </div>
              ) : resultImageUrl ? (
                <img
                  src={resultImageUrl}
                  alt="result"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 12,
                  }}
                />
              ) : (
                <div className="text-muted">{error || "Chưa có ảnh"}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-primary px-4 py-2" onClick={handleTryOn} disabled={loading}>
          {loading ? "Đang xử lý..." : "Tạo ảnh Try-On"}
        </button>
        {/* {elapsedTime !== null && (
          <p className="mt-2 text-muted">
            ⏱️ Xử lý mất <strong>{(elapsedTime / 1000).toFixed(1)} giây</strong>
          </p>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>} */}
      </div>
    </div>
  );
}

export default TryOnForm;
