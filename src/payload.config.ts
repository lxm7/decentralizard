import { s3Storage } from '@payloadcms/storage-s3';
process.env.NODE_OPTIONS = '--tls-min-v1.2';

import { postgresAdapter } from '@payloadcms/db-postgres';
// import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // sharp-import
import { buildConfig, PayloadRequest } from 'payload';
import { fileURLToPath } from 'url';

import { Categories } from './collections/Categories';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Users } from './collections/Users';
import { NewsletterSubscribers } from './collections/Newsletter';
import { Footer } from './Footer/config';
import { Header } from './Header/config';
import { plugins } from './plugins';
import { defaultLexical } from '@/fields/defaultLexical';
import { getServerSideURL } from './utilities/getURL';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit from.
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl: process.env.CERT_CA
        ? {
            ca: fs.readFileSync(path.resolve(process.cwd(), process.env.CERT_CA)),
            rejectUnauthorized: true,
          }
        : undefined,
    },
    // Schema is migration-managed, never auto-pushed. Drizzle `push` defaults to
    // true and re-ran on every prod boot — that's what kept resetting RLS, and
    // would let multiple instances (Hetzner + EKS) thrash the shared live DB.
    // Local schema iteration: use a local DB + migrations, or temporarily flip.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    afterSchemaInit: [
      ({ schema }) => {
        // Enable RLS for all tables (baked into generated migrations).
        Object.values(schema.tables).forEach((table) => table.enableRLS());
        return schema;
      },
    ],
  }),
  collections: [Pages, Posts, Media, Categories, Users, NewsletterSubscribers],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    s3Storage({
      // No S3_BUCKET (local dev) → adapter off, falls back to local disk staticDir.
      enabled: Boolean(process.env.S3_BUCKET),
      collections: {
        // With MEDIA_BASE_URL (CloudFront, set in Phase 2) serve files directly
        // from the CDN; until then proxy through Payload so it works pre-CDN.
        media: process.env.MEDIA_BASE_URL
          ? {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                const key = prefix ? `${prefix}/${filename}` : filename;
                return `${process.env.MEDIA_BASE_URL}/${key}`;
              },
            }
          : true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: process.env.AWS_REGION || 'eu-west-1',
        // Credentials resolve via the AWS default chain — no hardcoded keys:
        //   Fly → AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env
        //   EKS → IRSA web-identity token
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  // email: nodemailerAdapter({
  //   defaultFromAddress: 'contact@decentralizard.com',
  //   defaultFromName: 'Decentralizard',
  // Nodemailer transportOptions
  // transport: nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT || '587', 10),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS,
  //   },
  // }),
  // }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true;

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization');
        return authHeader === `Bearer ${process.env.CRON_SECRET}`;
      },
    },
    tasks: [],
  },
});
