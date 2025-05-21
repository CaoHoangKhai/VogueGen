const messages = {
    success: {
        LOGIN_SUCCESS: "Đăng nhập thành công!",
        REGISTER_SUCCESS: "Đăng ký thành công! Vui lòng đăng nhập.",
        UPDATE_SUCCESS: "Cập nhật thông tin thành công!",
        DELETE_SUCCESS: "Xóa thông tin thành công!"
    },
    error: {
        EMAIL_NOT_FOUND: "Email không tồn tại.",
        PHONE_NOT_FOUND: "Số điện thoại không tồn tại.",
        EMAIL_OR_PHONE_INCORRECT: "Email hoặc số điện thoại không chính xác.",
        EMAIL_ALREADY_EXISTS: "Email đã tồn tại.",
        PHONE_ALREADY_EXISTS: "Số điện thoại đã tồn tại.",
        LOGIN_FAILED: "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.",
        REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại sau.",
        UNKNOWN_ERROR: "Có lỗi xảy ra, vui lòng thử lại!",
        MISSING_EMAIL_PHONE: "Vui lòng nhập email và số điện thoại.",
        PASSWORD_INCORRECT: "Mật khẩu không đúng."
    },
    info: {
        SIGNIN_PAGE: "Trang Đăng Nhập",
        SIGNUP_PAGE: "Trang Đăng Ký",
        HOME_PAGE: "Trang Chủ",
        CONTACT_PAGE: "Trang Liên Hệ",
        USER_PAGE: "Trang Người Dùng",
        ADMIN_PAGE: "Trang Quản Trị Viên",
        DASHBOARD_PAGE: "Bảng Điều Khiển",
        PROFILE_PAGE: "Trang Cá Nhân",
        SETTINGS_PAGE: "Cài Đặt Hệ Thống"
    },
    warning: {
        INCOMPLETE_INFORMATION: "Thông tin bạn cung cấp chưa đầy đủ.",
        UNAUTHORIZED_ACCESS: "Bạn không có quyền truy cập vào tài nguyên này.",
        ACCESS_RESTRICTED: "Bạn cần đăng nhập để tiếp tục.",
        INVALID_INPUT: "Dữ liệu nhập không hợp lệ."
    }
};

module.exports = messages;
