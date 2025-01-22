'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function MaintenancePage() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="relative w-screen h-screen">
      {/* Background image */}
      <Image
        src="/images/future1.webp"
        alt="Background future space image"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'bottom',
        }}
        unoptimized
        className={`z-0 transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-6">
        {/* Logo (Switch visibility based on imageLoaded state) */}
        <div className="relative w-60 h-10">
          <Image
            src="/images/logo2-white-loader-colour.svg"
            alt="logo-loader"
            fill
            className={`absolute transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/images/logo2-white.svg"
            alt="logo"
            fill
            className={`absolute transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        {/* Text */}
        <div className="px-6 text-center">
          {imageLoaded ? (
            <h1 className="text-white text-xl md:text-xl">
              This site is under construction. Come back soon!
            </h1>
          ) : (
            <h1 className="text-transparent bg-clip-text text-xl md:text-xl">
              This site is under construction. Come back soon!
            </h1>
          )}
        </div>
      </div>
    </div>
  )
}
