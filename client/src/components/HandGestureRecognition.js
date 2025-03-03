import React, { useState, useEffect } from 'react';
import '../styles/HandGestureRecognition.css';

const HandGestureRecognition = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentSign, setCurrentSign] = useState('Ready...');
  const [sentence, setSentence] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Flask server URL
  const serverUrl = 'http://127.0.0.1:4500';
  
  // Start detection
  const startDetection = async () => {
    try {
      const response = await fetch(`${serverUrl}/start_detection`);
      const data = await response.json();
      
      if (data.status === 'started') {
        setIsDetecting(true);
        setCurrentSign('Detecting...');
        // Start polling for updates
        startPolling();
      }
    } catch (error) {
      console.error('Error starting detection:', error);
    }
  };
  
  // Stop detection
  const stopDetection = async () => {
    try {
      const response = await fetch(`${serverUrl}/stop_detection`);
      const data = await response.json();
      
      if (data.status === 'stopped') {
        setIsDetecting(false);
        setCurrentSign('Detection Stopped');
        // Stop polling
        stopPolling();
      }
    } catch (error) {
      console.error('Error stopping detection:', error);
    }
  };
  
  // Clear sentence
  const clearSentence = async () => {
    try {
      await fetch(`${serverUrl}/clear_sentence`);
      setSentence([]);
    } catch (error) {
      console.error('Error clearing sentence:', error);
    }
  };
  
  // Speak sentence
  const speakSentence = async () => {
    try {
      const response = await fetch(`${serverUrl}/speak_sentence`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Add to history
        setHistory(prev => [data.text, ...prev]);
        // Play audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_data}`);
        audio.play();
      }
    } catch (error) {
      console.error('Error speaking sentence:', error);
    }
  };
  
  // Polling for updates
  let pollingInterval = null;
  
  const startPolling = () => {
    pollingInterval = setInterval(fetchData, 500);
  };
  
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
  
  const fetchData = async () => {
    try {
      const response = await fetch(`${serverUrl}/get_current_data`);
      const data = await response.json();
      
      if (data.current_sign) {
        setCurrentSign(data.current_sign);
      }
      
      if (data.current_sentence) {
        setSentence(data.current_sentence);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);
  
  // Handle video load/error
  const handleVideoLoad = () => {
    setIsConnected(true);
  };
  
  const handleVideoError = () => {
    setIsConnected(false);
  };
  
  return (
    <div className='rishika'>
    <div className="sign-language-container">
      <div className="header">
        <h1>Sign Language Translator</h1>
        <p>Real-time sign language detection and translation</p>
      </div>
      
      <div className="main-content">
        <div className="video-section">
          <h2>Camera Feed</h2>
          <div className="video-container">
            <iframe 
              src={`${serverUrl}/video_feed`}
              title="Sign Language Video Feed"
              width="100%"
              height="400"
              onLoad={handleVideoLoad}
              onError={handleVideoError}
            />
          </div>
          {/* <div className="current-sign">{currentSign}</div> */}
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Camera Connected' : 'Camera Disconnected'}
          </div>
          
        </div>
        
        <div className="results-section">
          <h2>Translation Results</h2>
          <div className="sentence-container">
            <div className="controls">
              <button onClick={speakSentence}>Speak Sentence</button>
              <button onClick={clearSentence}>Clear Sentence</button>
            </div>
          </div>
          
          <div className="history-container">
            <h3>Translation History</h3>
            <div className="history-list">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={index} className="history-item">{item}</div>
                ))
              ) : (
                <div className="history-item">No previous translations yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="info-section">
        <h2>Supported Sign Language Gestures</h2>
        <div className="signs-list">
          {["Hello", "I love you", "No", "Okay", "Please", "Thank you", "Yes"].map((sign, index) => (
            <span key={index} className="sign-badge">{sign}</span>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};


export default HandGestureRecognition;