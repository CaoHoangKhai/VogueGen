const { ObjectId } = require("mongodb");

class ProductServer {
    constructor(client) {
        this.Product = client.db().collection("sanpham");
        this.Category = client.db().collection("danhmuc");
        this.Supplier = client.db().collection("nhacungcap");
    }
    extractProductData(payload) {
        return {
            masanpham: payload.masanpham,
            tensanpham: payload.tensanpham,
            giasanpham: payload.giasanpham,
            theloai: payload.theloai,
            mota: payload.mota,
            ngaythem: payload.ngaythem,
            soluong: payload.soluong || 0,
            hinhanh: payload.hinhanh || [],
            kichthuoc: payload.kichthuoc || []
        }
    }


}

module.exports = ProductServer;