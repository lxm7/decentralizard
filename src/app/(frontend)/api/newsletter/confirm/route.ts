// api/newsletter/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return new NextResponse(getHtmlResponse('Missing confirmation token', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Find subscriber by confirmation token
    const subscribers = await payload.find({
      collection: 'newsletter-subscribers',
      where: {
        confirmationToken: { equals: token },
      },
    })

    if (!subscribers.docs.length) {
      return new NextResponse(
        getHtmlResponse(
          'Invalid or expired confirmation link. Please try signing up again.',
          false,
        ),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        },
      )
    }

    // Update subscriber to confirmed
    const subscriber = subscribers.docs[0]
    await payload.update({
      collection: 'newsletter-subscribers',
      id: subscriber.id,
      data: {
        confirmed: true,
        confirmationToken: null,
      },
    })

    return new NextResponse(
      getHtmlResponse(
        `You're now subscribed to our newsletter! We'll send updates to ${subscriber.email}`,
        true,
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      },
    )
  } catch (err) {
    console.error('Confirmation error:', err)
    return new NextResponse(
      getHtmlResponse(
        'An error occurred while confirming your subscription. Please try again.',
        false,
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      },
    )
  }
}

function getHtmlResponse(message, success) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://decentralizard.com'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${success ? 'Subscription Confirmed' : 'Subscription Error'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
            margin-top: 40px;
          }
          .success {
            color: #28a745;
          }
          .error {
            color: #dc3545;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
        <meta http-equiv="refresh" content="5;url=${siteUrl}" />
      </head>
      <body>
        <div class="container">
          <h1 class="${success ? 'success' : 'error'}">
            ${success ? 'Subscription Confirmed!' : 'Subscription Error'}
          </h1>
          <p>${message}</p>
          <p>Redirecting you to our homepage in 5 seconds...</p>
          <a href="${siteUrl}" class="button">Return to Homepage</a>
        </div>
      </body>
    </html>
  `
}
