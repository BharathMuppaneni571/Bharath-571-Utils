import React, { useMemo, useState, useEffect } from 'react';

const StarExplosion: React.FC<{ x: string; y: string; color: string; onComplete: () => void }> = ({ x, y, color, onComplete }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 30 + Math.random() * 40;
      return {
        id: i,
        tx: `${Math.cos(angle) * velocity}px`,
        ty: `${Math.sin(angle) * velocity}px`,
      };
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="star-explosion" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="explosion-particle"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}`,
            // @ts-ignore
            '--tx': p.tx,
            '--ty': p.ty,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const StarBackground: React.FC = () => {
  const [explosions, setExplosions] = useState<{ id: number; x: string; y: string; color: string }[]>([]);

  // Generate random static stars
  const staticStars = useMemo(() => {
    const colors = [
      'rgba(255, 255, 255, 1)',   // White
      'rgba(215, 235, 255, 0.9)', // Slight Blue
      'rgba(255, 245, 210, 0.9)', // Slight Yellow
      'rgba(255, 220, 220, 0.8)', // Slight Red/Pink
    ];
    return Array.from({ length: 140 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${size}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.4,
        delay: `${Math.random() * 10}s`,
        duration: `${2 + Math.random() * 5}s`,
        hasFlare: size > 2 && Math.random() > 0.6,
      };
    });
  }, []);

  // Memoize shooting stars configuration with slightly higher frequency
  const shootingStars = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dur: `${10 + Math.random() * 10}s`, // Half speed (long duration)
      delay: `${Math.random() * 20}s`, // More frequent than before (was 40s)
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const colors = ['#14b8a6', '#8b5cf6', '#3b82f6', '#fff'];
        setExplosions((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            color: colors[Math.floor(Math.random() * colors.length)]
          },
        ]);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const removeExplosion = (id: number) => {
    setExplosions((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* Randomized Stars */}
      {staticStars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full star-twinkle ${star.hasFlare ? 'star-flare' : ''}`}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${parseInt(star.size) * 2}px ${star.color}`,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          } as React.CSSProperties}
        >
          {star.hasFlare && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[400%] h-[1px] bg-white/20 blur-[0.5px]" />
              <div className="absolute h-[400%] w-[1px] bg-white/20 blur-[0.5px]" />
            </div>
          )}
        </div>
      ))}
      
      {/* Shooting Stars */}
      {shootingStars.map((sStar) => (
        <div
          key={sStar.id}
          className="shooting-star"
          style={{
            left: sStar.left,
            top: sStar.top,
            // @ts-ignore
            '--dur': sStar.dur,
            '--delay': sStar.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Nova Explosions */}
      {explosions.map((exp) => (
        <StarExplosion
          key={exp.id}
          x={exp.x}
          y={exp.y}
          color={exp.color}
          onComplete={() => removeExplosion(exp.id)}
        />
      ))}
    </div>
  );
};

export default StarBackground;
