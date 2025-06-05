const { ObjectId } = require("mongodb");

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
        try {
            const tensanpham = payload.tensanpham || '';
            const giasanpham = Number(payload.giasanpham) || 0;
            const theloai = payload.theloai || '';
            const mota = payload.mota || '';
            const ngaythem = payload.ngaythem ? new Date(payload.ngaythem) : new Date();
            const kichthuoc = Array.isArray(payload.kichthuoc) ? payload.kichthuoc : [];
            const mausanpham = Array.isArray(payload.mausanpham) ? payload.mausanpham : [];
            // hinhanh là object: { colorCode: [filename, ...], ... }
            const hinhanh = typeof payload.hinhanh === "object" && payload.hinhanh !== null ? payload.hinhanh : {};

            // Thêm sản phẩm chính
            const { insertedId: productId } = await this.sanpham.insertOne({
                tensanpham,
                giasanpham,
                theloai,
                mota,
                ngaythem,
            });

            // Thêm kích thước
            if (kichthuoc.length > 0) {
                const kichThuocDocs = kichthuoc.map(kt => ({
                    masanpham: productId.toString(),
                    size: kt.size,
                    soluong: parseInt(kt.soluong || kt.quantity) || 0
                }));
                await this.kichthuoc.insertMany(kichThuocDocs);
            }

            // Thêm màu sản phẩm
            if (mausanpham.length > 0) {
                const mauDocs = mausanpham.map(ms => ({
                    masanpham: productId.toString(),
                    mau: ms.mau || ms
                }));
                await this.mausanpham.insertMany(mauDocs);
            }

            // Thêm hình ảnh
            const imageDocs = [];
            Object.entries(hinhanh).forEach(([colorCode, fileArr]) => {
                if (Array.isArray(fileArr)) {
                    fileArr.forEach(filename => {
                        imageDocs.push({
                            masanpham: productId.toString(),
                            mau: colorCode,
                            tenfile: filename
                        });
                    });
                }
            });
            if (imageDocs.length > 0) {
                await this.hinhanhsanpham.insertMany(imageDocs);
            }

            return { success: true, message: "Tạo sản phẩm thành công", productId };
        } catch (error) {
            console.error("Lỗi tạo sản phẩm:", error);
            return { success: false, message: "Không thể tạo sản phẩm", error: error.message };
        }
    }

    async getProductById(id) {
        try {
            const objectId = new ObjectId(id);

            // Lấy sản phẩm
            const product = await this.sanpham.findOne({ _id: objectId });
            if (!product) return null;

            // Lấy tên thể loại
            product.tentheloai = await this.getCategoryNameById(product.theloai);

            // Lấy danh sách kích thước
            product.kichthuoc = await this.kichthuoc.find({ masanpham: id }).toArray();

            // Lấy danh sách màu sắc
            product.mausanpham = await this.mausanpham.find({ masanpham: id }).toArray();

            // Lấy hình ảnh và gắn url truy cập
            const hinhAnhList = await this.hinhanhsanpham.find({ masanpham: id }).toArray();
            product.hinhanh = hinhAnhList.map(img => ({
                ...img,
                url: img.tenfile ? `/images/${img.tenfile}` : null
            }));

            return product;
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm theo ID:", error);
            throw new Error("Không thể lấy sản phẩm theo ID.");
        }
    }

    async updateProduct(id, payload) {
    try {
        const objectId = new ObjectId(id);
        const oldProduct = await this.getProductById(id);

        if (!oldProduct) {
            return { success: false, message: "Không tìm thấy sản phẩm để cập nhật." };
        }

        const {
            tensanpham = '',
            giasanpham = 0,
            theloai = '',
            mota = '',
            ngaythem = new Date(),
            kichthuoc = [],
            mausanpham = [],
            hinhanh = {}
        } = payload;

        // ======= CẬP NHẬT BẢNG SANPHAM =======
        const updatedFields = {};
        if (oldProduct.tensanpham !== tensanpham) updatedFields.tensanpham = tensanpham;
        if (Number(oldProduct.giasanpham) !== Number(giasanpham)) updatedFields.giasanpham = Number(giasanpham);
        if (oldProduct.theloai !== theloai) updatedFields.theloai = theloai;
        if (oldProduct.mota !== mota) updatedFields.mota = mota;

        const inputDate = new Date(ngaythem);
        if (new Date(oldProduct.ngaythem).toISOString() !== inputDate.toISOString()) {
            updatedFields.ngaythem = inputDate;
        }

        if (Object.keys(updatedFields).length > 0) {
            await this.sanpham.updateOne({ _id: objectId }, { $set: updatedFields });
        }

        // ======= CẬP NHẬT KÍCH THƯỚC =======
        const existingSizes = (oldProduct.kichthuoc || []).map(item => `${item.size}-${item.soluong}`).sort();
        const newSizes = (kichthuoc || []).map(item => `${item.size}-${parseInt(item.soluong || item.quantity) || 0}`).sort();

        if (JSON.stringify(existingSizes) !== JSON.stringify(newSizes)) {
            await this.kichthuoc.deleteMany({ masanpham: id });
            const kichThuocDocs = kichthuoc.map(kt => ({
                masanpham: id,
                size: kt.size,
                soluong: parseInt(kt.soluong || kt.quantity) || 0
            }));
            if (kichThuocDocs.length > 0) {
                await this.kichthuoc.insertMany(kichThuocDocs);
            }
        }

        // ======= CẬP NHẬT MÀU SẮC =======
        const existingColors = (oldProduct.mausanpham || []).map(ms => ms.mau).sort();
        const newColors = (mausanpham || []).map(ms => typeof ms === "string" ? ms : ms.mau).sort();

        if (JSON.stringify(existingColors) !== JSON.stringify(newColors)) {
            await this.mausanpham.deleteMany({ masanpham: id });
            const mauDocs = newColors.map(mau => ({ masanpham: id, mau }));
            if (mauDocs.length > 0) {
                await this.mausanpham.insertMany(mauDocs);
            }
        }

        // ======= CẬP NHẬT HÌNH ẢNH =======
        const oldImages = (oldProduct.hinhanh || []).map(img => `${img.mau}-${img.tenfile}`).sort();
        const newImages = [];

        Object.entries(hinhanh).forEach(([colorCode, files]) => {
            if (Array.isArray(files)) {
                files.forEach(filename => {
                    newImages.push(`${colorCode}-${filename}`);
                });
            }
        });

        newImages.sort();

        if (JSON.stringify(oldImages) !== JSON.stringify(newImages)) {
            console.log("🧼 Xoá hình ảnh cũ...");
            await this.hinhanhsanpham.deleteMany({ masanpham: id });

            const imageDocs = [];
            Object.entries(hinhanh).forEach(([colorCode, files]) => {
                if (Array.isArray(files)) {
                    files.forEach(filename => {
                        console.log(`📸 Chuẩn bị thêm ảnh: ${filename} (màu: ${colorCode})`);
                        imageDocs.push({
                            masanpham: id,
                            mau: colorCode,
                            tenfile: filename
                        });
                    });
                } else {
                    console.warn(`⚠️ Không phải mảng: hinhanh[${colorCode}] =`, files);
                }
            });

            console.log("📦 Danh sách ảnh sẽ insert:", imageDocs);

            if (imageDocs.length > 0) {
                const result = await this.hinhanhsanpham.insertMany(imageDocs);
                console.log(`✅ Đã insert ${result.length} hình ảnh.`);
            } else {
                console.warn("⚠️ Không có ảnh nào được thêm.");
            }
        }

        return { success: true, message: "Cập nhật sản phẩm thành công (nếu có thay đổi)." };

    } catch (error) {
        console.error("❌ Lỗi cập nhật sản phẩm:", error);
        return { success: false, message: "Không thể cập nhật sản phẩm", error: error.message };
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