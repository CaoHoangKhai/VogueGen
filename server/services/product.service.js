const { ObjectId } = require("mongodb");

class ProductServer {
    constructor(client) {
        this.SanPham = client.db().collection("sanpham");
        this.KichThuoc = client.db().collection("kichthuoc");
        this.MauSanPham = client.db().collection("mausanpham");
        this.HinhAnh = client.db().collection("hinhanhsanpham");
        this.TheLoai = client.db().collection("theloaisanpham");
    }

    extractProductData(payload) {
        return {
            tensanpham: payload.tensanpham || '',
            giasanpham: Number(payload.giasanpham) || 0,  // Chuyển string sang number
            theloai: payload.theloai || '',
            mota: payload.mota || '',
            ngaythem: new Date(),  // hoặc lấy từ payload nếu có
            kichthuoc: Array.isArray(payload.kichthuoc) ? payload.kichthuoc : [],
            mau: Array.isArray(payload.mau) ? payload.mau : [], // chú ý trường mau
            hinhanh: Array.isArray(payload.hinhanh) ? payload.hinhanh : [],
        }
    }

    async createProduct(payload) {
        console.log("Payload nhận được từ client:", payload);

        try {
            const data = this.extractProductData(payload);
            console.log("Dữ liệu đã chuẩn hóa:", data);

            // Thêm sản phẩm chính vào SanPham
            const { insertedId: productId } = await this.SanPham.insertOne({
                tensanpham: data.tensanpham,
                giasanpham: data.giasanpham,
                theloai: data.theloai,
                mota: data.mota,
                ngaythem: data.ngaythem,
            });
            console.log("ID sản phẩm mới:", productId.toString());

            // Thêm kích thước nếu có
            if (data.kichthuoc.length > 0) {
                const kichThuocDocs = data.kichthuoc.map(kt => ({
                    MaSanPham: productId.toString(),
                    Size: kt.size,
                    SoLuong: parseInt(kt.soluong) || 0
                }));
                console.log("Dữ liệu kichthuoc sẽ insert:", kichThuocDocs);
                await this.KichThuoc.insertMany(kichThuocDocs);
            }

            // Thêm màu sản phẩm nếu có
            if (data.mau.length > 0) {
                const mauDocs = data.mau.map(ms => ({
                    masanpham: productId.toString(),
                    mau: ms
                }));
                console.log("Dữ liệu mausanpham sẽ insert:", mauDocs);
                await this.MauSanPham.insertMany(mauDocs);
            } else {
                console.log("Mảng màu rỗng, không thêm màu sản phẩm.");
            }

            // Thêm hình ảnh nếu có
            if (data.hinhanh.length > 0) {
                const imageDocs = data.hinhanh.map(img => ({
                    MaSanPham: productId.toString(),
                    DuLieuHinhAnh: img.duongdan || img.url
                }));
                console.log("Dữ liệu hình ảnh sẽ insert:", imageDocs);
                await this.HinhAnh.insertMany(imageDocs);
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
            const product = await this.SanPham.findOne({ _id: objectId });
            if (!product) return null;

            let tenTheLoai = null;
            if (product.TheLoai && ObjectId.isValid(product.TheLoai)) {
                const theloai = await this.TheLoai.findOne({ _id: new ObjectId(product.TheLoai) });
                tenTheLoai = theloai?.TenTheLoai || theloai?.tendanhmuc || null;
            }

            const kichthuocList = await this.KichThuoc.find({ MaSanPham: id }).toArray();
            const mausanphamList = await this.MauSanPham.find({ MaSanPham: id }).toArray();
            const hinhAnhList = await this.HinhAnh.find({ MaSanPham: objectId }).toArray();

            return {
                ...product,
                tentheloai: tenTheLoai,
                kichthuoc: kichthuocList,
                mausanpham: mausanphamList,
                hinhanh: hinhAnhList
            };
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
            throw new Error("Không thể lấy sản phẩm.");
        }
    }

    async updateProduct(id, payload) {
        try {
            const objectId = new ObjectId(id);
            const data = this.extractProductData(payload);

            await this.SanPham.updateOne(
                { _id: objectId },
                {
                    $set: {
                        TenSanPham: data.tensanpham,
                        GiaSanPham: data.giasanpham,
                        TheLoai: data.theloai,
                        MoTa: data.mota,
                        NgayThem: data.ngaythem,
                    }
                }
            );

            await this.KichThuoc.deleteMany({ MaSanPham: id });
            if (data.kichthuoc.length > 0) {
                const kichThuocDocs = data.kichthuoc.map(kt => ({
                    MaSanPham: id,
                    Size: kt.size,
                    SoLuong: parseInt(kt.soluong) || 0
                }));
                await this.KichThuoc.insertMany(kichThuocDocs);
            }

            await this.MauSanPham.deleteMany({ MaSanPham: id });
            if (data.mausanpham.length > 0) {
                const mauDocs = data.mausanpham.map(ms => ({
                    MaSanPham: id,
                    Mau: ms.mau
                }));
                await this.MauSanPham.insertMany(mauDocs);
            }

            await this.HinhAnh.deleteMany({ MaSanPham: objectId });
            if (data.hinhanh.length > 0) {
                const imageDocs = data.hinhanh.map(img => ({
                    MaSanPham: objectId,
                    DuLieuHinhAnh: img.duongdan || img.url
                }));
                await this.HinhAnh.insertMany(imageDocs);
            }

            return { message: "Cập nhật sản phẩm thành công" };
        } catch (error) {
            console.error("Lỗi cập nhật sản phẩm:", error);
            throw new Error("Không thể cập nhật sản phẩm.");
        }
    }

    async deleteProduct(id) {
        try {
            const objectId = new ObjectId(id);
            await this.SanPham.deleteOne({ _id: objectId });
            await this.KichThuoc.deleteMany({ MaSanPham: id });
            await this.MauSanPham.deleteMany({ MaSanPham: id });
            await this.HinhAnh.deleteMany({ MaSanPham: objectId });

            return { message: "Đã xoá sản phẩm và dữ liệu liên quan" };
        } catch (error) {
            console.error("Lỗi xoá sản phẩm:", error);
            throw new Error("Không thể xoá sản phẩm.");
        }
    }

    async searchProductByName(name) {
        try {
            const regex = new RegExp(name, "i");
            return await this.SanPham.find({ TenSanPham: { $regex: regex } }).toArray();
        } catch (error) {
            console.error("Lỗi tìm kiếm sản phẩm:", error);
            throw new Error("Không thể tìm kiếm sản phẩm.");
        }
    }

    async getCategoryNameById(theloaiId) {
        if (!theloaiId || !ObjectId.isValid(theloaiId)) return null;

        const category = await this.TheLoai.findOne({ _id: new ObjectId(theloaiId) });
        if (!category) return null;

        return category.tendanhmuc || null;
    }

    async getAllProducts() {
        try {
            const products = await this.SanPham.find({}).toArray();

            for (const product of products) {
                const productId = product._id.toString();

                // Lấy tên thể loại qua hàm tái sử dụng
                product.tentheloai = await this.getCategoryNameById(product.theloai);

                // Lấy danh sách kích thước
                product.kichthuoc = await this.KichThuoc.find({ MaSanPham: productId }).toArray();

                // Lấy danh sách màu sắc
                product.mausanpham = await this.MauSanPham.find({ MaSanPham: productId }).toArray();

                // Lấy danh sách hình ảnh
                product.hinhanh = await this.HinhAnh.find({ MaSanPham: product._id }).toArray();
            }

            return products;
        } catch (error) {
            console.error("Lỗi lấy tất cả sản phẩm:", error);
            throw new Error("Không thể lấy danh sách sản phẩm.");
        }
    }


}

module.exports = ProductServer;
