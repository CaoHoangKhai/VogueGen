const { ObjectId } = require("mongodb");
function toSlug(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}
class DesignService {
    constructor(client) {
        this.design = client.db().collection("designs");
        this.theloaisanpham = client.db().collection("theloaisanpham");
        this.nguoidung = client.db().collection("nguoidung");
        this.mauthietke = client.db().collection("mauthietke");
    }

    async createDesign({ manguoidung, theloai }) {
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");
        if (!ObjectId.isValid(theloai)) throw new Error("ID thể loại không hợp lệ.");

        // Kiểm tra người dùng có tồn tại không
        const user = await this.nguoidung.findOne({ _id: new ObjectId(manguoidung) });
        if (!user) {
            return {
                success: false,
                message: "Vui lòng đăng ký để sử dụng tính năng thiết kế."
            };
        }

        // Kiểm tra thể loại có tồn tại không
        const category = await this.theloaisanpham.findOne({ _id: new ObjectId(theloai) });
        if (!category) {
            return {
                success: false,
                message: "Thể loại không tồn tại. Vui lòng chọn thể loại hợp lệ."
            };
        }

        const designData = {
            manguoidung: new ObjectId(manguoidung),
            theloai: new ObjectId(theloai),
            ngaytao: new Date()
        };

        const result = await this.design.insertOne(designData);

        // Tạo link giống getDesignByUser
        const slugPrefix = category?.tendanhmuc ? toSlug(category.tendanhmuc) : "san-pham";
        const originalId = result.insertedId.toString();
        const link = `${slugPrefix}/${originalId}`;

        // Cập nhật trường link vào document vừa tạo
        await this.design.updateOne(
            { _id: result.insertedId },
            { $set: { link: link } }
        );

        return {
            success: true,
            message: "Khởi tạo thiết kế thành công.",
            id: result.insertedId,
            link
        };
    }

    async getDesignsByUser(manguoidung) {
        if (!ObjectId.isValid(manguoidung)) throw new Error("ID người dùng không hợp lệ.");

        const designs = await this.design.find({ manguoidung: new ObjectId(manguoidung) }).toArray();

        for (const design of designs) {
            // Lấy thông tin thể loại
            const theloai = await this.theloaisanpham.findOne({ _id: design.theloai });
            design.theloai_info = theloai || null;

            // Tạo slug từ tên danh mục
            const slugPrefix = theloai?.tendanhmuc ? toSlug(theloai.tendanhmuc) : "san-pham";

            // Lấy danh sách ảnh mẫu từ collection mauthietke theo theloai
            const mauThietKeArr = await this.mauthietke
                .find({ theloai: design.theloai })
                .toArray();

            // Sắp xếp theo position: front → back → others
            mauThietKeArr.sort((a, b) => {
                const priority = { front: 1, back: 2 };
                return (priority[a.position] || 3) - (priority[b.position] || 3);
            });

            // Gắn link đường dẫn ảnh
            design.hinhanh_mau = mauThietKeArr.map(mau => {
                const fileName = mau.duongdan || mau.hinhanh || mau.anhthietke || null;
                return fileName ? `http://localhost:4000/images/designs/${slugPrefix}/${fileName}` : null;
            });
        }

        return designs;
    }

    async getDesignById(designId) {
        if (!ObjectId.isValid(designId)) throw new Error("ID thiết kế không hợp lệ.");

        const design = await this.design.findOne({ _id: new ObjectId(designId) });
        if (!design) return null;

        // Lấy thông tin thể loại
        const theloai = await this.theloaisanpham.findOne({ _id: design.theloai });
        design.theloai_info = theloai || null;

        // Tạo slug từ tên danh mục
        const slugPrefix = theloai?.tendanhmuc ? toSlug(theloai.tendanhmuc) : "san-pham";

        // Lấy danh sách ảnh mẫu từ collection mauthietke theo theloai
        const mauThietKeArr = await this.mauthietke
            .find({ theloai: design.theloai })
            .toArray();

        mauThietKeArr.sort((a, b) => {
            const priority = { front: 1, back: 2 };
            return (priority[a.position] || 3) - (priority[b.position] || 3);
        });

        design.hinhanh_mau = mauThietKeArr.map(mau => {
            const fileName = mau.duongdan || mau.hinhanh || mau.anhthietke || mau.designImage || null;
            return fileName
                ? {
                    url: `http://localhost:4000/images/designs/${slugPrefix}/${fileName}`,
                    position: mau.position || null
                }
                : null;
        }).filter(Boolean);

        return design;

    }
}

module.exports = DesignService;