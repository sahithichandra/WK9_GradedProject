import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: "https://example.com/default-profile-image.png",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;