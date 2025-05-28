const ProductServer = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");

exports.createProduct = async (req, res, next) => {
  try {
    let kichthuocParsed = [];

    // Kiểm tra và xử lý kichthuoc: có thể là chuỗi JSON hoặc object
    if (req.body.kichthuoc) {
      if (typeof req.body.kichthuoc === "string") {
        try {
          kichthuocParsed = JSON.parse(req.body.kichthuoc);
        } catch (parseError) {
          console.error("Không thể parse kichthuoc:", parseError);
          return res.status(400).json({ error: "Dữ liệu kích thước không hợp lệ" });
        }
      } else if (Array.isArray(req.body.kichthuoc)) {
        kichthuocParsed = req.body.kichthuoc;
      }
    }

    // Xử lý danh sách hình ảnh (req.files đến từ middleware multer)
    const imageList = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        imageList.push(file.filename); // hoặc file.path tùy bạn lưu như thế nào
      }
    }

    // Tạo object sản phẩm đầy đủ
    const newProductData = {
      tensanpham: req.body.tensanpham,
      giasanpham: req.body.giasanpham,
      theloai: req.body.theloai,     // ID danh mục
      mota: req.body.mota,
      ngaythem: req.body.ngaythem,
      soluong: req.body.soluong,
      kichthuoc: kichthuocParsed,    // Đã xử lý chuẩn
      hinhanh: imageList             // Danh sách tên file ảnh
    };

    // Gọi service để lưu vào DB
    const productService = new ProductServer(MongoDB.client);
    const productId = await productService.createProduct(newProductData);

    // Trả kết quả thành công
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      id: productId
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi tạo sản phẩm" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const productService = new ProductServer(MongoDB.client);
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
  }
}


exports.getProductById = async (req, res) => {
  try {
    console.log("Product ID nhận được:", req.params.id);
    const productService = new ProductServer(MongoDB.client);
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm" });
  }
}


exports.deleteProduct = async (req, res) => {
  try {
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi xoá sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi xoá sản phẩm" });
  }
}


exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) {
      return res.status(400).json({ error: "Thiếu từ khoá tìm kiếm" });
    }
    const results = await productService.searchProductByName(keyword);
    res.json(results);
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi tìm kiếm sản phẩm" });
  }
}

