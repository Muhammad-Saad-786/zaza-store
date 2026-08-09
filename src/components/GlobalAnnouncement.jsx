import { useEffect, useState } from "react";

export default function GlobalAnnouncement() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 500ms
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Automatically hide popup after 4 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Don't render anything when hidden
  if (!isVisible) {
    return null;
  }

  // Close popup manually
  const handleClose = () => {
    setIsVisible(false);
  };

  // Prevent clicking inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/75
        backdrop-blur-sm
        px-4
        py-6
      "
      onClick={handleClose}
    >
      {/* Announcement Container */}
      <div
        onClick={handleModalClick}
        className="
          relative
          w-full
          max-w-[900px]
          animate-announcement
        "
      >
        {/* Announcement Image */}
        <img
          src="/zazastore-new.png"
          alt="ZAZA Store is evolving into a global gaming platform"
          className="
            block
            w-full
            h-auto

            rounded-2xl

            object-contain

            shadow-[0_0_80px_rgba(168,85,247,0.35)]
          "
        />
      </div>
    </div>
  );
}
