const mongoose = require('mongoose');
const userModel = require('../schemas/users');

mongoose.connect('mongodb+srv://quytan27:tanquy123@db.tuqahw9.mongodb.net/NNPTUD-C6')
.then(async () => {
    const users = await userModel.find({ username: { $in: ['testchat', 'testchat2'] } }).select('username _id');
    console.log('--- DANH SÁCH USER TEST ---');
    users.forEach(u => {
        console.log(`Username: ${u.username} | ID: ${u._id}`);
    });
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
