import React from "react";

const DesignGuide = () => {
    return (
        <div className="container">
            <div className="p-4 p-md-5">
                <h2 className="text-center fw-bold mb-4 text-primary">
                    Hướng Dẫn Thiết Kế Áo Tại SHOPIFY
                </h2>

                {/* BƯỚC 1 */}
                <div className="mb-4">
                    <h5 className="fw-semibold text-dark">Bước 1: Xem Chi Tiết Sản Phẩm & Chọn Màu</h5>
                    <ul className="ps-3">
                        <li>Truy cập danh sách sản phẩm và chọn một mẫu áo bạn yêu thích.</li>
                        <li>Ở trang chi tiết sản phẩm, chọn màu áo muốn thiết kế.</li>
                        <li>Nhấn nút <strong>“Thiết Kế”</strong> để bắt đầu thiết kế áo.</li>
                    </ul>
                </div>

                {/* BƯỚC 2 */}
                <div className="mb-4">
                    <h5 className="fw-semibold text-dark">Bước 2: Thiết Kế Áo Theo Phong Cách Riêng</h5>
                    <ul className="ps-3">
                        <li><strong>Thêm chữ:</strong> Nhập nội dung, chọn font, màu và đặt vị trí trên áo.</li>
                        <li><strong>Thêm ảnh:</strong> Tải hình từ máy tính hoặc chọn từ thư viện.</li>
                        <li><strong>Tùy chỉnh:</strong> Kéo, xoay, phóng to hoặc thu nhỏ các đối tượng.</li>
                        <li><strong>Đổi màu áo:</strong> Có thể thay đổi lại màu nền của áo trong quá trình thiết kế.</li>
                    </ul>
                    <p className="text-muted small mt-2">
                        Gợi ý: Hãy kết hợp chữ và hình ảnh để tạo thiết kế thật độc đáo!
                    </p>
                </div>

                {/* BƯỚC 3 */}
                <div className="mb-4">
                    <h5 className="fw-semibold text-dark">Bước 3: Lưu Thiết Kế</h5>
                    <ul className="ps-3">
                        <li>Nhấn nút <strong>“Lưu Thiết Kế”</strong> sau khi hoàn thành.</li>
                        <li>Thiết kế sẽ được lưu lại vào tài khoản của bạn để sử dụng sau này.</li>
                    </ul>
                    <p className="text-danger small mt-2">
                        Lưu ý: Nếu không bấm “Lưu Thiết Kế”, thiết kế sẽ không được ghi nhận.
                    </p>
                </div>

                {/* BƯỚC 4 */}
                <div className="mb-4">
                    <h5 className="fw-semibold text-dark">Bước 4: Quản Lý & Sử Dụng Lại Thiết Kế</h5>
                    <ul className="ps-3">
                        <li>Xem các thiết kế đã lưu trong mục “Thiết Kế Của Tôi”.</li>
                        <li>Tải ảnh thiết kế về máy để chia sẻ hoặc in áo.</li>
                        <li>Mở lại thiết kế để chỉnh sửa và lưu thành phiên bản mới.</li>
                    </ul>
                </div>

                {/* LƯU Ý */}
                <div className="border-top pt-3 text-muted small">
                    <p><strong>•</strong> Phải nhấn <strong>“Lưu Thiết Kế”</strong> để hệ thống ghi nhận.</p>
                    <p><strong>•</strong> Có thể tạo nhiều thiết kế khác nhau từ cùng một sản phẩm.</p>
                    <p><strong>•</strong> Thiết kế đã lưu có thể chỉnh sửa bất kỳ lúc nào.</p>
                </div>
            </div>
        </div>
    );
};

export default DesignGuide;
