from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

app = FastAPI()

# CORS (React frontend connect karne ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO("model/best.pt")

# Class names
CLASS_NAMES = [
    "Red Light Violation",
    "Fight",
    "Fire/Smoke",
    "Crowd",
    "Suspicious"
]


@app.get("/")
def home():
    return {"message": "SafeCity AI Backend Running 🚀"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Save temporary file
    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run prediction
    results = model(file_location)

    detections = []
    boxes_list = []

    highest_conf = 0
    final_label = "No Detection"

    class_counts = {name: 0 for name in CLASS_NAMES}

    for r in results:
        if r.boxes is None:
            continue

        for box in r.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            bbox = box.xyxyn[0].tolist()

            label = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else "Unknown"

            if label in class_counts:
                class_counts[label] += 1

            detections.append({
                "label": label,
                "confidence": round(confidence * 100, 2),
                "box": bbox
            })

            boxes_list.append(bbox)

            if confidence > highest_conf:
                highest_conf = confidence
                final_label = label

    # Remove temp file
    if os.path.exists(file_location):
        os.remove(file_location)

    return {
        "status": "success",
        "top_prediction": final_label,
        "confidence": round(highest_conf * 100, 2),
        "all_predictions": detections,
        "bounding_boxes": boxes_list,
        "class_counts": class_counts
    }