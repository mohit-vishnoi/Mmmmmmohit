import React, { useEffect, useRef } from 'react';
import { Message, Role } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6 custom-scrollbar">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-80">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-cyan-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <p className="text-lg font-medium">How can Nexus help you today?</p>
          <p className="text-sm">Ask about billing, technical issues, or account settings.</p>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === Role.USER;
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md
                ${isUser 
                  ? 'bg-cyan-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }
                ${msg.isError ? 'border-red-500 bg-red-900/20 text-red-200' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1 gap-4">
                <span className={`text-xs font-bold ${isUser ? 'text-cyan-100' : 'text-cyan-500'}`}>
                  {isUser ? 'You' : 'Nexus AI'}
                </span>
                <span className={`text-[10px] opacity-70 ${isUser ? 'text-cyan-100' : 'text-slate-400'}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {msg.text}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start w-full">
           <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-md">
            <div className="flex items-center space-x-2 h-5">
              <div className="w-2 h-2 bg-cyan-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full typing-dot"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;