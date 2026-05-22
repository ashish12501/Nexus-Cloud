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

export async function deleteItems(req, res) {
  try {
    // 1. Normalize input to always be arrays
    let { fileIds = [], folderIds = [] } = req.body;
    if (typeof fileIds === "string") fileIds = [fileIds];
    if (typeof folderIds === "string") folderIds = [folderIds];

    let totalFreedSpace = 0;
    const successfullyDeletedMongoFileIds = [];

    // ==========================================
    // 2. RESOLVE FOLDER CONTENTS (The Cascade)
    // ==========================================
    let allFolderIdsToDelete = new Set(folderIds.map((id) => id.toString()));

    if (folderIds.length > 0) {
      // Use a queue to find sub-folders recursively
      let folderQueue = [...folderIds];

      while (folderQueue.length > 0) {
        // Find all folders whose parent is in the current queue
        const subFolders = await folderModel.find(
          {
            parentFolder: { $in: folderQueue },
            createdBy: req.user.id,
          },
          "_id",
        );

        folderQueue = []; // Clear queue for the next level deep

        for (let subFolder of subFolders) {
          const idStr = subFolder._id.toString();
          if (!allFolderIdsToDelete.has(idStr)) {
            allFolderIdsToDelete.add(idStr);
            folderQueue.push(subFolder._id);
          }
        }
      }

      // Now find EVERY file that lives inside ANY of these folders
      const filesInFolders = await fileModel.find(
        {
          parentFolder: { $in: Array.from(allFolderIdsToDelete) },
          createdBy: req.user.id,
        },
        "_id",
      );

      // Add all these nested files to our master fileIds array
      filesInFolders.forEach((file) => {
        if (!fileIds.includes(file._id.toString())) {
          fileIds.push(file._id.toString());
        }
      });
    }

    // ==========================================
    // 3. PROCESS FILES (Google Drive + Mongo)
    // ==========================================
    if (fileIds.length > 0) {
      const filesToDelete = await fileModel.find({
        _id: { $in: fileIds },
        createdBy: req.user.id,
      });

      // Delete from Google Drive concurrently
      await Promise.all(
        filesToDelete.map(async (file) => {
          try {
            await drive.files.delete({ fileId: file.googleDriveFileId });

            successfullyDeletedMongoFileIds.push(file._id);
            totalFreedSpace += file.size;
          } catch (driveError) {
            // If 404, Google Drive already deleted it, proceed safely
            if (driveError.status === 404) {
              successfullyDeletedMongoFileIds.push(file._id);
              totalFreedSpace += file.size;
            } else {
              console.error(
                `Failed to delete file ${file._id} from Drive:`,
                driveError.message,
              );
            }
          }
        }),
      );

      // Delete from MongoDB ONLY if Drive deletion succeeded
      if (successfullyDeletedMongoFileIds.length > 0) {
        await fileModel.deleteMany({
          _id: { $in: successfullyDeletedMongoFileIds },
        });
      }
    }

    // ==========================================
    // 4. PROCESS FOLDERS (Mongo Only)
    // ==========================================
    const finalFolderIdsArray = Array.from(allFolderIdsToDelete);
    if (finalFolderIdsArray.length > 0) {
      await folderModel.deleteMany({
        _id: { $in: finalFolderIdsArray },
        createdBy: req.user.id,
      });
    }

    // ==========================================
    // 5. REFUND USER QUOTA
    // ==========================================
    if (totalFreedSpace > 0) {
      await userModel.findByIdAndUpdate(req.user.id, {
        $inc: { usedSpace: -totalFreedSpace },
      });
    }

    res.status(200).json({
      message: "Cascade deletion completed successfully",
      filesDeleted: successfullyDeletedMongoFileIds.length,
      foldersDeleted: finalFolderIdsArray.length,
      storageRefunded: totalFreedSpace,
    });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete items", error: error.message });
  }
}

export async function renameItem(req, res) {
  try {
    const { itemId, newName, itemType } = req.body;

    if (itemType === "file") {
      const file = await fileModel.findOneAndUpdate(
        { _id: itemId, createdBy: req.user.id },
        { name: newName },
        { new: true },
      );
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res
        .status(200)
        .json({ message: "File renamed successfully", data: file });
    } else if (itemType === "folder") {
      const folder = await folderModel.findOneAndUpdate(
        { _id: itemId, createdBy: req.user.id },
        { name: newName },
        { new: true },
      );
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res
        .status(200)
        .json({ message: "Folder renamed successfully", data: folder });
    } else {
      res.status(400).json({ message: "Invalid item type" });
    }
  } catch (error) {
    console.error("Rename Error:", error);
    res
      .status(500)
      .json({ message: "Failed to rename item", error: error.message });
  }
}

// controllers/files.controller.js

export async function copyItems(req, res) {
  try {
    // 1. Normalize input
    let { fileIds = [], folderIds = [], targetFolderId } = req.body;
    if (typeof fileIds === "string") fileIds = [fileIds];

    // Product Rule: Block folder copying
    if (folderIds && folderIds.length > 0) {
      return res.status(400).json({
        message:
          "Folder copying is currently not supported. Please select files only.",
      });
    }

    if (fileIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No files provided for copying." });
    }

    // 2. Safely evaluate the target folder
    const finalTargetFolder = ["root", "", null, undefined].includes(
      targetFolderId,
    )
      ? null
      : targetFolderId;

    // 3. Fetch valid files to verify ownership and get their sizes
    const filesToCopy = await fileModel.find({
      _id: { $in: fileIds },
      createdBy: req.user.id,
    });

    if (filesToCopy.length === 0) {
      return res
        .status(404)
        .json({ message: "No valid files found or unauthorized." });
    }

    // ==========================================================
    // 4. PRE-COPY STORAGE VALIDATION (The Quota Gatekeeper)
    // ==========================================================
    // Calculate total size of all files requested for copying
    const totalIncomingSize = filesToCopy.reduce(
      (sum, file) => sum + file.size,
      0,
    );

    // Fetch the user's current storage metrics
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the new files will push them over their hard limit
    // (Assuming your user schema has a 'storageLimit' field, e.g., 15 * 1024 * 1024 * 1024 for 15GB)
    const projectedSpace = user.usedSpace + totalIncomingSize;
    if (projectedSpace > user.storageLimit) {
      const availableSpace = user.storageLimit - user.usedSpace;
      return res.status(400).json({
        message: "Insufficient storage space to complete this copy operation.",
        details: {
          requiredBytes: totalIncomingSize,
          availableBytes: availableSpace > 0 ? availableSpace : 0,
        },
      });
    }
    // ==========================================================

    let totalCopiedSpace = 0;
    const successfullyCopiedFiles = [];

    // 5. Process File Copies Concurrently (Only runs if quota check passes!)
    await Promise.all(
      filesToCopy.map(async (file) => {
        try {
          // A. Duplicate in Google Drive
          const driveResponse = await drive.files.copy({
            fileId: file.googleDriveFileId,
            requestBody: { name: `${file.name} - Copy` },
          });

          // B. Create in MongoDB
          const newFile = await fileModel.create({
            name: `${file.name} - Copy`,
            parentFolder: finalTargetFolder,
            mimeType: file.mimeType,
            size: file.size,
            googleDriveFileId: driveResponse.data.id,
            createdBy: req.user.id,
          });

          successfullyCopiedFiles.push(newFile);
          totalCopiedSpace += file.size;
        } catch (copyError) {
          console.error(`Failed to copy file ${file._id}:`, copyError.message);
        }
      }),
    );

    // 6. Charge the user quota
    if (totalCopiedSpace > 0) {
      await userModel.findByIdAndUpdate(req.user.id, {
        $inc: { usedSpace: totalCopiedSpace },
      });
    }

    res.status(201).json({
      message: `Successfully copied ${successfullyCopiedFiles.length} file(s)`,
      data: successfullyCopiedFiles,
    });
  } catch (error) {
    console.error("Bulk Copy Error:", error);
    res
      .status(500)
      .json({ message: "Failed to copy items", error: error.message });
  }
}

export async function moveItems(req, res) {
  try {
    // 1. Normalize both input arrays
    let { fileIds = [], folderIds = [], targetFolderId } = req.body;
    if (typeof fileIds === "string") fileIds = [fileIds];
    if (typeof folderIds === "string") folderIds = [folderIds];

    if (fileIds.length === 0 && folderIds.length === 0) {
      return res.status(400).json({ message: "No items provided for moving" });
    }

    // 2. Safely evaluate the target folder
    const finalTargetFolder = ["root", "", null, undefined].includes(
      targetFolderId,
    )
      ? null
      : targetFolderId;

    // 3. 🚨 SECURITY: Prevent moving a folder into itself
    if (finalTargetFolder && folderIds.includes(finalTargetFolder)) {
      return res
        .status(400)
        .json({ message: "Cannot move a folder into itself." });
    }

    let filesMoved = 0;
    let foldersMoved = 0;

    // 4. Move Files (Mass Update)
    if (fileIds.length > 0) {
      const fileResult = await fileModel.updateMany(
        { _id: { $in: fileIds }, createdBy: req.user.id },
        { $set: { parentFolder: finalTargetFolder } },
      );
      filesMoved = fileResult.modifiedCount;
    }

    // 5. Move Folders (Mass Update)
    if (folderIds.length > 0) {
      const folderResult = await folderModel.updateMany(
        { _id: { $in: folderIds }, createdBy: req.user.id },
        { $set: { parentFolder: finalTargetFolder } },
      );
      foldersMoved = folderResult.modifiedCount;
    }

    res.status(200).json({
      message: `Successfully moved ${filesMoved} file(s) and ${foldersMoved} folder(s)`,
    });
  } catch (error) {
    console.error("Bulk Move Error:", error);
    res
      .status(500)
      .json({ message: "Failed to move items", error: error.message });
  }
}
