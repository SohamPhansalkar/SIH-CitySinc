from transformers import BlipProcessor, BlipForConditionalGeneration
from sentence_transformers import SentenceTransformer, util
from PIL import Image
import torch
import torchvision.transforms as T
import torch.nn.functional as F
from torchvision.models import resnet18, ResNet18_Weights
import re
import string

# --- BLIP Captioning ---
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model.eval()

# --- Sentence Similarity ---
similarity_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

# --- Simple Classification Model ---
# Replace with your own trained model for real use
class SimpleClassifier(torch.nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.model = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, num_classes)

    def forward(self, x):
        return self.model(x)

department_labels = {
    "Roads & Transport": [
        "pothole",
        "road_crack",
        "damaged_signage",
        "faded_road_markings",
        "broken_barrier",
        "damaged_sidewalk",
        "illegal_parking",
        "blocked_driveway",
        "abandoned_vehicle",
        "traffic_signal_fault"
    ],

    "Sanitation & Waste Management": [
        "garbage_dump",
        "overflowing_bin",
        "littering",
        "construction_debris",
        "dead_animal",
        "animal_waste"
    ],

    "Drainage & Water Supply": [
        "waterlogging",
        "open_manhole",
        "clogged_drain",
        "burst_pipe",
        "leaking_tap"
    ],

    "Electrical & Public Lighting": [
        "streetlight_fault",
        "flickering_light",
        "electric_wire_hazard",
        "fallen_electric_pole",
        "transformer_issue"
    ],

    "Environment & Parks": [
        "fallen_tree",
        "illegal_tree_cutting",
        "damaged_park_bench",
        "broken_playground_equipment",
        "overgrown_weeds"
    ],

    "Urban Planning / Public Safety": [
        "graffiti_vandalism",
        "encroachment",
        "broken_fence",
        "unsafe_building",
        "fire_hazard"
    ],

    "Public Amenities": [
        "public_toilet_issue",
        "drinking_water_issue",
        "bus_stop_damage",
        "damaged_street_furniture"
    ],

    "Pollution Control": [
        "noise_pollution",
        "air_pollution",
        "industrial_waste",
        "illegal_burning"
    ],

    "Animal Control & Public Health": [
        "stray_animals",
        "mosquito_breeding_site"
    ],

    "Normal / No Issue": [
        "normal"
    ]
}

# Extract all unique class labels from the department_labels dictionary
class_labels = sorted(list(set([item for sublist in department_labels.values() for item in sublist])))

# Load classifier (for demo, using random weights; replace with your trained weights)
classifier = SimpleClassifier(num_classes=len(class_labels))
classifier.eval()


# Image preprocessing for classifier
classifier_transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def classify_image(image_path):
    image = Image.open(image_path).convert("RGB")
    img_tensor = classifier_transform(image).unsqueeze(0)
    with torch.no_grad():
        logits = classifier(img_tensor)
        probs = F.softmax(logits, dim=1)
        pred_idx = probs.argmax(dim=1).item()
        confidence = probs[0, pred_idx].item()
    return class_labels[pred_idx], confidence

def get_department(issue):
    for department, issues in department_labels.items():
        if issue in issues:
            return department
    return "Unknown Department"

def clean_text(text):
    text = text.lower()
    text = re.sub(f'[{re.escape(string.punctuation)}]', '', text)
    return text

def validate_image(image_path, user_description):
    # Generate caption
    image = Image.open(image_path).convert("RGB")
    inputs = blip_processor(images=image, return_tensors="pt")
    out = blip_model.generate(**inputs)
    caption = blip_processor.decode(out[0], skip_special_tokens=True)

    # Calculate similarity
    emb1 = similarity_model.encode(caption, convert_to_tensor=True)
    emb2 = similarity_model.encode(user_description, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(emb1, emb2).item()

    # Combine and clean caption and description for keyword extraction
    combined_text = caption + " " + user_description
    cleaned_text = clean_text(combined_text)

    return caption, similarity, cleaned_text

def match_keywords_to_department(cleaned_text):
    best_match_issue = "Unknown Issue"
    best_match_department = "Unknown Department"
    max_matches = 0

    cleaned_text_words = cleaned_text.split()

    for department, issues in department_labels.items():
        for issue in issues:
            issue_words = issue.split('_')
            current_matches = 0
            for issue_word in issue_words:
                if issue_word in cleaned_text_words:
                    current_matches += 1

            if current_matches > max_matches:
                max_matches = current_matches
                best_match_issue = issue
                best_match_department = department

    return best_match_issue, best_match_department


# Static image path - CHANGE THIS TO YOUR IMAGE NAME
image_path = input("Enter the path of the image:")

# Ask user for description
description = input("Enter your description of the image: ")

# Process
caption, similarity, cleaned_text = validate_image(image_path, description)

# Match keywords to department
best_match_issue, best_match_department = match_keywords_to_department(cleaned_text)

# Show results in proper format
print("\n--- Validation Results ---")
print(f"AI Generated Caption : {caption}")
print(f"User Description     : {description}")
print(f"Similarity Score     : {similarity:.3f}")
print(f"Status               : {'ACCEPTED ✅' if similarity >= 0.6 else 'REJECTED ❌'}")
if(similarity >= 0.6):
  print(f"Predicted Issue      : {best_match_issue}")
  print(f"Assigned Department  : {best_match_department}")
