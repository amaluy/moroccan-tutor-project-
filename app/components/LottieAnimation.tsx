'use client';

import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

export default function LottieAnimation({ 
  animationData, 
  loop = true, 
  autoplay = true, 
  style 
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      animationData: animationData,
    });

    return () => {
      anim.destroy();
    };
  }, [animationData, loop, autoplay]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} />;
}