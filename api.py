from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from controller import run_controller
import shutil
import os

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://satquery-ai-aethervision.vercel.app", 
                   "http://localhost:3000",
                   "http://127.0.0.1:3000",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/ask")
async def ask(
    question: str = Form(...),
    images: list[UploadFile] = File(...)
):
    saved_paths = []
    for image in images:
        file_path = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        saved_paths.append(file_path)

    result = run_controller(saved_paths, question)
    return result