const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Cấu hình CORS phù hợp cho Postman hoặc client
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.io đã sẵn sàng.");

    const jwt = require("jsonwebtoken");
    const secret = "secret"; // Secret từ authHandler.js

    // Middleware xác thực Token
    io.use((socket, next) => {
        const token = socket.handshake.query.token;
        if (!token) {
            return next(new Error("Xác thực thất bại: Thiếu Token"));
        }
        try {
            const decoded = jwt.verify(token, secret);
            socket.userId = decoded.id; // Gắn userId vào socket
            next();
        } catch (err) {
            next(new Error("Xác thực thất bại: Token không hợp lệ"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId;
        if (userId) {
            console.log(`Người dùng ${userId} đã kết nối an toàn (Socket ID: ${socket.id})`);
            socket.join(userId);
        }

        socket.on("disconnect", () => {
            if (userId) {
                console.log(`Người dùng ${userId} đã ngắt kết nối`);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io chưa được khởi tạo!");
    }
    return io;
};

module.exports = { initSocket, getIO };
