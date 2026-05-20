import userModel from "../models/user.model.js";

export const checkQuota = async (req, res, next) => {
  try {
    // If no files were attached, throw an error
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided for upload" });
    }

    // 1. Calculate the total size of all incoming files in this request
    const totalIncomingSize = req.files.reduce(
      (sum, file) => sum + file.size,
      0,
    );

    // 2. Fetch the user's current storage stats
    const user = await userModel.findById(req.user.id);

    // 3. Check if the upload exceeds the 10MB limit
    if (user.usedSpace + totalIncomingSize > user.totalSpace) {
      return res.status(400).json({
        message: "Storage limit exceeded. Upgrade your plan or delete files.",
        availableSpace: user.totalSpace - user.usedSpace,
        attemptedUploadSize: totalIncomingSize,
      });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking storage quota", error: error.message });
  }
};
