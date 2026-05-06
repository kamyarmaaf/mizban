import { useState } from 'react';
import { Send, Bot, User, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatPageProps {
  onNavigate?: (page: string) => void;
}

export default function AIChatPage({ onNavigate }: AIChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! من دستیار هوشمند میزبان هستم. چطور می‌تونم کمکتون کنم؟',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

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

  const handleClose = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-emerald-600 py-2 md:py-3 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleClose}
            className="absolute top-1.5 left-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-white text-center mb-0.5">
            دستیار هوشمند میزبان
          </h1>
          <p className="text-emerald-50 text-center text-xs">
            بهترین تجربه‌ها را با کمک هوش مصنوعی پیدا کنید
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3 flex flex-col">
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 sm:gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'ai' ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}
                >
                  {message.sender === 'ai' ? (
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[75%] sm:max-w-[70%] ${
                    message.sender === 'user' ? 'text-left' : 'text-right'
                  }`}
                >
                  <div
                    className={`rounded-lg sm:rounded-xl px-3 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm ${
                      message.sender === 'ai'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 px-2">
                    {message.timestamp.toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-2 sm:p-3 bg-white">
            <div className="flex gap-2 sm:gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 px-3 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right text-xs sm:text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg sm:rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">ارسال</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-yellow-800 text-xs text-center">
            این یک نسخه MVP است. قابلیت چت با هوش مصنوعی در نسخه‌های آینده فعال خواهد شد.
          </p>
        </div>
      </div>
    </div>
  );
}
