from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("smartcity_best.pt")

@app.get("/")
def home():
    return {"message": "SafeCity AI Backend Running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    
    temp_file = f"temp_{file.filename}"
    
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model(temp_file)

    detections = []

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls]

            detections.append({
                "incident": label,
                "confidence": round(conf * 100, 2)
            })

    os.remove(temp_file)

    return {"detections": detections}