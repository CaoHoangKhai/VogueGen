import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetailById, updateOrderStatus } from "../../../api/Order/order.api";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { colors } from "../../../config/colors";
import html2pdf from "html2pdf.js";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(); // ref cho vùng in

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await getOrderDetailById(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
        setStatusUpdate(res.data.trangthai);
      } else {
        setError("Không tìm thấy đơn hàng.");
      }
    } catch (err) {
      setError("Lỗi khi tải đơn hàng.");
      console.error("❌ Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getColorName = (code) => {
    const found = colors.find((c) => c.code.toLowerCase() === code?.toLowerCase());
    return found ? found.color : code || "Không rõ";
  };

  const handleStatusChange = (e) => {
    setStatusUpdate(Number(e.target.value));
  };

  const handleUpdateStatus = async () => {
    if (!window.confirm("Bạn có chắc muốn cập nhật trạng thái đơn hàng?")) return;
    if (statusUpdate === null || statusUpdate === undefined) {
      alert("⚠️ Bạn chưa chọn trạng thái mới.");
      return;
    }

    setUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, statusUpdate);
      if (res.success) {
        alert("✅ Cập nhật trạng thái thành công");
        fetchOrder();
      } else {
        alert(res.message || "❌ Không thể cập nhật trạng thái");
      }
    } catch (err) {
      alert("❌ Lỗi khi cập nhật trạng thái");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa Đơn Đơn Hàng</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
              }
              th {
                background-color: #f2f2f2;
              }
              h4, h5 {
                text-align: center;
              }
              .color-circle {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 1px solid #ccc;
                margin-right: 5px;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleExportPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: 0.5,
      filename: `hoa-don-${order?.madonhang || "donhang"}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div className="container"><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container">
      <div className="text-end my-4">
        <div className="btn-group" role="group" aria-label="Export Options">
          <button
            className="btn btn-outline-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 me-2"
            onClick={handlePrint}
          >
            <i className="bi bi-printer-fill"></i>
            In hóa đơn
          </button>
          <button
            className="btn btn-outline-success px-4 py-2 fw-semibold d-flex align-items-center gap-2"
            onClick={handleExportPDF}
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
            Xuất PDF
          </button>
        </div>
      </div>

      <div className="card shadow-sm" ref={printRef}>
        <div className="card-header text-center text-dark">
          <h4>Chi Tiết Đơn Hàng</h4>
        </div>

        <div className="card-body">
          {order && (
            <>
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Mã đơn hàng:</strong> {order.madonhang}</p>
                  <p><strong>Khách hàng:</strong> {order.hoten}</p>
                  <p><strong>SĐT:</strong> {order.sodienthoai}</p>
                  <p><strong>Địa chỉ:</strong> {order.diachinguoidung}</p>
                </div>

                <div className="col-md-6">
                  <p><strong>Ngày đặt:</strong> {formatDate(order.ngaydat)}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.phuongthucthanhtoan === "cod" ? "Thanh toán khi nhận hàng" : order.phuongthucthanhtoan}</p>
                  <p>
                    <strong>Trạng thái hiện tại:</strong>{" "}
                    <span className={`badge ${order.class}`}>
                      {order.trangthaidonhang}
                    </span>
                  </p>

                  {order.trangthai !== 3 && order.trangthai !== 4 && (
                    <div className="mt-2 d-print-none">
                      <label><strong>🛠 Cập nhật trạng thái</strong></label>
                      <div className="d-flex gap-2 align-items-center">
                        <select className="form-select" value={statusUpdate} onChange={handleStatusChange}>
                          <option value={1}>Chờ xác nhận</option>
                          <option value={2}>Đang giao</option>
                          <option value={3}>Hoàn tất</option>
                          <option value={4}>Đã huỷ</option>
                        </select>
                        <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating}>
                          {updating ? "Đang cập nhật..." : "Cập nhật"}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="mt-2"><strong>Tổng tiền:</strong> {order.tongtien.toLocaleString("vi-VN")}₫</p>
                </div>
              </div>

              {order.ghichu && (
                <div className="mb-4">
                  <strong>Ghi chú:</strong> <em>{order.ghichu}</em>
                </div>
              )}

              <hr />
              <h5 className="mt-4">Danh sách sản phẩm</h5>

              <table className="table table-bordered mt-3 text-center">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th className="col-1">Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th className="col-2">Màu</th>
                    <th>Size</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.chitiet.length > 0 ? (
                    order.chitiet.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.masanpham}</td>
                        <td>{item.tensanpham}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <div style={{
                              width: 20,
                              height: 20,
                              backgroundColor: item.mausanpham,
                              borderRadius: "50%",
                              border: "1px solid #ccc"
                            }} title={getColorName(item.mausanpham)} />
                            <span>{getColorName(item.mausanpham)}</span>
                          </div>
                        </td>
                        <td>{item.size}</td>
                        <td>{item.soluong}</td>
                        <td>{item.giatien.toLocaleString("vi-VN")}₫</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-muted">Không có sản phẩm nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
