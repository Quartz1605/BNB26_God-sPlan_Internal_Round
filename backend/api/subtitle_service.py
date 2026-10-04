def _format_time_srt(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int(round((seconds % 1) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"

def _format_time_vtt(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int(round((seconds % 1) * 1000))
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"
    return f"{minutes:02d}:{secs:02d}.{ms:03d}"

def generate_srt(segments: list) -> str:
    lines = []
    for i, seg in enumerate(segments, start=1):
        start = _format_time_srt(seg.get("start", 0))
        end = _format_time_srt(seg.get("end", 0))
        text = seg.get("text", "").strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)

def generate_vtt(segments: list) -> str:
    lines = ["WEBVTT\n"]
    for i, seg in enumerate(segments, start=1):
        start = _format_time_vtt(seg.get("start", 0))
        end = _format_time_vtt(seg.get("end", 0))
        text = seg.get("text", "").strip()
        lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(lines)
