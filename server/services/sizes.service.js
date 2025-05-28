const { ObjectId } = require("mongodb");

class SizesService {
    constructor(client) {
        this.Sizes = client.db().collection("sizesanpham");
    }

    async getAllSizes() {
        return await this.Sizes.find({}).toArray();
    }
}

module.exports = SizesService;
