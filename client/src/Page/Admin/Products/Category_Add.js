import { useState, useEffect } from "react";
import { getAllCategories, createCategory } from "../../../api/Category/category.api";

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const data = await getAllCategories();
        if (data && Array.isArray(data)) {
            setCategories(data);
        } else {
            setMessage("❌ Không thể lấy danh sách danh mục.");
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setMessage("⚠️ Tên danh mục không được để trống.");
            return;
        }

        setLoading(true);
        const result = await createCategory({ tendanhmuc: newCategory.trim() });

        if (result?.insertedId) {
            setMessage("✅ Thêm danh mục thành công.");
            setNewCategory("");
            fetchCategories();
        } else {
            setMessage("⚠️ Danh mục đã tồn tại hoặc thêm thất bại.");
        }

        setLoading(false);
    };

    return (
        <div className="container py-4">
            <div className="card shadow-lg border-0 rounded-4">
                <div className="card-header bg-dark text-white text-center rounded-top-4">
                    <h4 className="mb-0">🗂️ Quản lý Danh Mục Sản Phẩm</h4>
                </div>

                <div className="card-body p-4">

                    {/* Form thêm danh mục */}
                    <div className="row mb-4 align-items-end">
                        <div className="col-md-8">
                            <label htmlFor="newCategory" className="form-label fw-bold">
                                Nhập danh mục mới
                            </label>
                            <input
                                type="text"
                                id="newCategory"
                                className="form-control form-control-lg"
                                placeholder="Ví dụ: Áo khoác, Quần jeans..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <button
                                className="btn btn-success btn-lg w-100"
                                onClick={handleAddCategory}
                                disabled={loading}
                            >
                                {loading ? "Đang thêm..." : "➕ Thêm Danh Mục"}
                            </button>
                        </div>
                    </div>

                    {/* Thông báo */}
                    {message && (
                        <div className="alert alert-info text-center rounded-3">
                            {message}
                        </div>
                    )}

                    {/* Header danh sách */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">📋 Danh sách danh mục ({categories.length})</h5>
                        <button className="btn btn-outline-secondary btn-sm" onClick={fetchCategories}>
                            🔄 Làm mới
                        </button>
                    </div>

                    {/* Bảng danh mục */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: "10%" }}>#</th>
                                    <th>Tên Danh Mục</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>{index + 1}</td>
                                            <td className="text-start ps-4">{item.tendanhmuc}</td>
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
        </div>
    );
};

export default CategoryManager;
