const { ObjectId } = require("mongodb");

class ProductServer {
    constructor(client) {
        this.Product = client.db().collection("sanpham");
        this.Category = client.db().collection("theloaisanpham");
        this.ProductDetail = client.db().collection("chitietsanpham");
        this.ProductImage = client.db().collection("hinhanhsanpham");
    }

    // Chuẩn hóa dữ liệu đầu vào
    extractProductData(payload) {
        let theloaiObjectId = null;
        try {
            if (ObjectId.isValid(payload.theloai)) {
                theloaiObjectId = new ObjectId(payload.theloai);
            }
        } catch (err) {
            console.error("Lỗi ép kiểu ObjectId:", err);
        }

        return {
            masanpham: payload.masanpham,
            tensanpham: payload.tensanpham,
            giasanpham: parseFloat(payload.giasanpham),
            theloai: theloaiObjectId,
            mota: payload.mota,
            ngaythem: payload.ngaythem ? new Date(payload.ngaythem) : new Date(),
            soluong: parseInt(payload.soluong) || 0,
            hinhanh: payload.hinhanh || [],
            kichthuoc: payload.kichthuoc || [] // [{ size, mau, chatlieu }]
        };
    }

    // Thêm sản phẩm mới
    async createProduct(payload) {
        const data = this.extractProductData(payload);

        const result = await this.Product.insertOne({
            tensanpham: data.tensanpham,
            giasanpham: data.giasanpham,
            theloai: data.theloai,
            mota: data.mota,
            ngaythem: data.ngaythem,
            soluong: data.soluong
        });

        const insertedId = result.insertedId;

        // Thêm chi tiết sản phẩm
        if (data.kichthuoc.length > 0) {
            const details = data.kichthuoc.map(item => ({
                masanpham: insertedId,
                size: item.size,
                mau: item.mau,
                chatlieu: item.chatlieu
            }));
            await this.ProductDetail.insertMany(details);
        }

        // Thêm hình ảnh sản phẩm
        if (data.hinhanh.length > 0) {
            const images = data.hinhanh.map(img => ({
                masanpham: insertedId,
                dulieuhinhanh: img
            }));
            await this.ProductImage.insertMany(images);
        }

        return insertedId;
    }

    // Lấy thông tin sản phẩm theo ID
    // Lấy thông tin sản phẩm theo ID, bao gồm chi tiết, hình ảnh và tên danh mục
    async getProductById(id) {
        const objectId = new ObjectId(id);

        const product = await this.Product.findOne({ _id: objectId });
        if (!product) return null;

        const details = await this.ProductDetail.find({ masanpham: objectId }).toArray();
        const images = await this.ProductImage.find({ masanpham: objectId }).toArray();

        // Truy vấn tên danh mục từ collection "danhmuc"
        let tendanhmuc = null;
        if (product.theloai && ObjectId.isValid(product.theloai)) {
            const category = await this.Category.findOne({ _id: new ObjectId(product.theloai) });
            if (category) {
                tendanhmuc = category.tendanhmuc;
            }
        }

        return {
            ...product,
            chitiet: details,
            hinhanh: images,
            tendanhmuc: tendanhmuc
        };
    }


    // Cập nhật sản phẩm
    async updateProduct(id, payload) {
        const objectId = new ObjectId(id);
        const data = this.extractProductData(payload);

        await this.Product.updateOne(
            { _id: objectId },
            {
                $set: {
                    tensanpham: data.tensanpham,
                    giasanpham: data.giasanpham,
                    theloai: data.theloai,
                    mota: data.mota,
                    soluong: data.soluong,
                    ngaythem: data.ngaythem
                }
            }
        );

        // Xoá dữ liệu chi tiết cũ, thêm lại mới
        await this.ProductDetail.deleteMany({ masanpham: objectId });
        if (data.kichthuoc.length > 0) {
            const newDetails = data.kichthuoc.map(item => ({
                masanpham: objectId,
                size: item.size,
                mau: item.mau,
                chatlieu: item.chatlieu
            }));
            await this.ProductDetail.insertMany(newDetails);
        }

        // Xoá hình ảnh cũ, thêm lại mới
        await this.ProductImage.deleteMany({ masanpham: objectId });
        if (data.hinhanh.length > 0) {
            const newImages = data.hinhanh.map(img => ({
                masanpham: objectId,
                dulieuhinhanh: img
            }));
            await this.ProductImage.insertMany(newImages);
        }

        return { message: "Cập nhật thành công" };
    }

    // Xoá sản phẩm
    async deleteProduct(id) {
        const objectId = new ObjectId(id);

        await this.Product.deleteOne({ _id: objectId });
        await this.ProductDetail.deleteMany({ masanpham: objectId });
        await this.ProductImage.deleteMany({ masanpham: objectId });

        return { message: "Đã xoá sản phẩm và dữ liệu liên quan" };
    }

    // Tìm kiếm sản phẩm theo tên
    async searchProductByName(name) {
        const regex = new RegExp(name, "i");
        return await this.Product.find({ tensanpham: { $regex: regex } }).toArray();
    }

    // Lấy toàn bộ sản phẩm kèm chi tiết, hình ảnh, và tên danh mục
    async getAllProducts() {
        const products = await this.Product.find({}).toArray();

        const results = [];

        for (const product of products) {
            const productId = product._id;

            // Lấy chi tiết sản phẩm
            const details = await this.ProductDetail.find({ masanpham: productId }).toArray();

            // Lấy hình ảnh sản phẩm
            const images = await this.ProductImage.find({ masanpham: productId }).toArray();

            // Lấy tên danh mục từ theloai
            let tendanhmuc = null;
            if (product.theloai && ObjectId.isValid(product.theloai)) {
                const category = await this.Category.findOne({ _id: new ObjectId(product.theloai) });
                if (category) {
                    tendanhmuc = category.tendanhmuc;
                }
            }

            results.push({
                ...product,
                chitiet: details,
                hinhanh: images,
                tendanhmuc: tendanhmuc
            });
        }

        return results;
    }

}

module.exports = ProductServer;
