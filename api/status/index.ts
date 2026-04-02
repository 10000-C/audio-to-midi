import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const hasToken = !!process.env.REPLICATE_API_TOKEN;
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConfigured: hasToken,
  });
}
