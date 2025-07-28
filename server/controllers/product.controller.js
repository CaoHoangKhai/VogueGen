const fs = require("fs");
const path = require("path");
const ProductServer = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

exports.createProduct = async (req, res) => {
  try {
    console.log("🟡 [CREATE PRODUCT] Nhận dữ liệu:", req.body);

    // Parse kích thước
    let kichthuoc = [];
    try {
      const raw = req.body.kichthuoc || req.body.sizes || "[]";
      kichthuoc = typeof raw === "string" ? JSON.parse(raw) : raw;
      console.log("✅ Parsed kích thước:", kichthuoc);
    } catch {
      console.warn("❌ Không parse được kích thước");
      return res.status(400).json({ error: "Dữ liệu kích thước không hợp lệ" });
    }

    // Parse màu sắc
    let mausanpham = [];
    try {
      const raw = req.body.mausac || req.body.colors?.[""] || "[]";
      mausanpham = typeof raw === "string" ? JSON.parse(raw) : raw;
      console.log("✅ Parsed màu sắc:", mausanpham);
    } catch {
      console.warn("❌ Không parse được màu sắc");
      return res.status(400).json({ error: "Dữ liệu màu sắc không hợp lệ" });
    }

    // Parse giới tính
    const gioitinh = req.body.gioitinh?.toLowerCase() || "";
    if (!["nam", "nu","unisex"].includes(gioitinh)) {
      return res.status(400).json({ error: "Giới tính chỉ được phép là 'nam' hoặc 'nu'" });
    }

    // Xử lý hình ảnh upload
    let hinhanh = [];
    if (req.files && Array.isArray(req.files)) {
      console.log(`📦 Đang xử lý ${req.files.length} file ảnh...`);
      for (let index = 0; index < req.files.length; index++) {
        const file = req.files[index];
        const fileBuffer = fs.readFileSync(file.path);
        const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");

        const imageData = {
          hash,
          data: fileBuffer,
          contentType: file.mimetype,
          tenfile: file.originalname,
          color: req.body.colors?.[index] || null,
          position: req.body.positions?.[index] || null,
        };
        hinhanh.push(imageData);

        console.log(`✅ Ảnh ${index + 1}:`, {
          tenfile: file.originalname,
          color: imageData.color,
          position: imageData.position,
          hash,
        });

        await fs.promises.unlink(file.path); // Xóa file tạm
      }
    } else {
      console.log("⚠️ Không có file ảnh nào được gửi lên.");
    }

    // Parse giá sản phẩm
    const giaSanPham = Number(req.body.giasanpham) || 0;

    // Tổng hợp dữ liệu tạo sản phẩm
    const newProductData = {
      tensanpham: req.body.tensanpham || "",
      giasanpham: giaSanPham,
      theloai: req.body.theloai || "",
      mota: req.body.mota || "",
      ngaythem: new Date(),
      kichthuoc,
      mausanpham,
      hinhanh,
      gioitinh,
    };

    console.log("📤 Dữ liệu chuẩn bị insert:", newProductData);

    // Gọi service tạo sản phẩm
    const productService = new ProductServer(MongoDB.client);
    const result = await productService.createProduct(newProductData);

    // Trả kết quả
    if (result.success) {
      console.log("✅ Tạo sản phẩm thành công:", result.productId);
      res.status(201).json({
        message: "Tạo sản phẩm thành công",
        id: result.productId,
      });
    } else {
      console.warn("❌ Không thể tạo sản phẩm:", result.message);
      res.status(400).json({ error: result.message || "Không thể tạo sản phẩm" });
    }
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server khi tạo sản phẩm" });
  }
};

exports.getProductById = async (req, res) => {
  const { productId } = req.params;
  console.log("📥 Lấy sản phẩm theo ID:", productId);

  const productService = new ProductServer(MongoDB.client);
  const product = await productService.getProductById(productId);

  if (product) {
    console.log("✅ Tìm thấy sản phẩm:", product._id);
    res.json(product);
  } else {
    console.warn("❌ Không tìm thấy sản phẩm");
    res.status(404).json({ error: "Không tìm thấy sản phẩm" });
  }
};


exports.getAllProducts = async (req, res) => {
  console.log("📥 Yêu cầu lấy tất cả sản phẩm");
  const productService = new ProductServer(MongoDB.client);
  const products = await productService.getAllProducts();
  console.log(`✅ Trả về ${products.length} sản phẩm`);
  res.json(products);
};

exports.getImagesByColor = async (req, res) => {
  try {
    const { productId, color } = req.params;
    console.log("📥 Nhận yêu cầu lấy ảnh theo màu:", { productId, color });

    if (!ObjectId.isValid(productId)) {
      console.warn("❌ ID không hợp lệ:", productId);
      return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
    }

    const productService = new ProductServer(MongoDB.client);
    const result = await productService.getImagesByColor(productId, color);

    if (result.success) {
      console.log(`✅ Tìm thấy ${result.images.length} ảnh cho màu ${color}`);
      return res.status(200).json(result.images);
    } else {
      console.warn("⚠️ Không có ảnh hoặc lỗi truy vấn:", result.message);
      return res.status(404).json({ error: result.message || "Không tìm thấy ảnh" });
    }
  } catch (error) {
    console.error("❌ Lỗi controller getImagesByColor:", error);
    return res.status(500).json({ error: "Lỗi server khi lấy ảnh theo màu" });
  }
};

exports.getFullProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("📥 Lấy sản phẩm theo slug danh mục:", slug);

    const productService = new ProductServer(MongoDB.client);
    const products = await productService.getFullProductsByCategorySlug(slug);

    if (!products || products.length === 0) {
      console.warn("⚠️ Không tìm thấy sản phẩm với slug:", slug);
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong danh mục này." });
    }

    console.log(`✅ Tìm thấy ${products.length} sản phẩm với slug ${slug}`);
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi getProductByCategorySlug:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

exports.getColorsByProductId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 Lấy màu theo productId:", id);

    if (!ObjectId.isValid(id)) {
      console.warn("❌ ID sản phẩm không hợp lệ:", id);
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ.",
      });
    }

    const productService = new ProductServer(MongoDB.client);
    const result = await productService.getColorsByProductId(new ObjectId(id));

    if (!result.success) {
      console.warn("❌ Không lấy được màu:", result.message);
      return res.status(500).json(result);
    }

    console.log(`✅ Lấy thành công ${result.colors?.length || 0} màu`);
    res.json(result);
  } catch (error) {
    console.error("🔴 [GET COLORS BY PRODUCT ID] Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy màu theo sản phẩm.",
      error: error.message,
    });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const productService = new ProductServer(MongoDB.client);
    const topProducts = await productService.getBestSellingProducts();

    if (topProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm bán chạy."
      });
    }

    res.status(200).json({
      success: true,
      products: topProducts
    });
  } catch (error) {
    console.error("🔥 [getTopSellingProducts] Lỗi:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi truy vấn sản phẩm bán chạy.",
      error: error.message
    });
  }
};