import asyncio
import os
import sys

# Setup environment to load from backend/.env
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Import services
from api.ffmpeg_service import extract_audio_for_transcription, extract_frames_for_clip
from api.transcription_service import transcription_service
from api.ai_service import analyze_transcript_with_ai, verify_clip_visually_with_ai

async def test_pipeline(video_path: str):
    print(f"=== TESTING PIPELINE FOR {video_path} ===")
    
    if not os.path.exists(video_path):
        print(f"File not found: {video_path}")
        return

    import tempfile
    import time
    temp_dir = tempfile.gettempdir()
    audio_out = os.path.join(temp_dir, "test_audio.wav")
    
    t0 = time.time()
    
    # 1. FFprobe
    from api.ffmpeg_service import get_video_metadata
    metadata = await get_video_metadata(video_path)
    dur = metadata.get("duration", 0)
    print(f"[1] Metadata: Duration = {dur}s")
    
    # 2. Audio Extraction
    print("[2] Extracting audio...")
    await extract_audio_for_transcription(video_path, audio_out)
    
    # 3. Transcription
    print("[3] Transcribing audio...")
    t_stt = time.time()
    transcript_result = await transcription_service.transcribe(audio_out)
    compact_text = transcript_result.to_compact_text()
    print(f"    Transcription took {time.time() - t_stt:.2f}s. Extracted {len(transcript_result.segments)} segments.")
    
    # 4. Gemini Transcript Analysis
    print("[4] Gemini Transcript Analysis...")
    t_ai = time.time()
    analysis = await analyze_transcript_with_ai(compact_text, dur)
    print(f"    Transcript analysis took {time.time() - t_ai:.2f}s. Found {len(analysis.get('clip_candidates', []))} candidates.")
    
    # 5. Visual Verification
    print("[5] Gemini Visual Verification...")
    t_vis = time.time()
    candidates = analysis.get("clip_candidates", [])
    verified_candidates = []
    
    for idx, c in enumerate(candidates):
        print(f"    Verifying candidate {idx+1}: {c['title']} ({c['start']}s - {c['end']}s)")
        frames = await extract_frames_for_clip(video_path, c["start"], c["end"], interval=3, width=640, output_dir=temp_dir)
        print(f"      Extracted {len(frames)} frames. Sending to Gemini...")
        verified = await verify_clip_visually_with_ai(c, frames)
        verified_candidates.append(verified)
        
        # Cleanup frames
        for f in frames:
            try:
                os.remove(f)
            except:
                pass
                
    analysis["clip_candidates"] = verified_candidates
    print(f"    Visual verification took {time.time() - t_vis:.2f}s.")
    
    print(f"=== TOTAL TIME: {time.time() - t0:.2f}s ===")
    
    # Cleanup audio
    if os.path.exists(audio_out):
        os.remove(audio_out)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pipeline.py <path_to_video>")
    else:
        asyncio.run(test_pipeline(sys.argv[1]))
