'use client'

import { useState, useEffect } from 'react'
import NewsletterModal from './'

export default function NewsletterManager() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = localStorage.getItem('newsletter_modal_seen')

    if (!hasSeenModal) {
      // Show modal with slight delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleCloseModal = () => {
    setShowModal(false)
    localStorage.setItem('newsletter_modal_seen', 'true')
  }

  if (!showModal) return null

  return <NewsletterModal onClose={handleCloseModal} />
}
