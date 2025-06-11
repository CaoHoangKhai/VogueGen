import React, { useEffect, useState } from "react";
import axios from "axios";

const Promotions_List = () => {
  const [promotions, setPromotions] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set());

  // Lấy danh sách khuyến mãi từ server
  const fetchPromotions = async () => {
    try {
      const response = await axios.get("http://localhost:4000/admin/promotions");
      setPromotions(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error.message);
      alert("Không lấy được danh sách khuyến mãi");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Xử lý kết thúc khuyến mãi
  const handleEndPromotion = async (id) => {
    setLoadingIds(new Set(loadingIds).add(id));
    try {
      await axios.patch(`http://localhost:4000/admin/promotions/status/${id}`);
      // Cập nhật trạng thái trên local luôn
      setPromotions(promotions.map(p => 
        p._id === id ? { ...p, trangthai: "0" } : p
      ));
    } catch (error) {
      console.error("Lỗi khi đổi trạng thái khuyến mãi:", error.message);
      alert("Không thể cập nhật trạng thái khuyến mãi");
    }
    // Xóa id khỏi loadingIds
    setLoadingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header text-dark text-center">
          <h4>Danh Sách Khuyến Mãi</h4>
        </div>

        <div className="card-body text-center">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Mã KM</th>
                <th>Tên Khuyến Mãi</th>
                <th>Số Lượng</th>
                <th>Đã Sử Dụng</th>
                <th>Giảm Giá</th>
                <th>Ngày Bắt Đầu</th>
                <th>Ngày Kết Thúc</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">Không có khuyến mãi nào</td>
                </tr>
              ) : (
                promotions.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.makhuyenmai}</td>
                    <td>{item.tenkhuyenmai}</td>
                    <td>{item.soluong}</td>
                    <td>{item.dasudung}</td>
                    <td>{item.giamgia}</td>
                    <td>{item.ngaybatdau ? new Date(item.ngaybatdau).toLocaleDateString("vi-VN") : "Không rõ"}</td>
                    <td>{item.ngayketthuc ? new Date(item.ngayketthuc).toLocaleDateString("vi-VN") : "Không rõ"}</td>
                    <td className="text-center">
                      {item.trangthai === "1" ? (
                        <span className="badge bg-success">Hiệu lực</span>
                      ) : (
                        <span className="badge bg-secondary">Hết hạn</span>
                      )}
                    </td>
                    <td>
                      {item.trangthai === "1" ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEndPromotion(item._id)}
                          disabled={loadingIds.has(item._id)}
                        >
                          {loadingIds.has(item._id) ? "Đang xử lý..." : "Kết Thúc"}
                        </button>
                      ) : (
                        <span>Đã Kết Thúc</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Promotions_List;