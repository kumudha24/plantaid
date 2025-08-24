const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
mongoose.connect('mongodb+srv://kumudhashree2004:GSyVcB1COrJ2Cc7t@cluster0.fcprpwp.mongodb.net/plantaiddb?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Updated Blog schema - now supports both old imagePath and new imageUrl
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  content: { type: String, required: true },
  imagePath: String, // Keep for backward compatibility
  imageUrl: String, // New field for Cloudinary URLs
  cloudinaryPublicId: String, // Store for deletion
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Blog = mongoose.model("Blog", blogSchema);

// Multer setup with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'plantaid-blogs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Optimize image size
      { quality: 'auto' }
    ]
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// ➡️ Create blog
app.post("/blogs", upload.single("image"), async (req, res) => {
  try {
    console.log("Creating blog with data:", req.body);
    const blog = new Blog({
      title: req.body.title,
      subtitle: req.body.subtitle || "",
      content: req.body.content,
      imageUrl: req.file ? req.file.path : null, // Cloudinary URL
      cloudinaryPublicId: req.file ? req.file.public_id : null,
      likes: 0,
      dislikes: 0
    });
    await blog.save();
    console.log("Blog created successfully:", blog._id);
    res.json(blog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Failed to create blog", details: err.message });
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
    const maxLikesResult = await Blog.findOne().sort({ likes: -1 }).select('likes');
    
    if (!maxLikesResult || maxLikesResult.likes === 0) {
      return res.json([]);
    }
    
    const maxLikes = maxLikesResult.likes;
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

    // If new image uploaded, delete old image from Cloudinary
    if (req.file) {
      if (blog.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(blog.cloudinaryPublicId);
          console.log("Old image deleted from Cloudinary:", blog.cloudinaryPublicId);
        } catch (err) {
          console.warn("Could not delete old image from Cloudinary:", err.message);
        }
      }
      blog.imageUrl = req.file.path;
      blog.cloudinaryPublicId = req.file.public_id;
      blog.imagePath = null; // Clear old imagePath
    }

    blog.title = req.body.title || blog.title;
    blog.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : blog.subtitle;
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

    // Delete image from Cloudinary if exists
    if (blog.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(blog.cloudinaryPublicId);
        console.log("Image deleted from Cloudinary:", blog.cloudinaryPublicId);
      } catch (err) {
        console.warn("Could not delete image from Cloudinary:", err.message);
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