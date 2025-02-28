/**
 * This is an example of a standalone script that loads in the Payload config
 * and uses the Payload Local API to query the database.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

import { blog_posts } from './1allposts_summarized_test.json'

async function run() {
  try {
    const payload = await getPayload({ config })

    for (const post of blog_posts) {
      console.log('________________post.content', post.content)
      await payload.create({
        collection: 'posts',
        draft: false,
        data: {
          // _status: 'published',
          title: Array.isArray(post.title) ? post.title[0] : post.title,
          content: {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: post.content,
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          },
          meta: post.meta,
          categories: post.categories.map((id) => parseInt(id)),
          // heroImage: post.heroImage,
        },
      })
    }
  } catch (error) {
    console.error(JSON.stringify(error))
    process.exit(1)
  }

  process.exit(0)
}

await run()
