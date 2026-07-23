import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const maxPoints = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new point at mouse position
      if (mouseRef.current.x > 0) {
        pointsRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          age: 0,
          maxAge: 50,
        });
      }

      // Update and draw points
      pointsRef.current = pointsRef.current.filter((point) => {
        point.age++;

        if (point.age > point.maxAge) return false;

        const progress = point.age / point.maxAge;
        const alpha = 1 - progress;
        const size = 3 * (1 - progress * 0.7);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.6})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.1})`;
        ctx.fill();

        return true;
      });

      // Limit points
      if (pointsRef.current.length > maxPoints) {
        pointsRef.current = pointsRef.current.slice(-maxPoints);
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
  );
}
