import React, { useEffect, useRef, useState } from 'react';

const ParticleConstellation = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Attraction to mouse
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200;
          this.vx += (dx / dist) * force * 0.05;
          this.vy += (dy / dist) * force * 0.05;
        }

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
      }

      draw(h) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, 80%, 70%, 0.8)`;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const currentHue = hue;

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw(currentHue);
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / 120) * 0.3;
            ctx.strokeStyle = `hsla(${currentHue}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      setHue(h => (h + 0.3) % 360);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleTouch = (e) => {
      if (e.touches[0]) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouch);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
      cancelAnimationFrame(animationId);
    };
  }, [hue]);

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-thin text-white tracking-widest opacity-90 animate-pulse">
            ETHEREAL
          </h1>
          <p className="text-sm text-white/60 tracking-[0.3em] uppercase font-light">
            Move to interact
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticleConstellation;
