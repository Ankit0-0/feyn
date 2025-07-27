import { drive } from "../config/driveConfig.js";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFile = async (filePath) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        mimeType: mime.lookup(filePath) || "text/plain",
      },
      media: {
        mimeType: mime.lookup(filePath) || "text/plain",
        body: fs.createReadStream(filePath),
      },
    });

    console.log("File uploaded successfully:", response.data);
  } catch (error) {
    console.log(error);
  }
};

const uploadFileToFolder = async (filePath, folderId) => {
  const fileName = path.basename(filePath);
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mime.lookup(filePath) || "application/octet-stream",
        parents: [folderId],
      },
      media: {
        mimeType: mime.lookup(filePath) || "application/octet-stream",
        body: fs.createReadStream(filePath),
      },
    });

    console.log(`Uploaded '${fileName}' to folder ID '${folderId}'`, response.data);
  } catch (error) {
    console.error(`Error uploading '${fileName}':`, error.message);
  }
};



const downloadFile = async (fileId, fileName) => {
  const destPath = path.resolve("./downloads", fileName);
  const dest = fs.createWriteStream(destPath);

  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

  await new Promise((resolve, reject) => {
    res.data
      .on("end", () => {
        console.log(`✅ Finished downloading ${fileName}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ Error downloading file:", err);
        reject(err);
      })
      .pipe(dest);
  });

  return destPath;
};


const fetchAndDownloadFromDrive = async (fileName) => {
  const res = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: "files(id, name, mimeType)",
  });

  const files = res.data.files;
  if (files.length === 0) {
    throw new Error(`❌ File "${fileName}" not found in Drive`);
  }

  const file = files[0];
  const filePath = await downloadFile(file.id, file.name);
  return filePath;
};


const fetchAndDownloadFromFolder = async (fileName, folderId) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
    fields: "files(id, name, mimeType)",
  });

  const files = res.data.files;
  if (files.length === 0) {
    throw new Error(`❌ File "${fileName}" not found in folder ${folderId}`);
  }

  const file = files[0];
  const filePath = await downloadFile(file.id, file.name);
  return filePath;
};


const listAllDriveFilesAndFolders = async () => {
  try {
    const res = await drive.files.list({
      q: "trashed = false",
      fields: "files(id, name, mimeType, parents)",
    });

    const files = res.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      parents: file.parents || [],
    }));

    return files;
  } catch (err) {
    console.error("❌ Error listing files/folders:", err.message);
    throw new Error("Failed to list files and folders");
  }
};


export {
  uploadFile,
  uploadFileToFolder,
  downloadFile,
  fetchAndDownloadFromDrive,
  fetchAndDownloadFromFolder,
  listAllDriveFilesAndFolders,
};
