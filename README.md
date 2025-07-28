
# 🛍️ Fashion E-Commerce Platform with Virtual Try-On & Design Personalization

## 📌 Giới thiệu
Dự án **Website Thương Mại Điện Tử Thời Trang** mang đến trải nghiệm mua sắm trực tuyến hiện đại với nhiều tính năng nổi bật:

✅ **Virtual Try-On (VTON)** – Cho phép khách hàng xem trước sản phẩm trên người mẫu hoặc chính ảnh cá nhân.  
✅ **Cá nhân hóa thiết kế** – Người dùng có thể tự chỉnh sửa sản phẩm: thêm chữ, hình ảnh, đổi màu sắc trước khi đặt hàng.  
✅ **Quản trị sản phẩm & đơn hàng** – Hỗ trợ admin dễ dàng quản lý kho, sản phẩm và thông tin khách hàng.  

---

## 🚀 Công nghệ sử dụng

### 🔹 **Frontend**
- ⚛ **ReactJS** – Xây dựng giao diện hiện đại, tối ưu trải nghiệm người dùng.  
- 🎨 **Bootstrap 5** – Thiết kế responsive, hỗ trợ mọi loại thiết bị.  

### 🔹 **Backend**
- 🟢 **Node.js (Express)** – Tạo RESTful API phục vụ frontend.  
- 🏗 **MVC Architecture** – Quản lý code theo mô hình Model – View – Controller, dễ bảo trì và mở rộng.  

### 🔹 **Database**
- 🍃 **MongoDB (Mongoose)** – Lưu trữ dữ liệu sản phẩm, người dùng, đơn hàng và thiết kế cá nhân hóa.  

### 🔹 **AI & Tích hợp đặc biệt**
- 🧠 **Virtual Try-On API (IDM-VTON/Diffusers)** – Sinh ảnh người mẫu mặc thử sản phẩm.  
- 🎨 **Design Personalization Module** – Cho phép khách hàng sáng tạo mẫu thiết kế riêng với overlay text/image.  

---

## 📂 Cấu trúc thư mục

<pre> ``` fashion-ecommerce/ ├── client # Frontend ReactJS │ ├── src │ │ ├── components # Các component UI tái sử dụng │ │ ├── pages # Trang chính: Home, Cart, Try-On, Design… │ │ ├── services # Kết nối API backend │ │ └── App.js │ └── package.json ├── server # Backend NodeJS │ ├── controllers # Xử lý request & response │ ├── models # Mongoose schema (User, Product, Order…) │ ├── routes # Định nghĩa REST API │ ├── services # Logic nghiệp vụ & tích hợp AI Try-On │ └── server.js ├── public # File tĩnh (ảnh logo, font, icon…) ├── README.md └── package.json ``` </pre>

---

## ⚙️ Cài đặt & Chạy dự án

### 1️⃣ Clone project
git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>

### 2️⃣ Cài dependencies cho backend & frontend
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

### 3️⃣ Cấu hình file .env trong thư mục server
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db>
VTON_API=http://localhost:7860/try-on
JWT_SECRET=your_secret_key

### 4️⃣ Chạy server & client
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm start

---

## 🌟 Chức năng chính

- 👕 **Quản lý sản phẩm thời trang**: tìm kiếm, lọc và duyệt danh mục sản phẩm.  
- 🧍 **Virtual Try-On**: tải ảnh người mẫu hoặc ảnh cá nhân để xem sản phẩm trên người.  
- 🎨 **Cá nhân hóa thiết kế**: thêm chữ, hình ảnh, đổi màu sản phẩm trước khi đặt mua.  
- 🛒 **Giỏ hàng & thanh toán**: thêm sản phẩm vào giỏ, xử lý thanh toán cơ bản.  
- 📦 **Admin Dashboard**: quản lý sản phẩm, đơn hàng và người dùng.  

---

## 🛠️ API Backend

### 🔑 **Auth API**
- POST /api/auth/register – Đăng ký tài khoản  
- POST /api/auth/login – Đăng nhập hệ thống  

### 🏷 **Product API**
- GET /api/products – Lấy danh sách sản phẩm  
- POST /api/products – (Admin) Thêm sản phẩm  

### 🧍 **Virtual Try-On API**
- POST /api/tryon – Gửi ảnh người & sản phẩm → trả về ảnh mặc thử  

### 🎨 **Design API**
- POST /api/design – Lưu thiết kế cá nhân hóa của khách hàng  

---

## 📸 Demo
📌 (Thêm screenshot hoặc GIF minh họa giao diện: trang chủ, trang Try-On, module thiết kế cá nhân hóa)

---

## 👨‍💻 Đóng góp

1️⃣ **Fork** repo  
2️⃣ Tạo **branch mới**:
git checkout -b feature/ten-tinh-nang

3️⃣ Commit & push thay đổi:
git commit -m "Add new feature"
git push origin feature/ten-tinh-nang

4️⃣ Tạo **Pull Request** về nhánh main.

---

## 📄 License
📜 **MIT License** – Tự do sử dụng, chỉnh sửa và phát triển.

