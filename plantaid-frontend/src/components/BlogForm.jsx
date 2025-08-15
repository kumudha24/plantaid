import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export default function BlogForm() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null); // Store File object
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

    const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/blogs`);
      setBlogs(res.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
    };

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file || null);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please enter title, subtitle and content');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle',subtitle);
      formData.append('content', content);
      if (imageFile) formData.append('image', imageFile); // 'image' matches multer.single('image')

      const res = await axios.post(`${BACKEND_URL}/blogs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Add newly created blog to UI
      setBlogs(prev => [res.data, ...prev]);

      // Clear form
      setTitle('');
      setSubtitle('');
      setContent('');
      setImageFile(null);
      e.target.reset(); // resets file input
    } catch (err) {
      console.error('Error submitting blog:', err);
      alert('Failed to submit blog');
    } finally {
      setLoading(false);
    }
    };

  return (
    <div className="container">
      <h1>🌱PlantAid - Create Post🌱</h1>

      <div className="blog-container">
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Blog'}
          </button>
        </form>
      </div>

      <hr />

      <h2>All Blogs</h2>
      <div>
        {blogs.length === 0 && <p>No blogs yet.</p>}
        {blogs.map((b) => (
          <div key={b._id} className="blog-post">
            {b.imagePath && (
              <img
                src={`${BACKEND_URL}/${b.imagePath}`}
                alt={b.title}
              />
            )}
            <h3>{b.title}</h3>
            {b.subtitle && <p><strong>{b.subtitle}</strong></p>}
            <p>{b.content}</p>
            <small>{new Date(b.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}