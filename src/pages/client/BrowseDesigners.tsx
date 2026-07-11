// ─────────────────────────────────────────────────────────────────────────────
// ArtConnect.Ug – Browse Designers Screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  RefreshCw,
  Users,
  SlidersHorizontal,
} from 'lucide-react'
import { useStore } from '../../lib/store'
import { DesignerCard } from '../../components/features/DesignerCard'
import { BottomNav } from '../../components/layout/BottomNav'
import type { DesignerSpecialization } from '../../lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterChip = 'all' | DesignerSpecialization

interface FilterOption {
  key: FilterChip
  label: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All' },
  { key: 'graphic', label: 'Graphic' },
  { key: 'industrial', label: 'Industrial' },
  { key: 'branding', label: 'Branding' },
  { key: 'ui_ux', label: 'UI/UX' },
  { key: 'motion', label: 'Motion' },
  { key: 'packaging', label: 'Packaging' },
]

// ── Animation Variants ────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

const BrowseDesigners: React.FC = () => {
  const navigate = useNavigate()
  const { designers, initializeDemoData } = useStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize demo data if empty
  useEffect(() => {
    if (designers.length === 0) {
      initializeDemoData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered and searched designers
  const filteredDesigners = useMemo(() => {
    let result = designers

    // Apply specialization filter
    if (activeFilter !== 'all') {
      result = result.filter((d) => d.specializations.includes(activeFilter))
    }

    // Apply search query (by name or location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.specializations.some((s) => s.toLowerCase().includes(q))
      )
    }

    return result
  }, [designers, activeFilter, searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 900)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-mist-100 pb-24">
      <div className="max-w-md mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="sticky top-0 z-20 bg-mist-100/95 backdrop-blur-sm pt-4 pb-3"
        >
          <div className="px-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-charcoal-900 font-grotesk">
                  Find Designers
                </h1>
                <p className="text-xs text-mist-500 font-inter mt-0.5">
                  {designers.length} vetted creative professionals
                </p>
              </div>
              {/* Refresh simulation button */}
              <motion.button
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-mist-100 shadow-sm"
                onClick={handleRefresh}
                whileTap={{ scale: 0.88 }}
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={isRefreshing ? { duration: 0.7, ease: 'linear' } : { duration: 0.3 }}
              >
                <RefreshCw size={16} strokeWidth={2} className="text-charcoal-700" />
              </motion.button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 mb-3">
            <div className="relative">
              <Search
                size={16}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-400"
              />
              <input
                type="text"
                placeholder="Search by name, style, location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-9 bg-white border border-mist-100 rounded-2xl text-sm text-charcoal-900 font-inter placeholder:text-mist-300 focus:outline-none focus:ring-2 focus:ring-copper-700/30 focus:border-copper-700/50 transition-all shadow-sm"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={handleClearSearch}
                  >
                    <X size={15} strokeWidth={2.5} className="text-mist-400 hover:text-charcoal-700 transition-colors" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Filter chips – horizontal scroll */}
          <div className="overflow-x-auto scrollbar-none pl-4">
            <div className="flex gap-2 pb-1 pr-4">
              {FILTER_OPTIONS.map((option) => (
                <motion.button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  whileTap={{ scale: 0.93 }}
                  className={[
                    'shrink-0 h-8 px-4 rounded-full text-xs font-medium font-inter transition-all duration-200',
                    activeFilter === option.key
                      ? 'bg-copper-700 text-white shadow-md shadow-copper-700/25'
                      : 'bg-white text-mist-500 border border-mist-100 hover:border-copper-700/30 hover:text-charcoal-800',
                  ].join(' ')}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Results area ────────────────────────────────────────────────── */}
        <div className="px-4 pt-2">

          {/* Results count + filter indicator */}
          {(searchQuery || activeFilter !== 'all') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-3"
            >
              <p className="text-xs text-mist-500 font-inter">
                {filteredDesigners.length}{' '}
                {filteredDesigners.length === 1 ? 'result' : 'results'}
                {activeFilter !== 'all' && (
                  <span className="text-copper-700 font-medium">
                    {' '}in {FILTER_OPTIONS.find((f) => f.key === activeFilter)?.label}
                  </span>
                )}
              </p>
              <motion.button
                className="flex items-center gap-1 text-xs text-copper-700 font-inter font-medium"
                onClick={() => {
                  setActiveFilter('all')
                  setSearchQuery('')
                }}
                whileTap={{ scale: 0.93 }}
              >
                <X size={11} strokeWidth={2.5} />
                Clear
              </motion.button>
            </motion.div>
          )}

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filteredDesigners.length > 0 ? (
              <motion.div
                key={`${activeFilter}-${searchQuery}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 pb-4"
              >
                {filteredDesigners.map((designer) => (
                  <motion.div key={designer.id} variants={cardVariants}>
                    <DesignerCard
                      designer={designer}
                      onViewProfile={(userId) => navigate(`/client/designer/${userId}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-mist-200 flex items-center justify-center mb-4">
                  <Users size={28} strokeWidth={1.5} className="text-mist-400" />
                </div>
                <h3 className="text-base font-semibold text-charcoal-800 font-grotesk">
                  No designers found
                </h3>
                <p className="text-sm text-mist-500 font-inter mt-1.5 max-w-[220px]">
                  Try adjusting your search or removing filters
                </p>
                <motion.button
                  className="mt-5 px-5 py-2.5 rounded-xl bg-copper-700/10 text-copper-700 text-sm font-medium font-inter flex items-center gap-2"
                  onClick={() => {
                    setActiveFilter('all')
                    setSearchQuery('')
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  <SlidersHorizontal size={15} strokeWidth={2} />
                  Clear all filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BottomNav role="client" />
    </div>
  )
}

export default BrowseDesigners
