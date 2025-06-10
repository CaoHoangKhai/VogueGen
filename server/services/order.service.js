const { ObjectId } = require("mongodb");

class OrderService {
    constructor(client) {
        this.donhang = client.db().collection("donhang");
        this.chitietdonhang = client.db().collection("chitietdonhang");
    }

    extractOrderData(payload) {
        return {
            manguoidung: payload.manguoidung,
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            diachinguoidung: payload.diachinguoidung,
            ghichu: payload.ghichu,
            tongtien: payload.tongtien,
            ngaydat: new Date(),
            phuongthucthanhtoan: payload.phuongthucthanhtoan,
            trangthai: 1
        };
    }
    extractOrderDetailData(payload) {
        return {
            madonhang: payload.madonhang,
            masanpham: payload.masanpham,
            tensanpham: payload.tensanpham,
            soluong: payload.soluong,
            giaban: payload.giaban,
        }
    }
}