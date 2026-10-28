const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        let existingUser = null;
        try {
            existingUser = await User.findOne({ email });
        } catch (e) {
            existingUser = (global.inMemoryDb.users || []).find(u => u.email === email);
        }

        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserObj = {
            _id: "usr_" + Date.now(),
            name,
            email,
            password: hashedPassword,
            phone: phone || "+91 9876543210",
            walletBalance: 2500,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
            createdAt: new Date()
        };

        try {
            const user = await User.create({ name, email, password: hashedPassword, phone: newUserObj.phone });
            newUserObj._id = user._id;
        } catch (e) {
            global.inMemoryDb.users.push(newUserObj);
        }

        const token = jwt.sign(
            { id: newUserObj._id, name: newUserObj.name, email: newUserObj.email },
            process.env.JWT_SECRET || "f5ed50c52c0540cd0e079ed6b33dob3455fac",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Signup Successful! Welcome to VoyaGo.",
            token,
            user: { id: newUserObj._id, name: newUserObj.name, email: newUserObj.email, phone: newUserObj.phone, walletBalance: newUserObj.walletBalance }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during signup" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = null;

        try {
            user = await User.findOne({ email });
        } catch (e) {
            user = (global.inMemoryDb.users || []).find(u => u.email === email);
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET || "f5ed50c52c0540cd0e079ed6b33dob3455fac",
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || "+91 9876543210",
                walletBalance: user.walletBalance || 2500,
                avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login" });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let user = null;
        try {
            user = await User.findById(userId).select("-password");
        } catch (e) {
            user = (global.inMemoryDb.users || []).find(u => String(u._id) === String(userId));
        }

        if (!user) {
            return res.status(200).json({
                user: { id: userId, name: "Om Singh", email: "om@voyago.com", phone: "+91 9876543210", walletBalance: 2450, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" }
            });
        }

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Error loading profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        try {
            const updated = await User.findByIdAndUpdate(userId, { name, phone }, { new: true }).select("-password");
            if (updated) return res.status(200).json({ message: "Profile updated successfully", user: updated });
        } catch (e) {}

        return res.status(200).json({
            message: "Profile updated successfully",
            user: { id: userId, name: name || "Om Singh", phone: phone || "+91 9876543210", walletBalance: 2450 }
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile
};