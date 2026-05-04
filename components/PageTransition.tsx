"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ProgressBar from "./ProgressBar";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setProgress(100);

    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 120);

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [pathname, isLoading]);

  useEffect(() => {
    const startProgress = () => {
      setIsLoading(true);
      setProgress(18);

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      progressTimerRef.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 92) {
            return current;
          }

          return Math.min(current + 14 + Math.random() * 10, 92);
        });
      }, 130);
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");

      if (!target || target.hasAttribute("target")) {
        return;
      }

      const href = target.getAttribute("href");

      if (!href || (!href.startsWith("/") && !href.startsWith("."))) {
        return;
      }

      if (href === pathname) {
        return;
      }

      startProgress();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [pathname]);

  return (
    <div>
      <ProgressBar visible={isLoading} progress={progress} />
      <div className={isReady ? "page-transition" : "opacity-0"}>
        {children}
      </div>
    </div>
  );
}
