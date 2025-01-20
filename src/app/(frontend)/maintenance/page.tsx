import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div className="relative w-screen h-screen">
      <Image
        src="/images/future1.webp"
        alt="Background future space image"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'bottom',
        }}
        unoptimized
        className="z-0"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-6">
        <Image
          src="/images/logo2-white.svg"
          alt="logo"
          width={240}
          height={40}
          className="z-1 h-10"
        />

        {/* Text */}
        <div className="px-6 text-center">
          <h1 className="text-white text-xl md:text-xl">
            This site is under going maintenance. Come back soon!
          </h1>
        </div>
      </div>
    </div>
  )
}
