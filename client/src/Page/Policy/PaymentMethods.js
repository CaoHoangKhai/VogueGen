const PaymentMethods = () => (
    <div className="container">
        <h2 className="mb-4">Phương Thức Thanh Toán</h2>

        <p>
            Tại <strong>SHOPIFY</strong>, chúng tôi luôn đặt sự thuận tiện và an toàn của khách hàng lên hàng đầu.
            Vì vậy, hệ thống hỗ trợ đa dạng phương thức thanh toán để bạn dễ dàng lựa chọn hình thức phù hợp nhất khi mua sắm trực tuyến.
        </p>

        <h4 className="mt-4">1. Thanh toán khi nhận hàng (COD)</h4>
        <p>
            Đây là hình thức phổ biến và an toàn cho khách hàng mới. Bạn chỉ cần đặt hàng và thanh toán trực tiếp cho nhân viên giao hàng khi nhận được sản phẩm.
        </p>
        <ul className="list-unstyled">
            <li>✔ Không cần thanh toán trước.</li>
            <li>✔ Dễ kiểm tra sản phẩm trước khi thanh toán.</li>
            <li>✔ Áp dụng toàn quốc với đơn vị vận chuyển hỗ trợ COD.</li>
        </ul>

        <h4 className="mt-4">2. Chuyển khoản ngân hàng</h4>
        <p>
            Sau khi đặt hàng, bạn có thể chuyển khoản đến tài khoản ngân hàng của chúng tôi được hiển thị ở trang xác nhận đơn hàng.
        </p>
        <ul className="list-unstyled">
            <li>✔ Đơn hàng được xử lý nhanh sau khi nhận thanh toán.</li>
            <li>✔ Giúp tiết kiệm thời gian giao dịch so với COD.</li>
            <li>✔ Lưu ý: Ghi rõ mã đơn hàng trong nội dung chuyển khoản để tránh nhầm lẫn.</li>
        </ul>
        <p><em>Thông tin tài khoản ngân hàng sẽ được gửi qua email và SMS sau khi đặt hàng thành công.</em></p>

        <h4 className="mt-4">3. Thanh toán qua ví điện tử</h4>
        <p>
            Chúng tôi hỗ trợ các ví điện tử phổ biến như <strong>Momo, ZaloPay, ViettelPay</strong> giúp bạn thanh toán tiện lợi qua điện thoại.
        </p>
        <ul className="list-unstyled">
            <li>✔ Giao dịch nhanh chóng, an toàn.</li>
            <li>✔ Không cần nhập số tài khoản thủ công.</li>
            <li>✔ Hỗ trợ mã QR để quét nhanh khi thanh toán.</li>
        </ul>

        <h4 className="mt-4">4. Thanh toán online qua cổng VNPAY</h4>
        <p>
            Nếu bạn sử dụng thẻ ngân hàng nội địa (có Internet Banking) hoặc thẻ quốc tế (Visa, Mastercard), bạn có thể thanh toán trực tiếp thông qua cổng VNPAY.
        </p>
        <ul className="list-unstyled">
            <li>✔ Bảo mật theo tiêu chuẩn PCI DSS.</li>
            <li>✔ Giao dịch tức thì, đơn hàng được xử lý ngay.</li>
            <li>✔ Hỗ trợ hoàn tiền nếu có lỗi trong quá trình thanh toán.</li>
        </ul>
        <p><em>Lưu ý: Kiểm tra kỹ thông tin đơn hàng trước khi xác nhận thanh toán online.</em></p>

        <h4 className="mt-4">🛡️ An Toàn & Bảo Mật</h4>
        <p>
            Chúng tôi cam kết mọi giao dịch được mã hóa và bảo mật tuyệt đối. Thông tin thẻ hoặc tài khoản ngân hàng không được lưu trên hệ thống của chúng tôi.
        </p>

        <h4 className="mt-4">📌 Gợi ý cho bạn</h4>
        <ul className="list-unstyled">
            <li>🔒 Luôn kiểm tra địa chỉ website trước khi thanh toán (https://...)</li>
            <li>📞 Nếu có sự cố thanh toán, hãy liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ ngay.</li>
            <li>✅ Lưu lại mã đơn hàng sau khi thanh toán thành công.</li>
        </ul>

        <p className="mt-4">
            Hệ thống sẽ hiển thị đầy đủ thông tin thanh toán ở bước cuối cùng trước khi bạn xác nhận đơn hàng. Mọi thắc mắc xin liên hệ <strong>hotline: 0900 123 456</strong> hoặc Zalo CSKH để được hỗ trợ nhanh nhất.
        </p>
    </div>
);

export default PaymentMethods;
