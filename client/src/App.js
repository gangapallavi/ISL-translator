import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import "./styles/App.css";
import ImageSelector from './components/ImageSelector';
import HandGestureRecognition from "./components/HandGestureRecognition";
import Tesseract from "./components/Tesseract";
import SpeechToText from "./components/SpeechToText";

function App() {
  const imagesFolder = "/images/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("http://localhost:5000/api/user", {
            headers: { "x-auth-token": token },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token"); // Invalid token, remove it
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={logout} />
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!isAuthenticated ? <Signup onLogin={login} /> : <Navigate to="/" />}
          />
          <Route
            path="/learn"
            element={
              isAuthenticated ? 
              <ImageSelector folderPath={imagesFolder} /> : 
              <Navigate to="/login" />
            }
          />
          <Route path="/gesture" element={isAuthenticated ? <HandGestureRecognition /> : <Navigate to="/login"/>} />
          <Route path="/tesseract" element={isAuthenticated ? <Tesseract/> : <Navigate to="/login"/>} />
          <Route path="/stt" element={isAuthenticated ? <SpeechToText/> : <Navigate to="/login"/>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
      
    </div>
  );
}

export default App;
