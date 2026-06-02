import os
import sys
import argparse
from flask import Flask, request, jsonify
import cv2
import numpy as np

# Adjust imports according to the path
sys.path.append('.')
try:
    from fastreid.config import get_cfg
    from fastreid.engine import DefaultPredictor
    from pet_id import add_retri_config
except ImportError:
    print("WARNING: Could not import fastreid. Make sure requirements are installed.")

app = Flask(__name__)

predictor = None

def setup_predictor():
    global predictor
    try:
        cfg = get_cfg()
        add_retri_config(cfg)

        # Look for a default config file
        config_file = './configs/fusion_submit.yaml'
        if os.path.exists(config_file):
            cfg.merge_from_file(config_file)

        cfg.MODEL.BACKBONE.PRETRAIN = False
        cfg.freeze()
        predictor = DefaultPredictor(cfg)
        print("AI Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load AI model: {e}")

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    image_bytes = file.read()

    # Decode the image
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    if predictor:
        try:
            # Get feature representation
            predictions = predictor(img)
            features = predictions.cpu().numpy().tolist()
            return jsonify({"features": features, "status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Mock response if model couldn't load
        return jsonify({"message": "Model not loaded. This is a mock response from the Python API."}), 200

if __name__ == '__main__':
    setup_predictor()
    app.run(host='0.0.0.0', port=5000)
