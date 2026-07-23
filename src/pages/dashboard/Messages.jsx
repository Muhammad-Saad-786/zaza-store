import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlinePaperAirplane,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from "react-icons/hi";
import useChatStore from "../../stores/useChatStore";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Messages() {
  const location = useLocation();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    fetchConversations,
    openConversation,
    sendMessage,
    subscribeToMessages,
    closeConversation,
  } = useChatStore();

  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Handle contact from account detail page
  useEffect(() => {
    const contactUser = location.state?.contactUser;
    if (contactUser) {
      console.log("Opening conversation with:", contactUser);
      openConversation(
        contactUser.userId,
        contactUser.username,
        contactUser.avatar_url,
      );
      // Clear the state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchConversations();
    const unsubscribe = subscribeToMessages();
    return () => {
      if (unsubscribe) unsubscribe();
      closeConversation();
    };
  }, []);

  useEffect(() => {
    if (activeConversation) {
      setShowSidebar(false);
    }
  }, [activeConversation]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleOpenConversation = (conv) => {
    openConversation(conv.userId, conv.username, conv.avatar_url);
    setShowSidebar(false);
  };

  // Merge active conversation into list if not present
  const allConversations = [...conversations];
  if (
    activeConversation &&
    !allConversations.find((c) => c.userId === activeConversation.userId)
  ) {
    allConversations.unshift({
      userId: activeConversation.userId,
      username: activeConversation.username,
      avatar_url: activeConversation.avatar_url,
      unread: 0,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-120px)]"
    >
      <div className="flex h-full gap-4">
        {/* Conversations List */}
        <div
          className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 flex-shrink-0`}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-extrabold text-white">
              Messages
            </h1>
            <button
              onClick={fetchConversations}
              className="text-sm text-brand-purple hover:text-brand-gold flex items-center gap-1"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <GlassCard className="flex-1 overflow-y-auto p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : allConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <HiOutlineUser className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No conversations yet</p>
                <p className="text-white/20 text-xs mt-1">
                  Click "Contact" on an account to start chatting with a seller
                </p>
              </div>
            ) : (
              allConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleOpenConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/5 border-b border-glass-border ${
                    activeConversation?.userId === conv.userId
                      ? "bg-brand-purple/10"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple overflow-visible to-brand-gold flex items-center justify-center text-sm font-bold text-white  flex-shrink-0 relative">
                    {conv.avatar_url ? (
                      <img
                        src={conv.avatar_url}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      conv.username?.charAt(0).toUpperCase() || "?"
                    )}
                    {conv.unread > 0 && (
                      <span className="absolute z-10 -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white truncate">
                        {conv.username}
                      </span>
                      {conv.verified_seller && (
                        <img
                          src="/blue-verify-badge.png"
                          alt="Verified"
                          className="w-4 h-4 object-contain flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </GlassCard>
        </div>

        {/* Chat Window */}
        <div
          className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-col flex-1`}
        >
          {activeConversation ? (
            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-glass-border">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden text-white/40 hover:text-white mr-2"
                >
                  ← Back
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                  {activeConversation.avatar_url ? (
                    <img
                      src={activeConversation.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    activeConversation.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {activeConversation.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <HiOutlineUser className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? "bg-brand-purple text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${isMine ? "text-white/50" : "text-white/30"}`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-glass-border flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-glass flex-1 text-sm px-3"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
              </form>
            </GlassCard>
          ) : (
            <GlassCard className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <HiOutlineUser className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Select a conversation</p>
                <p className="text-white/20 text-sm mt-1">
                  Choose a seller or buyer to start chatting
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
