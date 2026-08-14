"use client";

import { useState, useRef, useEffect } from "react";

export default function AgentChat({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId }),
      });
      const data = await res.json();

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.message) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message.content }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to reach the agent." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '450px' }}>
      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem'
      }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Start chatting with {agentName}</p>
            <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Messages are persisted to the database.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: msg.role === 'user' ? 'rgba(219,231,214,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${msg.role === 'user' ? 'rgba(219,231,214,0.3)' : 'var(--glass-border)'}`,
          }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
            <span style={{ opacity: 0.5 }}>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        display: 'flex', gap: '0.5rem', padding: '1rem',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
            color: 'white', fontSize: '0.875rem', fontFamily: 'inherit'
          }}
        />
        <button type="submit" disabled={loading} className="pill-btn" style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(219,231,214,0.15)',
          opacity: loading ? 0.5 : 1,
        }}>
          Send
        </button>
      </form>
    </div>
  );
}
