const mongoose = require("mongoose");
const roleModel = require("./schemas/roles");

mongoose.connect("mongodb://localhost:27017/NNPTUD-C6")
    .then(async () => {
        const role = await roleModel.findOne({ name: "user" });
        if (role) {
            console.log("Role ID for 'user':", role._id);
        } else {
            console.log("Role 'user' not found. You might need to seed it.");
        }
        process.exit();
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
