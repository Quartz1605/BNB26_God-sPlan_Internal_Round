import { useEffect, useRef, useState, RefObject } from "react";

export function useVideoVisibility(options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
      
      const video = videoRef.current;
      if (!video) return;

      if (entry.isIntersecting) {
        // Try to play if visible
        video.play().catch(() => {
          // Autoplay was prevented
        });
      } else {
        video.pause();
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(container);

    return () => {
      observer.unobserve(container);
      observer.disconnect();
    };
  }, [options]);

  return { containerRef, videoRef, isVisible };
}
