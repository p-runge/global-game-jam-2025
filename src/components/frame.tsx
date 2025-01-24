import { useEffect, useRef } from "react";

// ratio of 16/9
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export function Frame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resize = () => {
      if (!ref.current) return;

      console.log(window.innerWidth, window.innerHeight);

      const scale = Math.min(
        (1 / CANVAS_WIDTH) * window.innerWidth,
        (1 / CANVAS_HEIGHT) * window.innerHeight,
      );
      ref.current.style.transform = `scale(${scale})`;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <div
        ref={ref}
        className="aspect-[16/9] h-[1080px] w-[1920px] bg-gray-200"
      >
        {children}
      </div>
    </div>
  );
}
