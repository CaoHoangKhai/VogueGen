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
        try {
            // 1. Tạo sản phẩm chính
            const newProduct = await sanphamModel.create({
                tensanpham: payload.tensanpham,
                giasanpham: payload.giasanpham,
                theloai: payload.theloai,
                mota: payload.mota,
                ngaythem: payload.ngaythem,
                // Nếu có trường nào khác thì thêm ở đây
            });

            const productId = newProduct._id;

            // 2. Tạo dữ liệu màu sắc
            const mausac = Array.isArray(payload.mausanpham) ? payload.mausanpham : [];
            const mauDocs = mausac.map(mau => ({
                masanpham: productId,
                mau: mau.trim()
            }));

            // 3. Tạo dữ liệu kích thước
            const kichthuocArr = Array.isArray(payload.kichthuoc) ? payload.kichthuoc : [];
            const kichthuocDocs = kichthuocArr.map(item => ({
                masanpham: productId,
                size: item.size,
                soluong: item.soluong
            }));

            // 4. Tạo dữ liệu hình ảnh
            const hinhanhArr = Array.isArray(payload.hinhanh) ? payload.hinhanh : [];
            const hinhanhDocs = hinhanhArr.map(img => ({
                masanpham: productId,
                tenfile: img.tenfile
            }));

            // 5. Lưu màu sắc, kích thước, hình ảnh vào DB
            if (mauDocs.length > 0) {
                await mausanphamModel.insertMany(mauDocs);
            }
            if (kichthuocDocs.length > 0) {
                await kichthuocModel.insertMany(kichthuocDocs);
            }
            if (hinhanhDocs.length > 0) {
                await hinhanhModel.insertMany(hinhanhDocs);
            }

            return newProduct; // trả về sản phẩm vừa tạo
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