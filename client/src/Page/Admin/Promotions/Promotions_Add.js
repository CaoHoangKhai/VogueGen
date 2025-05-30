import { useState } from "react";
import axios from "axios";

const Promotions_Add = () => {
    const [form, setForm] = useState({
        makhuyenmai: "",
        tenkhuyenmai: "",
        nguoitao: "admin",
        soluong: 0,
        giamgia: 0,
        ngaybatdau: "",
        ngayketthuc: "",
        trangthai: "1",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...form,
                soluong: Number(form.soluong),
                giamgia: Number(form.giamgia),
            };

            const res = await axios.post("http://localhost:4000/admin/promotions/", payload);
            alert("Tạo khuyến mãi thành công!");
            console.log(res.data);
        } catch (error) {
            console.error("Lỗi khi tạo khuyến mãi:", error.response?.data || error.message);
            alert(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="container mt-3">
            <div className="card shadow-sm">
                <div className="card-header text-dark text-center">
                    <h4>Thêm Mã Khuyến Mãi</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Dòng 1: Mã và Tên */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label">Mã Khuyến Mãi</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="makhuyenmai"
                                    value={form.makhuyenmai}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: KM2025"
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">Tên Khuyến Mãi</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="tenkhuyenmai"
                                    value={form.tenkhuyenmai}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập tên chương trình"
                                />
                            </div>
                        </div>

                        {/* Dòng 2: Số lượng và Giảm giá */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label">Số Lượng</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="soluong"
                                    value={form.soluong}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">Giảm Giá (%)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="giamgia"
                                    value={form.giamgia}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    required
                                    placeholder="VD: 15"
                                />
                            </div>
                        </div>

                        {/* Dòng 3: Ngày bắt đầu và ngày kết thúc */}
                        <div className="row mb-3">
                            <div className="col">
                                <label className="form-label">Ngày Bắt Đầu</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="ngaybatdau"
                                    value={form.ngaybatdau}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col">
                                <label className="form-label">Ngày Kết Thúc</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="ngayketthuc"
                                    value={form.ngayketthuc}
                                    onChange={handleChange}
                                    required
                                    min={form.ngaybatdau || ""}  // Khóa ngày kết thúc không được nhỏ hơn ngày bắt đầu
                                />

                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="mb-3">
                            <label className="form-label">Trạng Thái</label>
                            <select
                                className="form-select"
                                name="trangthai"
                                value={form.trangthai}
                                onChange={handleChange}
                            >
                                <option value="1">Hoạt động</option>
                                <option value="0">Ngưng hoạt động</option>
                            </select>
                        </div>

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
