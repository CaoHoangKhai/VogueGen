const { ObjectId } = require("mongodb");

class SizesService {
    constructor(client) {
        this.Sizes = client.db().collection("sizesanpham");
    }

    async getAllSizes() {
        return await this.Sizes.find({}).toArray();
    }
}

// {
//   "_id": {
//     "$oid": "683fda79e5356aeab20e2bfd"
//   },
//   "size": "One-Size"
// }
module.exports = SizesService;
