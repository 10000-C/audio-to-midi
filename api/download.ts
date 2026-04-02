import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  // Only allow Replicate delivery URLs for security
  if (!url.startsWith('https://replicate.delivery/')) {
    return res.status(400).json({ error: 'Only replicate.delivery URLs are allowed' });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch file' });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    const safeFilename = typeof filename === 'string' ? filename : 'download';
    const encodedFilename = encodeURIComponent(safeFilename);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Replicate files expire in 1h

    return res.send(Buffer.from(buffer));
  } catch (error: any) {
    console.error('Download error:', error);
    return res.status(500).json({ error: error.message });
  }
}
