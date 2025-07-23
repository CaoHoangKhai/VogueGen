const { ObjectId } = require("mongodb");

class SizesService {
    constructor(client) {
        this.Sizes = client.db().collection("sizesanpham");
        this.kichthuoc = client.db().collection("kichthuoc");
        this.designs = client.db().collection("designs");
    }

    async getAllSizes() {
        return await this.Sizes.find({}).toArray();
    }

    async getSizesByDesignId(designId) {
        const design = await this.designs.findOne({ _id: new ObjectId(designId) });

        if (!design || !design.masanpham) {
            return null; // hoặc throw lỗi nếu muốn
        }

        const masanpham = design.masanpham;

        const docs = await this.kichthuoc
            .find({ masanpham: new ObjectId(masanpham) })
            .project({ size: 1, _id: 0 })
            .toArray();

        return docs.map(doc => doc.size);
    }
}

module.exports = SizesService;
