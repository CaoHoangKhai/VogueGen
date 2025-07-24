import { useEffect, useState } from "react";
import { getDesignsByUser, renameDesign, deleteDesignById } from "../../../api/Design/design.api";
import { Link } from "react-router-dom";
import Toast from "../../../Components/Toast"; // Không destructure

const MyDesign = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserId(user._id);
            } catch (error) {
                console.error("Lỗi khi phân tích user:", error);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await getDesignsByUser(userId);
                setDesigns(res);
            } catch (err) {
                console.error("Lỗi khi tải thiết kế:", err);
                setDesigns([]);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchDesigns();
    }, [userId]);

    if (loading) return <div className="text-center mt-5">Đang tải...</div>;

    const handleRename = async (designId, oldName) => {
        const newName = prompt("Đổi tên thiết kế (tối đa 50 ký tự):", oldName);
        if (!newName || newName.trim() === "" || newName === oldName) return;

        const trimmedName = newName.trim();

        if (trimmedName.length > 50) {
            setToast({ type: "error", message: "❌ Tên thiết kế không được vượt quá 50 ký tự." });
            return;
        }

        try {
            const result = await renameDesign(designId, trimmedName);
            if (result.success) {
                setDesigns((prev) =>
                    prev.map((d) =>
                        d._id === designId ? { ...d, ten: trimmedName } : d
                    )
                );
                setToast({ type: "success", message: "✅ Đổi tên thành công!" });
            } else {
                setToast({ type: "error", message: "❌ Không thể đổi tên." });
            }
        } catch (err) {
            console.error("Lỗi đổi tên:", err);
            setToast({ type: "error", message: "❌ Đã xảy ra lỗi khi đổi tên." });
        }
    };


    const handleDelete = async (designId) => {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa thiết kế này?");
        if (!confirm) return;

        try {
            const result = await deleteDesignById(designId);
            if (result.success) {
                setDesigns((prev) => prev.filter((d) => d._id !== designId));
                setToast({ type: "success", message: "🗑️ Thiết kế đã được xóa!" });
            } else {
                setToast({ type: "error", message: "❌ Không thể xóa thiết kế: " + result.message });
            }
        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            setToast({ type: "error", message: "❌ Đã xảy ra lỗi khi xóa thiết kế." });
        }
    };

    return (
        <div className="container">
            <h3 className="mb-4 text-center">Thiết kế của tôi</h3>

            {designs.length === 0 ? (
                <div className="text-center">Không có thiết kế nào.</div>
            ) : (
                <div className="row">
                    {designs.map((d) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={d._id}>
                            <Link to={`/design/${d.link}`} className="text-decoration-none text-dark">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body position-relative">
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <button
                                                className="btn btn-sm btn-light"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === d._id ? null : d._id);
                                                }}
                                            >
                                                ⋯
                                            </button>
                                            {openMenuId === d._id && (
                                                <div
                                                    className="bg-white border rounded shadow-sm mt-1"
                                                    style={{
                                                        position: "absolute",
                                                        top: "100%",
                                                        right: 0,
                                                        zIndex: 10,
                                                        minWidth: 120
                                                    }}
                                                >
                                                    <button
                                                        className="dropdown-item btn btn-sm text-start w-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                            handleRename(d._id, d.ten);
                                                        }}
                                                    >
                                                        ✏️ Đổi tên
                                                    </button>
                                                    <button
                                                        className="dropdown-item btn btn-sm text-start w-100 text-danger"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                            handleDelete(d._id);
                                                        }}
                                                    >
                                                        🗑️ Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="card-title">Tên thiết kế: {d.ten}</p>
                                        <p className="card-text mb-1"><strong>ID:</strong> {d._id}</p>
                                        <p className="card-text"><strong>Ngày tạo:</strong> {new Date(d.ngaytao).toLocaleString()}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Hiển thị Toast nếu có */}
            {toast && (
                <Toast
                    show={true}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default MyDesign;
