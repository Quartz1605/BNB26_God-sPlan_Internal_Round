import os
import json
import logging
import httpx
from typing import Dict, Any, List

logger = logging.getLogger("creatorai.transcription")

class TranscriptionResult:
    def __init__(self, segments: List[Dict[str, Any]]):
        self.segments = segments

    def to_compact_text(self) -> str:
        """Create a compact timestamped text representation for Gemini."""
        lines = []
        for seg in self.segments:
            start = round(seg.get("start", 0), 1)
            end = round(seg.get("end", 0), 1)
            text = seg.get("text", "").strip()
            if text:
                lines.append(f"[{start:05.1f} - {end:05.1f}]\n{text}\n")
        return "\n".join(lines)


class TranscriptionService:
    def __init__(self):
        self.provider = os.environ.get("TRANSCRIPTION_PROVIDER", "mock").lower()
        self.api_key = os.environ.get("TRANSCRIPTION_API_KEY", "")

    async def transcribe(self, audio_path: str) -> TranscriptionResult:
        logger.info(f"[TRANSCRIPTION] Starting transcription using provider: {self.provider}")
        
        if self.provider == "deepgram" and self.api_key:
            return await self._transcribe_deepgram(audio_path)
        else:
            # Fallback to a mock for development/testing
            return await self._transcribe_mock(audio_path)

    async def _transcribe_deepgram(self, audio_path: str) -> TranscriptionResult:
        url = "https://api.deepgram.com/v1/listen?punctuate=true&diarize=false&smart_format=true"
        
        headers = {
            "Authorization": f"Token {self.api_key}"
        }
        
        with open(audio_path, "rb") as audio_file:
            audio_data = audio_file.read()
            
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                url,
                headers=headers,
                content=audio_data
            )
                
            if response.status_code != 200:
                logger.error(f"[TRANSCRIPTION] Deepgram error: {response.text}")
                raise Exception(f"Transcription failed with status {response.status_code}")
                
            result = response.json()
            
            segments = []
            # Parse deepgram response
            try:
                words = result["results"]["channels"][0]["alternatives"][0]["words"]
                # Group words into rough sentences or segments (Deepgram smart_format usually gives good paragraphs or we just chunk by reasonable time)
                # For simplicity, if Deepgram returns paragraphs we use them, otherwise chunk every 5-10 seconds.
                paragraphs = result["results"]["channels"][0]["alternatives"][0].get("paragraphs", {})
                if paragraphs and "paragraphs" in paragraphs:
                    for para in paragraphs["paragraphs"]:
                        for sent in para["sentences"]:
                            segments.append({
                                "start": sent["start"],
                                "end": sent["end"],
                                "text": sent["text"]
                            })
                else:
                    # Fallback word-by-word chunking
                    current_segment = {"start": words[0]["start"], "text": [], "end": 0}
                    for w in words:
                        if w["start"] - current_segment["end"] > 1.5 and current_segment["text"]: # 1.5s pause
                            current_segment["text"] = " ".join(current_segment["text"])
                            segments.append(current_segment)
                            current_segment = {"start": w["start"], "text": [], "end": 0}
                            
                        current_segment["text"].append(w["punctuated_word"])
                        current_segment["end"] = w["end"]
                        
                    if current_segment["text"]:
                        current_segment["text"] = " ".join(current_segment["text"])
                        segments.append(current_segment)
            except KeyError:
                logger.warning("[TRANSCRIPTION] Could not parse expected Deepgram structure")
                
            return TranscriptionResult(segments)


    async def _transcribe_mock(self, audio_path: str) -> TranscriptionResult:
        """A mock transcription service for development without API keys."""
        logger.info("[TRANSCRIPTION] Using mock transcription")
        import asyncio
        await asyncio.sleep(2) # Simulate processing time
        
        # We can't know the video length easily here without passing it, 
        # so we just return a dummy transcript. 
        segments = [
            {"start": 0.0, "end": 4.2, "text": "Welcome back to the channel."},
            {"start": 4.5, "end": 11.7, "text": "Today I'm going to explain the biggest mistake people make when starting a company."},
            {"start": 12.0, "end": 19.3, "text": "Most founders think the problem is getting users, but it's actually retention."},
            {"start": 19.5, "end": 25.0, "text": "If you have a leaky bucket, it doesn't matter how much water you pour into it."},
            {"start": 25.5, "end": 35.0, "text": "So today we're going to cover three strategies to fix your retention and actually grow your startup."}
        ]
        return TranscriptionResult(segments)

transcription_service = TranscriptionService()
