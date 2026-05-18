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
});

const userModal = mongoose.model("user", userSchema);
export default userModal;
