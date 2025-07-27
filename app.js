import express from "express";
import driveRoutes from "./routes/driveRoutes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/drive", driveRoutes);

app.use("/", (req, res) => {
  res.send("Welcome to the Drive API!");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
