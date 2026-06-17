import client from 'prom-client';

// Reuse a single registry across module re-evaluation (dev hot reload, route
// re-init) to avoid "metric already registered" errors.
const globalForMetrics = globalThis as unknown as {
  metricsRegistry?: client.Registry;
};

const register =
  globalForMetrics.metricsRegistry ??
  (() => {
    const r = new client.Registry();
    r.setDefaultLabels({ app: 'decentralizard' });
    client.collectDefaultMetrics({ register: r });
    return r;
  })();

globalForMetrics.metricsRegistry = register;

// Never cache — Prometheus scrapes live process state each interval.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const body = await register.metrics();
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': register.contentType },
  });
}
