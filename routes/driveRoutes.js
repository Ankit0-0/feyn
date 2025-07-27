import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  fetchAndDownloadFromDrive,
  fetchAndDownloadFromFolder,
  uploadFile,
  uploadFileToFolder,
} from "../utils/driveUtils.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

// Upload to Drive root
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    await uploadFile(filePath);
    res.json({ message: "File uploaded to Drive root" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload to specific folder
router.post("/upload-to-folder", upload.single("file"), async (req, res) => {
  try {
    const folderId = req.body.folderId;
    const filePath = req.file.path;
    await uploadFileToFolder(filePath, folderId);
    res.json({ message: "File uploaded to folder" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/download/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const localPath = await fetchAndDownloadFromDrive(fileName); // return file path
    res.download(localPath, fileName); // send the file to the client
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/download-from-folder/:fileName", async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const folderId = req.query.folderId;
    const localPath = await fetchAndDownloadFromFolder(fileName, folderId);
    res.download(localPath, fileName); // send the file
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

import { listAllDriveFilesAndFolders } from "../utils/driveUtils.js";

router.get("/list", async (req, res) => {
  try {
    const files = await listAllDriveFilesAndFolders();
    res.json({ count: files.length, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;