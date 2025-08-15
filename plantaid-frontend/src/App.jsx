import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import BlogForm from './components/BlogForm';

//Home component defined here inside the same file
function Home(){
  return(
    <div className="container">
      <center>
        <h1>🌸🪴Welcome to PlantAid🪴🌸</h1>
        <p>PlantAid is a community-driven platform where plant lovers share real experiences of diagnosing and curing plant diseases.<br/> From leaf spots to rare infections, it's your go-to hub for practical plant health solutions with photos and tips.</p>

        <h2>🌱Latest Posts🌱</h2>
        <p><strong>🌿5 Common Plant Diseases🌿:</strong> Learn how to identify and treat the most frequent plant issues.</p>
        <p><strong>🌻Sunflower Care Guide🌻:</strong> Tips to grow tall, bright, and healthy sunflowers.</p>
        <p><strong>🍃DIY Natural Pest Repellent🍃:</strong> Make your own safe and effective spray for plants.</p>
        <p><strong>🌱Beginner's Guide to Indoor Plants🌱:</strong> Easy-care plants to start your green journey.</p>
        <p><strong>🍂Why Leaves Turn Yellow🍂:</strong> Causes and cures for yellowing leaves in plants.</p>

        <h2>🌎🌼Featured Plant of the Month🌼🌎</h2>
        <p><strong>🍃Aloe Vera🍃</strong>- Famous for its healing properties and easy care, Aloe Vera not only decorates your space but also helps soothe skin irritations and improve air quality.</p>
      </center>
    </div>
  );
}

function About(){
  return(
    <div className="container">
      <center>
        <h1>🌸🌱About PlantAid🌱🌸</h1>
        <p>
          PlantAid is a friendly online community dedicated to helping plant lovers identify, treat, and prevent plant diseases through real-life experiences. Here, gardeners, farmers, and hobbyists can share their stories of how they discovered issues in their plants, the methods they used to cure them, and the results they achieved, complete with photos for easy reference. Our mission is to create a space where plant care knowledge is accessible, practical, and rooted in real success stories, so that together we can keep our plants healthy and thriving. Whether you're a beginner learning about common leaf spots or an expert tackling rare infections, PlantAid is your go-to hub for plant health solutions.<br/><br/>  
          ☘️Our Mission☘️<br/><br/>  
          To create a supportive community where plant lovers can share real-life solutions for plant diseases. We aim to make plant care knowledge practical, accessible, and inspired by real success stories.<br/><br/>  
          🌷Contact Us🌷<br/>  
          Email: contact@plantaid.com
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
        <Link to="/">Home</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;