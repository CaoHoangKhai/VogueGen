// import React, { useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import { FaUpload } from "react-icons/fa";

// const TryOn = () => {
//   const [personImage, setPersonImage] = useState(null);
//   const [maskedPerson, setMaskedPerson] = useState(null);
//   const [shirtImage, setShirtImage] = useState(null);
//   const [tryOnResult, setTryOnResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const personInputRef = useRef();
//   const shirtInputRef = useRef();

//   // Handle chọn ảnh người và mask bằng BodyPix
//   const handlePersonUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const imgURL = URL.createObjectURL(file);
//     setPersonImage(imgURL);
//     setTryOnResult(null);

//     const img = new Image();
//     img.src = imgURL;
//     img.crossOrigin = "anonymous";
//     img.onload = async () => {
//       const maskedBase64 = await runBodyPix(img);
//       setMaskedPerson(maskedBase64);
//     };
//   };

//   // Handle chọn ảnh áo
//   const handleShirtUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setShirtImage(URL.createObjectURL(file));
//     setTryOnResult(null);
//   };

//   // Chạy BodyPix để mask áo
//   const runBodyPix = async (imgElement) => {
//     const net = await bodyPix.load();
//     const segmentation = await net.segmentPersonParts(imgElement, {
//       internalResolution: "medium",
//       segmentationThreshold: 0.7,
//     });

//     const torsoParts = ["torso-front", "torso-back"];
//     const mask = bodyPix.toMask(segmentation, (part) =>
//       torsoParts.includes(part.part)
//     );

//     const canvas = document.createElement("canvas");
//     canvas.width = imgElement.width;
//     canvas.height = imgElement.height;
//     bodyPix.drawMask(canvas, imgElement, mask, 0.7, 0, false);

//     return canvas.toDataURL("image/jpeg");
//   };

//   // Gửi ảnh mask + áo lên backend
//   const handleTryOn = async () => {
//     if (!maskedPerson || !shirtImage) return;

//     setLoading(true);

//     try {
//       const maskedBlob = await (await fetch(maskedPerson)).blob();
//       const clothBlob = await (await fetch(shirtImage)).blob();

//       const formData = new FormData();
//       formData.append("masked_person", maskedBlob, "masked.jpg");
//       formData.append("cloth", clothBlob, "cloth.jpg");

//       const response = await fetch("https://your-colab-url/predict", {
//         method: "POST",
//         body: formData,
//       });

//       const resultBlob = await response.blob();
//       const resultUrl = URL.createObjectURL(resultBlob);
//       setTryOnResult(resultUrl);
//     } catch (err) {
//       console.error("❌ Lỗi khi thử áo:", err);
//       alert("Có lỗi xảy ra khi gọi API.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-4">
//       <div className="row g-4">
//         {/* Cột 1 - Ảnh người */}
//         <div className="col-md-4">
//           <div className="p-3 border bg-light rounded text-center">
//             <h5>Ảnh người</h5>
//             <div
//               onClick={() => personInputRef.current.click()}
//               className="upload-box"
//             >
//               <FaUpload size={30} className="text-primary" />
//               <span className="mt-2 text-secondary">Chọn ảnh người</span>
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               ref={personInputRef}
//               onChange={handlePersonUpload}
//               style={{ display: "none" }}
//             />
//             {personImage && (
//               <div className="preview-box mt-3">
//                 <img src={personImage} alt="Người" />
//               </div>
//             )}
//             {maskedPerson && (
//               <div className="preview-box mt-2">
//                 <h6>Áo đã mask:</h6>
//                 <img src={maskedPerson} alt="Masked Person" />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Cột 2 - Ảnh áo */}
//         <div className="col-md-4">
//           <div className="p-3 border bg-light rounded text-center">
//             <h5>Ảnh áo</h5>
//             <div
//               onClick={() => shirtInputRef.current.click()}
//               className="upload-box"
//             >
//               <FaUpload size={30} className="text-success" />
//               <span className="mt-2 text-secondary">Chọn ảnh áo</span>
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               ref={shirtInputRef}
//               onChange={handleShirtUpload}
//               style={{ display: "none" }}
//             />
//             {shirtImage && (
//               <div className="preview-box mt-3">
//                 <img src={shirtImage} alt="Áo" />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Cột 3 - Kết quả */}
//         <div className="col-md-4">
//           <div className="p-3 border bg-light rounded text-center">
//             <h5>Kết quả thử áo</h5>
//             {maskedPerson && shirtImage ? (
//               <>
//                 <button
//                   className="btn btn-primary mb-3"
//                   onClick={handleTryOn}
//                   disabled={loading}
//                 >
//                   {loading ? "Đang xử lý..." : "🧪 Thử áo"}
//                 </button>
//                 {tryOnResult && (
//                   <div className="preview-box mt-2">
//                     <img src={tryOnResult} alt="Kết quả" />
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p className="text-muted">Vui lòng chọn đủ ảnh người và áo.</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* CSS */}
//       <style>{`
//         .upload-box {
//           cursor: pointer;
//           padding: 20px;
//           border: 2px dashed #ccc;
//           border-radius: 8px;
//           background: #fff;
//         }
//         .preview-box {
//           width: 200px;
//           height: 300px;
//           overflow: hidden;
//           margin: 0 auto;
//           border: 1px solid #ccc;
//           background: #f8f9fa;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .preview-box img {
//           max-width: 100%;
//           max-height: 100%;
//           object-fit: contain;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TryOn;
const TryOn = ()=> {
  return (
    <div className="container">
      <h1 className="text-center my-5">Trang thử đồ</h1>
      <p className="text-center">Chức năng này đang được phát triển.</p>
      <p className="text-center">Vui lòng quay lại sau.</p>
    </div>
  );
};

export default TryOn;