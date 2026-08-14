'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentChatInterface({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Network failure.' }]);
    }

    setLoading(false);
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Chat with {agentName}</h3>

      {/* Message Area */}
      <div style={{
        flex: 1, minHeight: '200px', maxHeight: '300px', overflowY: 'auto',
        marginBottom: '1rem', padding: '0.75rem',
        background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        {messages.length === 0 ? (
          <div className="text-secondary" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
            Send a message to start chatting with {agentName}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(163,217,150,0.08)',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', fontSize: '0.8rem', lineHeight: '1.5',
            }}>
              <div className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                {msg.role === 'user' ? 'You' : agentName}
              </div>
              {msg.content}
            </div>
          ))
        )}
        {loading && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {agentName} is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
            color: 'white', fontSize: '0.875rem', outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="pill-btn"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(163,217,150,0.15)', color: 'var(--success-color)',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
