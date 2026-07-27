import { useEffect, useState } from "react";
import useOnlineStatus from "../../stores/useOnlineStatus";

export default function OnlineIndicator({
  userId,
  showText = false,
  size = "sm",
}) {
  const { onlineUsers, fetchOnlineUsers, isUserOnline, getLastSeen } =
    useOnlineStatus();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeenText, setLastSeenText] = useState("");

  useEffect(() => {
    if (userId) {
      fetchOnlineUsers([userId]);
    }
  }, [userId]);

  useEffect(() => {
    setIsOnline(isUserOnline(userId));
    setLastSeenText(getLastSeen(userId));
  }, [onlineUsers, userId]);

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Green Dot */}
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full ${
            isOnline ? "bg-green-400" : "bg-gray-500"
          }`}
        />
        {isOnline && (
          <div
            className={`${sizes[size]} rounded-full bg-green-400 absolute inset-0 animate-ping opacity-75`}
          />
        )}
      </div>

      {/* Optional Text */}
      {showText && (
        <span
          className={`${textSizes[size]} ${isOnline ? "text-green-400" : "text-white/30"}`}
        >
          {isOnline ? "Online" : lastSeenText}
        </span>
      )}
    </div>
  );
}
