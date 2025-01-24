'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function MaintenancePage() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Display loader for at least 2 seconds
    const loaderTimer = setTimeout(() => {
      setShowLoader(false)
    }, 3000)

    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 2850) // Small delay for smooth transition

    return () => {
      clearTimeout(contentTimer)
      clearTimeout(loaderTimer)
    }
  }, [imageLoaded, showLoader])

  return (
    <div className="relative w-screen h-screen">
      {/* Background Image with Fade-In */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src="/images/future1.webp"
          alt="Background future space image"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'bottom',
          }}
          unoptimized
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-6">
        {/* Logo */}
        <div className="relative w-60 h-10">
          {showLoader && (
            <Image
              src="/images/logo2-white-loader-colour.svg"
              alt="logo-loader"
              fill
              className="absolute transition-opacity duration-1000 opacity-100"
            />
          )}
          {!showLoader && (
            <Image
              src="/images/logo2-white.svg"
              alt="logo"
              fill
              className={`absolute transition-opacity duration-1000 ${
                showContent ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>

        {/* Text with Smooth Fade */}
        <div
          className={`px-6 text-center transition-opacity duration-1000 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-white text-xl md:text-xl">
            This site is under construction. Come back soon!
          </h1>
        </div>
      </div>
    </div>
  )
}
