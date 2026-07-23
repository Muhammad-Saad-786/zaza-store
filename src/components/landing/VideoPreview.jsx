import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const VideoPreview = ({ children }) => {
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const rect = currentTarget.getBoundingClientRect();
    const xOffset = clientX - (rect.left + rect.width / 2);
    const yOffset = clientY - (rect.top + rect.height / 2);

    if (isHovering) {
      gsap.to(sectionRef.current, {
        x: xOffset * 0.5,
        y: yOffset * 0.5,
        rotationY: xOffset * 0.02,
        rotationX: -yOffset * 0.02,
        duration: 1,
        ease: "power1.out",
      });
      gsap.to(contentRef.current, {
        x: -xOffset * 0.3,
        y: -yOffset * 0.3,
        duration: 1,
        ease: "power1.out",
      });
    }
  };

  useEffect(() => {
    if (!isHovering) {
      gsap.to(sectionRef.current, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 1,
        ease: "power1.out",
      });
      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        duration: 1,
        ease: "power1.out",
      });
    }
  }, [isHovering]);

  return (
    <div
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="w-full h-full"
    >
      <div ref={contentRef} className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default VideoPreview;
