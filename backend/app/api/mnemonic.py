from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import base64
import os
import json

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

router = APIRouter()


class MnemonicReq(BaseModel):
    word: str
    definition: str


@router.post("/mnemonic/generate")
async def generate_mnemonic(req: MnemonicReq):

    # ----------------------------------------------------------
    # 1. Generate mnemonic JSON
    # ----------------------------------------------------------
    prompt_text = f"""
    Create mnemonic JSON.

    Word: {req.word}
    Definition: {req.definition}

    STRICT OUTPUT:
    {{
      "mnemonic_word": "...",
      "mnemonic_sentence": "..."
    }}
    """

    text_res = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt_text]
    )

    # Clean markdown
    raw = text_res.text.strip()
    raw = raw.replace("```json", "").replace("```", "")
    raw = raw.replace("**", "")
    raw = raw.strip()

    parsed = json.loads(raw)
    mnemonic_word = parsed["mnemonic_word"]
    mnemonic_sentence = parsed["mnemonic_sentence"]

    # ----------------------------------------------------------
    # 2. Generate image
    # ----------------------------------------------------------
    prompt_image = (
        f"Funny colorful cartoon illustration of: {mnemonic_sentence}. "
        "No text in the image. Highly visual."
    )

    img_res = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[prompt_image],
    )

    # Extract raw bytes from inline_data
    image_base64 = None
    for part in img_res.parts:
        if part.inline_data is not None:
            raw_bytes = part.inline_data.data  # <-- BYTES ✔
            image_base64 = base64.b64encode(raw_bytes).decode("utf-8")
            break

    return {
        "mnemonic_word": mnemonic_word,
        "mnemonic_sentence": mnemonic_sentence,
        "image_base64": image_base64,
    }
