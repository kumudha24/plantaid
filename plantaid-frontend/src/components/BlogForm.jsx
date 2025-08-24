// src/components/BlogForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Backend URL - Change this for local development
const BACKEND_URL = 'https://plantaid-backend.onrender.com';

export default function BlogForm() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [userInteractions, setUserInteractions] = useState({}); // Track user likes/dislikes
  const formRef = useRef(null); // Add ref for the form

  useEffect(() => {
    fetchBlogs();
    loadUserInteractions();
  }, []);

  const loadUserInteractions = () => {
    const saved = localStorage.getItem('plantaid_user_interactions');
    if (saved) {
      setUserInteractions(JSON.parse(saved));
    }
  };

  const saveUserInteractions = (interactions) => {
    localStorage.setItem('plantaid_user_interactions', JSON.stringify(interactions));
    setUserInteractions(interactions);
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/blogs`);
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      alert("Failed to load blogs. Please refresh the page.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
  };

  const handleEditClick = (blog) => {
    setEditingBlogId(blog._id);
    setTitle(blog.title);
    setSubtitle(blog.subtitle || ''); // Handle optional subtitle
    setContent(blog.content);
    setImageFile(null); // Reset file input for editing
    
    // Scroll to form smoothly
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setEditingBlogId(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setImageFile(null);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return;
    }

    try {
      console.log("Attempting to delete blog:", id);
      console.log("Using backend URL:", BACKEND_URL);
      
      const response = await axios.delete(`${BACKEND_URL}/blogs/${id}`);
      console.log("Delete response:", response.data);
      
      // Remove from local state
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      alert("Blog deleted successfully!");
    } catch (err) {
      console.error("Error deleting blog:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Backend URL used:", BACKEND_URL);
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        alert(`Cannot connect to server. Please make sure your backend server is running on ${BACKEND_URL}`);
      } else {
        alert(`Failed to delete blog: ${err.response?.data?.details || err.message}`);
      }
    }
  };

  const handleLike = async (blogId) => {
    // Check if user has already interacted with this post
    if (userInteractions[blogId]) {
      alert('You have already liked or disliked this post!');
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_URL}/blogs/${blogId}/like`);
      
      // Update user interactions
      const newInteractions = { ...userInteractions, [blogId]: 'liked' };
      saveUserInteractions(newInteractions);

      setBlogs(prev => prev.map(blog => 
        blog._id === blogId 
          ? { ...blog, likes: response.data.likes, dislikes: response.data.dislikes }
          : blog
      ));
    } catch (error) {
      console.error('Error liking blog:', error);
      alert('Failed to like the blog');
    }
  };

  const handleDislike = async (blogId) => {
    // Check if user has already interacted with this post
    if (userInteractions[blogId]) {
      alert('You have already liked or disliked this post!');
      return;
    }

    try {
      const response = await axios.put(`${BACKEND_URL}/blogs/${blogId}/dislike`);
      
      // Update user interactions
      const newInteractions = { ...userInteractions, [blogId]: 'disliked' };
      saveUserInteractions(newInteractions);

      setBlogs(prev => prev.map(blog => 
        blog._id === blogId 
          ? { ...blog, likes: response.data.likes, dislikes: response.data.dislikes }
          : blog
      ));
    } catch (error) {
      console.error('Error disliking blog:', error);
      alert('Failed to dislike the blog');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only title and content are required, subtitle is optional
    if (!title.trim() || !content.trim()) {
      alert("Please enter title and content");
      return;
    }

    try {
      setLoading(true);

      if (editingBlogId) {
        // 🔹 UPDATE existing blog
        console.log("Updating blog:", editingBlogId);
        const res = await axios.put(`${BACKEND_URL}/blogs/${editingBlogId}`, {
          title: title.trim(),
          subtitle: subtitle.trim(), // Can be empty string
          content: content.trim(),
        });
        console.log("Update response:", res.data);
        
        setBlogs((prev) =>
          prev.map((b) => (b._id === editingBlogId ? res.data : b))
        );
        alert("Blog updated successfully!");
      } else {
        // 🔹 CREATE new blog
        console.log("Creating new blog");
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("subtitle", subtitle.trim()); // Can be empty string
        formData.append("content", content.trim());
        if (imageFile) formData.append("image", imageFile);

        const res = await axios.post(`${BACKEND_URL}/blogs`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Create response:", res.data);

        setBlogs((prev) => [res.data, ...prev]);
        alert("Blog created successfully!");
      }

      // Clear form
      setTitle("");
      setSubtitle("");
      setContent("");
      setImageFile(null);
      setEditingBlogId(null);
      e.target.reset();
    } catch (err) {
      console.error("Error submitting blog:", err);
      console.error("Error response:", err.response?.data);
      alert(`Failed to ${editingBlogId ? 'update' : 'create'} blog: ${err.response?.data?.details || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the correct image URL (supports both old and new format)
  const getImageUrl = (blog) => {
    if (blog.imageUrl) {
      return blog.imageUrl; // New Cloudinary URL
    } else if (blog.imagePath) {
      return `${BACKEND_URL}/${blog.imagePath}`; // Old local path (for backward compatibility)
    }
    return null;
  };

  return (
    <div className="container">
      <h1>🌱PlantAid - Create Post🌱</h1>

      <div className="blog-container" ref={formRef}>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Title*"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Subtitle (Optional)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div>
            <textarea
              placeholder="Content*"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          {!editingBlogId && (
            <div>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading
                ? editingBlogId
                  ? "Updating..."
                  : "Posting..."
                : editingBlogId
                ? "Update Blog"
                : "Post Blog"}
            </button>

            {editingBlogId && (
              <button type="button" className="cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <hr />
      <h2>All Blogs</h2>
      <div>
        {blogs.length === 0 && <p>No blogs yet. Create your first blog post!</p>}
        {blogs.map((b) => {
          const imageUrl = getImageUrl(b);
          
          return (
            <div key={b._id} className="blog-post">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={b.title}
                  onError={(e) => {
                    console.log('Image failed to load:', imageUrl);
                    e.target.style.display = 'none'; // Hide broken images
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', imageUrl);
                  }}
                />
              )}
              <h3>{b.title}</h3>
              {b.subtitle && <p><strong>{b.subtitle}</strong></p>}
              <p>{b.content}</p>
              
              <div className="like-dislike-container">
                <button 
                  className={`like-btn ${userInteractions[b._id] === 'liked' ? 'user-liked' : ''}`}
                  onClick={() => handleLike(b._id)}
                  disabled={loading || userInteractions[b._id]}
                  title={userInteractions[b._id] ? 'You have already voted' : 'Like this post'}
                >
                  👍 {b.likes || 0}
                </button>
                <button 
                  className={`dislike-btn ${userInteractions[b._id] === 'disliked' ? 'user-disliked' : ''}`}
                  onClick={() => handleDislike(b._id)}
                  disabled={loading || userInteractions[b._id]}
                  title={userInteractions[b._id] ? 'You have already voted' : 'Dislike this post'}
                >
                  👎 {b.dislikes || 0}
                </button>
              </div>
              
              <small>{new Date(b.createdAt).toLocaleString()}</small>
              
              <div className="blog-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditClick(b)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClick(b._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}