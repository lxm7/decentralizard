import { readFile } from 'node:fs/promises';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const s3 = new S3Client({});
const BUCKET = process.env.MEDIA_BUCKET;

// Font is loaded once per container, not per invocation.
const fontData = await readFile(new URL('./fonts/inter-700.woff', import.meta.url));

/** Lightweight satori vdom node — avoids needing JSX / a build step. */
const el = (type, style, children) => ({ type, props: { style, children } });

function card({ title, author, category }) {
  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px',
      background: 'linear-gradient(135deg, #0b0e14 0%, #131a2a 100%)',
      color: '#e6edf3',
      fontFamily: 'Inter',
    },
    [
      el(
        'div',
        { display: 'flex', fontSize: 30, letterSpacing: 3, color: '#5eead4' },
        [(category || 'DECENTRALIZARD').toUpperCase()],
      ),
      el(
        'div',
        { display: 'flex', fontSize: 66, lineHeight: 1.1, maxWidth: '900px' },
        [title],
      ),
      el(
        'div',
        { display: 'flex', fontSize: 30, color: '#8b9bb4' },
        [author ? `By ${author}` : 'decentralizard.com'],
      ),
    ],
  );
}

export const handler = async (event) => {
  const { slug, title, author, category } = event ?? {};
  if (!slug || !title) {
    throw new Error('og-image: `slug` and `title` are required');
  }
  if (!BUCKET) {
    throw new Error('og-image: MEDIA_BUCKET env var not set');
  }

  const svg = await satori(card({ title, author, category }), {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();

  const key = `og/posts/${slug}.png`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: png,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=3600',
    }),
  );

  return { key };
};
