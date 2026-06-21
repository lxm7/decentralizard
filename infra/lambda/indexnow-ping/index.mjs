// Notifies IndexNow (Bing, Yandex, Seznam, …) that a URL changed.
// Zero deps: Node 20 ships global fetch. Zipped by Terraform archive_file.
//
// Requires a verification file hosted at https://<SITE_HOST>/<INDEXNOW_KEY>.txt
// whose contents are exactly INDEXNOW_KEY.

const KEY = process.env.INDEXNOW_KEY;
const SITE_HOST = process.env.SITE_HOST;

export const handler = async (event) => {
  const { url } = event ?? {};
  if (!url) {
    throw new Error('indexnow-ping: `url` is required');
  }
  if (!KEY || !SITE_HOST) {
    throw new Error('indexnow-ping: INDEXNOW_KEY and SITE_HOST env vars required');
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: SITE_HOST,
      key: KEY,
      keyLocation: `https://${SITE_HOST}/${KEY}.txt`,
      urlList: [url],
    }),
  });

  // IndexNow returns 200/202 on success; treat 4xx as a soft failure (logged, not thrown)
  // so a single bad ping never fails the whole pipeline.
  return { status: res.status, ok: res.ok, url };
};
