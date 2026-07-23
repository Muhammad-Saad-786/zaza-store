import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineSearch, HiOutlineLightningBolt } from "react-icons/hi";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const totalVideos = 4;
const getVideoSrc = (index) => `/hero-${index}.mp4`;

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs
  const frameRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const nextVideoRef = useRef(null);

  // Force video reload when component mounts
  useEffect(() => {
    setLoading(true);

    const video = backgroundVideoRef.current;

    if (video) {
      video.load();

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }

    // Safety fallback so loader never gets stuck
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Hide loader when background video is ready
  const handleBackgroundLoaded = () => {
    setLoading(false);
  };

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prev) => (prev % totalVideos) + 1);
  };

  // Main video transition animation
  useGSAP(
    () => {
      if (!hasClicked) return;

      gsap.set(nextVideoRef.current, { visibility: "visible" });

      gsap.to(nextVideoRef.current, {
        transformOrigin: "center center",
        scale: 1,
        width: "100%",
        height: "100%",
        duration: 1,
        ease: "power1.inOut",
        onStart: () => {
          nextVideoRef.current?.load();
          nextVideoRef.current?.play().catch(() => {});
        },
      });

      gsap.from(previewVideoRef.current, {
        transformOrigin: "center center",
        scale: 0,
        duration: 1.5,
        ease: "power1.inOut",
      });
    },
    { dependencies: [currentIndex, hasClicked], revertOnUpdate: true },
  );

  // Scroll animation
  useGSAP(() => {
    if (!frameRef.current) return;

    gsap.set(frameRef.current, {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });

    gsap.from(frameRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: frameRef.current,
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  }, []);

  // Cleanup ScrollTriggers when leaving page
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0s]" />
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {/* Video Frame */}
      <div
        ref={frameRef}
        className="relative z-10 h-full w-full overflow-hidden"
      >
        {/* Background Video */}
        <video
          key={`bg-${currentIndex}`}
          ref={backgroundVideoRef}
          src={getVideoSrc(currentIndex === totalVideos - 1 ? 1 : currentIndex)}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleBackgroundLoaded}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />

        {/* Mini Video Preview - Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-40 h-40 sm:w-56 sm:h-56 cursor-pointer rounded-xl overflow-hidden">
          <VideoPreview>
            <div
              onClick={handleMiniVdClick}
              className="w-full h-full scale-50 opacity-0 hover:scale-100 hover:opacity-100 transition-all duration-500"
            >
              <video
                key={`preview-${currentIndex}`}
                ref={previewVideoRef}
                src={getVideoSrc((currentIndex % totalVideos) + 1)}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full scale-150 object-cover"
              />
            </div>
          </VideoPreview>
        </div>

        {/* Next Video (hidden, expands on click) */}
        <video
          key={`next-${currentIndex}`}
          ref={nextVideoRef}
          src={getVideoSrc(currentIndex)}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible z-20 w-40 h-40 object-cover"
        />

        {/* Content */}
        <div className="absolute inset-0 z-40">
          <div className="pt-20 sm:pt-24 px-5 sm:px-10">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter">
              Find Your
              <br />
              <span className="text-transparent bg-clip-text bg-amber-500  ">
                Dream
              </span>{" "}
              Account
            </h1>

            <p className="text-white/50 text-lg mt-4 max-w-xs">
              Premium MLBB Accounts
              <br />
              Rare Skins & High Ranks
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/marketplace">
                <button className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  <HiOutlineSearch className="w-5 h-5" />
                  Browse
                </button>
              </Link>

              <Link to="/sell">
                <button className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-black rounded-xl font-semibold hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25 transition-all">
                  <HiOutlineLightningBolt className="w-5 h-5" />
                  Sell
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
