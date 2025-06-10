const fs = require("fs");
const path = require("path");
const ProductServer = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");

exports.createProduct = async (req, res, next) => {
  try {
    console.log("📦 DỮ LIỆU CLIENT GỬI LÊN:");
    console.log("Body:", req.body);

    // Xử lý kichthuoc
    // Kích thước có thể nằm trong req.body.kichthuoc hoặc req.body.sizes
    let kichthuocParsed = [];
    const kichthuocRaw = req.body.kichthuoc || req.body.sizes || "[]";
    try {
      kichthuocParsed = typeof kichthuocRaw === "string" ? JSON.parse(kichthuocRaw) : kichthuocRaw;
    } catch {
      return res.status(400).json({ error: "Dữ liệu kích thước không hợp lệ" });
    }

    // Màu sắc có thể nằm trong req.body.mausac hoặc req.body.colors
    let mausacParsed = [];
    const mausacRaw = req.body.mausac || req.body.colors || "[]";
    try {
      mausacParsed = typeof mausacRaw === "string" ? JSON.parse(mausacRaw) : mausacRaw;
    } catch {
      return res.status(400).json({ error: "Dữ liệu màu sắc không hợp lệ" });
    }


    // Xử lý images
    let images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      images = req.files.map((file) => ({
        tenfile: file.filename,
      }));
    } else if (Array.isArray(req.body.images)) {
      images = req.body.images;
    } else if (typeof req.body.images === "string") {
      try {
        images = JSON.parse(req.body.images);
      } catch {
        return res.status(400).json({ error: "Dữ liệu hình ảnh không hợp lệ" });
      }
    }

    // Parse giá sản phẩm chuẩn (chỉ số nguyên)
    const giaSanPham = Number(req.body.giasanpham) || 0;

    // Tạo object để gọi service
    const newProductData = {
      tensanpham: req.body.tensanpham || "",
      giasanpham: giaSanPham,
      theloai: req.body.theloai || "",
      mota: req.body.mota || "",
      ngaythem: new Date(),
      kichthuoc: kichthuocParsed,
      mausanpham: mausacParsed, // Đã đổi tên trường cho đồng bộ
      hinhanh: images,          // Đã đổi tên trường cho đồng bộ
    };

    // Gọi service tạo sản phẩm
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.createProduct(newProductData);

    // Di chuyển file ảnh nếu có upload
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const destDir = path.join(__dirname, "..", "public", "images");
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      for (const file of req.files) {
        const oldPath = file.path;
        const newPath = path.join(destDir, file.filename);
        try {
          await fs.promises.rename(oldPath, newPath);
          console.log(`✅ Đã di chuyển: ${file.originalname} -> ${file.filename}`);
        } catch (err) {
          console.error("❌ Lỗi khi di chuyển ảnh:", err);
        }
      }
    }

    if (result.success) {
      res.status(201).json({
        message: "Tạo sản phẩm thành công",
        id: result.productId || result.id,
      });
    } else {
      res.status(400).json({ error: result.message || "Không thể tạo sản phẩm" });
    }
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

exports.getAllProductsHome = async (req, res) => {
  try {
    const productService = new ProductServer(MongoDB.client);
    const products = await productService.getAllProductsHome();
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
    const result = await productService.getProductById(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message || "Không tìm thấy sản phẩm" });
    }

    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log("📦 DỮ LIỆU CLIENT GỬI LÊN:");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // 1. Parse kích thước
    let kichthuocParsed = [];
    if (req.body.kichthuoc) {
      try {
        kichthuocParsed = typeof req.body.kichthuoc === 'string'
          ? JSON.parse(req.body.kichthuoc)
          : req.body.kichthuoc;
      } catch {
        return res.status(400).json({ error: "❌ Dữ liệu kích thước không hợp lệ" });
      }
    }

    // 2. Parse màu sắc
    let mauParsed = [];
    if (req.body.mausanpham) {
      try {
        mauParsed = typeof req.body.mausanpham === 'string'
          ? JSON.parse(req.body.mausanpham)
          : req.body.mausanpham;
      } catch {
        return res.status(400).json({ error: "❌ Dữ liệu màu sắc không hợp lệ" });
      }
    }

    // 3. Parse hình ảnh cũ (giữ lại)
    let hinhanhCu = [];
    if (req.body.hinhanhCu) {
      try {
        hinhanhCu = typeof req.body.hinhanhCu === "string"
          ? JSON.parse(req.body.hinhanhCu)
          : req.body.hinhanhCu;
      } catch {
        return res.status(400).json({ error: "❌ Dữ liệu hình ảnh cũ không hợp lệ" });
      }
    }

    // 4. Parse danh sách _id ảnh cần xóa
    let hinhanhXoa = [];
    if (req.body.hinhanhXoa) {
      try {
        hinhanhXoa = typeof req.body.hinhanhXoa === "string"
          ? JSON.parse(req.body.hinhanhXoa)
          : req.body.hinhanhXoa;
      } catch {
        return res.status(400).json({ error: "❌ Dữ liệu hình ảnh xóa không hợp lệ" });
      }
    }

    // 5. Thêm ảnh mới từ req.files (nếu có upload)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const destDir = path.join(__dirname, "..", "public", "images");
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      for (const file of req.files) {
        const oldPath = file.path;
        const newPath = path.join(destDir, file.filename);
        try {
          await fs.promises.rename(oldPath, newPath);
          console.log(`✅ Đã di chuyển: ${file.originalname} -> ${file.filename}`);
        } catch (err) {
          console.error("❌ Lỗi khi di chuyển ảnh:", err);
        }
      }
    }

    // 6. Parse giá sản phẩm
    const giaSanPham = parseInt(
      req.body.giasanpham?.toString().replace(/[^\d]/g, ""),
      10
    ) || 0;

    // 7. Parse ngày thêm sản phẩm (nếu có)
    const ngayThem = req.body.ngaythem ? new Date(req.body.ngaythem) : new Date();

    // 8. Tạo payload truyền sang service
    const updateData = {
      tensanpham: req.body.tensanpham,
      giasanpham: giaSanPham,
      theloai: req.body.theloai,
      mota: req.body.mota,
      ngaythem: ngayThem,
      kichthuoc: kichthuocParsed,
      mausanpham: mauParsed,
      hinhanhCu: hinhanhCu,   // Ảnh giữ lại
      hinhanhXoa: hinhanhXoa  // _id ảnh cần xóa
    };

    // 9. Gọi service xử lý cập nhật
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.updateProduct(req.params.id, updateData, req.files);

    return res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error("❌ Lỗi server khi cập nhật sản phẩm:", error);
    return res.status(500).json({ success: false, message: "Cập nhật sản phẩm thất bại." });
  }
};

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

