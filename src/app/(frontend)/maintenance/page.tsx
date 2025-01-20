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
        // quality={75}
        className="z-0"
      />

      {/* Centered text with semi-transparent background */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-50 rounded-lg px-6 py-4 text-center">
          <h1 className="text-white text-xl md:text-3xl">
            This is under going maintenance. Come back soon!
          </h1>
        </div>
      </div>
    </div>
  )
}
