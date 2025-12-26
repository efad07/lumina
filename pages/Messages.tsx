
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Conversation, Message, User } from '../types';
import { MockService } from '../services/mockService';
import { Send, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(userId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle direct navigation to a chat
  useEffect(() => {
    if (userId) {
      setActiveConversationId(userId);
    }
  }, [userId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (user && activeConversationId) {
      loadMessages(activeConversationId);
      // Also fetch user details if not in conversation list (first time chat)
      MockService.getUserById(activeConversationId).then(u => setActiveUser(u));
    }
  }, [activeConversationId, user]);

  // Polling for "Real-time" effect
  useEffect(() => {
    if (!activeConversationId || !user) return;

    const intervalId = setInterval(() => {
      // Silently refresh messages
      MockService.getMessages(user.id, activeConversationId).then(msgs => {
        // Simple diff check could be better, but replacing is fine for mock
        if (msgs.length !== messages.length) {
          setMessages(msgs);
        }
      });
      // Also refresh sidebar to update last message
      MockService.getConversations(user.id).then(setConversations);
    }, 3000); // Check every 3 seconds

    return () => clearInterval(intervalId);
  }, [activeConversationId, user, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const data = await MockService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (otherId: string) => {
    if (!user) return;
    try {
      const msgs = await MockService.getMessages(user.id, otherId);
      setMessages(msgs);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversationId) return;

    const tempContent = newMessage;
    setNewMessage(''); // optimistic clear

    try {
      const sentMsg = await MockService.sendMessage(user.id, activeConversationId, tempContent);
      setMessages(prev => [...prev, sentMsg]);
      // Update sidebar list order or content immediately
      loadConversations();
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex transition-colors">
      
      {/* Sidebar - Conversations List */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r border-gray-200 dark:border-gray-700`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search people..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-3 animate-pulse">
                   <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                   <div className="flex-1 space-y-2 py-2">
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                     <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                   </div>
                 </div>
               ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No conversations yet. Start messaging someone from their profile!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {conversations.map(convo => (
                <div 
                  key={convo.userId}
                  onClick={() => {
                    setActiveConversationId(convo.userId);
                    navigate(`/messages/${convo.userId}`);
                  }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${activeConversationId === convo.userId ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <img src={convo.user.avatarUrl} alt={convo.user.username} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className={`font-semibold text-sm truncate ${activeConversationId === convo.userId ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                          {convo.user.fullName}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        {convo.lastMessage.senderId === user.id ? 'You: ' : ''}{convo.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversationId ? (
        <div className={`${activeConversationId ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 flex-col bg-white dark:bg-gray-800`}>
           {/* Chat Header */}
           <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => {
                   setActiveConversationId(null);
                   navigate('/messages');
                 }}
                 className="md:hidden text-gray-500"
               >
                 <ArrowLeft className="h-6 w-6" />
               </button>
               {activeUser ? (
                 <>
                   <img src={activeUser.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                   <div>
                     <h3 className="font-bold text-gray-900 dark:text-white">{activeUser.fullName}</h3>
                     <span className="text-xs text-green-500 font-medium">Online</span>
                   </div>
                 </>
               ) : (
                 <div className="animate-pulse flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                   <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                 </div>
               )}
             </div>
             <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
               <MoreVertical className="h-5 w-5" />
             </button>
           </div>

           {/* Messages List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
             {messages.map((msg) => {
               const isMe = msg.senderId === user.id;
               return (
                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                     isMe 
                       ? 'bg-indigo-600 text-white rounded-br-none' 
                       : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                   }`}>
                     <p className="text-sm">{msg.content}</p>
                     <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                       {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                 </div>
               );
             })}
             <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
             <form onSubmit={handleSendMessage} className="flex gap-2">
               <input
                 type="text"
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 placeholder="Write a message..."
                 className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
               />
               <Button type="submit" disabled={!newMessage.trim()} className="rounded-xl aspect-square p-0 w-12 flex items-center justify-center">
                 <Send className="h-5 w-5 ml-0.5" />
               </Button>
             </form>
           </div>
        </div>
      ) : (
        <div className="hidden md:flex w-2/3 flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
             <Search className="h-10 w-10 text-gray-400 dark:text-gray-500" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
           <p>Choose a person from the list to start chatting</p>
        </div>
      )}
    </div>
  );
};
