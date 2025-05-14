const {ObjectId} = require("mongodb");
const { patch } = require("../app");

class AuthService {
    constructor(client){
        this.Auth = client.db().collection("DOCGIA");
    }
    extractAuthData(payload){
        return{
            id: payload.id,
            hoten:payload.hoten,
            sodienthoai: payload.sodienthoai,
            matkhau:payload.matkhau,
            email:payload.email,
            vaitro_id: payload.vaitro_id,
            trangthai_id:payload.trangthai_id
        };
    }

    async signup(payload){
        const user = this.extractAuthData(payload);

        const emailDaTonTai = await this.checkEmail(user.email);
        if(emailDaTonTai){
            throw new Error("Email đã được đăng ký.");
        }

        const soDienThoaiDaTonTai = await this.checkSoDienThoai(user.sodienthoai);
        if(soDienThoaiDaTonTai){
            throw new Error ("Số điện thoại đã được đăng ký");
        }

        const result = await this.Auth.insertOne(user);
        return result.insertedId;
    }

    async checkEmail(email){
        return await this.Auth.findOne({email});
    }

    async checkSoDienThoai(sodienthoai){
        return await this.Auth.findOne({sodienthoai});
    }

}

module.exports = AuthService;