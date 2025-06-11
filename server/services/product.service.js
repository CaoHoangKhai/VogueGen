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

    async getCategoryNameById(theloaiId) {
        try {
            // Nếu là ObjectId dạng chuỗi thì convert
            const id = typeof theloaiId === 'string' && ObjectId.isValid(theloaiId)
                ? new ObjectId(theloaiId)
                : theloaiId;

            const category = await this.theloaisanpham.findOne({ _id: id });
            return category?.tendanhmuc || null;
        } catch (error) {
            console.warn("⚠️ Không thể lấy tên thể loại:", error.message);
            return null;
        }
    }

    async getAllProducts() {
        try {
            const products = await this.sanpham.find({}).toArray();

            // Sử dụng Promise.all để xử lý song song
            const enrichedProducts = await Promise.all(products.map(async (product) => {
                const productId = product._id.toString();

                // Thể loại
                const tentheloai = await this.getCategoryNameById(product.theloai);

                // Kích thước
                const kichthuoc = await this.kichthuoc.find({ masanpham: productId }).toArray();

                // Màu sắc
                const mausanpham = await this.mausanpham.find({ masanpham: productId }).toArray();

                // Hình ảnh
                const hinhAnhList = await this.hinhanhsanpham.find({ masanpham: productId }).toArray();
                const hinhanh = hinhAnhList.map(img => ({
                    ...img,
                    url: img.tenfile ? `/images/${img.tenfile}` : null
                }));

                return {
                    ...product,
                    // tentheloai,
                    kichthuoc,
                    mausanpham,
                    hinhanh
                };
            }));

            return enrichedProducts;
        } catch (error) {
            console.error("❌ Lỗi khi lấy tất cả sản phẩm:", error);
            throw new Error("Không thể lấy danh sách sản phẩm.");
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

            // ✅ Tích hợp lấy tên thể loại
            product.tentheloai = await this.getCategoryNameById(product.theloai);

            // 🔍 Lấy kích thước
            product.kichthuoc = await this.kichthuoc.find({ masanpham: objectId }).toArray();

            // 🎨 Lấy màu sắc
            const mausanpham = await this.mausanpham.find({ masanpham: objectId }).toArray();
            product.mausanpham = mausanpham.map(mau => mau.mau);

            // 🖼️ Lấy hình ảnh (tạo URL đầy đủ)
            const hinhanh = await this.hinhanhsanpham.find({ masanpham: objectId }).toArray();
            product.hinhanh = hinhanh.map(img => ({
                _id: img._id,
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
            const objectId = new ObjectId(id);

            // 1. Parse các trường
            const kichthuoc = Array.isArray(payload.kichthuoc)
                ? payload.kichthuoc
                : JSON.parse(payload.kichthuoc || "[]");

            const mausanpham = Array.isArray(payload.mausanpham)
                ? payload.mausanpham
                : JSON.parse(payload.mausanpham || "[]");

            // Hình ảnh cũ (giữ lại)
            const hinhanhCu = payload.hinhanhCu
                ? (Array.isArray(payload.hinhanhCu) ? payload.hinhanhCu : JSON.parse(payload.hinhanhCu))
                : [];

            // Danh sách _id ảnh cần xóa
            const hinhanhXoa = payload.hinhanhXoa
                ? (Array.isArray(payload.hinhanhXoa) ? payload.hinhanhXoa : JSON.parse(payload.hinhanhXoa))
                : [];

            // 2. Cập nhật thông tin sản phẩm chính
            await this.sanpham.updateOne(
                { _id: objectId },
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

            // 3. Cập nhật màu sắc
            await this.mausanpham.deleteMany({ masanpham: objectId });
            const mauDocs = mausanpham.map(mau => ({
                masanpham: objectId,
                mau: mau.trim(),
            }));
            if (mauDocs.length > 0) {
                await this.mausanpham.insertMany(mauDocs);
            }

            // 4. Cập nhật kích thước
            await this.kichthuoc.deleteMany({ masanpham: objectId });
            const kichThuocDocs = kichthuoc.map(sizeObj => ({
                masanpham: objectId,
                size: sizeObj.size,
                soluong: sizeObj.soluong,
            }));
            if (kichThuocDocs.length > 0) {
                await this.kichthuoc.insertMany(kichThuocDocs);
            }

            // 5. Cập nhật hình ảnh
            // a. Danh sách ảnh hiện có trong DB
            const existingImages = await this.hinhanhsanpham.find({ masanpham: objectId }).toArray();
            const existingImgMap = new Map(existingImages.map(img => [img.tenfile, img]));

            // b. Danh sách ảnh cần giữ lại (ảnh cũ + ảnh upload mới)
            const newImages = [
                ...hinhanhCu.map(img => ({ tenfile: img.tenfile })),
                ...(Array.isArray(files) ? files.map(file => ({ tenfile: file.filename })) : []),
            ];
            const newImgSet = new Set(newImages.map(img => img.tenfile));

            // c. Thêm ảnh mới chưa có trong DB
            for (const img of newImages) {
                if (!existingImgMap.has(img.tenfile)) {
                    await this.hinhanhsanpham.insertOne({
                        masanpham: objectId,
                        tenfile: img.tenfile,
                    });
                }
            }

            // d. Xóa ảnh đã bị loại bỏ (theo _id)
            if (Array.isArray(hinhanhXoa) && hinhanhXoa.length > 0) {
                for (const imgId of hinhanhXoa) {
                    try {
                        await this.hinhanhsanpham.deleteOne({ _id: new ObjectId(imgId) });
                    } catch (err) {
                        console.error("Lỗi khi xóa ảnh theo _id:", imgId, err);
                    }
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
        try {
            const id = typeof theloaiId === 'string' && ObjectId.isValid(theloaiId)
                ? new ObjectId(theloaiId)
                : theloaiId;

            const query = ObjectId.isValid(id) ? { _id: id } : { _id: new ObjectId() }; // tránh lỗi
            const category = await this.theloaisanpham.findOne(query);

            return category?.tendanhmuc || null;
        } catch (error) {
            console.warn("⚠️ Không thể lấy tên thể loại:", error.message);
            return null;
        }
    }



    async getAllProducts() {
        try {
            // Lấy danh sách tất cả sản phẩm
            const products = await this.sanpham.find({}).toArray();

            // Lấy toàn bộ kích thước, màu sắc, hình ảnh một lần duy nhất
            const allKichThuoc = await this.kichthuoc.find({}).toArray();
            const allMauSac = await this.mausanpham.find({}).toArray();
            const allHinhAnh = await this.hinhanhsanpham.find({}).toArray();

            // Gộp dữ liệu theo masanpham
            const kichThuocMap = {};
            const mauSacMap = {};
            const hinhAnhMap = {};

            for (const kt of allKichThuoc) {
                const pid = kt.masanpham.toString();
                if (!kichThuocMap[pid]) kichThuocMap[pid] = [];
                kichThuocMap[pid].push(kt);
            }

            for (const mau of allMauSac) {
                const pid = mau.masanpham.toString();
                if (!mauSacMap[pid]) mauSacMap[pid] = [];
                mauSacMap[pid].push(mau.mau); // Chỉ lấy trường `mau`
            }

            for (const img of allHinhAnh) {
                const pid = img.masanpham.toString();
                if (!hinhAnhMap[pid]) hinhAnhMap[pid] = [];
                hinhAnhMap[pid].push({
                    _id: img._id,
                    tenfile: img.tenfile,
                    url: `http://localhost:${port}/images/${img.tenfile}`
                });
            }

            // Duyệt từng sản phẩm và gắn dữ liệu liên quan
            for (const product of products) {
                const productId = product._id.toString();

                // Gán tên thể loại
                product.tentheloai = await this.getCategoryNameById(product.theloai);

                // Gán kích thước
                product.kichthuoc = kichThuocMap[productId] || [];

                // Gán màu sắc
                product.mausanpham = mauSacMap[productId] || [];

                // Gán hình ảnh
                product.hinhanh = hinhAnhMap[productId] || [];
            }

            return {
                success: true,
                data: products
            };

        } catch (error) {
            console.error("Lỗi lấy tất cả sản phẩm:", error);
            return {
                success: false,
                message: "Không thể lấy danh sách sản phẩm.",
                error: error.message
            };
        }
    }
}

module.exports = ProductServer;