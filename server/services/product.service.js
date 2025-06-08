const { ObjectId } = require("mongodb");
const port = require("../config").app.port;
class ProductServer {
    constructor(client) {
        this.sanpham = client.db().collection("sanpham");
        this.kichthuoc = client.db().collection("kichthuoc");
        this.mausanpham = client.db().collection("mausanpham");
        this.hinhanhsanpham = client.db().collection("hinhanhsanpham");
        this.theloaisanpham = client.db().collection("theloaisanpham");
    }

    extractProductData(payload) {
        return {
            tensanpham: payload.tensanpham || '',
            giasanpham: Number(payload.giasanpham) || 0,
            theloai: payload.theloai || '',
            mota: payload.mota || '',
            ngaythem: new Date(),
            kichthuoc: Array.isArray(payload.kichthuoc) ? payload.kichthuoc : [],
            mausanpham: Array.isArray(payload.mausanpham) ? payload.mausanpham : [],
            hinhanh: Array.isArray(payload.hinhanh) ? payload.hinhanh : [],
        }
    }

    async createProduct(payload) {
        const productData = this.extractProductData(payload);

        try {
            // 1. Tạo sản phẩm chính trong collection "sanpham"
            const result = await this.sanpham.insertOne({
                tensanpham: productData.tensanpham,
                giasanpham: productData.giasanpham,
                theloai: productData.theloai,
                mota: productData.mota,
                ngaythem: productData.ngaythem,
            });

            const productId = result.insertedId;

            // 2. Tạo danh sách màu sắc
            const mauDocs = productData.mausanpham.map(mau => ({
                masanpham: productId,
                mau: mau.trim()
            }));

            // 3. Tạo danh sách kích thước
            const kichthuocDocs = productData.kichthuoc.map(item => ({
                masanpham: productId,
                size: item.size,
                soluong: item.soluong
            }));

            // 4. Tạo danh sách hình ảnh
            const hinhanhDocs = productData.hinhanh.map(img => ({
                masanpham: productId,
                tenfile: img.tenfile
            }));

            // 5. Lưu vào các collection phụ nếu có dữ liệu
            if (mauDocs.length > 0) {
                await this.mausanpham.insertMany(mauDocs);
            }
            if (kichthuocDocs.length > 0) {
                await this.kichthuoc.insertMany(kichthuocDocs);
            }
            if (hinhanhDocs.length > 0) {
                await this.hinhanhsanpham.insertMany(hinhanhDocs);
            }

            // 6. Trả về sản phẩm đã tạo
            return {
                _id: productId,
                ...productData
            };
        } catch (error) {
            console.error("❌ Lỗi khi tạo sản phẩm:", error);
            throw error;
        }
    }


    async getProductById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                return {
                    success: false,
                    message: "ID sản phẩm không hợp lệ",
                };
            }

            const objectId = new ObjectId(id);

            const product = await this.sanpham.findOne({ _id: objectId });
            if (!product) {
                return {
                    success: false,
                    message: "Không tìm thấy sản phẩm",
                };
            }

            // Lấy tên thể loại
            if (product.theloai && ObjectId.isValid(product.theloai.toString())) {
                const theloaiObj = await this.theloaisanpham.findOne({ _id: new ObjectId(product.theloai) });
                product.tentheloai = theloaiObj?.tentheloai || "";
            } else {
                product.tentheloai = "";
            }

            // Lấy kích thước (dùng ObjectId để query)
            const kichthuoc = await this.kichthuoc.find({ masanpham: objectId }).toArray();
            product.kichthuoc = kichthuoc;

            // Lấy màu sắc (dùng ObjectId để query)
            const mausanpham = await this.mausanpham.find({ masanpham: objectId }).toArray();
            product.mausanpham = mausanpham.map(mau => mau.mau);

            // Lấy hình ảnh (dùng ObjectId để query)
            const hinhanh = await this.hinhanhsanpham.find({ masanpham: objectId }).toArray();
            product.hinhanh = hinhanh.map(img => ({
                _id: img._id, // thêm dòng này
                tenfile: img.tenfile,
                url: `http://localhost:${port}/images/${img.tenfile}`
            }));

            return {
                success: true,
                data: product,
            };
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm theo ID:", error);
            return {
                success: false,
                message: "Đã xảy ra lỗi khi truy vấn sản phẩm",
                error: error.message,
            };
        }
    }

    async updateProduct(id, payload, files) {
        try {
            // 1. Parse các trường JSON (nếu gửi dạng chuỗi)
            const kichthuoc = Array.isArray(payload.kichthuoc)
                ? payload.kichthuoc
                : JSON.parse(payload.kichthuoc || "[]");

            const mausanpham = Array.isArray(payload.mausanpham)
                ? payload.mausanpham
                : JSON.parse(payload.mausanpham || "[]");

            const hinhanhCu = Array.isArray(payload.hinhanhCu)
                ? payload.hinhanhCu
                : JSON.parse(payload.hinhanhCu || "[]");

            // 2. Cập nhật thông tin sản phẩm chính
            await this.sanpham.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        tensanpham: payload.tensanpham,
                        giasanpham: payload.giasanpham,
                        theloai: payload.theloai,
                        mota: payload.mota,
                        ngaythem: payload.ngaythem,
                    },
                }
            );

            // 3. Cập nhật màu sắc: xóa hết rồi thêm mới
            await this.mausanpham.deleteMany({ masanpham: new ObjectId(id) });

            const mauDocs = mausanpham.map(mau => ({
                masanpham: new ObjectId(id),
                mau: mau.trim(),
            }));
            if (mauDocs.length > 0) {
                await this.mausanpham.insertMany(mauDocs);
            }

            // 4. Cập nhật kích thước thông minh
            const existingSizes = await this.kichthuoc.find({ masanpham: new ObjectId(id) }).toArray();
            const existingSizeMap = new Map(existingSizes.map(s => [s.size, s]));

            const newSizeSet = new Set();

            for (const sizeObj of kichthuoc) {
                const sizeKey = sizeObj.size;
                newSizeSet.add(sizeKey);

                if (existingSizeMap.has(sizeKey)) {
                    await this.kichthuoc.updateOne(
                        { _id: existingSizeMap.get(sizeKey)._id },
                        { $set: { soluong: sizeObj.soluong } }
                    );
                } else {
                    await this.kichthuoc.insertOne({
                        masanpham: new ObjectId(id),
                        size: sizeObj.size,
                        soluong: sizeObj.soluong,
                    });
                }
            }

            for (const [oldSize, oldDoc] of existingSizeMap.entries()) {
                if (!newSizeSet.has(oldSize)) {
                    await this.kichthuoc.deleteOne({ _id: oldDoc._id });
                }
            }

            // 5. Cập nhật hình ảnh thông minh
            // Kết hợp hình ảnh cũ và hình ảnh mới (files)
            const newImages = [
                ...hinhanhCu.map(img => ({ tenfile: img.tenfile })),
                ... (Array.isArray(files) ? files.map(file => ({ tenfile: file.filename })) : [])
            ];

            // Lấy hình ảnh hiện có trong DB
            const existingImages = await this.hinhanhsanpham.find({ masanpham: new ObjectId(id) }).toArray();

            const existingImgSet = new Set(existingImages.map(img => img.tenfile));
            const newImgSet = new Set(newImages.map(img => img.tenfile));

            // Thêm hình mới chưa có trong DB
            for (const img of newImages) {
                if (!existingImgSet.has(img.tenfile)) {
                    await this.hinhanhsanpham.insertOne({
                        masanpham: new ObjectId(id),
                        tenfile: img.tenfile,
                    });
                }
            }

            // Xóa hình cũ không còn trong danh sách mới
            for (const oldImg of existingImages) {
                if (!newImgSet.has(oldImg.tenfile)) {
                    await this.hinhanhsanpham.deleteOne({ _id: oldImg._id });

                    // Nếu muốn xóa file vật lý trên server:
                    // const fs = require('fs');
                    // const path = require('path');
                    // const filePath = path.join(__dirname, 'public/images', oldImg.tenfile);
                    // fs.unlink(filePath, err => { if (err) console.error(err); });
                }
            }

            return {
                success: true,
                message: "Cập nhật sản phẩm thành công.",
            };
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
            return {
                success: false,
                message: "Cập nhật sản phẩm thất bại: " + error.message,
            };
        }
    }


    async deleteProduct(id) {
        try {
            const objectId = new ObjectId(id);
            await this.sanpham.deleteOne({ _id: objectId });
            await this.kichthuoc.deleteMany({ masanpham: id });
            await this.mausanpham.deleteMany({ masanpham: id });
            await this.hinhanhsanpham.deleteMany({ masanpham: id });

            return { message: "Đã xoá sản phẩm và dữ liệu liên quan" };
        } catch (error) {
            console.error("Lỗi xoá sản phẩm:", error);
            throw new Error("Không thể xoá sản phẩm.");
        }
    }

    async searchProductByName(name) {
        try {
            const regex = new RegExp(name, "i");
            return await this.sanpham.find({ tensanpham: { $regex: regex } }).toArray();
        } catch (error) {
            console.error("Lỗi tìm kiếm sản phẩm:", error);
            throw new Error("Không thể tìm kiếm sản phẩm.");
        }
    }

    async getCategoryNameById(theloaiId) {
        if (!theloaiId || !ObjectId.isValid(theloaiId)) return null;

        const category = await this.theloaisanpham.findOne({ _id: new ObjectId(theloaiId) });
        if (!category) return null;

        return category.tendanhmuc || null;
    }

    async getAllProducts() {
        try {
            const products = await this.sanpham.find({}).toArray();

            for (const product of products) {
                const productId = product._id.toString();

                // Lấy tên thể loại
                product.tentheloai = await this.getCategoryNameById(product.theloai);

                // Lấy kích thước
                product.kichthuoc = await this.kichthuoc.find({ masanpham: productId }).toArray();

                // Lấy màu sắc
                product.mausanpham = await this.mausanpham.find({ masanpham: productId }).toArray();

                // Lấy hình ảnh và trả về url đúng cho client
                const hinhAnhList = await this.hinhanhsanpham.find({ masanpham: productId }).toArray();
                product.hinhanh = hinhAnhList.map(img => ({
                    ...img,
                    url: img.tenfile ? `/images/${img.tenfile}` : null
                }));
            }

            return products;
        } catch (error) {
            console.error("Lỗi lấy tất cả sản phẩm:", error);
            throw new Error("Không thể lấy danh sách sản phẩm.");
        }
    }
}

module.exports = ProductServer;