import React from "react";
import { Link } from "react-router-dom";
import "../index.css"; // Assuming your root CSS is in index.css

const NotFound = () => {
  return (
    <div
      className="not-found-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "0 1rem",
        backgroundColor: "var(--bg-color, #ffffff)",
        color: "var(--text-color, #333333)",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          margin: "0",
          color: "var(--primary-color, #4b6bfb)",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "2rem",
          marginTop: "1rem",
          color: "var(--secondary-color, #333)",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "1.2rem",
          maxWidth: "600px",
          margin: "1rem auto",
        }}
      >
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: "var(--primary-color, #4b6bfb)",
          color: "var(--light-text, #ffffff)",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.25rem",
          textDecoration: "none",
          fontWeight: "bold",
          marginTop: "2rem",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
