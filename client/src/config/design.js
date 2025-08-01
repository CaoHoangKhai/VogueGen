const baseShirtFrame = {
  top: "20%",
  left: "31%",
  width: "38%",
  height: "50%",
  border: "2px dashed #00bcd4",
  zIndex: 10,
  overflow: "hidden"
};

const poloShirtFrame = {
  top: "25%",
  left: "32%",
  width: "36%",
  height: "50%",
  border: "2px dashed #00bcd4",
  zIndex: 10,
  overflow: "hidden"
};

const longSleevesFrame = {
  top: "20%",
  left: "32%",
  width: "36%",
  height: "50%",
  border: "2px dashed #00bcd4",
  zIndex: 10,
  overflow: "hidden"
};

const hoodieFrame = {
  top: "25%",
  left: "32%",
  width: "36%",
  height: "30%",
  border: "2px dashed #00bcd4",
  zIndex: 10,
  overflow: "hidden"
};

// 🎩 Hat có nhiều góc (front, right, left)
const hatFrames = {
  front: { top: "42%", left: "30%", width: "38%", height: "20%", border: "2px dashed #00bcd4" },
  right: { top: "40%", left: "42%", width: "28%", height: "20%", border: "2px dashed #00bcd4" },
  left: { top: "40%", left: "28%", width: "28%", height: "20%", border: "2px dashed #00bcd4" }
  // ❌ back, bottom không có khung thiết kế
};

// 🎨 Gom tất cả vào 1 object chính
const designFrames = {
  hats: hatFrames,
  tshirts: { front: baseShirtFrame, back: baseShirtFrame },
  tanktop: { front: baseShirtFrame, back: baseShirtFrame },
  poloshirt: { front: poloShirtFrame, back: poloShirtFrame },
  longsleeves: { front: longSleevesFrame, back: longSleevesFrame },
  hoodie: { front: hoodieFrame, back: hoodieFrame }
};

// ✅ Hàm tiện ích lấy frame đúng theo productType + vitri
export function getDesignFrame(productType, vitri) {
  if (!productType || !vitri) return null;

  // 🔄 Chuẩn hóa productType (từ URL: "t-shirts" -> "tshirt")
  const normalizedType = productType.replace(/-/g, "").toLowerCase();

  const framesForType = designFrames[normalizedType];
  if (!framesForType) return null;

  // Nếu productType như tshirt, tanktop → front/back giống nhau
  return framesForType[vitri] || null;
}

export default designFrames;
