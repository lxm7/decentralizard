import type { CollectionConfig } from 'payload';

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';

import { authenticated } from '../../access/authenticated';
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished';
import { Banner } from '../../blocks/Banner/config';
import { Code } from '../../blocks/Code/config';
import { MediaBlock } from '../../blocks/MediaBlock/config';
import { generatePreviewPath } from '../../utilities/generatePreviewPath';
import { populateAuthors } from './hooks/populateAuthors';
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost';

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields';
import { slugField } from '@/fields/slug';

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'content', 'categories'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
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
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'text',
      label: 'Short Description',
      admin: {
        description: 'Short summary of this article',
        placeholder: 'Short summary of this article',
      },
    },
    {
      name: 'category_titles',
      type: 'text',
      label: 'Category Titles',
      hasMany: true,
      admin: {
        readOnly: true,
        description: 'Categories this article belongs to',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                };
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          label: 'Intelligence',
          description: 'Nexus analysis metrics surfaced in the article Data Snapshot panel.',
          fields: [
            {
              name: 'sentiment',
              type: 'group',
              label: 'Market Sentiment',
              fields: [
                {
                  name: 'label',
                  type: 'select',
                  defaultValue: 'neutral',
                  options: [
                    { label: 'Bullish', value: 'bullish' },
                    { label: 'Bearish', value: 'bearish' },
                    { label: 'Neutral', value: 'neutral' },
                  ],
                },
                {
                  name: 'score',
                  type: 'number',
                  label: 'Delta %',
                  admin: {
                    description:
                      'Signed sentiment delta, e.g. -12 or 8. Drives the chip on the snapshot panel.',
                  },
                },
              ],
            },
            {
              name: 'validity',
              type: 'number',
              label: 'Validity Score',
              min: 0,
              max: 100,
              admin: {
                description:
                  '0–100 confidence in the underlying data. ≥90 marks the article as a Verified Oracle.',
              },
            },
            {
              name: 'domain',
              type: 'select',
              admin: {
                description: 'Primary intelligence domain for clustering and the hero chip.',
              },
              options: [
                { label: 'Layer 2', value: 'layer-2' },
                { label: 'DeFi', value: 'defi' },
                { label: 'MEV', value: 'mev' },
                { label: 'Infrastructure', value: 'infrastructure' },
                { label: 'Governance', value: 'governance' },
                { label: 'Security', value: 'security' },
                { label: 'Markets', value: 'markets' },
              ],
            },
            {
              name: 'sources',
              type: 'array',
              label: 'Source Verification',
              admin: {
                description: 'Provenance signals shown in the snapshot panel.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'confidence',
                  type: 'number',
                  min: 0,
                  max: 100,
                  admin: {
                    description: 'Confidence %, e.g. 99.2',
                  },
                },
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'analytics',
                  admin: {
                    description: 'Determines the source icon.',
                  },
                  options: [
                    { label: 'On-Chain Analytics', value: 'analytics' },
                    { label: 'Smart Contract Audit', value: 'audit' },
                    { label: 'Governance / Legal', value: 'gavel' },
                    { label: 'Verified Oracle', value: 'verified' },
                  ],
                },
              ],
            },
          ],
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
            {
              name: 'keywords',
              type: 'array',
              fields: [
                {
                  name: 'keyword',
                  type: 'text',
                },
              ],
              label: 'Keywords',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },

    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
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
};
