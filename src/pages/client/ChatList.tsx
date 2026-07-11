// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Client Chat List Screen
// Route: /client/messages
// Lists active contractors for chat access
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { useStore } from '../../lib/store'
import { Header } from '../../components/layout/Header'
import { BottomNav } from '../../components/layout/BottomNav'
import { Avatar } from '../../components/ui/Avatar'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export default function ChatList() {
  const navigate = useNavigate()
  const { user, contracts, designers, messages } = useStore((s) => ({
    user: s.user,
    contracts: s.contracts,
    designers: s.designers,
    messages: s.messages,
  }))

  const activeContracts = contracts.filter(
    (c) => c.client_id === (user?.id ?? 'demo-client-001') && c.status === 'active'
  )

  return (
    <div className="min-h-screen bg-mist-100">
      <Header title="Messages" variant="light" showBack />

      <div className="max-w-2xl mx-auto px-4 pb-24 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-grotesk font-bold text-charcoal-900">Active Conversations</h2>
            <Badge variant="copper" size="sm">{activeContracts.length} active</Badge>
          </div>

          {activeContracts.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <MessageCircle size={40} className="mx-auto text-mist-300 mb-3" />
              <p className="font-grotesk font-bold text-charcoal-900 mb-1">No Active Chats</p>
              <p className="text-xs text-charcoal-900/60 font-inter">
                Start a contract to begin messaging with your designer.
              </p>
            </Card>
          ) : (
            activeContracts.map((contract, i) => {
              const designer = designers.find((d) => d.user_id === contract.designer_id)
              const contractMessages = messages.filter((m) => m.contract_id === contract.id)
              const lastMessage = contractMessages[contractMessages.length - 1]

              return (
                <motion.button
                  key={contract.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/chat/${contract.id}`)}
                  className="w-full text-left"
                >
                  <Card variant="default" hoverable className="flex items-center gap-3 p-4">
                    <Avatar
                      name={designer?.name || 'Designer'}
                      src={designer?.avatar_url || null}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-medium text-charcoal-900 truncate">
                        {designer?.name || 'Designer'}
                      </p>
                      <p className="text-xs text-charcoal-900/60 truncate">
                        {lastMessage?.content || `Contract #${contract.id.slice(-4)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {contractMessages.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-copper-700 text-white text-[10px] font-bold flex items-center justify-center">
                          {contractMessages.length > 9 ? '9+' : contractMessages.length}
                        </span>
                      )}
                      <ArrowRight size={16} className="text-charcoal-900/30" />
                    </div>
                  </Card>
                </motion.button>
              )
            })
          )}
        </motion.div>
      </div>

      <BottomNav role="client" />
    </div>
  )
}
