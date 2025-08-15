const { ObjectId } = require("mongodb");
const port = require("../config").app.port;

class ProductServer {
  constructor(client) {
    const db = client.db();
    this.sanpham = db.collection("sanpham");
    this.kichthuoc = db.collection("kichthuoc");
    this.mausanpham = db.collection("mausanpham");
    this.hinhanhsanpham = db.collection("hinhanhsanpham");
    this.theloaisanpham = db.collection("theloaisanpham");
    this.chitietdonhang = client.db().collection("chitietdonhang");
  }

  async createProduct(productData) {
    try {
      // Insert sản phẩm chính
      const result = await this.sanpham.insertOne({
        tensanpham: productData.tensanpham,
        giasanpham: productData.giasanpham,
        theloai: productData.theloai,
        mota: productData.mota,
        ngaythem: productData.ngaythem,
        gioitinh: productData.gioitinh || "", // thêm giới tính vào DB
      });

      const productId = result.insertedId;

      // Insert màu sắc
      const mauDocs = (productData.mausanpham || []).map(mau => ({
        masanpham: productId,
        mau: mau.trim(),
      }));

      // Insert kích thước
      const kichthuocDocs = (productData.kichthuoc || []).map(size => ({
        masanpham: productId,
        size: typeof size === "string" ? size.trim() : size?.size?.trim(),
      }));

      // Insert hình ảnh
      const hinhanhDocs = (productData.hinhanh || []).map(img => ({
        masanpham: productId,
        hash: img.hash,
        data: img.data,
        contentType: img.contentType,
        tenfile: img.tenfile,
        mau: img.color || null,
        vitri: img.position || null,
      }));

      if (mauDocs.length) await this.mausanpham.insertMany(mauDocs);
      if (kichthuocDocs.length) await this.kichthuoc.insertMany(kichthuocDocs);
      if (hinhanhDocs.length) await this.hinhanhsanpham.insertMany(hinhanhDocs);

      return { success: true, productId };
    } catch (error) {
      console.error("❌ createProduct error:", error);
      return { success: false, message: error.message };
    }
  }
  
  async deleteProduct(productId) {
    try {
      const _id = typeof productId === "string" ? new ObjectId(productId) : productId;

      // Xóa sản phẩm chính
      const result = await this.sanpham.deleteOne({ _id });
      if (result.deletedCount === 0) {
        return { success: false, message: "Sản phẩm không tồn tại" };
      }

      // Xóa màu sắc liên quan
      await this.mausanpham.deleteMany({ masanpham: _id });

      // Xóa kích thước liên quan
      await this.kichthuoc.deleteMany({ masanpham: _id });

      // Xóa hình ảnh liên quan
      await this.hinhanhsanpham.deleteMany({ masanpham: _id });

      return { success: true, message: "Đã xóa sản phẩm và các dữ liệu liên quan" };
    } catch (error) {
      console.error("❌ deleteProduct error:", error);
      return { success: false, message: error.message };
    }
  }

  async getAllProducts() {
    try {
      const products = await this.sanpham.find({}).toArray();

      const detailedProducts = await Promise.all(
        products.map(async (product) => {
          let tentheloai = "Không rõ";

          if (ObjectId.isValid(product.theloai)) {
            const theloaiDoc = await this.theloaisanpham.findOne({
              _id: new ObjectId(product.theloai),
            });
            if (theloaiDoc?.tendanhmuc) {
              tentheloai = theloaiDoc.tendanhmuc;
            }
          }

          return {
            _id: product._id,
            tensanpham: product.tensanpham,
            giasanpham: product.giasanpham,
            mota: product.mota,
            ngaythem: product.ngaythem,
            theloai: product.theloai,
            tentheloai,
          };
        })
      );

      return detailedProducts;
    } catch (err) {
      console.error("❌ getAllProducts error:", err);
      return [];
    }
  }

  async getProductById(productId) {
    try {
      const _id = new ObjectId(productId);

      const product = await this.sanpham.findOne(
        { _id },
        {
          projection: {
            _id: 1,
            tensanpham: 1,
            mota: 1,
            giasanpham: 1,
            theloai: 1,
            trangthai: 1,
            gioitinh: 1,   // 👈 Thêm field này
          },
        }
      );
      if (!product) return null;

      // 🔹 Lấy tên danh mục
      if (product.theloai) {
        const danhMucDoc = await this.theloaisanpham.findOne(
          { _id: new ObjectId(product.theloai) },
          { projection: { tendanhmuc: 1 } }
        );
        product.tendanhmuc = danhMucDoc?.tendanhmuc || null;
      }

      // 🔹 Lấy màu sắc
      const mausanpham = await this.mausanpham.find(
        { masanpham: _id },
        { projection: { _id: 1, masanpham: 1, mau: 1 } }
      ).toArray();

      // 🔹 Lấy kích thước
      const kichthuocRaw = await this.kichthuoc.find(
        { masanpham: _id },
        { projection: { _id: 1, masanpham: 1, size: 1 } }
      ).toArray();

      const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
      const kichthuoc = kichthuocRaw.sort((a, b) => {
        const idxA = sizeOrder.indexOf(a.size.toUpperCase());
        const idxB = sizeOrder.indexOf(b.size.toUpperCase());
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      return {
        ...product,
        mausanpham,
        kichthuoc,
      };
    } catch (err) {
      console.error("❌ getProductById error:", err);
      return null;
    }
  }

  async getImagesByColor(productId, colorHex) {
    try {
      const images = await this.hinhanhsanpham.find({
        masanpham: new ObjectId(productId),
        mau: colorHex,
      }).toArray();

      return { success: true, images };
    } catch (error) {
      console.error("❌ getImagesByColor error:", error);
      return { success: false, message: error.message };
    }
  }

  async getProductByCategorySlug(slug) {
    try {
      // 1. Tìm danh mục theo slug
      const category = await this.theloaisanpham.findOne({ slug });

      if (!category) {
        return []; // Không tìm thấy danh mục
      }

      // 2. So sánh theloai = category._id (dưới dạng string)
      const result = await this.sanpham.find({
        theloai: category._id.toString()
      }).toArray();

      return result;
    } catch (error) {
      console.error("Lỗi getProductByCategorySlug:", error);
      return [];
    }
  }

  async getFullProductsByCategorySlug(slug) {
    try {
      // Bước 1: Lấy danh sách sản phẩm thô theo slug
      const rawProducts = await this.getProductByCategorySlug(slug);

      const fullProducts = [];

      for (const rawProduct of rawProducts) {
        const full = await this.getProductById(rawProduct._id.toString());

        if (full) {
          let anhdaidien = null;

          // Bước 3: Lấy màu đầu tiên để lấy ảnh
          const firstColor = full.mausanpham?.[0]?.mau;
          if (firstColor) {
            const { images } = await this.getImagesByColor(full._id, firstColor);
            anhdaidien = images?.[0] || null;
          }

          fullProducts.push({
            ...full,
            anhdaidien,
          });
        }
      }

      return fullProducts;
    } catch (error) {
      console.error("❌ getFullProductsByCategorySlug error:", error);
      return [];
    }
  }

  async getColorsByProductId(productId) {
    try {
      const colors = await this.mausanpham.find(
        { masanpham: new ObjectId(productId) },
        { projection: { _id: 1, mau: 1 } }
      ).toArray();

      return { success: true, colors };
    } catch (error) {
      console.error("❌ getColorsByProductId error:", error);
      return { success: false, message: error.message };
    }
  }

  async totalProducts() {
    try {
      const total = await this.sanpham.countDocuments();
      return total;
    } catch (error) {
      console.error("❌ [adminDashboard - ProductServer] Lỗi:", error.message);
      return 0;
    }
  }

  async getBestSellingProducts() {
    try {
      const bestProductsData = await this.chitietdonhang.aggregate([
        {
          $group: {
            _id: "$masanpham",
            tong_soluong: { $sum: "$soluong" }
          }
        },
        {
          $sort: { tong_soluong: -1 }
        },
        {
          $limit: 5
        }
      ]).toArray();

      if (bestProductsData.length === 0) return [];

      const results = await Promise.all(
        bestProductsData.map(async (item) => {
          try {
            const productId = new ObjectId(item._id); // ép kiểu nếu cần
            const product = await this.sanpham.findOne({ _id: productId });

            if (!product) return null;

            return {
              ...product,
              tong_soluong: item.tong_soluong
            };
          } catch (err) {
            console.warn("⚠️ Lỗi khi xử lý sản phẩm:", item._id, err.message);
            return null;
          }
        })
      );

      // Lọc bỏ null nếu có sản phẩm không tìm thấy
      return results.filter((p) => p !== null);
    } catch (error) {
      console.error("❌ [ProductService.getBestSellingProducts] Lỗi:", error.message);
      throw error;
    }
  }
  async updateProduct(productId, productData) {
    try {
      // Chuyển productId sang ObjectId nếu cần
      const { ObjectId } = require("mongodb");
      const _id = new ObjectId(productId);

      // Cập nhật sản phẩm chính
      const updateFields = {
        tensanpham: productData.tensanpham,
        giasanpham: productData.giasanpham,
        theloai: productData.theloai,
        mota: productData.mota,
        gioitinh: productData.gioitinh || "",
      };

      const result = await this.sanpham.updateOne(
        { _id },
        { $set: updateFields }
      );

      // Xóa kích thước cũ và insert mới
      if (Array.isArray(productData.sizes)) {
        await this.kichthuoc.deleteMany({ masanpham: _id });

        const kichthuocDocs = productData.sizes.map(size => ({
          masanpham: _id,
          size: typeof size === "string" ? size.trim() : size?.size?.trim(),
        }));

        if (kichthuocDocs.length) {
          await this.kichthuoc.insertMany(kichthuocDocs);
        }
      }

      return {
        success: true,
        message: "Cập nhật sản phẩm thành công",
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error("❌ updateProduct error:", error);
      return { success: false, message: error.message };
    }
  }

}

module.exports = ProductServer;