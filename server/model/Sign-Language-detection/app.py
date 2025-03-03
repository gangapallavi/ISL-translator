from flask import Flask, render_template, Response, jsonify
import cv2
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import numpy as np
import math
import time
import threading
import json
from gtts import gTTS
import io
import base64
import pygame
import os

# Initialize Flask app
app = Flask(__name__)

# Create folders
os.makedirs('templates', exist_ok=True)
os.makedirs('static', exist_ok=True)

# Global variables
camera = None
detector = None
classifier = None
current_sign = ""
current_sentence = []
is_detection_running = False
current_frame = None
frame_lock = threading.Lock()
data_lock = threading.Lock()

# Initialize the detection components
def initialize_detection():
    global camera, detector, classifier
    camera = cv2.VideoCapture(0)
    detector = HandDetector(maxHands=1)
    classifier = Classifier("Model/keras_model.h5", "Model/labels.txt")
    pygame.mixer.init()

# Function to process frames and perform detection in a separate thread
def detection_thread():
    global camera, detector, classifier, current_sign, current_sentence, is_detection_running, current_frame
    
    labels = ["Hello", "I love you", "No", "Okay", "Please", "Thank you", "Yes"]
    offset = 20
    imgSize = 300
    last_detection_time = time.time()
    
    while is_detection_running:
        success, img = camera.read()
        if not success:
            time.sleep(0.1)
            continue
            
        imgOutput = img.copy()
        hands, img = detector.findHands(img)
        
        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8)*255
            
            # Make sure the bounding box is within the image boundaries
            if y-offset >= 0 and x-offset >= 0 and y+h+offset < img.shape[0] and x+w+offset < img.shape[1]:
                imgCrop = img[y-offset:y+h+offset, x-offset:x+w+offset]
                imgCropShape = imgCrop.shape
                
                aspectRatio = h / w
                if aspectRatio > 1:
                    k = imgSize / h
                    wCal = math.ceil(k * w)
                    imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                    wGap = math.ceil((imgSize-wCal)/2)
                    imgWhite[:, wGap:wCal+wGap] = imgResize
                else:
                    k = imgSize / w
                    hCal = math.ceil(k * h)
                    imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                    hGap = math.ceil((imgSize-hCal)/2)
                    imgWhite[hGap:hCal+hGap, :] = imgResize
                
                prediction, index = classifier.getPrediction(imgWhite, draw=False)
                detected_word = labels[index]
                
                # Update current sign
                with data_lock:
                    current_sign = detected_word
                    
                    # Add to sentence if different from last sign and enough time has passed
                    current_time = time.time()
                    if (current_time - last_detection_time > 1.5 and 
                        (len(current_sentence) == 0 or current_sentence[-1] != detected_word)):
                        current_sentence.append(detected_word)
                        last_detection_time = current_time
                
                # Draw on the output image for debugging
                cv2.rectangle(imgOutput, (x-offset, y-offset-70), (x-offset+400, y-offset+60-50), (0, 255, 0), cv2.FILLED)
                cv2.putText(imgOutput, detected_word, (x, y-30), cv2.FONT_HERSHEY_COMPLEX, 2, (0, 0, 0), 2)
                cv2.rectangle(imgOutput, (x-offset, y-offset), (x+w+offset, y+h+offset), (0, 255, 0), 4)

        # Update the current frame for streaming
        with frame_lock:
            current_frame = imgOutput.copy()
        
        # Short sleep to prevent CPU overuse
        time.sleep(0.03)

# Function to generate frames for the video feed
def generate_frames():
    global current_frame, camera, is_detection_running
    
    # Start with a blank frame
    blank_frame = np.ones((480, 640, 3), dtype=np.uint8) * 255
    cv2.putText(blank_frame, "Waiting for camera...", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    
    while True:
        # If detection is not running and we have camera access, show raw camera feed
        if not is_detection_running and camera and camera.isOpened():
            success, frame = camera.read()
            if success:
                output_frame = frame
            else:
                output_frame = blank_frame
        # If detection is running, use the processed frame from the detection thread
        elif current_frame is not None:
            with frame_lock:
                output_frame = current_frame.copy()
        else:
            output_frame = blank_frame
        
        # Convert to JPEG
        ret, buffer = cv2.imencode('.jpg', output_frame)
        frame_bytes = buffer.tobytes()
        
        # Yield the frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route."""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_detection')
def start_detection():
    global is_detection_running
    if not is_detection_running:
        is_detection_running = True
        threading.Thread(target=detection_thread, daemon=True).start()
    return jsonify({"status": "started"})

@app.route('/stop_detection')
def stop_detection():
    global is_detection_running
    is_detection_running = False
    return jsonify({"status": "stopped"})

@app.route('/get_current_data')
def get_current_data():
    global current_sign, current_sentence
    with data_lock:
        return jsonify({
            "current_sign": current_sign,
            "current_sentence": current_sentence
        })

@app.route('/clear_sentence')
def clear_sentence():
    global current_sentence
    with data_lock:
        current_sentence = []
    return jsonify({"status": "cleared"})

@app.route('/speak_sentence')
def speak_sentence():
    global current_sentence
    with data_lock:
        if not current_sentence:
            return jsonify({"status": "empty"})
        
        text = " ".join(current_sentence)
        
        # Generate speech
        tts = gTTS(text=text, lang='en')
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        # Convert to base64 for sending to frontend
        audio_data = base64.b64encode(mp3_fp.read()).decode('utf-8')
        
        # Also play on server side if needed
        mp3_fp.seek(0)
        pygame.mixer.music.load(mp3_fp, 'mp3')
        pygame.mixer.music.play()
        
        # Clear the sentence after speaking
        sentence_spoken = current_sentence.copy()
        current_sentence = []
        
        return jsonify({
            "status": "success", 
            "text": text,
            "audio_data": audio_data,
            "sentence_spoken": sentence_spoken
        })

if __name__ == '__main__':
    initialize_detection()
    print("Starting server at http://127.0.0.1:4500")
    app.run(host='0.0.0.0', port=4500, debug=True, threaded=True)