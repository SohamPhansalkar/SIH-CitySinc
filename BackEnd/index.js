const express = require("express"); // For API server
const mongoose = require("mongoose"); // For MongoDB connection and schema
const cors = require("cors"); // To connect front-end to back-end

const app = express();
app.use(cors());
app.use(express.json());

const DBUserID = "admin";
const DBPassword = "admin";
const Port = 3000;

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

// Get a user by userName (using query param eg - ?id=test123@gmail.com)
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
// url-python app.route

// 4. Start server
app.listen(Port, () => {
  console.log("🚀 Server running on http://localhost:" + Port);
});
