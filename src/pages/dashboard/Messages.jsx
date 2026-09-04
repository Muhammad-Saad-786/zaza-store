import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import OnlineIndicator from "../../components/ui/OnlineIndicator";
import {
  HiOutlinePaperAirplane,
  HiOutlineRefresh,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
} from "react-icons/hi";
import useChatStore from "../../stores/useChatStore";
import useAuthStore from "../../stores/useAuthStore";
import Spinner from "../../components/ui/Spinner";
import QuickRepliesManager from "../../components/dashboard/QuickRepliesManager";

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
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Handle contact from account detail page
  useEffect(() => {
    const contactUser = location.state?.contactUser;
    if (contactUser) {
      openConversation(
        contactUser.userId,
        contactUser.username,
        contactUser.avatar_url,
      );
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

  const displayedConversations = filterUnreadOnly
    ? allConversations.filter((c) => c.unread > 0)
    : allConversations;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-140px)]"
    >
      <div className="flex h-full gap-4">
        {/* Conversations List */}
        <div
          className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 flex-shrink-0 bg-[#16161e] border border-[#262636] rounded-2xl overflow-hidden`}
        >
          <div className="p-4 border-b border-[#262636] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[#f5a623] text-lg font-black">︽</span>
              <h1 className="text-lg font-black text-white">Messages</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  filterUnreadOnly
                    ? "bg-[#f5a623] text-[#121217]"
                    : "bg-[#1f1f29] border border-[#2e2e3e] text-white hover:text-[#f5a623]"
                }`}
              >
                Unread
              </button>
              <button
                onClick={fetchConversations}
                className="p-1.5 text-white/60 hover:text-[#f5a623] rounded-lg hover:bg-[#1f1f29]"
                title="Refresh"
              >
                <HiOutlineRefresh className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : displayedConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <img
                  src="/messages.png"
                  alt="No messages"
                  className="w-24 h-24 object-contain mb-3"
                  onError={(e) => {
                    e.target.src = "/empty-orders.png";
                  }}
                />
                <h3 className="text-sm font-bold text-white">No chats yet</h3>
                <p className="text-white/50 text-xs mt-1">
                  Buyer conversations and offers will appear here.
                </p>
              </div>
            ) : (
              displayedConversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => handleOpenConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all ${
                    activeConversation?.userId === conv.userId
                      ? "bg-[#f5a623]/15 border border-[#f5a623]/40"
                      : "hover:bg-[#1f1f29] border border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#1f1f29] border border-[#2e2e3e] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative overflow-hidden">
                    {conv.avatar_url ? (
                      <img
                        src={conv.avatar_url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      conv.username?.charAt(0).toUpperCase() || "?"
                    )}
                    {conv.unread > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-[#f5a623] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {conv.username}
                      </span>
                      {conv.unread > 0 && (
                        <span className="bg-[#f5a623] text-[#121217] text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      Click to chat
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-col flex-1 bg-[#16161e] border border-[#262636] rounded-2xl overflow-hidden`}
        >
          {activeConversation ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[#262636] flex items-center justify-between bg-[#191924]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden text-white/60 hover:text-white mr-1 text-xs"
                  >
                    ← Back
                  </button>
                  <div className="w-9 h-9 rounded-full bg-[#1f1f29] border border-[#2e2e3e] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
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
                    <p className="text-xs font-bold text-white">
                      {activeConversation.username}
                    </p>
                    <OnlineIndicator
                      userId={activeConversation.userId}
                      showText
                      size="sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsQuickRepliesOpen(true)}
                  className="px-3 py-1 rounded-xl bg-[#f5a623]/15 text-[#f5a623] text-xs font-bold border border-[#f5a623]/30 hover:bg-[#f5a623]/25 transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineSparkles className="w-3.5 h-3.5" /> Quick Replies
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#121217]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <img
                      src="/messages.png"
                      alt="Empty chat"
                      className="w-20 h-20 object-contain mb-3"
                      onError={(e) => {
                        e.target.src = "/empty-orders.png";
                      }}
                    />
                    <p className="text-white/60 text-xs font-medium">
                      No messages yet. Send an offer or greeting!
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
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                            isMine
                              ? "bg-[#f5a623] text-[#121217] font-semibold rounded-br-sm shadow-md"
                              : "bg-[#1f1f29] text-white border border-[#2e2e3e] rounded-bl-sm"
                          }`}
                        >
                          <p className="leading-relaxed">{msg.content}</p>
                          <p
                            className={`text-[9px] mt-1 text-right ${
                              isMine ? "text-[#121217]/70 font-bold" : "text-white/40"
                            }`}
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

              {/* Message Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-[#262636] bg-[#16161e] flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsQuickRepliesOpen(true)}
                  className="p-2.5 text-[#f5a623] hover:bg-[#1f1f29] rounded-xl transition-colors"
                  title="Insert Canned Response"
                >
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message or use quick replies..."
                  className="flex-1 bg-[#121217] border border-[#2e2e3e] text-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#f5a623]"
                  disabled={sending}
                />

                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-2.5 bg-[#f5a623] text-[#121217] font-black rounded-xl hover:bg-[#e0961f] transition-colors disabled:opacity-50 text-xs flex items-center gap-1.5 shadow-md"
                >
                  <span>Send</span>
                  <HiOutlinePaperAirplane className="w-4 h-4 transform rotate-90" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <img
                  src="/messages.png"
                  alt="Select chat"
                  className="w-28 h-28 object-contain mx-auto mb-4"
                  onError={(e) => {
                    e.target.src = "/empty-orders.png";
                  }}
                />
                <h3 className="text-base font-black text-white">Select a conversation</h3>
                <p className="text-white/50 text-xs mt-1">
                  Choose a buyer or seller from the sidebar to begin chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Replies Modal */}
      <QuickRepliesManager
        isOpen={isQuickRepliesOpen}
        onClose={() => setIsQuickRepliesOpen(false)}
        onSelectReply={(text) => setNewMessage(text)}
      />
    </motion.div>
  );
}
