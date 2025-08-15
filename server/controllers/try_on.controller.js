const TryOnService = require("../services/try_on.service");
const MongoDB = require("../utils/mongodb.util");
const { ObjectId } = require("mongodb");

exports.addTryOnImage = async (req, res) => {
    try {
        const { manguoidung, data } = req.body;
        if (!manguoidung || !data) {
            return res.status(400).json({ error: "Missing user ID or image data" });
        }
        const tryOnService = new TryOnService(MongoDB.client);
        const insertedId = await tryOnService.addTryOnImage(manguoidung, data);
        return res.status(201).json({ id: insertedId });
    } catch (error) {
        console.error("addTryOnImage error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

exports.deleteTryOnImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const tryOnService = new TryOnService(MongoDB.client);
        const deleted = await tryOnService.deleteTryOnImage(id);
        if (!deleted) {
            return res.status(404).json({ error: "Image not found" });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error("deleteTryOnImage error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

exports.getTryOnImagesByUser = async (req, res) => {
    try {
        const { manguoidung } = req.params;
        if (!manguoidung) {
            return res.status(400).json({ error: "Missing user ID" });
        }
        const tryOnService = new TryOnService(MongoDB.client);
        const images = await tryOnService.getTryOnImageByUser(manguoidung);
        return res.json(images);
    } catch (error) {
        console.error("getTryOnImagesByUser error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
