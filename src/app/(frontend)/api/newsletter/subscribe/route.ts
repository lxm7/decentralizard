import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import { NextResponse, NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY as string,
)

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id, confirmed')
      .eq('email', email)
      .single()

    let confirmationToken

    if (existingSubscriber) {
      if (existingSubscriber.confirmed) {
        return NextResponse.json({
          message: "You're already subscribed to our newsletter",
        })
      }

      // Update existing unconfirmed subscription
      confirmationToken = uuidv4()
      await supabase
        .from('newsletter_subscribers')
        .update({ confirmation_token: confirmationToken })
        .eq('email', email)
    } else {
      // Create new subscription
      confirmationToken = uuidv4()
      await supabase.from('newsletter_subscribers').insert([
        {
          email,
          confirmation_token: confirmationToken,
          metadata: {
            source: 'website_popup',
            referrer: request.headers.get('referer') || null,
          },
        },
      ])
    }

    // Send confirmation email
    const confirmUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/newsletter/confirm?token=${confirmationToken}`

    await transporter.sendMail({
      from: `"Decentralizard" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Confirm your newsletter subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center">
          <h2>Just one more step!</h2>
          <p>Thanks for signing up for our newsletter. To complete your subscription, please confirm your email address:</p>
          <p style="text-align: center;">
            <a href="${confirmUrl}" style="display: inline-block; background-color: #9933ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirm Subscription
            </a>
          </p>
          <p>If you didn't request this subscription, you can safely ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({
      message: 'Please check your email to confirm your subscription',
    })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
