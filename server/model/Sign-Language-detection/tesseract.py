from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import numpy as np
import math
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/process-gesture', methods=['POST'])
def process_gesture():
    data = request.json
    target_gesture = data.get('targetGesture')
    
    # Initialize hand detector and classifier
    cap = cv2.VideoCapture(0)
    detector = HandDetector(maxHands=1)
    classifier = Classifier("Model/keras_model.h5", "Model/labels.txt")
    
    offset = 20
    imgSize = 300
    labels = ["Hello", "I love you", "No", "Okay", "Please", "Thank you", "Yes"]
    detected_word = None
    
    # Wait a moment to make sure camera is ready
    time.sleep(1)
    
    # Try to detect for up to 5 seconds
    start_time = time.time()
    max_time = 5  # 5 seconds timeout
    
    while (time.time() - start_time) < max_time:
        success, img = cap.read()
        if not success:
            continue
            
        hands, img = detector.findHands(img)
        
        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            
            # Create white background
            imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
            
            # Crop hand region
            if y-offset >= 0 and x-offset >= 0:
                imgCrop = img[y-offset:y + h + offset, x-offset:x + w + offset]
                
                # Check if crop is valid
                if imgCrop.size != 0:
                    aspectRatio = h / w
                    
                    if aspectRatio > 1:
                        k = imgSize / h
                        wCal = math.ceil(k * w)
                        imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                        wGap = math.ceil((imgSize - wCal) / 2)
                        imgWhite[:, wGap: wCal + wGap] = imgResize
                    else:
                        k = imgSize / w
                        hCal = math.ceil(k * h)
                        imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                        hGap = math.ceil((imgSize - hCal) / 2)
                        imgWhite[hGap: hCal + hGap, :] = imgResize
                    
                    # Get prediction
                    prediction, index = classifier.getPrediction(imgWhite, draw=False)
                    detected_word = labels[index]
                    break  # We got a detection, exit the loop
    
    # Release resources
    cap.release()
    cv2.destroyAllWindows()
    
    # If no gesture was detected
    if detected_word is None:
        return jsonify({
            "detected": "No gesture detected",
            "match": False
        })
    
    # Return result
    return jsonify({
        "detected": detected_word,
        "match": detected_word == target_gesture
    })

if __name__ == '__main__':
    print("Starting Speech-to-Text Translation server...")
    app.run(debug=True, host='0.0.0.0', port=4501)