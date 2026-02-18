import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { GeminiService } from './services/gemini';
import { Message, Role, ChatConfig } from './types';

const INITIAL_CONFIG: ChatConfig = {
  userName: "Alex",
  topic: "General Inquiry"
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Ref to hold the service instance
  const geminiServiceRef = useRef<GeminiService | null>(null);

  // Initialize service once
  useEffect(() => {
    geminiServiceRef.current = new GeminiService();
    geminiServiceRef.current.initChat(INITIAL_CONFIG);
    
    // Optional: Add an initial greeting from the AI
    const initialGreeting: Message = {
      id: 'init-1',
      role: Role.MODEL,
      text: `Hello ${INITIAL_CONFIG.userName}! I'm Nexus, your AI support assistant. I see you're asking about ${INITIAL_CONFIG.topic}. How can I assist you today?`,
      timestamp: Date.now()
    };
    setMessages([initialGreeting]);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!geminiServiceRef.current) return;

    // 1. Add User Message
    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 2. Prepare AI Message Placeholder
      const aiMsgId = (Date.now() + 1).toString();
      const aiMessagePlaceholder: Message = {
        id: aiMsgId,
        role: Role.MODEL,
        text: '',
        timestamp: Date.now(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessagePlaceholder]);

      // 3. Stream Response
      let accumulatedText = '';
      const stream = geminiServiceRef.current.sendMessageStream(text);

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, text: accumulatedText } 
              : msg
          )
        );
      }

      // 4. Finalize
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Chat Error:", error);
      // Update the last message to show error
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.role === Role.MODEL && lastMsg.isStreaming) {
           return prev.map(msg => 
             msg.id === lastMsg.id 
              ? { ...msg, text: "I encountered an error processing your request. Please try again.", isError: true, isStreaming: false }
              : msg
           );
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        absolute lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Nexus</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Context</h3>
            <div className="space-y-2">
               <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">User</p>
                  <p className="text-sm font-medium text-slate-200">{INITIAL_CONFIG.userName}</p>
               </div>
               <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">Current Topic</p>
                  <p className="text-sm font-medium text-cyan-400">{INITIAL_CONFIG.topic}</p>
               </div>
            </div>
          </div>

          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Chats</h3>
             <button className="w-full text-left p-2 rounded hover:bg-slate-700 text-sm text-slate-300 transition-colors truncate">
               Billing Question - #1024
             </button>
             <button className="w-full text-left p-2 rounded hover:bg-slate-700 text-sm text-slate-300 transition-colors truncate">
               Login Issue - #1023
             </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full p-2 rounded hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            End Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="h-14 border-b border-slate-700 flex items-center justify-between px-4 lg:hidden bg-slate-800/80 backdrop-blur-md sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-semibold text-slate-200">Nexus Support</span>
          <div className="w-8"></div> {/* Spacer for centering */}
        </header>

        {/* Desktop Header (Minimal) */}
        <header className="hidden lg:flex h-14 border-b border-slate-800 items-center justify-between px-6 bg-slate-900/90 backdrop-blur-md">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-400">System Operational</span>
           </div>
           <div className="text-xs text-slate-500 font-mono">
              Model: gemini-3-flash
           </div>
        </header>

        <MessageList messages={messages} isLoading={isLoading} />
        <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;