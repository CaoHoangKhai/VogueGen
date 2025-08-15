const { ObjectId } = require("mongodb");

class TryOnService {
  constructor(client) {
    this.tryOnCollection = client.db().collection("tryOnImages"); 
  }

  async addTryOnImage(manguoidung, base64Data) {
    const doc = {
      manguoidung,
      data: base64Data,
      createdAt: new Date(),
    };
    const result = await this.tryOnCollection.insertOne(doc);
    return result.insertedId;
  }

  async deleteTryOnImage(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
    const result = await this.tryOnCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async getTryOnImageByUser(manguoidung) {
    return await this.tryOnCollection.find({ manguoidung }).toArray();
  }
}

module.exports = TryOnService;
