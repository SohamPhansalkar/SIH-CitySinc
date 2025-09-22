from flask import Flask, request
from flask_restful import Api, Resource
import os
from imagevalidation import validate_image, match_keywords_to_department

app = Flask(__name__)
api = Api(app)

API_KEY = "CITYSYNC-AI"
STATIC_IMAGES_FOLDER = os.path.join(os.getcwd(), 'static', 'images')
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

class ImageValidation(Resource):
    def post(self):
        # API Key validation
        if request.headers.get('API-Key') != API_KEY:
            return {'error': 'Invalid API key'}, 401

        # Extract and validate JSON input
        data = request.get_json() or {}
        image_filename = data.get('image_path')
        description = data.get('description', '').strip()
        if not image_filename or not description:
            return {'error': 'Missing image_path or description'}, 400
        if len(description.split()) > 20:
            return {'error': 'Description must be 20 words or less'}, 400

        # Construct full path and validate file
        full_image_path = os.path.join(STATIC_IMAGES_FOLDER, image_filename)
        
        # ADD DEBUG LINES:
        print(f"Current working directory: {os.getcwd()}")
        print(f"STATIC_IMAGES_FOLDER: {STATIC_IMAGES_FOLDER}")
        print(f"image_filename: {image_filename}")
        print(f"full_image_path: {full_image_path}")
        print(f"File exists? {os.path.exists(full_image_path)}")
        
        if not os.path.exists(full_image_path):
            return {'error': 'Image file not found'}, 404
        if os.path.splitext(full_image_path)[1].lower() not in ALLOWED_EXTENSIONS:
            return {'error': 'Invalid image format'}, 400
        
        # Process image
        try:
            caption, similarity, cleaned_text = validate_image(full_image_path, description)
            issue, department = match_keywords_to_department(cleaned_text)
            accepted = similarity >= 0.6
            return {
                'similarity_score': round(similarity, 3),
                'status': "ACCEPTED" if accepted else "REJECTED",
                'predicted_issue': issue if accepted else "No issue",
                'assigned_department': department if accepted else "No department"
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500

api.add_resource(ImageValidation, '/validate')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=2000)