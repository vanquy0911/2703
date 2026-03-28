const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const userModel = require("./schemas/users");
const roleModel = require("./schemas/roles");
const { sendNewUserPassword } = require("./utils/senMailHandler");

const CSV_FILE = path.join(__dirname, "users.csv");
const MONGO_URI = "mongodb+srv://quytan27:tanquy123@db.tuqahw9.mongodb.net/NNPTUD-C6?retryWrites=true&w=majority&appName=db";

// Hàm tạo mật khẩu ngẫu nhiên 16 ký tự
function generatePassword() {
    return crypto.randomBytes(8).toString("hex"); // 16 ký tự hexa
}

async function importUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Đã kết nối MongoDB.");

        // Tìm ID của role 'user'
        let userRole = await roleModel.findOne({ name: "user" });
        if (!userRole) {
            console.log("Không tìm thấy role 'user', đang tạo mới...");
            userRole = await roleModel.create({
                name: "user",
                description: "Mặc định người dùng"
            });
        }
        const roleId = userRole._id;

        // Đọc file CSV
        const data = fs.readFileSync(CSV_FILE, "utf-8");
        const lines = data.trim().split("\n");

        for (const line of lines) {
            // Tách bằng tab hoặc khoảng trắng
            const parts = line.split(/\s+/);
            if (parts.length < 2) continue;

            const username = parts[0].trim();
            const email = parts[1].trim();
            const password = generatePassword();

            try {
                // Kiểm tra user đã tồn tại chưa
                const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
                if (existingUser) {
                    console.log(`Bỏ qua ${username} (${email}) - Đã tồn tại.`);
                    continue;
                }

                // Tạo người dùng mới
                // Mật khẩu sẽ được hash tự động nhờ pre-save hook trong schemas/users.js
                const newUser = new userModel({
                    username,
                    email,
                    password,
                    role: roleId,
                    status: true // Kích hoạt luôn
                });

                await newUser.save();
                console.log(`Đã tạo: ${username} | Pass: ${password}`);

                // Gửi email
                await sendNewUserPassword(email, username, password);
                console.log(`Đã gửi mail cho: ${email}`);
                
            } catch (err) {
                console.error(`Lỗi khi tạo ${username}:`, err.message);
            }
        }

        console.log("Hoàn thành nhập liệu.");
        process.exit();
    } catch (error) {
        console.error("Lỗi:", error.message);
        process.exit(1);
    }
}

importUsers();
