import React, { useState } from "react";
import "../styles/SpeechToText.css"; // Import CSS

function SpeechToText() {
    const [text, setText] = useState("");
    const [listening, setListening] = useState(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        setListening(true);
        console.log("Recording started...");
    };

    recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        setText(speechText);
        console.log("Recognized Text:", speechText);
        recognition.stop(); // Stop recognition after getting the result
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
    };

    recognition.onend = () => {
        console.log("Recording stopped...");
        setListening(false);
    };

    const startListening = () => {
        setText("");
        recognition.start();
    };

    return (
        <div className="container">
            <h1>🎤 Speech to Text</h1>
            <button
                className={`record-btn ${listening ? "listening" : ""}}
                onClick={startListening`}
                disabled={listening}
            >
                {listening ? "🎙 Listening..." : "🎤 Start Recording"}
            </button>
            <div className="text-box">
                <h2>Recognized Text:</h2>
                <p>{text || "Your speech will appear here..."}</p>
            </div>
        </div>
    );
}

export default SpeechToText;

