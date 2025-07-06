const { ObjectId } = require("mongodb");
const ProductService = require("./product.service");

class FavoriteService {
    constructor(client) {
        this.favorite = client.db().collection("yeuthich");
        this.productServer = new ProductService(client); // Khởi tạo product server
    }

    extractFavoriData(payload) {
        return {
            manguoidung: ObjectId.isValid(payload.manguoidung) ? new ObjectId(payload.manguoidung) : null,
            masanpham: ObjectId.isValid(payload.masanpham) ? new ObjectId(payload.masanpham) : null,
        };
    }


    async toggleFavorite(payload) {
        const data = this.extractFavoriData(payload);

        if (!data.manguoidung || !data.masanpham) {
            console.error("ID không hợp lệ:", payload);
            throw new Error("ID người dùng hoặc sản phẩm không hợp lệ.");
        }

        const exists = await this.favorite.findOne({
            manguoidung: data.manguoidung,
            masanpham: data.masanpham,
        });

        if (exists) {
            await this.favorite.deleteOne({
                manguoidung: data.manguoidung,
                masanpham: data.masanpham,
            });
            return { message: "Đã xóa khỏi danh sách yêu thích", toggled: true, favorited: false };
        }

        const result = await this.favorite.insertOne(data);
        return { message: "Đã thêm vào danh sách yêu thích", toggled: true, favorited: true, id: result.insertedId };
    }


    async getFavoritesByUser(userId) {
        if (!ObjectId.isValid(userId)) {
            throw new Error("UserId không hợp lệ.");
        }

        const favorites = await this.favorite.find({
            manguoidung: new ObjectId(userId),
        }).toArray();

        console.log("🟢 Số lượng yêu thích:", favorites.length);

        const result = [];

        for (const fav of favorites) {
            const productIdStr = fav.masanpham.toString();

            // Lấy chi tiết sản phẩm
            const productDetail = await this.productServer.getProductById(productIdStr);

            if (!productDetail) {
                console.warn("⚠️ Không tìm thấy sản phẩm yêu thích:", productIdStr);
                continue;
            }

            // Lấy màu đầu tiên
            const firstColor = productDetail.mausanpham?.[0]?.mau;

            let anhdaidien = null;
            if (firstColor) {
                try {
                    const imageResult = await this.productServer.getImagesByColor(productIdStr, firstColor);
                    anhdaidien = imageResult?.images?.[0] || null;
                } catch (err) {
                    console.warn("⚠️ Không lấy được ảnh theo màu:", firstColor, err.message);
                }
            }

            result.push({
                mayeuthich: fav._id,
                masanpham: fav.masanpham,
                manguoidung: fav.manguoidung,
                anhdaidien,
                ...productDetail,
            });
        }

        return result;
    }



    async isFavorite(payload) {
        const data = this.extractFavoriData(payload);
        const exists = await this.favorite.findOne({
            manguoidung: data.manguoidung,
            masanpham: data.masanpham,
        });
        return !!exists;
    }

    async checkFavorite(manguoidung, masanpham) {
        if (!ObjectId.isValid(manguoidung) || !ObjectId.isValid(masanpham)) {
            throw new Error("ID không hợp lệ.");
        }
        const exists = await this.favorite.findOne({
            manguoidung: new ObjectId(manguoidung),
            masanpham: new ObjectId(masanpham),
        });
        return !!exists;
    }

    async deleteFavoriteById(favoriteId) {
        if (!ObjectId.isValid(favoriteId)) {
            throw new Error("ID yêu thích không hợp lệ.");
        }
        const result = await this.favorite.deleteOne({ _id: new ObjectId(favoriteId) });
        if (result.deletedCount === 1) {
            return { success: true, message: "Đã xóa bản ghi yêu thích." };
        } else {
            return { success: false, message: "Không tìm thấy bản ghi yêu thích để xóa." };
        }
    }
}

module.exports = FavoriteService;
