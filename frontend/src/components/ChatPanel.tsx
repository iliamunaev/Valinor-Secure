import { useState } from 'react';
import { Message } from '../App';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send } from 'lucide-react';


interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, model: string) => void;

}

const AI_AGENTS = [
  { id: 'gpt', name: 'GPT-4' },
  { id: 'claude', name: 'Claude' },
  { id: 'deepseek', name: 'DeepSeek' },
];

const MODEL_MAP: Record<string, string> = {
  gpt: "gpt-4.1-mini",
  claude: "claude-3-opus",
  deepseek: "deepseek-v3",
};

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState('gpt');
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, MODEL_MAP[selectedAgent]);
      setInputValue('');
    }
  };  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 border-r border-gray-800">
      {/* Agent Selector */}
      <div className="p-4 border-b border-gray-800">
        <div className="bg-gray-800 rounded-lg p-1 inline-flex">
          {AI_AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`px-4 py-2 rounded-md transition-all ${
                selectedAgent === agent.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg border border-gray-700 focus-within:border-cyan-500 transition-colors">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a URL to scan..."
            className="min-h-[80px] bg-transparent border-0 text-gray-100 placeholder:text-gray-500 resize-none focus-visible:ring-0"
          />
          <div className="flex justify-between items-center px-3 pb-3">
            <span className="text-gray-500">
              Agent: {AI_AGENTS.find(a => a.id === selectedAgent)?.name}
            </span>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
