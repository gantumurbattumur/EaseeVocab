from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.api_core import exceptions as google_exceptions
import base64
import os
import json
from typing import Optional

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY is None:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")

client = genai.Client(api_key=API_KEY)

router = APIRouter(prefix="/mnemonic", tags=["Mnemonic"])


class MnemonicRequest(BaseModel):
    """Request schema for mnemonic generation."""
    word: str = Field(..., min_length=1, description="Word to create mnemonic for")
    definition: str = Field(..., min_length=1, description="Definition of the word")


class MnemonicResponse(BaseModel):
    """Response schema for mnemonic generation."""
    mnemonic_word: str
    mnemonic_sentence: str
    image_base64: Optional[str] = None


@router.post("/generate", response_model=MnemonicResponse)
async def generate_mnemonic(req: MnemonicRequest) -> MnemonicResponse:
    """
    Generate a mnemonic (memory aid) for a word using AI.
    
    Args:
        req: Request containing word and definition
    
    Returns:
        MnemonicResponse with mnemonic word, sentence, and optional image
    
    Raises:
        HTTPException: If AI service fails or returns invalid data
    """
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

    try:
        text_res = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt_text]
        )
    except (google_exceptions.GoogleAPIError, Exception) as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to generate mnemonic text: {str(e)}"
        )

    if not text_res or not text_res.text:
        raise HTTPException(
            status_code=503,
            detail="Empty response from AI service"
        )

    # Clean markdown
    raw = text_res.text.strip()
    raw = raw.replace("```json", "").replace("```", "")
    raw = raw.replace("**", "")
    raw = raw.strip()

    try:
        parsed = json.loads(raw)
        mnemonic_word = parsed.get("mnemonic_word")
        mnemonic_sentence = parsed.get("mnemonic_sentence")
        
        if not mnemonic_word or not mnemonic_sentence:
            raise ValueError("Missing required fields in response")
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse mnemonic response: {str(e)}"
        )

    # ----------------------------------------------------------
    # 2. Generate image
    # ----------------------------------------------------------
    # Image should combine the mnemonic (for the word being learned) with the definition context
    prompt_image = (
        f"Funny colorful cartoon illustration representing the mnemonic: {mnemonic_sentence}. "
        f"This is a memory aid for the word '{req.word}' which means: {req.definition}. "
        "No text in the image. Highly visual and memorable. "
        "The illustration should help remember the word through the mnemonic connection."
    )

    image_base64 = None
    try:
        img_res = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt_image],
        )

        # Extract raw bytes from inline_data
        if img_res and img_res.parts:
            for part in img_res.parts:
                if part.inline_data is not None:
                    raw_bytes = part.inline_data.data
                    image_base64 = base64.b64encode(raw_bytes).decode("utf-8")
                    break
    except (google_exceptions.GoogleAPIError, Exception) as e:
        # Image generation failure is not critical, continue without image
        pass

    return MnemonicResponse(
        mnemonic_word=mnemonic_word,
        mnemonic_sentence=mnemonic_sentence,
        image_base64=image_base64
    )
