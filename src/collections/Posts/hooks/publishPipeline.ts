import type { CollectionAfterChangeHook } from 'payload';

import type { Post } from '../../../payload-types';
import { getServerSideURL } from '../../../utilities/getURL';

/**
 * Fires the serverless publish pipeline (API Gateway → EventBridge → Step
 * Functions) when a post is published. Best-effort: any failure is logged and
 * swallowed so it can never block a save. No-ops unless both env vars are set.
 *
 * See infra/terraform/envs/lambda-pipeline.
 */
export const publishPipeline: CollectionAfterChangeHook<Post> = async ({
  doc,
  req: { payload, context },
}) => {
  const endpoint = process.env.PIPELINE_ENDPOINT;
  const secret = process.env.PIPELINE_SECRET;

  if (context.disableRevalidate || !endpoint || !secret) {
    return doc;
  }

  if (doc._status !== 'published' || !doc.slug) {
    return doc;
  }

  const event = {
    slug: doc.slug,
    title: doc.title,
    url: `${getServerSideURL()}/posts/${doc.slug}`,
    category: doc.category_titles?.[0],
    author: doc.populatedAuthors?.[0]?.name,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: secret,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    if (!res.ok) {
      payload.logger.warn(`publishPipeline: endpoint returned ${res.status} for ${doc.slug}`);
    }
  } catch (err) {
    payload.logger.warn(`publishPipeline: failed to trigger for ${doc.slug}: ${err}`);
  } finally {
    clearTimeout(timeout);
  }

  return doc;
};
