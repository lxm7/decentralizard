import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: anyone,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email address of the subscriber',
      },
    },
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the email has been confirmed',
      },
    },
    {
      name: 'confirmationToken',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Token used for email confirmation',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      defaultValue: {},
      admin: {
        description: 'Additional data about subscription source',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users', // Adjust to your users collection name
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Associated user account (if any)',
      },
    },
  ],
  hooks: {},
}
