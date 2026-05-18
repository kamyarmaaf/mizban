import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! من دستیار هوشمند میزبان هستم. چطور می‌تونم کمکتون کنم؟',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: 'این بخش در نسخه بعدی با هوش مصنوعی فعال خواهد شد.\nلطفاً از لیست تجربه‌ها استفاده کنید.',
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage, aiResponse]);
    setInputText('');
  };

  return (
    <div className="fixed bottom-20 left-6 z-40">
      {isOpen ? (
        <div className="w-96 h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold">دستیار هوشمند</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-light">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'ai' ? 'bg-primary/20' : 'bg-complementary/20'
                  }`}
                >
                  {message.sender === 'ai' ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-complementary" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[75%] ${
                    message.sender === 'user' ? 'text-left' : 'text-right'
                  }`}
                >
                  <div
                    className={`rounded-xl px-3 py-2 text-sm ${
                      message.sender === 'ai'
                        ? 'bg-white text-dark border border-gray-200'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                  <p className="text-xs text-dark/40 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="پیام..."
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-right text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 flex-shrink-0"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
