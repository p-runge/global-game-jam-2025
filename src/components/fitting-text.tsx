import { useEffect, useRef } from "react";

interface Props {
  children: string;
  width?: string;
  height?: string;
}

export default function FittingText({
  children,
  width = "100%",
  height = "100%",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const calculateFontSize = () => {
    if (!containerRef.current || !textRef.current) return;

    const boxWidth = containerRef.current.clientWidth;
    const boxHeight = containerRef.current.clientHeight;

    let low = 8; // Minimum readable font size
    let high = 100; // Arbitrary large font size
    let bestFit = low;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      textRef.current.style.fontSize = `${mid}px`;

      const textWidth = textRef.current.clientWidth;
      const textHeight = textRef.current.clientHeight;

      if (textWidth <= boxWidth && textHeight <= boxHeight) {
        bestFit = mid; // Keep this size as a candidate
        low = mid + 1; // Try a bigger font
      } else {
        high = mid - 1; // Reduce font size
      }
    }

    textRef.current.style.fontSize = `${bestFit}px`;
  };

  useEffect(() => {
    calculateFontSize();
    window.addEventListener("resize", calculateFontSize);
    return () => window.removeEventListener("resize", calculateFontSize);
  }, [children, width, height]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center"
      style={{
        width,
        height,
      }}
    >
      <span
        ref={textRef}
        className="whitespace-normal break-words text-center leading-none"
      >
        {children}
      </span>
    </div>
  );
}
