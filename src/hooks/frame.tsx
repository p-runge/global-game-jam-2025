import { createContext, useContext, useEffect, useRef, useState } from "react";

// ratio of 16/9
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type FrameContextType = {
  scale: number;
};
const FrameContext = createContext<FrameContextType | null>(null);

export function useFrame() {
  const frame = useContext(FrameContext);
  if (!frame) throw new Error("useFrame must be used within Frame");
  return frame;
}

export default function Frame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (!ref.current) return;

      const scale = Math.min(
        (1 / CANVAS_WIDTH) * window.innerWidth,
        (1 / CANVAS_HEIGHT) * window.innerHeight,
      );
      setScale(scale);
      ref.current.style.transform = `scale(${scale})`;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <FrameContext.Provider value={{ scale }}>
      <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
        <div
          ref={ref}
          className="bg-gray-200 aspect-[16/9] h-[1080px] w-[1920px]"
        >
          <div className="h-full overflow-hidden">{children}</div>
        </div>
      </div>
    </FrameContext.Provider>
  );
}
