const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose.connect('mongodb+srv://kumudhashree2004:GSyVcB1COrJ2Cc7t@cluster0.fcprpwp.mongodb.net/plantaiddb?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Blog schema with timestamps and like/dislike functionality
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" }, // Made optional with default empty string
  content: { type: String, required: true },
  imagePath: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

const Blog = mongoose.model("Blog", blogSchema);

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = "uploads/";
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ➡️ Create blog
app.post("/blogs", upload.single("image"), async (req, res) => {
  try {
    console.log("Creating blog with data:", req.body);
    const blog = new Blog({
      title: req.body.title,
      subtitle: req.body.subtitle || "", // Handle empty subtitle
      content: req.body.content,
      imagePath: req.file ? req.file.path : null,
      likes: 0,
      dislikes: 0
    });
    await blog.save();
    console.log("Blog created successfully:", blog._id);
    res.json(blog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

// ➡️ Get all blogs (sorted by newest first)
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// ➡️ Get recent blogs (limit 5)
app.get("/blogs/recent", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    res.json(blogs);
  } catch (err) {
    console.error("Error fetching recent blogs:", err);
    res.status(500).json({ error: "Failed to fetch recent blogs" });
  }
});

// ➡️ Get featured blogs (most liked)
app.get("/blogs/featured", async (req, res) => {
  try {
    // Find the maximum number of likes
    const maxLikesResult = await Blog.findOne().sort({ likes: -1 }).select('likes');
    
    if (!maxLikesResult || maxLikesResult.likes === 0) {
      return res.json([]);
    }
    
    const maxLikes = maxLikesResult.likes;
    
    // Find all blogs with the maximum likes
    const featuredBlogs = await Blog.find({ likes: maxLikes }).sort({ createdAt: -1 });
    
    res.json(featuredBlogs);
  } catch (err) {
    console.error("Error fetching featured blogs:", err);
    res.status(500).json({ error: "Failed to fetch featured blogs" });
  }
});

// ➡️ Search blogs
app.get("/blogs/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { subtitle: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (err) {
    console.error("Error searching blogs:", err);
    res.status(500).json({ error: "Failed to search blogs" });
  }
});

// ➡️ Like blog
app.put("/blogs/:id/like", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json({ likes: blog.likes, dislikes: blog.dislikes });
  } catch (err) {
    console.error("Error liking blog:", err);
    res.status(500).json({ error: "Failed to like blog" });
  }
});

// ➡️ Dislike blog
app.put("/blogs/:id/dislike", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json({ likes: blog.likes, dislikes: blog.dislikes });
  } catch (err) {
    console.error("Error disliking blog:", err);
    res.status(500).json({ error: "Failed to dislike blog" });
  }
});

// ➡️ Update blog
app.put("/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("Updating blog:", req.params.id, "with data:", req.body);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.log("Blog not found:", req.params.id);
      return res.status(404).json({ error: "Blog not found" });
    }

    // If new image uploaded, delete old image
    if (req.file) {
      if (blog.imagePath && fs.existsSync(blog.imagePath)) {
        try {
          fs.unlinkSync(blog.imagePath);
          console.log("Old image deleted:", blog.imagePath);
        } catch (err) {
          console.warn("Could not delete old image:", err.message);
        }
      }
      blog.imagePath = req.file.path;
    }

    blog.title = req.body.title || blog.title;
    blog.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : blog.subtitle; // Handle empty string
    blog.content = req.body.content || blog.content;

    await blog.save();
    console.log("Blog updated successfully:", blog._id);
    res.json(blog);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ error: "Failed to update blog", details: err.message });
  }
});

// ➡️ Delete blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    console.log("Deleting blog:", req.params.id);
    
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.log("Blog not found:", req.params.id);
      return res.status(404).json({ error: "Blog not found" });
    }

    // Try deleting image safely
    if (blog.imagePath) {
      try {
        if (fs.existsSync(blog.imagePath)) {
          fs.unlinkSync(blog.imagePath);
          console.log("Image deleted:", blog.imagePath);
        }
      } catch (err) {
        console.warn("Could not delete image file:", err.message);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    console.log("Blog deleted successfully:", req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Failed to delete blog", details: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));