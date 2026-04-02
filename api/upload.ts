import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Prefer client-supplied token, fall back to env variable
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    || process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  try {
    // req.body is a Buffer when Content-Type is not JSON
    const body = req.body;

    // Determine content type from the request
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    // Upload to Replicate Files API
    const fileRes = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: typeof body === 'string' ? Buffer.from(body, 'base64') : body,
    });

    if (!fileRes.ok) {
      const errorText = await fileRes.text();
      console.error('Replicate upload error:', fileRes.status, errorText);
      return res.status(fileRes.status).json({
        error: `Upload failed: ${fileRes.status}`,
        detail: errorText,
      });
    }

    const file = await fileRes.json();
    return res.status(200).json(file);
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
