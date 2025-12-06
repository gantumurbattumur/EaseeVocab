from fastapi import FastAPI
from app.api import words, crossword, auth

app = FastAPI()

app.include_router(words.router)
app.include_router(crossword.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "MemoCross API running"}
