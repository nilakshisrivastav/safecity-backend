from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

app = FastAPI()

# 🔥 CORS (React frontend connect karne ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later production me restrict karna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load YOLO model
model = YOLO("model/best.pt")

# Classes (same order jo training me tha)
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

    # Temporary file save
    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO prediction
    results = model(file_location)

    detections = []
    highest_conf = 0
    final_label = "No Detection"

    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            label = CLASS_NAMES[class_id]

            detections.append({
                "label": label,
                "confidence": round(confidence * 100, 2)
            })

            if confidence > highest_conf:
                highest_conf = confidence
                final_label = label

    os.remove(file_location)

    return {
        "status": "success",
        "top_prediction": final_label,
        "confidence": round(highest_conf * 100, 2),
        "all_detections": detections
    }