import { useEffect, useState } from "react";
import { getDesignsByUser } from "../../api/Design/design.api";
import { Link } from "react-router-dom"; // <-- thêm dòng này

const MyDesign = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

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

    return (
        <div className="container">
            <h3 className="mb-4">Thiết kế của tôi</h3>

            {designs.length === 0 ? (
                <div>Không có thiết kế nào.</div>
            ) : (
                <div className="row">
                    {designs.map((d) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={d._id}>
                            <Link to={`/design/${d._id}`} className="text-decoration-none text-dark">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title text-primary">Thể loại: {d.theloai}</h5>
                                        <p className="card-text mb-1"><strong>ID:</strong> {d._id}</p>
                                        <p className="card-text"><strong>Ngày tạo:</strong> {new Date(d.ngaytao).toLocaleString()}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDesign;
