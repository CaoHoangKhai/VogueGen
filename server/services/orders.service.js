const { ObjectId } = require("mongodb");

class OrdersService {
    constructor(client) {
        this.Orders = client.db().collection("donhang");
        this.OrderDetail = client.db().collection("chitietdonhang");
    }

    extractOrdersData(payload) {
        return {
            madonhang: payload.madonhang,
            manguoidat: payload.manguoidat,
            hoten: payload.hoten,
            sodienthoai: payload.sodienthoai,
            diachinguoidung: payload.diachinguoidung,
            ghichu: payload.ghichu,
            tongtien: payload.tongtien,
            ngaydat: payload.ngaydat,
            phuongthucthanhtoan: payload.phuongthucthanhtoan,
            trangthai: payload.trangthai
        }
    }
    extractOrderDetailData(payload) {
        return {
           madonhang:payload.madonhang,
           masanpham:payload.masanpham,
           soluong:payload.soluong,
           giatien:payload.giatien
        }
    }


}