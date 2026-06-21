// Invalidates the (stable-key) OG card on the media CloudFront distribution so
// the freshly-rendered card is served immediately after a re-publish.
// Zero deps: @aws-sdk/client-cloudfront ships in the Node 20 Lambda runtime.

import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';

const cf = new CloudFrontClient({});
const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID;

export const handler = async (event) => {
  const { slug } = event ?? {};
  if (!slug) {
    throw new Error('cloudfront-invalidate: `slug` is required');
  }
  if (!DISTRIBUTION_ID) {
    throw new Error('cloudfront-invalidate: DISTRIBUTION_ID env var not set');
  }

  const path = `/og/posts/${slug}.png`;
  const out = await cf.send(
    new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${slug}-${Date.now()}`,
        Paths: { Quantity: 1, Items: [path] },
      },
    }),
  );

  return { invalidationId: out.Invalidation?.Id, path };
};
