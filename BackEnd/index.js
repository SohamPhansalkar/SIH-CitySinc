const express = require("express"); // For API server
const mongoose = require("mongoose"); // For MongoDB connection and schema
const cors = require("cors"); // To connect front-end to back-end
const multer = require("multer"); // To receive images
const path = require("path"); // For handling file paths

const app = express();
app.use(cors());
app.use(express.json());

const DBUserID = "admin";
const DBPassword = "admin";
const Port = 3000;
const PyAPI = "http://localhost:2000";

// 1. Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://" +
      DBUserID +
      ":" +
      DBPassword +
      "@cluster0.5uticim.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Create a Schema + Model
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // email will be stored as _id
  userName: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);

// 3. API Routes

// Get all users
app.get("/listUsers", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get a user by email (query param: ?id=test123@gmail.com)
app.get("/getUser", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new user
app.post("/addUser", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Multer config for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../static/images")); // use absolute path
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// ✅ Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ File uploaded:", req.file);

    const fileName = req.file.filename;
    const filePath = "/images/" + fileName;

    // Send image info to Python AI server
    const response = await fetch(PyAPI + "/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": "CITYSYNC-AI",
      },
      body: JSON.stringify({
        image_path: fileName, // actual uploaded filename
        description: "test dec",
      }),
    });

    let aiResult = {};
    try {
      aiResult = await response.json();
    } catch {
      aiResult = { error: "Invalid response from AI server" };
    }

    // Respond to frontend
    res.json({
      message: "Image uploaded successfully",
      fileName: fileName,
      filePath: filePath,
      aiResult: aiResult,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ Serve images folder as static
app.use("/images", express.static(path.join(__dirname, "../static/images")));

// 4. Start server
app.listen(Port, () => {
  console.log("🚀 Server running on http://localhost:" + Port);
});
