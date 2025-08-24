import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import BlogForm from './components/BlogForm';
import PlantAid from './components/PlantAid';
import axios from 'axios';

const BACKEND_URL = 'https://plantaid-backend.onrender.com';
//Home component with search functionality and recent posts
function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userInteractions, setUserInteractions] = useState({}); // Track user likes/dislikes

  // Fetch recent posts and featured blogs on component mount
  useEffect(() => {
    fetchRecentPosts();
    fetchFeaturedBlogs();
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

  const fetchRecentPosts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/blogs/recent`);
      setRecentPosts(response.data);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/blogs/featured`);
      setFeaturedBlogs(response.data);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
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

      // Update the post in recentPosts
      setRecentPosts(prev => prev.map(post => 
        post._id === blogId 
          ? { ...post, likes: response.data.likes, dislikes: response.data.dislikes }
          : post
      ));
      // Update in search results if showing
      if (hasSearched) {
        setSearchResults(prev => prev.map(post => 
          post._id === blogId 
            ? { ...post, likes: response.data.likes, dislikes: response.data.dislikes }
            : post
        ));
      }
      // Refresh featured blogs
      fetchFeaturedBlogs();
    } catch (error) {
      console.error('Error liking post:', error);
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

      // Update the post in recentPosts
      setRecentPosts(prev => prev.map(post => 
        post._id === blogId 
          ? { ...post, likes: response.data.likes, dislikes: response.data.dislikes }
          : post
      ));
      // Update in search results if showing
      if (hasSearched) {
        setSearchResults(prev => prev.map(post => 
          post._id === blogId 
            ? { ...post, likes: response.data.likes, dislikes: response.data.dislikes }
            : post
        ));
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/blogs/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching blogs:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // Updated function with showFullContent parameter
  const renderBlogPost = (post, showLikeButtons = true, showFullContent = false) => (
    <div key={post._id} className="blog-post">
      {post.imagePath && (
        <img src={`${BACKEND_URL}/${post.imagePath}`} alt={post.title} />
      )}
      <h3>{post.title}</h3>
      {post.subtitle && <p><strong>{post.subtitle}</strong></p>}
      <p>
        {showFullContent 
          ? post.content 
          : (post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content)
        }
      </p>
      
      {showLikeButtons && (
        <div className="like-dislike-container">
          <button 
            className={`like-btn ${userInteractions[post._id] === 'liked' ? 'user-liked' : ''}`}
            onClick={() => handleLike(post._id)}
            disabled={userInteractions[post._id]}
            title={userInteractions[post._id] ? 'You have already voted' : 'Like this post'}
          >
            👍 {post.likes || 0}
          </button>
          <button 
            className={`dislike-btn ${userInteractions[post._id] === 'disliked' ? 'user-disliked' : ''}`}
            onClick={() => handleDislike(post._id)}
            disabled={userInteractions[post._id]}
            title={userInteractions[post._id] ? 'You have already voted' : 'Dislike this post'}
          >
            👎 {post.dislikes || 0}
          </button>
        </div>
      )}
      
      <small>{new Date(post.createdAt).toLocaleDateString()}</small>
    </div>
  );

  return (
    <div className="container">
      <center>
        <h1>🌸🪴Welcome to PlantAid🪴🌸</h1>
        <p>
          PlantAid is a community-driven platform where plant lovers share real experiences of diagnosing and curing plant diseases.<br/> 
          From leaf spots to rare infections, it's your go-to hub for practical plant health solutions with photos and tips.
        </p>

        {/* Search Bar */}
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search for plant topics, diseases, or care tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {hasSearched && (
            <button 
              onClick={clearSearch} 
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                background: '#6b8e6b', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="search-results">
            <p>Searching...</p>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div className="search-results">
            <h2>🔍 Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <p>No posts found matching your search. Try different keywords!</p>
            ) : (
              <div>
                {searchResults.map((post) => renderBlogPost(post, true, true))}
              </div>
            )}
          </div>
        )}

        {/* Show latest posts only when not searching */}
        {!hasSearched && (
          <>
            <h2>🌱Latest Posts🌱</h2>
            {recentPosts.length === 0 ? (
              <p><em>No user posts yet. Be the first to share your plant experience!</em></p>
            ) : (
              <div>
                {recentPosts.map((post) => renderBlogPost(post))}
                {recentPosts.length === 5 && (
                  <p><em>Showing 5 most recent posts. Visit the Blog page to see all posts!</em></p>
                )}
              </div>
            )}

            {/* Featured Blogs of the Month */}
            <h2>🏆🌼Featured Blog{featuredBlogs.length > 1 ? 's' : ''} of the Month🌼🏆</h2>
            {featuredBlogs.length > 0 ? (
              <div className="featured-blogs-container">
                {featuredBlogs.length > 1 && (
                  <p className="tie-message">
                    🎉 We have a tie! {featuredBlogs.length} blogs share the top spot with {featuredBlogs[0].likes || 0} likes each! 🎉
                  </p>
                )}
                {featuredBlogs.map((blog, index) => (
                  <div key={blog._id} className="featured-blog">
                    {renderBlogPost(blog, false)}
                    <div className="featured-badge">
                      {featuredBlogs.length > 1 ? (
                        <span>⭐ Tied for Most Liked with {blog.likes || 0} likes! ⭐</span>
                      ) : (
                        <span>⭐ Most Liked Post with {blog.likes || 0} likes! ⭐</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p><em>No blogs available yet. Create the first post to be featured!</em></p>
            )}
          </>
        )}
      </center>
    </div>
  );
}

function About() {
  return (
    <div className="container">
      <center>
        <h1>🌸🌱About PlantAid🌱🌸</h1>
        <p>
          PlantAid is a friendly online community dedicated to helping plant lovers identify, treat, and prevent plant diseases through real-life experiences. Here, gardeners, farmers, and hobbyists can share their stories of how they discovered issues in their plants, the methods they used to cure them, and the results they achieved, complete with photos for easy reference. Our mission is to create a space where plant care knowledge is accessible, practical, and rooted in real success stories, so that together we can keep our plants healthy and thriving. Whether you're a beginner learning about common leaf spots or an expert tackling rare infections, PlantAid is your go-to hub for plant health solutions.<br/><br/>
          ☘️Our Mission☘️<br/><br/>
          To create a supportive community where plant lovers can share real-life solutions for plant diseases. We aim to make plant care knowledge practical, accessible, and inspired by real success stories.<br/><br/>
          🌷Contact Us🌷<br/>
          Email: plantaid24@gmail.com
        </p>
      </center>
    </div>
  );
}

// Blog component defined here inside the same file
function Blog() {
  return (
    <div>
      <BlogForm />
    </div>
  );
}

// Main App component uses Router and shows NavBar + route components
function App() {
  return (
    <Router>
      <nav>
        <Link to="/plantaid">PlantAid</Link>
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/plantaid" element={<PlantAid />} />
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;