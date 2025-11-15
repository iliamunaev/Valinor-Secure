from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Allow requests from frontend dev server
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
def read_root():
    return {
        "message": "Hello from TEST FastAPI Test! Test!",
        "test_backend": os.getenv("TEST_BACKEND", "undefined"),
    }
