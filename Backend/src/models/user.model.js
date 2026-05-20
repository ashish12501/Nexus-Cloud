import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username should be unique"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Must be unique"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  totalSpace: {
    type: Number,
    default: 52428800, // 50MB in bytes
  },
  usedSpace: {
    type: Number,
    default: 0,
  },
});

const userModal = mongoose.model("user", userSchema);
export default userModal;
