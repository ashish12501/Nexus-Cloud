import mongoose from "mongoose";
import fileModel from "../models/file.model.js";
import folderModel from "../models/folder.model.js";
import userModel from "../models/user.model.js";
import { drive } from "../config/google.config.js";
import { v4 as uuidv4 } from "uuid";
import stream from "stream";
import config from "../config/config.js";

export async function createFolder(req, res) {
  const { name, parentFolder } = req.body;
  try {
    const folder = await folderModel.create({
      name,
      parentFolder: parentFolder || null,
      createdBy: req.user.id,
    });
    res.status(201).json({
      message: "folder created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "could not create folder",
      errror: err,
    });
  }
}

export async function getFilesAndFolder(req, res) {
  try {
    // If the frontend passes "root" or nothing, we query for null
    let targetFolder = req.params.folderId;
    if (!targetFolder || targetFolder === "root") {
      targetFolder = null;
    }

    // Run both database queries simultaneously for better performance
    const [folders, files] = await Promise.all([
      folderModel.find({ createdBy: req.user.id, parentFolder: targetFolder }),
      fileModel.find({ createdBy: req.user.id, parentFolder: targetFolder }),
    ]);

    res.status(200).json({
      message: "Directory contents fetched",
      data: { folders, files },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch directory", error: error.message });
  }
}

export async function uploadFiles(req, res) {
  try {
    // 1. Determine your MongoDB parent folder mapping
    let targetFolder = req.body.folderId;
    if (targetFolder === "root" || !targetFolder || targetFolder === "null") {
      targetFolder = null;
    }

    const uploadedFilesData = [];
    let totalUploadedSize = 0;

    // 2. Process files concurrently
    await Promise.all(
      req.files.map(async (file) => {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;

        // Convert Multer Buffer into a Readable Stream for Google Drive
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        // 3. Upload to Google Drive
        const driveResponse = await drive.files.create({
          requestBody: {
            name: uniqueFilename,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // The folder we setup in Step 2
          },
          media: {
            mimeType: file.mimetype,
            body: bufferStream,
          },
          // Ask Google to return the file ID and the webViewLink
          fields: "id, webViewLink, webContentLink",
        });

        // 4. Save metadata to MongoDB
        const newFile = await fileModel.create({
          name: file.originalname,
          parentFolder: targetFolder,
          mimeType: file.mimetype,
          size: file.size,
          // Store the Google Drive File ID instead of the Firebase path
          googleDriveFileId: driveResponse.data.id,
          createdBy: req.user.id,
        });

        uploadedFilesData.push({
          ...newFile._doc,
          previewLink: driveResponse.data.webViewLink, // Optional: useful for frontend
        });
        totalUploadedSize += file.size;
      }),
    );

    // 5. Deduct quota using your User model
    await userModel.findByIdAndUpdate(req.user.id, {
      $inc: { usedSpace: totalUploadedSize },
    });

    res.status(201).json({
      message: `${req.files.length} file(s) uploaded successfully`,
      data: uploadedFilesData,
    });
  } catch (error) {
    console.error("Google Drive Upload Error:", error);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
}

export async function streamFile(req, res) {
  try {
    // 1. Find the file in MongoDB to get the Google Drive ID and MimeType
    const file = await fileModel.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found in database" });
    }

    // Security Check: Make sure the user requesting the file actually owns it
    // (Assuming you want to restrict access to the owner)
    if (file.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this file" });
    }

    // 2. Set the proper headers so the frontend knows what it is receiving
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.name}"`);

    // 3. Ask Google Drive for the raw binary stream
    const driveResponse = await drive.files.get(
      {
        fileId: file.googleDriveFileId,
        alt: "media", // This tells Google to return the file contents, not metadata
      },
      { responseType: "stream" }, // CRITICAL: Tell axios/googleapis to return a Node stream
    );

    // 4. Pipe the Google Drive stream directly to the Express response
    driveResponse.data
      .on("end", () => {
        // Stream finished successfully
      })
      .on("error", (err) => {
        console.error("Error piping stream from Google Drive:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error streaming file" });
        }
      })
      .pipe(res);
  } catch (error) {
    console.error("Stream Controller Error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Failed to stream file", error: error.message });
    }
  }
}
