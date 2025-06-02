const fs = require("fs");
const path = require("path");
const ProductServer = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");

exports.createProduct = async (req, res, next) => {
  try {
    // Parse kichthuoc
    let kichthuocParsed = [];
    if (req.body.kichthuoc) {
      try {
        kichthuocParsed = JSON.parse(req.body.kichthuoc);
      } catch (err) {
        return res.status(400).json({ error: "Dữ liệu kích thước không hợp lệ" });
      }
    }

    // Parse mau
    let mauParsed = [];
    if (req.body.mau) {
      try {
        mauParsed = JSON.parse(req.body.mau);
      } catch (err) {
        return res.status(400).json({ error: "Dữ liệu màu không hợp lệ" });
      }
    }

    // Parse hinhanh: gom file theo từng màu
    let hinhanh = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        // file.fieldname: ví dụ "files_#FFFFFF"
        const match = file.fieldname.match(/^files_(.+)$/);
        if (match) {
          const colorCode = match[1];
          if (!hinhanh[colorCode]) hinhanh[colorCode] = [];
          hinhanh[colorCode].push(file.filename);
        }
      });
    }

    // Parse giá
    const giaSanPham = parseInt(req.body.giasanpham?.toString().replace(/\D/g, ''), 10) || 0;

    // Object sản phẩm
    const newProductData = {
      tensanpham: req.body.tensanpham,
      giasanpham: giaSanPham,
      theloai: req.body.theloai,
      mota: req.body.mota,
      ngaythem: req.body.ngaythem || new Date(),
      kichthuoc: kichthuocParsed,
      mau: mauParsed,
      hinhanh: hinhanh,
    };

    // Tạo sản phẩm
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.createProduct(newProductData);

    // Di chuyển file ảnh vào public/images
    if (req.files && Array.isArray(req.files)) {
      const destDir = path.join(__dirname, "..", "public", "images");
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      for (const file of req.files) {
        const oldPath = file.path;
        const newPath = path.join(destDir, file.filename);
        try {
          await fs.promises.rename(oldPath, newPath);
          console.log(`Đã di chuyển ${oldPath} -> ${newPath}`);
        } catch (err) {
          console.error("❌ Lỗi khi di chuyển ảnh:", err);
        }
      }
    }

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      id: result.productId || result.id,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
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

