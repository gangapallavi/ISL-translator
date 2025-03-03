import React, { useState } from "react";
import '../styles/Tesseract.css';

const Card = ({ children, className = "" }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

const Button = ({ children, onClick, primary = true }) => {
  return (
    <button 
      className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Tesseract = () => {
  const chapters = {
    "Chapter 1: Basic Greetings": [
      { label: "Hello", url: "https://www.youtube.com/embed/example1" },
      { label: "Thank you", url: "https://www.youtube.com/embed/EPlhDhll9mw" },
    ],
    "Chapter 2: Common Phrases": [
      { label: "Please", url: "https://www.youtube.com/embed/example3" },
      { label: "Okay", url: "https://www.youtube.com/embed/example4" },
      { label: "I love you", url: "https://www.youtube.com/embed/example5" },
    ],
    "Chapter 3: Simple Responses": [
      { label: "Yes", url: "http://www.youtube.com/embed/0X8RoDuhCt0" },
      { label: "No", url: "https://www.youtube.com/embed/example7" },
    ],
    "Chapter 4: Numbers & Time": [
      { label: "Numbers 1-5", url: "https://www.youtube.com/embed/example8" },
      { label: "Days of Week", url: "https://www.youtube.com/embed/example9" },
    ],
    "Chapter 5: Daily Activities": [
      { label: "Eating & Drinking", url: "https://www.youtube.com/embed/example10" },
      { label: "Working & Studying", url: "https://www.youtube.com/embed/example11" },
    ],
  };

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTopicSelect = (chapter, topicUrl) => {
    setSelectedChapter(chapter);
    setSelectedTopic(topicUrl);
    setQuizStarted(false);
    setResult(null);
  };

  const getSelectedTopicLabel = () => {
    if (!selectedChapter || !selectedTopic) return null;
    const topic = chapters[selectedChapter].find(t => t.url === selectedTopic);
    return topic ? topic.label : null;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setResult(null);
  };

  const handleSubmitGesture = async () => {
    setLoading(true);
    try {
      // Send request to Flask backend
      const response = await fetch('http://localhost:4501/process-gesture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetGesture: getSelectedTopicLabel()
        }),
      });
      
      const data = await response.json();
      
      // Determine if the detected gesture matches the target
      const isCorrect = data.detected === getSelectedTopicLabel();
      
      setResult({
        detected: data.detected,
        isCorrect: isCorrect,
        message: isCorrect 
          ? "Congratulations! Your gesture was correct! 🎉" 
          : `Better luck next time. You showed "${data.detected}" instead of "${getSelectedTopicLabel()}".`
      });
    } catch (error) {
      console.error('Error submitting gesture:', error);
      setResult({ 
        error: 'Failed to process gesture. Please check if the backend is running and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="main-heading"><center>Indian Sign Language Course</center></h1>

      <main className="main-content">
        {!selectedTopic ? (
          // Before topic selection - centered layout
          <div className="chapters-grid">
            {Object.keys(chapters).map((chapter) => (
              <Card key={chapter} className="chapter-card">
                <h2>{chapter}</h2>
                <select 
                  className="dropdown"
                  onChange={(e) => handleTopicSelect(chapter, e.target.value)}
                >
                  <option value="">Select a topic</option>
                  {chapters[chapter].map((topic, index) => (
                    <option key={index} value={topic.url}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </Card>
            ))}
          </div>
        ) : (
          // After topic selection - side by side layout
          <div className="content-layout">
            {/* Left sidebar with chapter dropdowns */}
            <div className="chapters-sidebar">
              {Object.keys(chapters).map((chapter) => (
                <Card 
                  key={chapter} 
                  className={`chapter-card ${chapter === selectedChapter ? 'active' : ''}`}
                >
                  <h2>{chapter}</h2>
                  <select 
                    className="dropdown"
                    value={chapter === selectedChapter ? selectedTopic : ""}
                    onChange={(e) => handleTopicSelect(chapter, e.target.value)}
                  >
                    <option value="">Select a topic</option>
                    {chapters[chapter].map((topic, index) => (
                      <option key={index} value={topic.url}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </Card>
              ))}
            </div>

            {/* Right side content area */}
            <div className="content-area">
              <Card className="video-card">
                <div className="video-header">
                  <h3>
                    <span className="chapter">{selectedChapter}</span>
                    <span className="topic">{getSelectedTopicLabel()}</span>
                  </h3>
                </div>
                <div className="video-container">
                  <iframe
                    src={selectedTopic}
                    title="Video lesson"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </Card>

              <Card className="quiz-card">
                <h2>Practice Quiz</h2>
                {!quizStarted ? (
                  <div className="quiz-intro">
                    <p>Ready to practice what you've learned? Test your sign language skills!</p>
                    <Button onClick={handleStartQuiz}>Start Quiz</Button>
                  </div>
                ) : (
                  <div className="quiz-active">
                    <p className="instructions">Show the correct gesture for: <strong>{getSelectedTopicLabel()}</strong></p>
                    <p>Face the camera and make the sign when ready.</p>
                    
                    {loading ? (
                      <div className="status-message">
                        <div className="spinner"></div>
                        <p>Processing your gesture...</p>
                      </div>
                    ) : result ? (
                      <div className={`result-container ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                        <h3>{result.isCorrect ? "Success! 🎉" : "Not Quite Right 😕"}</h3>
                        <p>{result.message || result.error}</p>
                        <div className="action-buttons">
                          <Button onClick={handleStartQuiz}>Try Again</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <Button onClick={() => setQuizStarted(false)} primary={false}>Cancel</Button>
                        <Button onClick={handleSubmitGesture}>Submit Gesture</Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tesseract;