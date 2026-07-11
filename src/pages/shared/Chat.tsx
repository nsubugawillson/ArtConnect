// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – In-Contract Real-Time Chat Screen
// Route: /chat/:contractId
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { useStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { getInitials } from '../../lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (msgDay.getTime() === today.getTime()) return 'Today'
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Seed demo messages for contractId demo-contract-001 ───────────────────────

const DEMO_SEED_MESSAGES = [
  {
    id: 'seed-msg-a',
    contract_id: 'demo-contract-001',
    sender_id: 'demo-designer-001',
    content: "Hi! I've reviewed the brief and I'm excited to get started. I have some initial concept questions.",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-msg-b',
    contract_id: 'demo-contract-001',
    sender_id: 'demo-client-001',
    content: "Great! Please go ahead, we're excited to work with you.",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-msg-c',
    contract_id: 'demo-contract-001',
    sender_id: 'demo-designer-001',
    content: "Perfect. Could you share any reference images or brands you admire? It'll help me align with your vision.",
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()

  const user = useStore((s) => s.user)
  const storeMessages = useStore((s) => s.messages)
  const contracts = useStore((s) => s.contracts)
  const designers = useStore((s) => s.designers)
  const addMessage = useStore((s) => s.addMessage)

  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Resolve contract & participants ──────────────────────────────────────

  const contract = contracts.find((c) => c.id === contractId)

  const otherUserId =
    user?.role === 'designer' ? contract?.client_id : contract?.designer_id

  const otherDesigner = designers.find(
    (d) => d.user_id === otherUserId
  )

  const otherName = otherDesigner?.name ?? (user?.role === 'designer' ? 'Client' : 'Designer')
  const otherAvatar = otherDesigner?.avatar_url ?? null

  // ── Merge seeded + store messages ────────────────────────────────────────

  const allMessages = React.useMemo(() => {
    const storeForContract = storeMessages.filter((m) => m.contract_id === contractId)
    if (contractId === 'demo-contract-001' && storeForContract.length === 0) {
      return DEMO_SEED_MESSAGES
    }
    // Deduplicate by id
    const seen = new Set<string>()
    const combined = [
      ...(contractId === 'demo-contract-001' ? DEMO_SEED_MESSAGES : []),
      ...storeForContract,
    ]
    return combined.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
  }, [storeMessages, contractId])

  // ── Group messages by date for separators ────────────────────────────────

  const groupedMessages = React.useMemo(() => {
    const groups: { dateLabel: string; messages: typeof allMessages }[] = []
    let lastLabel = ''
    for (const msg of allMessages) {
      const label = getDateLabel(msg.created_at)
      if (label !== lastLabel) {
        groups.push({ dateLabel: label, messages: [msg] })
        lastLabel = label
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }
    return groups
  }, [allMessages])

  // ── Scroll to bottom ─────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = inputText.trim()
    if (!content || !contractId || !user) return

    setSending(true)
    setInputText('')
    // Small async tick to feel responsive
    await new Promise((r) => setTimeout(r, 120))
    addMessage(contractId, user.id, content)
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-mist-100 max-w-2xl mx-auto">
      {/* ── Fixed Header ─────────────────────────────────────────────────── */}
      <header className="flex-none flex items-center gap-3 px-4 py-3 bg-white border-b border-mist-100 shadow-sm z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-mist-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-charcoal-900" strokeWidth={2} />
        </button>

        <Avatar
          src={otherAvatar}
          name={otherName}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-semibold text-sm text-charcoal-900 truncate">
            {otherName}
          </p>
          {contract && (
            <p className="font-inter text-[11px] text-mist-500 truncate">
              Contract #{contract.id.slice(-6).toUpperCase()}
            </p>
          )}
        </div>

        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
      </header>

      {/* ── Messages Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groupedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-copper flex items-center justify-center shadow-lg shadow-copper-700/25">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <p className="font-grotesk font-semibold text-charcoal-900">Start the conversation</p>
              <p className="font-inter text-sm text-mist-500 mt-1">
                Send a message to get things going.
              </p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.dateLabel}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-mist-200" />
                <span className="font-inter text-[11px] font-medium text-mist-400 px-2">
                  {group.dateLabel}
                </span>
                <div className="flex-1 h-px bg-mist-200" />
              </div>

              {/* Messages in this group */}
              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id
                  const senderDesigner = designers.find((d) => d.user_id === msg.sender_id)
                  const senderName = senderDesigner?.name ?? (isOwn ? (user?.name ?? 'You') : otherName)
                  const senderAvatar = senderDesigner?.avatar_url ?? null

                  return (
                    <div
                      key={msg.id}
                      className={[
                        'flex items-end gap-2',
                        isOwn ? 'flex-row-reverse' : 'flex-row',
                      ].join(' ')}
                    >
                      {/* Avatar for received messages */}
                      {!isOwn && (
                        <Avatar
                          src={senderAvatar}
                          name={senderName}
                          size="xs"
                          className="mb-1 shrink-0"
                        />
                      )}

                      <div
                        className={[
                          'flex flex-col gap-1 max-w-[72%]',
                          isOwn ? 'items-end' : 'items-start',
                        ].join(' ')}
                      >
                        {/* Bubble */}
                        <div
                          className={[
                            'px-4 py-2.5 rounded-2xl font-inter text-sm leading-relaxed',
                            isOwn
                              ? 'gradient-copper text-white rounded-br-sm shadow-md shadow-copper-700/20'
                              : 'bg-white text-charcoal-900 border border-mist-100 rounded-bl-sm shadow-sm',
                          ].join(' ')}
                        >
                          {msg.content}
                        </div>

                        {/* Timestamp */}
                        <span className="font-inter text-[10px] text-mist-400 px-1">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Fixed Bottom Input ────────────────────────────────────────────── */}
      <div className="flex-none flex items-center gap-3 px-4 py-3 bg-white border-t border-mist-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 rounded-xl border-2 border-mist-200 bg-mist-50 font-inter text-sm text-charcoal-900 placeholder-mist-400 outline-none focus:border-copper-700 focus:bg-white focus:ring-2 focus:ring-copper-700/15 transition-all duration-200"
          disabled={sending}
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
          aria-label="Send message"
          className={[
            'flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0',
            inputText.trim() && !sending
              ? 'gradient-copper text-white shadow-md shadow-copper-700/30 hover:shadow-copper-700/50 active:scale-95'
              : 'bg-mist-100 text-mist-400 cursor-not-allowed',
          ].join(' ')}
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  )
}
