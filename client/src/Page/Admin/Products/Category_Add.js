import { useState, useEffect } from "react";
import axios from "axios";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:4000/admin/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
            setMessage("Không thể lấy danh sách danh mục.");
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setMessage("⚠️ Tên danh mục không được để trống.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/admin/categories", {
                tendanhmuc: newCategory.trim(),
            });

            if (response.data.insertedId) {
                setMessage("✅ Thêm danh mục thành công.");
                setNewCategory("");
                fetchCategories();
            } else {
                setMessage("⚠️ Danh mục đã tồn tại hoặc thêm thất bại.");
            }
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            setMessage("❌ Lỗi xảy ra khi thêm danh mục.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card shadow-sm">
                <div className="card-header text-dark text-center">
                    <h4>Quản lý Danh Mục Sản Phẩm</h4>
                </div>

                <div className="card-body">
                    {/* Thêm danh mục */}
                    <div className="row mb-4">
                        <div className="col-md-9">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập tên danh mục mới..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 d-grid">
                            <button
                                className="btn btn-success"
                                onClick={handleAddCategory}
                                disabled={loading}
                            >
                                {loading ? "Đang thêm..." : "➕ Thêm Danh Mục"}
                            </button>
                        </div>
                    </div>

                    {/* Thông báo */}
                    {message && (
                        <div className="alert alert-info text-center" role="alert">
                            {message}
                        </div>
                    )}

                    {/* Danh sách danh mục */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">📋 Danh sách danh mục</h5>
                        <button className="btn btn-outline-primary btn-sm" onClick={fetchCategories}>
                            🔄 Làm mới
                        </button>
                    </div>
                    <table className="table table-bordered table-hover text-center">
                        <thead className="table-light">
                            <tr>
                                <th>STT</th>
                                <th>Tên Danh Mục</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((item, index) => (
                                    <tr key={item._id}>
                                        <td className="col-1">{index + 1}</td>
                                        <td className="col">{item.tendanhmuc}</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="text-muted">
                                        Không có danh mục nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
