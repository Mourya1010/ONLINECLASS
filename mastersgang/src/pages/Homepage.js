


import React from "react";
import "./Homepage.css";

export default function HomePage() {
  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">MastersGang</div>
        <ul className="nav-links">
          <li>Home</li>
          <li>Courses</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
        
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Learn Anytime, Anywhere</h1>
        <p>
          Join thousands of students mastering new skills with our online
          platform.
        </p>
        <button className="hero-btn">Get Started</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <h3>📚 Quality Courses</h3>
          <p>Learn from expert teachers with structured content.</p>
        </div>
        <div className="feature-card">
          <h3>💻 Learn Anywhere</h3>
          <p>Access lessons on any device, anytime you want.</p>
        </div>
        <div className="feature-card">
          <h3>🔒 Secure Platform</h3>
          <p>Safe login and authentication system for all users.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 MastersGang. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

