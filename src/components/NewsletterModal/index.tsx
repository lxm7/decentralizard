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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded bg-white md:flex-row">
        <button
          className="absolute right-2.5 top-1 z-10 cursor-pointer border-none bg-transparent text-3xl text-black"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="min-h-[200px] flex-1 bg-[#f06] bg-gradient-to-tr from-[#f06] to-[#56CCF2] md:min-h-[400px]"></div>

        <div className="flex flex-1 flex-col overflow-y-auto p-[40px_30px]">
          <h2 className="m-0 mb-5 text-[38px] font-black text-black">Decentralizard</h2>

          <div>
            <h3 className="mb-4 text-[22px] font-semibold leading-snug text-black">
              Weekly updates sourcing the
              <br />
              best content for your niche,
              <br />
              audience and business
            </h3>

            <p className="mb-8 text-lg leading-relaxed text-gray-800">
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
                className="mb-4 w-full rounded border border-gray-300 p-3 text-base text-black placeholder:text-gray-500"
              />

              <button
                type="submit"
                className="w-full cursor-pointer rounded border-none bg-[#ff56cc] bg-gradient-to-r from-[#f06] to-[#56CCF2] p-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#e04eb8] disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={loading}
              >
                {loading ? 'SIGNING UP...' : 'SIGN UP'}
              </button>

              {error && <p className="my-2.5 text-red-500">{error}</p>}
            </form>
          ) : (
            <p className="my-2.5 text-green-600">
              Thanks! Please check your email to confirm your subscription.
            </p>
          )}

          <div className="mt-5 text-center text-sm">
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
