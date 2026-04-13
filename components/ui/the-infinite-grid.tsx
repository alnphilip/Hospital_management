"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useMotionTemplate, 
  useAnimationFrame 
} from "framer-motion";

export const Component = () => {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const { left, top } = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5; 
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % 40);
    gridOffsetY.set((currentY + speedY) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  if (!mounted) return <div className="w-full h-full bg-transparent" />;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-transparent"
      )}
    >
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} id="bg-grid" />
      </div>
      <motion.div 
        className="absolute inset-0 z-0 opacity-100"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} id="glow-grid" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      {/* Main Content (Can be used as background or interactive component) */}
      {/* 
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto space-y-6 pointer-events-none">
         <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            The Infinite Grid
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Move your cursor to reveal the active grid layer. <br/>
            The pattern scrolls infinitely in the background.
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
              onClick={() => setCount(count + 1)}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
              Interact ({count})
          </button>
          <button 
              className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-all active:scale-95"
          >
              Learn More
          </button>
        </div>
      </div>
      */}
    </div>
  );
};

const GridPattern = ({ offsetX, offsetY, id }: { offsetX: any, offsetY: any, id: string }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={id}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/50 dark:text-foreground/60" 
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};
