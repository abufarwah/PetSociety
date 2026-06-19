# import os
# import sys
# import argparse
# from flask import Flask, request, jsonify
# import cv2
# import numpy as np

# # Adjust imports according to the path
# # Adjust imports according to the path
# sys.path.append('.')
# try:
#     from fastreid.config import get_cfg
#     from fastreid.engine import DefaultPredictor
#     from pet_id.config import add_retri_config  # <-- تم تعديل المسار هنا
# except ImportError as e:
#     print(f"WARNING: Could not import fastreid. Error details: {e}")
#     import traceback
#     traceback.print_exc()  # <-- هذا السطر سيطبع مكان الخطأ بالظبط لو فشل الاستيراد
#     print("WARNING: Could not import fastreid. Make sure requirements are installed.")

# app = Flask(__name__)

# predictor = None

# def setup_predictor():
#     global predictor
#     try:
#         cfg = get_cfg()
#         add_retri_config(cfg)

#         # Look for a default config file
#         config_file = './configs/fusion_submit.yaml'
#         if os.path.exists(config_file):
#             cfg.merge_from_file(config_file)

#         cfg.MODEL.BACKBONE.PRETRAIN = False
#         cfg.freeze()
#         predictor = DefaultPredictor(cfg)
#         print("AI Model loaded successfully.")
#     except Exception as e:
#         print(f"Failed to load AI model: {e}")

# @app.route('/api/predict', methods=['POST'])
# def predict():
#     if 'image' not in request.files:
#         return jsonify({"error": "No image provided"}), 400

#     file = request.files['image']
#     image_bytes = file.read()

#     # Decode the image
#     img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

#     if img is None:
#         return jsonify({"error": "Invalid image"}), 400

#     if predictor:
#         try:
#             # Get feature representation
#             predictions = predictor(img)
#             features = predictions.cpu().numpy().tolist()
#             return jsonify({"features": features, "status": "success"})
#         except Exception as e:
#             return jsonify({"error": str(e)}), 500
#     else:
#         # Mock response if model couldn't load
#         return jsonify({"message": "Model not loaded. This is a mock response from the Python API."}), 200

# if __name__ == '__main__':
#     setup_predictor()
#     app.run(host='0.0.0.0', port=5000)

# import os
# import sys
# import argparse
# from flask import Flask, request, jsonify
# import cv2
# import numpy as np

# # Adjust imports according to the path
# sys.path.append('.')
# try:
#     from fastreid.config import get_cfg
#     from fastreid.engine import DefaultPredictor
#     from pet_id.config import add_retri_config  # المسار الصحيح والمعدل
# except ImportError as e:
#     print(f"WARNING: Could not import fastreid. Error details: {e}")
#     import traceback
#     traceback.print_exc() 
#     print("WARNING: Could not import fastreid. Make sure requirements are installed.")

# app = Flask(__name__)

# predictor = None

# def setup_predictor():
#     global predictor
#     try:
#         cfg = get_cfg()
#         add_retri_config(cfg)

#         # Look for a default config file
#         config_file = './configs/fusion_submit.yaml'
#         if os.path.exists(config_file):
#             cfg.merge_from_file(config_file)

#         # تعديل أساسي: إجبار الموديل على العمل على الـ CPU لتجنب خطأ الـ CUDA
#         cfg.MODEL.DEVICE = 'cpu'  
#         cfg.MODEL.BACKBONE.PRETRAIN = False
#         cfg.freeze()
#         predictor = DefaultPredictor(cfg)
#         print("AI Model loaded successfully.")
#     except Exception as e:
#         print(f"Failed to load AI model: {e}")

# @app.route('/api/predict', methods=['POST'])
# def predict():
#     if 'image' not in request.files:
#         return jsonify({"error": "No image provided"}), 400

#     file = request.files['image']
#     image_bytes = file.read()

#     # Decode the image
#     img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

#     if img is None:
#         return jsonify({"error": "Invalid image"}), 400

#     if predictor:
#         try:
#             # Get feature representation
#             predictions = predictor(img)
#             features = predictions.cpu().numpy().tolist()
#             return jsonify({"features": features, "status": "success"})
#         except Exception as e:
#             return jsonify({"error": str(e)}), 500
#     else:
#         # Mock response if model couldn't load
#         return jsonify({"message": "Model not loaded. This is a mock response from the Python API."}), 200

# if __name__ == '__main__':
#     setup_predictor()
#     app.run(host='0.0.0.0', port=5000)


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
    from fastreid.data.transforms import build_transforms
    from pet_id.config import add_retri_config  # المسار الصحيح والمعدل
except ImportError as e:
    print(f"WARNING: Could not import fastreid. Error details: {e}")
    import traceback
    traceback.print_exc() 
    print("WARNING: Could not import fastreid. Make sure requirements are installed.")

import torch
from PIL import Image
import io

app = Flask(__name__)

predictor = None
transform = None

def setup_predictor():
    global predictor, transform
    try:
        cfg = get_cfg()
        add_retri_config(cfg)

        # Look for a default config file
        config_file = './configs/fusion_submit.yaml'
        if os.path.exists(config_file):
            cfg.merge_from_file(config_file)

        # تعديل أساسي: إجبار الموديل على العمل على الـ CPU لتجنب خطأ الـ CUDA
        cfg.MODEL.DEVICE = 'cpu'  
        cfg.MODEL.BACKBONE.PRETRAIN = False
        
        # Build image transforms before freezing cfg
        transform = build_transforms(cfg, is_train=False)
        
        cfg.freeze()
        predictor = DefaultPredictor(cfg)
        print("AI Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load AI model: {e}")

# 1. الدالة الأولى: استخراج البصمة الرقمية من الصورة
@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    image_bytes = file.read()

    # Decode the image to PIL for transformations
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except Exception as e:
        return jsonify({"error": "Invalid image format"}), 400

    if predictor and transform:
        try:
            # Apply transforms
            image_tensor = transform(img)
            # Add batch dimension [1, C, H, W]
            image_tensor = torch.unsqueeze(image_tensor, 0)
            
            # Get feature representation
            predictions = predictor(image_tensor)
            # تحويل البصمة إلى مصفوفة أرقام عادية (List of floats) ليفهمها الـ .NET
            features = predictions.cpu().numpy().tolist()[0] 
            return jsonify({"features": features, "status": "success"})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
    else:
        # Mock response if model couldn't load
        return jsonify({"message": "Model not loaded. This is a mock response from the Python API."}), 200


# 2. الدالة الثانية والمطورة: مقارنة البصمات (Vector Similarity Matching)
@app.route('/api/match', methods=['POST'])
def match():
    data = request.get_json()
    
    # التأكد من وصول البيانات المطلوبة من الـ .NET
    if not data or 'query_feature' not in data or 'candidates' not in data:
        return jsonify({"error": "Missing query_feature or candidates list"}), 400

    query_feature = np.array(data['query_feature'])
    candidates = data['candidates'] # مصفوفة تحتوي على الـ IDs والبصمات المخزنة في الـ SQL
    threshold = data.get('threshold', 0.0) # حد أدنى اختياري للقبول (مثلاً أعلى من 0.5)

    norm_q = np.linalg.norm(query_feature)
    if norm_q == 0:
        return jsonify({"error": "Invalid query feature vector (norm is zero)"}), 400

    results = []

    # المرور على كل الحيوانات المخزنة وحساب نسبة التشابه
    for cand in candidates:
        cand_id = cand.get('id')
        cand_feat_raw = cand.get('feature')
        
        if not cand_feat_raw:
            continue
            
        cand_feat = np.array(cand_feat_raw)
        norm_c = np.linalg.norm(cand_feat)
        
        if norm_c == 0:
            continue
            
        # تطبيق معادلة Cosine Similarity الرياضية
        similarity = float(np.dot(query_feature, cand_feat) / (norm_q * norm_c))
        
        # إذا تجاوزت نسبة التشابه الحد المطلوب، يتم إضافتها للنتائج
        if similarity >= threshold:
            results.append({
                "id": cand_id,
                "score": round(similarity, 4) # إرجاع النسبة مقربة لأربع خانات (مثلاً 0.9152 تعني 91.5%)
            })

    # ترتيب النتائج من الأعلى تشابهاً إلى الأقل
    results.sort(key=lambda x: x['score'], reverse=True)

    return jsonify({"matches": results, "status": "success"})


if __name__ == '__main__':
    setup_predictor()
    app.run(host='0.0.0.0', port=5000)
