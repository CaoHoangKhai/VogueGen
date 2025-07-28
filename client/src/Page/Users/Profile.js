import React, { useEffect, useState } from "react";
import { getUserById, countFavoritesByUser } from "../../api/User/user.api";
import { getTotalOrdersByUserId, getTotalSpentByUser } from "../../api/Order/order.api";
import { changePassword } from "../../api/Auth/auth.api";
import { Link } from "react-router-dom";
import Toast from "../../Components/Toast";

// ✅ MUI components
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📌 State cho đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 📌 State Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "" // 'success' | 'error'
  });

  // 📌 State hiển/ẩn mật khẩu
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 📌 Lấy dữ liệu user khi load trang
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      const userFromStorage = parsed?.data || parsed;
      const userId = userFromStorage._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      setUser(userFromStorage);

      Promise.all([
        getUserById(userId),
        getTotalOrdersByUserId(userId),
        countFavoritesByUser(userId),
        getTotalSpentByUser(userId),
      ])
        .then(([resUser, resOrderCount, resFavorites, resTotalSpent]) => {
          const data = resUser?.data || resUser;
          data.soDonHang = resOrderCount?.total ?? 0;
          data.soYeuThich = resFavorites?.data?.favoriteCount ?? 0;
          data.tongChiTieu = resTotalSpent?.totalSpent ?? 0;
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        })
        .catch((err) => console.warn("❌ API Error:", err.message))
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("❌ Parse Error:", err.message);
      setLoading(false);
    }
  }, []);

  // 📌 Hàm đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({
        show: true,
        message: "❌ Mật khẩu mới và xác nhận không khớp.",
        type: "error"
      });
      return;
    }

    try {
      const res = await changePassword(user._id, oldPassword, newPassword);
      setToast({
        show: true,
        message: res.data.message || "✅ Đổi mật khẩu thành công.",
        type: "success"
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || "❌ Đổi mật khẩu thất bại.",
        type: "error"
      });
    }
  };

  if (loading) return <div className="container mt-4">Đang tải thông tin...</div>;
  if (!user) return <div className="container mt-4">Không tìm thấy thông tin người dùng.</div>;

  return (
    <div className="container">
      <h3 className="text-center mb-4">👤 Trang cá nhân</h3>

      {/* Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#info" type="button">
            Thông tin cá nhân
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#changePassword" type="button">
            Đổi mật khẩu
          </button>
        </li>
      </ul>

      <div className="tab-content p-3 border border-top-0 rounded-bottom">
        {/* TAB 1: Thông tin cá nhân */}
        <div className="tab-pane fade show active" id="info">
          <div className="row text-center mb-4">
            <div className="col-md-3">
              <Link className="text-decoration-none text-secondary" to="/user/orders">
                <div className="border p-3 rounded shadow-sm">
                  <strong>Đã tiêu</strong>
                  <div>{(user.tongChiTieu || 0).toLocaleString()}₫</div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link className="text-decoration-none text-secondary" to="/user/location">
                <div className="border p-3 rounded shadow-sm">
                  <strong>Số địa chỉ</strong>
                  <div>{user.sodiachi ?? 0}/5</div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link className="text-decoration-none text-secondary" to="/user/orders">
                <div className="border p-3 rounded shadow-sm">
                  <strong>Số đơn hàng</strong>
                  <div>{user.soDonHang ?? 0}</div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link className="text-decoration-none text-secondary" to="/user/favorites">
                <div className="border p-3 rounded shadow-sm">
                  <strong>Yêu thích</strong>
                  <div>{user.soYeuThich ?? 0}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Mã người dùng</label>
              <input type="text" className="form-control" value={user._id} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label">Họ tên</label>
              <input type="text" className="form-control" value={user.hoten} disabled />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Số điện thoại</label>
              <input type="text" className="form-control" value={user.sodienthoai} disabled />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={user.email} disabled />
            </div>
          </div>
        </div>

        {/* TAB 2: Đổi mật khẩu */}
        <div className="tab-pane fade" id="changePassword">
          <h5 className="mb-3">🔑 Đổi mật khẩu</h5>
          <form onSubmit={handleChangePassword}>
            {/* Mật khẩu cũ */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Mật khẩu cũ"
                type={showOld ? "text" : "password"}
                variant="outlined"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOld(!showOld)}>
                        {showOld ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>

            {/* Mật khẩu mới */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Mật khẩu mới"
                type={showNew ? "text" : "password"}
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)}>
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-3">
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                type={showConfirm ? "text" : "password"}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>

            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              Đổi mật khẩu
            </Button>
          </form>
        </div>
      </div>

      {/* ✅ Toast thông báo */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Profile;
