from flask import Flask, request
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

API_KEY = "CITYSYNC-AI"

class ImageValidation(Resource):
    def post(self):
        # API Key validation
        if request.headers.get('API-Key') != API_KEY:
            return {'error': 'Invalid API key'}, 401

        # Always return success with hardcoded response
        else:
            return {
                'ai_generated_caption': "a large puddle in the middle of a road",
                'user_description': "pothole on road",
                'similarity_score': 0.637,
                'status': "ACCEPTED",
                'predicted_issue': "pothole",
                'assigned_department': "Roads & Transport",
                'severity': "MEDIUM"
            }, 200

api.add_resource(ImageValidation, '/validate')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=2000)