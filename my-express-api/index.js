const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

const app = express();
app.use(express.json()); // Giúp đọc được dữ liệu JSON gửi lên

// 1. KẾT NỐI DATABASE MONGODB
// Thay 'mongodb://127.0.0.1:27017/db_buoi5' bằng link của bạn nếu dùng MongoDB Atlas
mongoose.connect('mongodb://127.0.0.1:27017/db_buoi5')
    .then(() => console.log('✅ Kết nối MongoDB thành công!'))
    .catch(err => console.log('❌ Lỗi kết nối MongoDB:', err));

// ==========================================
// YÊU CẦU 1: CRUD 
// ==========================================

// Create User
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) { res.status(400).json(err); }
});

// Get All Users (Có query theo username - includes)
app.get('/users', async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.query.username) {
            query.username = { $regex: req.query.username, $options: 'i' };
        }
        const users = await User.find(query).populate('role');
        res.status(200).json(users);
    } catch (err) { res.status(500).json(err); }
});

// Get User by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
        if (!user) return res.status(404).json("Không tìm thấy user");
        res.status(200).json(user);
    } catch (err) { res.status(500).json(err); }
});

// Update User
app.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false }, 
            req.body, { new: true }
        );
        res.status(200).json(user);
    } catch (err) { res.status(500).json(err); }
});

// Delete User (Xoá mềm)
app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.status(200).json("Đã xoá mềm user");
    } catch (err) { res.status(500).json(err); }
});

// ==========================================
// YÊU CẦU 2 & 3: ENABLE / DISABLE USER
// ==========================================

app.post('/enable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: true }, { new: true }
        );
        if (!user) return res.status(404).json("Thông tin sai hoặc user không tồn tại");
        res.status(200).json({ message: "Đã enable user", user });
    } catch (err) { res.status(500).json(err); }
});

app.post('/disable', async (req, res) => {
    try {
        const { email, username } = req.body;
        const user = await User.findOneAndUpdate(
            { email, username, isDeleted: false },
            { status: false }, { new: true }
        );
        if (!user) return res.status(404).json("Thông tin sai hoặc user không tồn tại");
        res.status(200).json({ message: "Đã disable user", user });
    } catch (err) { res.status(500).json(err); }
});

// ==========================================
// YÊU CẦU 4: LẤY USER THEO ROLE ID
// ==========================================

app.get('/roles/:id/users', async (req, res) => {
    try {
        const roleId = req.params.id;
        const users = await User.find({ role: roleId, isDeleted: false }).populate('role');
        res.status(200).json(users);
    } catch (err) { res.status(500).json(err); }
});

// 2. KHỞI ĐỘNG SERVER
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});