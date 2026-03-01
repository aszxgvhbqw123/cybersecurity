import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import Logo from '../components/Logo';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AiChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful assistant specializing in Cybersecurity, Artificial Intelligence, and Information Technology. Answer questions clearly and provide code examples in markdown when relevant.',
        },
      });
      setMessages([{
          role: 'model',
          text: "Hello! I'm the M-Sec AI assistant. How can I help you with Cybersecurity, AI, or IT today?"
      }]);
    } catch (e: any) {
        setError("Failed to initialize AI Chat. Please ensure your API key is configured correctly.");
        console.error(e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMessage: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e: any) {
      console.error(e);
      const errorMessage = "Sorry, I couldn't process that request. Please try again.";
      setError(errorMessage);
       setMessages(prev => [...prev, {role: 'model', text: errorMessage}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <Logo className="h-8 w-8 flex-shrink-0 mt-1" />}
            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-accent-blue text-primary' : 'bg-secondary'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && <div className="h-8 w-8 flex-shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center font-bold">Y</div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <Logo className="h-8 w-8 flex-shrink-0 mt-1" />
            <div className="max-w-xl p-3 rounded-xl bg-secondary">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-accent-blue rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-accent-blue rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-accent-blue rounded-full animate-bounce"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 md:p-6 bg-primary border-t border-secondary">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={error || "Ask me anything about tech..."}
            disabled={isLoading || !chatRef.current}
            className={`w-full bg-secondary border border-gray-600 rounded-full py-3 px-5 text-text-primary focus:ring-2 focus:ring-accent-blue focus:outline-none transition disabled:cursor-not-allowed ${error ? 'placeholder-red-500/70' : ''}`}
            aria-label="Chat input"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || !chatRef.current}
            className="bg-accent-blue text-primary rounded-full p-3 hover:bg-opacity-80 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-110 disabled:scale-100"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatPage;