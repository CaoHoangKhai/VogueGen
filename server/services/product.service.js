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
  }

  async createProduct(productData) {
    try {
      const result = await this.sanpham.insertOne({
        tensanpham: productData.tensanpham,
        giasanpham: productData.giasanpham,
        theloai: productData.theloai,
        mota: productData.mota,
        ngaythem: productData.ngaythem,
      });

      const productId = result.insertedId;

      const mauDocs = (productData.mausanpham || []).map(mau => ({
        masanpham: productId,
        mau: mau.trim(),
      }));

      const kichthuocDocs = (productData.kichthuoc || []).map(size => ({
        masanpham: productId,
        size: typeof size === "string" ? size.trim() : size?.size?.trim(),
      }));

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
          },
        }
      );
      if (!product) return null;

      // Lấy tên danh mục
      if (product.theloai) {
        const danhMucDoc = await this.theloaisanpham.findOne(
          { _id: new ObjectId(product.theloai) },
          { projection: { tendanhmuc: 1 } }
        );
        product.tendanhmuc = danhMucDoc?.tendanhmuc || null;
      }

      // Lấy màu sắc
      const mausanpham = await this.mausanpham.find(
        { masanpham: _id },
        { projection: { _id: 1, masanpham: 1, mau: 1 } }
      ).toArray();

      // Lấy kích thước
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

}
module.exports = ProductServer;