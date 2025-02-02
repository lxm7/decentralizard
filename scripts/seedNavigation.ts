import payload from 'payload'
import configPromise from '../src/payload.config'
import type { PayloadRequest } from 'payload'

// The nested menu structure you provided:
const mainCategories = [
  {
    title: 'AI-Driven Tools and Services',
    slug: 'ai-driven-tools-and-services',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Sustainability and Green Tech',
    slug: 'sustainability-and-green-tech',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Health Tech and Personalized Wellness',
    slug: 'health-tech-personalized-wellness',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'VR/AR and Metaverse Ecosystems',
    slug: 'vr-ar-metaverse-ecosystems',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Remote Work and Digital Nomadism',
    slug: 'remote-work-digital-nomadism',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Web3 and Decentralized Finance (DeFi)',
    slug: 'web3-defi',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Creator Economy Tools',
    slug: 'creator-economy-tools',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Smart Home and IoT Devices',
    slug: 'smart-home-iot-devices',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Micro-Mobility and Urban Tech',
    slug: 'micro-mobility-urban-tech',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
  {
    title: 'Pet Tech and Premium Care',
    slug: 'pet-tech-premium-care',
    children: [
      { title: 'Trends', slug: 'trends' },
      { title: 'Affiliate Opportunities', slug: 'affiliate-opportunities' },
      { title: 'Examples', slug: 'examples' },
    ],
  },
]

const dummyUser = {
  id: 'seed',
  collection: 'users',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  email: 'seed@example.com',
}

const dummyReq: Partial<PayloadRequest> = {
  user: dummyUser,
  payload,
}

async function seed() {
  // Initialize Payload with your configuration. Make sure to replace the secret and mongoURL with your actual values or ensure they're in your .env file.
  const config = await configPromise
  await payload.init({ config })

  console.log('Payload initialized for seeding.')

  // OPTIONAL: Clear existing pages if needed.
  // Be very careful with deletion scripts, especially in production environments!
  const existingPages = await payload.find({
    collection: 'pages',
    limit: 1000, // adjust limit as needed
  })
  for (const page of existingPages.docs) {
    await payload.delete({
      collection: 'pages',
      id: page.id,
    })
  }
  console.log('Existing pages cleared.')

  // Loop over main categories and create parent and child pages.
  for (const mainCat of mainCategories) {
    // Create the main category page (top-level, so no parent).
    const parentDoc = await payload.create({
      collection: 'pages',
      data: {
        title: mainCat.title,
        slug: mainCat.slug,
        hero: {
          type: 'none',
        },
        layout: [{ blockType: 'content', content: `Main page for ${mainCat.title}` }],
      },
      req: dummyReq,
    })
    console.log(`Created main page: ${mainCat.title}`)

    // Create child pages.
    for (const child of mainCat.children) {
      // OPTION 1: Use the provided slug (be aware of uniqueness issues if duplicate slugs occur)
      const childSlug = child.slug

      // OPTION 2: Generate a unique slug by combining parent and child slugs.
      // const childSlug = `${mainCat.slug}-${child.slug}`

      await payload.create({
        collection: 'pages',
        data: {
          title: child.title,
          slug: childSlug,
          hero: {
            type: 'none',
          },
          layout: [
            { blockType: 'content', content: `Page for ${child.title} under ${mainCat.title}` },
          ],
          path: `${mainCat.slug}/${child.slug}`,
          parent: parentDoc.id, // Reference to the parent page
          // content: `Page for ${child.title} under ${mainCat.title}`,
        },
        req: dummyReq,
      })
      console.log(`Created child page: ${child.title} under ${mainCat.title}`)
    }
  }

  console.log('Seeding complete.')
  process.exit()
}

seed().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
