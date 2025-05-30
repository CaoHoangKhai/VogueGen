const { ObjectId } = require("mongodb");

class ProductServer {
    constructor(client) {
        this.SanPham = client.db().collection("sanpham");
        this.TheLoai = client.db().collection("theloaisanpham");
        this.KichThuoc = client.db().collection("chitietsanpham");
        this.MauSanPham = client.db().collection("mausanpham");
        this.ChiTietSanPham = client.db().collection("chitietsanpham");
        this.HinhAnhSanPham = client.db().collection("hinhanhsanpham");
    }

    extractProductData(payload) {
        return {
            tensanpham: payload.tensanpham,
            giasanpham: parseFloat(payload.giasanpham) || 0,
            theloai: payload.theloai,
            mota: payload.mota || "",
            ngaythem: payload.ngaythem ? new Date(payload.ngaythem) : new Date(),
            kichthuoc: Array.isArray(payload.kichthuoc) ? payload.kichthuoc : [],
            mau: Array.isArray(payload.mau) ? payload.mau : [],
            hinhanh: Array.isArray(payload.hinhanh) ? payload.hinhanh : []
        };
    }

    async createProduct(payload) {
        const data = this.extractProductData(payload);

        const productResult = await this.SanPham.insertOne({
            tensanpham: data.tensanpham,
            giasanpham: data.giasanpham,
            theloai: data.theloai,
            mota: data.mota,
            ngaythem: data.ngaythem
        });

        const insertedProductId = productResult.insertedId;

        const kichThuocIdMap = {};
        for (const kt of data.kichthuoc) {
            let kichThuoc = await this.KichThuoc.findOne({ Size: kt.size });
            if (!kichThuoc) {
                const result = await this.KichThuoc.insertOne({
                    Size: kt.size,
                    SoLuong: parseInt(kt.soluong) || 0
                });
                kichThuocIdMap[kt.size] = result.insertedId;
            } else {
                kichThuocIdMap[kt.size] = kichThuoc._id;
            }
        }

        const mauIdMap = {};
        for (const mau of data.mau) {
            let mauDoc = await this.MauSanPham.findOne({ Mau: mau });
            if (!mauDoc) {
                const result = await this.MauSanPham.insertOne({ Mau: mau });
                mauIdMap[mau] = result.insertedId;
            } else {
                mauIdMap[mau] = mauDoc._id;
            }
        }

        const chiTietDocs = [];
        for (const kt of data.kichthuoc) {
            for (const mau of data.mau) {
                chiTietDocs.push({
                    MaSanPham: insertedProductId,
                    MaKichThuoc: kichThuocIdMap[kt.size],
                    MaMauSanPham: mauIdMap[mau],
                    ChatLieu: kt.chatlieu || "Không rõ"
                });
            }
        }
        if (chiTietDocs.length > 0) {
            await this.ChiTietSanPham.insertMany(chiTietDocs);
        }

        if (data.hinhanh.length > 0) {
            const imageDocs = data.hinhanh.map(img => ({
                MaSanPham: insertedProductId,
                DuLieuHinhAnh: img
            }));
            await this.HinhAnhSanPham.insertMany(imageDocs);
        }

        return insertedProductId;
    }

    async getProductById(id) {
        const objectId = new ObjectId(id);
        const product = await this.SanPham.findOne({ _id: objectId });
        if (!product) return null;

        const details = await this.ChiTietSanPham.find({ MaSanPham: objectId }).toArray();
        const images = await this.HinhAnhSanPham.find({ MaSanPham: objectId }).toArray();

        let tenTheLoai = null;
        if (product.theloai && ObjectId.isValid(product.theloai)) {
            const category = await this.TheLoai.findOne({ _id: new ObjectId(product.theloai) });
            if (category) tenTheLoai = category.TenTheLoai;
        }

        return {
            ...product,
            chitiet: details,
            hinhanh: images,
            tentheloai: tenTheLoai
        };
    }

    async updateProduct(id, payload) {
        const objectId = new ObjectId(id);
        const data = this.extractProductData(payload);

        await this.SanPham.updateOne(
            { _id: objectId },
            {
                $set: {
                    tensanpham: data.tensanpham,
                    giasanpham: data.giasanpham,
                    theloai: data.theloai,
                    mota: data.mota,
                    ngaythem: data.ngaythem
                }
            }
        );

        const kichThuocIdMap = {};
        for (const kt of data.kichthuoc) {
            let kichThuoc = await this.KichThuoc.findOne({ Size: kt.size });
            if (!kichThuoc) {
                const result = await this.KichThuoc.insertOne({
                    Size: kt.size,
                    SoLuong: parseInt(kt.soluong) || 0
                });
                kichThuocIdMap[kt.size] = result.insertedId;
            } else {
                kichThuocIdMap[kt.size] = kichThuoc._id;
            }
        }

        const mauIdMap = {};
        for (const mau of data.mau) {
            let mauDoc = await this.MauSanPham.findOne({ Mau: mau });
            if (!mauDoc) {
                const result = await this.MauSanPham.insertOne({ Mau: mau });
                mauIdMap[mau] = result.insertedId;
            } else {
                mauIdMap[mau] = mauDoc._id;
            }
        }

        await this.ChiTietSanPham.deleteMany({ MaSanPham: objectId });
        const chiTietDocs = [];
        for (const kt of data.kichthuoc) {
            for (const mau of data.mau) {
                chiTietDocs.push({
                    MaSanPham: objectId,
                    MaKichThuoc: kichThuocIdMap[kt.size],
                    MaMauSanPham: mauIdMap[mau],
                    ChatLieu: kt.chatlieu || "Không rõ"
                });
            }
        }
        if (chiTietDocs.length > 0) {
            await this.ChiTietSanPham.insertMany(chiTietDocs);
        }

        await this.HinhAnhSanPham.deleteMany({ MaSanPham: objectId });
        if (data.hinhanh.length > 0) {
            const imageDocs = data.hinhanh.map(img => ({
                MaSanPham: objectId,
                DuLieuHinhAnh: img
            }));
            await this.HinhAnhSanPham.insertMany(imageDocs);
        }

        return { message: "Cập nhật sản phẩm thành công" };
    }

    async deleteProduct(id) {
        const objectId = new ObjectId(id);
        await this.SanPham.deleteOne({ _id: objectId });
        await this.ChiTietSanPham.deleteMany({ MaSanPham: objectId });
        await this.HinhAnhSanPham.deleteMany({ MaSanPham: objectId });

        return { message: "Đã xoá sản phẩm và các dữ liệu liên quan" };
    }

    async searchProductByName(name) {
        const regex = new RegExp(name, "i");
        return await this.SanPham.find({ tensanpham: { $regex: regex } }).toArray();
    }

    async getCategoryNameById(theloaiId) {
        if (!theloaiId || !ObjectId.isValid(theloaiId)) return null;

        const category = await this.TheLoai.findOne({ _id: new ObjectId(theloaiId) });
        if (!category) return null;

        return category.tendanhmuc || null;  // Hoặc trường tên thể loại đúng trong DB
    }

    async getAllProducts() {
        const products = await this.SanPham.find({}).toArray();

        for (const product of products) {
            product.theloai = await this.getCategoryNameById(product.theloai);

            const productId = product._id;

            const images = await this.HinhAnhSanPham.find({ MaSanPham: productId }).toArray();
            product.hinhanh = images;

            const details = await this.ChiTietSanPham.find({ MaSanPham: productId }).toArray();

            for (let i = 0; i < details.length; i++) {
                const chiTiet = details[i];
                if (chiTiet.MaKichThuoc && ObjectId.isValid(chiTiet.MaKichThuoc)) {
                    const kichThuoc = await this.KichThuoc.findOne({ _id: new ObjectId(chiTiet.MaKichThuoc) });
                    if (kichThuoc) {
                        details[i].kichthuoc = kichThuoc.Size;
                        details[i].soluong = kichThuoc.SoLuong;
                    }
                }
            }

            product.chitiet = details;
        }

        return products;
    }

}

module.exports = ProductServer;
