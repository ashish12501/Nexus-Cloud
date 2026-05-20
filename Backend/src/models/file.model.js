import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folder",
      default: null, // 'null' means the file is in the root directory
    },
    mimeType: {
      type: String,
      required: true, // e.g., 'application/pdf', 'image/jpeg'
    },
    size: {
      type: Number,
      required: true, // Size in BYTES. Crucial for your 30-40MB quota logic!
    },
    googleDriveFileId: {
      type: String,
      required: true, // The exact path/name of the blob inside your Firebase bucket
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // Prefilled for your future collaboration update
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const fileModel = mongoose.model("files", fileSchema);

export default fileModel;
