import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder Name is required"],
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folders",
      required: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Created by is required"],
    },
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
  },
  { timestamps: true },
);

const folderModel = mongoose.model("folders", folderSchema);

export default folderModel;
