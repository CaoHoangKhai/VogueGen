import React, { useRef, useState } from "react";
import { FaUpload } from "react-icons/fa";

const TryOn = () => {
  const [personImage, setPersonImage] = useState(null);
  const [shirtImage, setShirtImage] = useState(null);

  const personInputRef = useRef();
  const shirtInputRef = useRef();

  const handlePersonUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPersonImage(URL.createObjectURL(file));
  };

  const handleShirtUpload = (e) => {
    const file = e.target.files[0];
    if (file) setShirtImage(URL.createObjectURL(file));
  };

  return (
    <div className="container py-4">
      <div className="row g-2">
        {/* Cột 1 - Ảnh người */}
        <div className="col-sm">
          <div className="p-3 border bg-light text-center rounded">
            <h5 className="mb-3">Ảnh người</h5>

            <div
              onClick={() => personInputRef.current.click()}
              className="d-inline-block p-3 border rounded bg-white shadow-sm"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUpload size={30} className="text-primary" />
              <span className="mt-2 text-secondary">Chọn ảnh người</span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handlePersonUpload}
              ref={personInputRef}
              style={{ display: "none" }}
            />

            {personImage && (
              <div
                className="mt-3 mx-auto border rounded"
                style={{
                  width: "200px",
                  height: "300px",
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={personImage}
                  alt="Ảnh người"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Cột 2 - Ảnh áo */}
        <div className="col-sm">
          <div className="p-3 border bg-light text-center rounded">
            <h5 className="mb-3">Ảnh áo thiết kế</h5>

            <div
              onClick={() => shirtInputRef.current.click()}
              className="d-inline-block p-3 border rounded bg-white shadow-sm"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUpload size={30} className="text-success" />
              <span className="mt-2 text-secondary">Chọn ảnh áo</span>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleShirtUpload}
              ref={shirtInputRef}
              style={{ display: "none" }}
            />

            {shirtImage && (
              <div
                className="mt-3 mx-auto border rounded"
                style={{
                  width: "200px",
                  height: "300px",
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={shirtImage}
                  alt="Ảnh áo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Cột 3 - Kết quả mặc thử */}
        <div className="col-sm">
          <div className="p-3 border bg-light text-center rounded">
            <h5 className="mb-3">Kết quả thử áo</h5>

            {personImage && shirtImage ? (
              <div
                className="position-relative mx-auto border rounded"
                style={{
                  width: "200px",
                  height: "300px",
                  overflow: "hidden",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <img
                  src={personImage}
                  alt="Người"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <img
                  src={shirtImage}
                  alt="Áo"
                  className="position-absolute top-0 start-0"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: 0.75,
                    pointerEvents: "none",
                  }}
                />
              </div>
            ) : (
              <p className="text-muted">Vui lòng chọn cả ảnh người và áo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
