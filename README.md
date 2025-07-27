````markdown
# 📁 Feyn - Google Drive File Manager API

A lightweight Node.js API built with Express to upload, download, and manage files & folders in your Google Drive using the official Google Drive API.

---

## 🚀 Features

- ✅ Upload files to Drive root or specific folders
- 📥 Download files from Drive by name
- 📂 List all files and folders in your Drive
- 📎 Simple REST API structure
- 🔐 Uses service account credentials for secure access

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ankit0-0/feyn.git
cd feyn
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root folder:

```
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY="your-private-key"
GOOGLE_DRIVE_FOLDER_ID=your-default-folder-id
```

> ⚠️ Note: If your private key includes `\n`, wrap it in double quotes and keep the line breaks as `\\n` (escaped).

### 4. Start the server

```bash
nodemon app.js
# or
node app.js
```

The server runs at:
📡 `http://localhost:3000`

---

## 📂 API Endpoints

### ✅ Upload a file

#### `POST /api/drive/upload`

* Uploads a file to the root of Drive
* Form data: `file` (as multipart)

#### `POST /api/drive/upload-to-folder`

* Uploads a file to a specific folder
* Form data:

  * `file` (as multipart)
  * `folderId` (text)

---

### 📥 Download a file

#### `GET /api/drive/download/:fileName`

* Downloads a file by name from Drive root
* Responds with the actual file

#### `GET /api/drive/download-from-folder/:fileName?folderId=FOLDER_ID`

* Downloads a file by name from a specific folder

---

### 📃 List all files

#### `GET /api/drive/list`

* Returns a JSON array of all files and folders in your Drive

---

## 🗂️ Project Structure

```
feyn/
│
├── app.js              # Main Express server
├── routes/
│   └── driveRoutes.js  # Route definitions
├── utils/
│   └── driveUtils.js   # Google Drive logic (upload/download/list)
├── uploads/            # Local temp uploads
├── downloads/          # Local downloaded files
├── .env                # Environment secrets
├── .gitignore
└── package.json
```

---

## 📄 .gitignore

```gitignore
.env
node_modules/
uploads/
downloads/
```

---

## 🛠️ Dependencies

* [express](https://www.npmjs.com/package/express)
* [googleapis](https://www.npmjs.com/package/googleapis)
* [multer](https://www.npmjs.com/package/multer)
* [dotenv](https://www.npmjs.com/package/dotenv)
* [mime-types](https://www.npmjs.com/package/mime-types)

---

## 📌 TODO

* Add support to delete or rename Drive files
* Add pagination for file listings
* Add UI (optional)

---

## 📜 License

MIT © Ankit0-0
