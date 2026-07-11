// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – General Inquiry Chat (pre-contract)
// Route: /inquiry/:designerId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

interface InquiryMessage {
  id: string
  content: string
  sender: 'client' | 'designer'
  timestamp: string
}

const AUTO_REPLIES = [
  "Thank you for your interest! I'd love to discuss your project further. Could you share more details about what you're looking for?",
  "That sounds like an exciting project! I have experience in that area. Let me know your timeline and budget expectations.",
  "I appreciate your inquiry! I'm currently available for new projects. Would you like to schedule a brief consultation call?",
]

export default function InquiryChat() {
  const { designerId } = useParams<{ designerId: string }>()
  const navigate = useNavigate()
  const { designers } = useStore((s) => ({
    designers: s.designers,
  }))

  const designer = designers.find((d) => d.user_id === designerId)

  const [messages, setMessages] = useState<InquiryMessage[]>([
    {
      id: 'welcome',
      content: `Hi! You're reaching out to ${designer?.name || 'this designer'}. This is a general inquiry chat — no active contract yet. Feel free to ask about their services, availability, or portfolio.`,
      sender: 'designer',
      timestamp: 'Now',
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const clientMsg: InquiryMessage = {
      id: `msg-${Date.now()}`,
      content: input.trim(),
      sender: 'client',
      timestamp: 'Just now',
    }
    setMessages((prev) => [...prev, clientMsg])
    setInput('')

    // Simulate auto-reply after delay
    setTimeout(() => {
      const reply: InquiryMessage = {
        id: `reply-${Date.now()}`,
        content: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sender: 'designer',
        timestamp: 'Just now',
      }
      setMessages((prev) => [...prev, reply])
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-mist-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-mist-100">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-mist-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-charcoal-900" />
          </button>
          <Avatar
            name={designer?.name || 'Designer'}
            src={designer?.avatar_url || null}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-inter font-medium text-charcoal-900 text-sm truncate">
              {designer?.name || 'Designer'}
            </p>
            <Badge variant="mist" size="sm">General Inquiry</Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={[
                'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-inter',
                msg.sender === 'client'
                  ? 'bg-gradient-to-r from-copper-700 to-copper-600 text-white rounded-br-md'
                  : 'bg-white text-charcoal-900 border border-mist-100 rounded-bl-md',
              ].join(' ')}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-mist-100">
        <div className="max-w-2xl mx-auto flex items-center gap-2 px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 h-11 px-4 rounded-xl border border-mist-200 bg-mist-50 text-sm font-inter text-charcoal-900 placeholder:text-mist-300 focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl gradient-copper text-white flex items-center justify-center shadow-md shadow-copper-700/25 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
