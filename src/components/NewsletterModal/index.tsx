import { useState } from 'react'
import Link from 'next/link'

export default function NewsletterModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setSuccess(true)
      localStorage.setItem('newsletter_subscribed', 'true')

      // Close modal after success message is shown
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-[1000]">
      <div className="flex max-w-[700px] w-[90%] bg-white rounded relative md:flex-row flex-col">
        <button
          className="absolute top-1 right-2.5 bg-transparent border-none text-3xl cursor-pointer z-10 text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex-1 bg-[#f06] bg-gradient-to-tr from-[#f06] to-[#56CCF2] min-h-[200px] md:min-h-[400px]"></div>

        <div className="flex-1 p-[40px_30px] flex flex-col">
          <h2 className="text-[38px] font-black m-0 mb-5">Decentralizard</h2>

          <div>
            <h3 className="text-[22px] font-semibold mb-4 leading-snug">
              Weekly updates sourcing the
              <br />
              best content for your niche,
              <br />
              audience and business
            </h3>

            <p className="text-lg mb-8 leading-relaxed">
              Subscribe to the
              <br />
              Decentralizard newsletter.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                required
                className="w-full p-3 border border-gray-300 rounded text-base mb-4"
              />

              <button
                type="submit"
                className="w-full p-3 bg-[#ff56cc] bg-gradient-to-r from-[#f06] to-[#56CCF2] hover:bg-[#e04eb8] text-white border-none rounded text-base font-semibold cursor-pointer transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'SIGNING UP...' : 'SIGN UP'}
              </button>

              {error && <p className="text-red-500 my-2.5">{error}</p>}
            </form>
          ) : (
            <p className="text-green-600 my-2.5">
              Thanks! Please check your email to confirm your subscription.
            </p>
          )}

          <div className="mt-5 text-sm text-center">
            <Link href="/terms" className="text-gray-800 no-underline hover:underline">
              Terms & Conditions
            </Link>
            {' | '}
            <Link href="/privacy" className="text-gray-800 no-underline hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
