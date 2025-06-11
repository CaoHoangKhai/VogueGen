import React, { useEffect } from "react";

const Toast = ({ show, message, type = "success", onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  // Custom màu cho error (đỏ), success (trắng), info (trắng)
  let bg = "#fff";
  let color = "#222";
  if (type === "error") {
    bg = "#ffebee";
    color = "#d32f2f";
  }

  return (
    <div
      className={`toast align-items-center border-0 position-fixed top-0 end-0 m-4 ${show ? "show" : ""}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        zIndex: 9999,
        minWidth: 250,
        background: bg,
        color: color,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        borderLeft: type === "error" ? "5px solid #d32f2f" : "5px solid #00bfae"
      }}
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close me-2 m-auto"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};

export default Toast;