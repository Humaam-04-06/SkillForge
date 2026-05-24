import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faTrash, faSlidersH, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const MentorChat = () => {
  const { user } = useSkillForgeStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Persistent sessionId per session
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  // Load chat session if cached
  useEffect(() => {
    const cached = localStorage.getItem('skillforge_chat_history');
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached chat history:', e);
      }
    } else {
      // Welcome message
      setMessages([
        {
          role: 'model',
          content: `Hi ${user?.displayName || user?.username || 'developer'}! I am your SkillForge AI Mentor. 
          
I have scanned your current skills radar. I can help you understand your **technical gaps**, outline **project architectures** to bridge those gaps, or run a **mock interview** drill.
          
What would you like to discuss today? Try clicking one of the pre-set topics below!`
        }
      ]);
    }
  }, [user]);

  // Sync to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('skillforge_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || text.trim() === '') return;

    // Reset input
    if (!textToSend) setInputMessage('');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setSending(true);

    try {
      const response = await api.post('/api/ai/mentor-chat', {
        messages: newMessages,
        sessionId
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: response.data.reply,
            isDemo: response.data.isDemo 
          }
        ]);
      }
    } catch (error) {
      console.error('Mentor Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: 'I apologize, I encountered an unhandled network error. Please verify your internet connection or Gemini credentials and try again.' 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation history?')) {
      localStorage.removeItem('skillforge_chat_history');
      setMessages([
        {
          role: 'model',
          content: `History cleared. What would you like to focus on next, ${user?.displayName || user?.username}?`
        }
      ]);
    }
  };

  const chips = [
    { text: 'Explain my biggest gap', prompt: 'What are my biggest technical gaps according to my scanned profile, and how can I resolve them?' },
    { text: 'Suggest a portfolio project', prompt: 'Suggest a full-stack portfolio project specifically tailored to bridge my lowest skills categories.' },
    { text: 'Start mock interview', prompt: 'Start a mock interview! Ask me one core technical question regarding my target stack. Wait for my answer.' }
  ];

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Title */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-2 shrink-0">
        <div>
          <Badge variant="purple">AI Assistant</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">AI Mentor Chat</h1>
          <p className="text-xxs text-textSecondary">Consult senior dev bots on roadmap checkpoints and structures</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearChat}
          className="text-red-400 hover:text-red-300"
          icon={<FontAwesomeIcon icon={faTrash} />}
        >
          Clear Chat
        </Button>
      </div>

      {/* Chat messages viewport */}
      <Card className="flex-1 flex flex-col min-h-0 relative overflow-hidden" bodyClassName="p-0 flex flex-col h-full">
        {/* Messages scrollarea */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 min-h-0">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs ${
                  isUser 
                    ? 'bg-accentPurple/10 border-accentPurple/20 text-accentPurple' 
                    : 'bg-accentCyan/10 border-accentCyan/20 text-accentCyan'
                }`}>
                  {isUser ? 'U' : <FontAwesomeIcon icon={faRobot} />}
                </div>

                {/* Bubble content */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-accentPurple/20 border border-accentPurple/30 text-textPrimary rounded-tr-none' 
                      : 'bg-darkCard border border-darkBorder text-textPrimary rounded-tl-none'
                  }`}>
                    {/* Preserve markdown structure/paragraphs */}
                    <p className="whitespace-pre-line font-medium select-text">{msg.content}</p>
                  </div>
                  {!isUser && msg.isDemo && (
                    <span className="text-[10px] text-accentPurple font-semibold block px-1 tracking-wider uppercase">
                      ⚠️ Demo Response (Simulated AI)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-xs">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div className="flex gap-1.5 p-3 rounded-xl bg-darkCard border border-darkBorder rounded-tl-none">
                <div className="w-1.5 h-1.5 bg-accentCyan rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-accentCyan rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-accentCyan rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-3 border-t border-darkBorder/40 bg-darkBg/25 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar select-none">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              disabled={sending}
              onClick={() => handleSendMessage(chip.prompt)}
              className="px-3.5 py-1.5 rounded-full border border-darkBorder bg-darkCard/50 text-[10px] md:text-xxs font-semibold text-textSecondary hover:text-accentCyan hover:border-accentCyan/30 transition-all whitespace-nowrap active:scale-95 shrink-0"
            >
              {chip.text} <FontAwesomeIcon icon={faChevronRight} className="text-[8px] opacity-60 ml-1" />
            </button>
          ))}
        </div>

        {/* Text Input Panel */}
        <div className="p-4 border-t border-darkBorder shrink-0 bg-darkCard/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              disabled={sending}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about coding, gaps, roadmap milestones, or concepts..."
              className="flex-1 px-4 py-3 bg-darkBg border border-darkBorder rounded-lg text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-accentCyan transition-colors disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={sending || inputMessage.trim() === ''}
              className="px-4"
              icon={<FontAwesomeIcon icon={faPaperPlane} />}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default MentorChat;
