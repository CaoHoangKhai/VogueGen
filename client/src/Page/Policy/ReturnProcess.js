const ReturnProcess = () => (
  <div className="container">
    <h2 className="mb-4">Quy Trình Đổi Trả Hàng</h2>

    <p>
      Chúng tôi luôn mong muốn mang đến trải nghiệm tốt nhất cho khách hàng. Trong trường hợp bạn cần đổi/trả hàng, vui lòng làm theo quy trình sau:
    </p>

    <h4 className="mt-4">📌 Bước 1: Kiểm tra điều kiện đổi/trả</h4>
    <ul className="list-unstyled">
      <li>✔ Sản phẩm còn mới, chưa qua sử dụng, không bị rách hoặc bẩn</li>
      <li>✔ Được yêu cầu đổi/trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng</li>
      <li>✔ Không thuộc danh mục không hỗ trợ đổi trả (VD: hàng thiết kế riêng)</li>
    </ul>

    <h4 className="mt-4">📌 Bước 2: Liên hệ bộ phận CSKH</h4>
    <p>
      Gửi yêu cầu đổi trả qua Zalo, email hoặc gọi hotline. Vui lòng cung cấp:
    </p>
    <ul className="list-unstyled">
      <li>✔ Mã đơn hàng</li>
      <li>✔ Hình ảnh sản phẩm (nếu có lỗi)</li>
      <li>✔ Lý do đổi/trả</li>
    </ul>

    <h4 className="mt-4">📌 Bước 3: Xác nhận và hướng dẫn hoàn hàng</h4>
    <p>
      Sau khi tiếp nhận yêu cầu, chúng tôi sẽ kiểm tra và hướng dẫn gửi lại sản phẩm về kho theo địa chỉ được cung cấp.
    </p>

    <h4 className="mt-4">📌 Bước 4: Xử lý đơn đổi hoặc hoàn tiền</h4>
    <ul className="list-unstyled">
      <li>✔ Gửi sản phẩm mới nếu đổi hàng</li>
      <li>✔ Hoàn tiền qua tài khoản ngân hàng trong 5–7 ngày làm việc nếu trả hàng</li>
    </ul>

    <p className="mt-4">
      Trong mọi trường hợp, khách hàng luôn được hỗ trợ tận tình, minh bạch và rõ ràng.
    </p>
  </div>
);
export default ReturnProcess;
