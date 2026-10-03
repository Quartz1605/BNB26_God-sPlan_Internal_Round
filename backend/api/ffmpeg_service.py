"""
FFmpeg / FFprobe service for video metadata extraction and clip rendering.
"""

import json
import subprocess
import os
import logging
import tempfile

logger = logging.getLogger("creatorai.ffmpeg")


async def get_video_metadata(file_path: str) -> dict:
    """
    Extract video metadata using ffprobe.
    Returns: { duration, width, height, fps, codec, has_audio }
    """
    try:
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            logger.error(f"[FFPROBE] Failed: {result.stderr}")
            raise Exception(f"FFprobe failed: {result.stderr}")

        probe_data = json.loads(result.stdout)

        # Extract video stream info
        video_stream = None
        has_audio = False
        for stream in probe_data.get("streams", []):
            if stream.get("codec_type") == "video" and video_stream is None:
                video_stream = stream
            if stream.get("codec_type") == "audio":
                has_audio = True

        if not video_stream:
            raise Exception("No video stream found in file")

        # Parse duration from format or stream
        duration = float(probe_data.get("format", {}).get("duration", 0))
        if duration == 0:
            duration = float(video_stream.get("duration", 0))

        # Parse FPS from r_frame_rate (e.g., "30/1" or "30000/1001")
        fps = 0.0
        r_frame_rate = video_stream.get("r_frame_rate", "0/1")
        if "/" in r_frame_rate:
            num, den = r_frame_rate.split("/")
            if int(den) > 0:
                fps = round(int(num) / int(den), 2)
        else:
            fps = float(r_frame_rate)

        metadata = {
            "duration": round(duration, 2),
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "fps": fps,
            "codec": video_stream.get("codec_name", "unknown"),
            "has_audio": has_audio
        }

        logger.info(f"[FFPROBE] Metadata extracted: duration={metadata['duration']}s, "
                     f"{metadata['width']}x{metadata['height']} @ {metadata['fps']}fps")

        return metadata

    except subprocess.TimeoutExpired:
        raise Exception("FFprobe timed out")
    except json.JSONDecodeError:
        raise Exception("FFprobe returned invalid JSON")
    except FileNotFoundError:
        logger.warning("[FFPROBE] ffprobe not found. Using mock metadata.")
        return {
            "duration": 600.0,
            "width": 1920,
            "height": 1080,
            "fps": 30.0,
            "codec": "h264 (mock)",
            "has_audio": True
        }


async def render_clip(
    source_path: str,
    output_path: str,
    start: float,
    end: float
) -> str:
    """
    Render a clip from source video using FFmpeg.
    Uses input seeking for speed, then re-encodes for accuracy.
    Returns the output file path.
    """
    duration = round(end - start, 2)

    logger.info(f"[CLIP_RENDER] Rendering clip: start={start}, end={end}, duration={duration}")

    try:
        cmd = [
            "ffmpeg",
            "-y",  # overwrite output
            "-ss", str(start),
            "-i", source_path,
            "-t", str(duration),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            "-avoid_negative_ts", "make_zero",
            output_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        if result.returncode != 0:
            logger.error(f"[CLIP_RENDER] FFmpeg error: {result.stderr[-500:]}")
            raise Exception(f"FFmpeg rendering failed")

        if not os.path.exists(output_path):
            raise Exception("FFmpeg did not produce output file")

        file_size = os.path.getsize(output_path)
        logger.info(f"[CLIP_RENDER] Success: {output_path} ({file_size} bytes)")

        return output_path

    except subprocess.TimeoutExpired:
        raise Exception("FFmpeg rendering timed out (5 min limit)")


async def extract_audio_for_transcription(video_path: str, output_audio_path: str) -> str:
    """
    Extract mono 16kHz audio from video for transcription.
    """
    logger.info(f"[FFMPEG] Extracting audio from {video_path} to {output_audio_path}")
    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            output_audio_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            logger.error(f"[FFMPEG] Audio extraction failed: {result.stderr[-300:]}")
            raise Exception("Failed to extract audio")
        return output_audio_path
    except subprocess.TimeoutExpired:
        raise Exception("Audio extraction timed out")
    except FileNotFoundError:
        logger.warning("[FFMPEG] ffmpeg not found. Creating empty mock audio file.")
        open(output_audio_path, 'wb').close()
        return output_audio_path


async def extract_frames_for_clip(
    video_path: str, 
    start: float, 
    end: float, 
    interval: int = 3, 
    width: int = 640,
    output_dir: str = ""
) -> list:
    """
    Extract frames at given interval for a specific clip segment.
    Returns list of paths to the extracted JPEG frames.
    """
    duration = end - start
    if duration <= 0:
        return []
        
    logger.info(f"[FFMPEG] Extracting frames for segment {start}-{end}")
    
    if not output_dir:
        output_dir = tempfile.gettempdir()
        
    import uuid
    prefix = uuid.uuid4().hex[:8]
    output_pattern = os.path.join(output_dir, f"frame_{prefix}_%03d.jpg")
    
    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-ss", str(start),
            "-t", str(duration),
            "-i", video_path,
            "-vf", f"fps=1/{interval},scale={width}:-1",
            "-q:v", "5",
            output_pattern
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            logger.error(f"[FFMPEG] Frame extraction failed: {result.stderr[-300:]}")
            raise Exception("Failed to extract frames")
            
        frames = []
        for f in sorted(os.listdir(output_dir)):
            if f.startswith(f"frame_{prefix}_") and f.endswith(".jpg"):
                frames.append(os.path.join(output_dir, f))
                
        logger.info(f"[FFMPEG] Extracted {len(frames)} frames for visual verification")
        return frames
        
    except subprocess.TimeoutExpired:
        raise Exception("Frame extraction timed out")
    except FileNotFoundError:
        logger.warning("[FFMPEG] ffmpeg not found. Returning empty frames list.")
        return []
