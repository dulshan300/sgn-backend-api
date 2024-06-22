const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.updateOrCreate = async function (email, userData) {
    const existingUser = await this.findOne({ email });

    if (existingUser) {
        // Update the existing user
        Object.assign(existingUser, userData);
        await existingUser.save(); // This will trigger the pre-save hook
        return existingUser;
    } else {
        // Create a new user
        const newUser = new this({ email, ...userData });
        await newUser.save(); // This will trigger the pre-save hook
        return newUser;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;