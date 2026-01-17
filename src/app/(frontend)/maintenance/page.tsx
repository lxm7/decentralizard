'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function MaintenancePage() {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="relative h-screen w-screen">
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
      <div className="bg-neutral-black absolute inset-0 z-10 bg-opacity-70"></div>

      {/* Centered content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-6">
        {/* Logo (Switch visibility based on imageLoaded state) */}
        <div className="relative h-10 w-60">
          <Image
            src="/images/logo/logo2-white-loader-colour.svg"
            alt="logo-loader"
            fill
            className={`absolute transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/images/logo/logo2-white.svg"
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
            <h1 className="text-neutral-white text-xl md:text-xl">
              This site is under construction. Come back soon!
            </h1>
          ) : (
            <h1 className="bg-clip-text text-xl text-transparent md:text-xl">
              This site is under construction. Come back soon!
            </h1>
          )}
        </div>
      </div>
    </div>
  )
}
