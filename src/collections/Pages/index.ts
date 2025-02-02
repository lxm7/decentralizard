import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        console.log('livePreview', data.path, data.slug)

        const path = generatePreviewPath({
          // If the document has a 'path' field, use that.
          slug: typeof data?.path === 'string' ? data.path : (data?.slug ?? ''),
          // slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        // If the document has a 'path' field, use that.
        slug: typeof data?.path === 'string' ? data.path : ((data?.slug ?? '') as string),
        // slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'path',
      label: 'Path',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages', // 👈 Self-referential relationship
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
    // indexes: [
    //     { fields: { slug: 1, parent: 1 }, options: { unique: true } },
    //     { fields: { parent: 1 } },
    //   ],
  ],
  // hooks: {
  //   afterChange: [revalidatePage],
  //   beforeChange: [populatePublishedAt],
  //   beforeDelete: [revalidateDelete],
  // },
  hooks: {
    /**
     * If you want to automatically build a “path” field (for example, if a page’s
     * full URL is built from its parent’s slug), you can use a beforeChange hook.
     *
     * This example hook does the following:
     * - When saving a page, if a parent is selected, it fetches the parent document
     *   and uses its "path" (or its slug if no path exists) to build the new page’s path.
     * - Otherwise, the path is set to the page’s slug.
     *
     * NOTE: This example is simplified. In a production project you may want to add
     * additional error checking and also update children pages if a parent’s slug changes.
     */
    beforeChange: [
      async ({ data, req }) => {
        if (data.parent && req) {
          // Fetch the parent document
          const parentResult = await req.payload.find({
            collection: 'pages',
            where: { id: { equals: data.parent } },
            limit: 1,
          })
          if (parentResult.docs.length > 0) {
            const parentDoc = parentResult.docs[0] as { slug: string; path?: string }
            const parentPath = parentDoc.path || parentDoc.slug
            data.path = `${parentPath}/${data.slug}`
            console.log(`Computed path for ${data.title}: ${data.path}`)
          } else {
            data.path = data.slug
          }
        } else {
          data.path = data.slug
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
