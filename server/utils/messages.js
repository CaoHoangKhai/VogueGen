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
        LOGIN_PAGE: "Trang Đăng Nhập",
        REGISTER_PAGE: "Trang Đăng Ký",
        HOME_PAGE: "Trang Chủ",
        CONTACT_PAGE: "Trang Liên Hệ"
    },
    warning: {
        INCOMPLETE_INFORMATION: "Thông tin bạn cung cấp chưa đầy đủ.",
        UNAUTHORIZED_ACCESS: "Bạn không có quyền truy cập vào tài nguyên này."
    }
};

module.exports = messages;
