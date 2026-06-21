// HTTP API REQUEST authorizer (simple response). Checks a shared secret in the
// Authorization header against PIPELINE_SECRET so the publish endpoint stays
// keyless on the app side (the hook just sends a header — no AWS SDK / sigv4).
// Zero deps. Zipped by Terraform archive_file.

const SECRET = process.env.PIPELINE_SECRET;

export const handler = async (event) => {
  const provided =
    event?.headers?.authorization ??
    event?.headers?.Authorization ??
    event?.identitySource?.[0];

  return { isAuthorized: Boolean(SECRET) && provided === SECRET };
};
