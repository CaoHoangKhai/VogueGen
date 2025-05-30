import { useState } from "react";

const Promotions_Add = () => {
    const [form, setForm] = useState({
        tenKhuyenMai: "",
        nguoiTao: "", // ID người tạo, có thể set mặc định nếu lấy từ token
        soLuong: 0,
        ngayBatDau: "",
        ngayKetThuc: "",
        trangThai: 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu gửi lên:", form);
        // Gọi API thêm khuyến mãi ở đây
    };

    return (
        <div className="container mt-3">
            <div className="card shadow-sm">
                <div className="card-header text-dark text-center">
                    <h4>Thêm Mã Khuyến Mãi</h4>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Tên Khuyến Mãi</label>
                            <input
                                type="text"
                                className="form-control"
                                name="tenKhuyenMai"
                                value={form.tenKhuyenMai}
                                onChange={handleChange}
                                required
                                placeholder="Nhập tên cho chương trình khuyến mãi"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Số Lượng</label>
                            <input
                                type="number"
                                className="form-control"
                                name="soLuong"
                                value={form.soLuong}
                                onChange={handleChange}
                                min="0"
                               
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Ngày Bắt Đầu</label>
                            <input
                                type="date"
                                className="form-control"
                                name="ngayBatDau"
                                value={form.ngayBatDau}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Ngày Kết Thúc</label>
                            <input
                                type="date"
                                className="form-control"
                                name="ngayKetThuc"
                                value={form.ngayKetThuc}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Trạng Thái</label>
                            <select
                                className="form-select"
                                name="trangThai"
                                value={form.trangThai}
                                onChange={handleChange}
                            >
                                <option value="1">Hoạt động</option>
                                <option value="0">Ngưng hoạt động</option>
                            </select>
                        </div>

                        {/* Nếu cần nhập NguoiTao theo danh sách: */}
                        {/* 
                        <div className="mb-3">
                            <label className="form-label">Người Tạo</label>
                            <select
                                className="form-select"
                                name="nguoiTao"
                                value={form.nguoiTao}
                                onChange={handleChange}
                            >
                                <option value="">Chọn người dùng</option>
                                <option value="1">Admin</option>
                                ...
                            </select>
                        </div> 
                        */}

                        <div className="text-end">
                            <button type="submit" className="btn btn-primary">
                                Thêm Mã
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Promotions_Add;
