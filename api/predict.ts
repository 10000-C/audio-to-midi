import type { VercelRequest, VercelResponse } from '@vercel/node';

// Model version hashes (pinned for reproducibility)
const MODELS = {
  demucs: {
    version: 'abf8fe28e407afa6d8e41e86a759caccc0af8e49c3c68016006b62cb0968441e',
    defaultInput: {
      model: 'htdemucs_6s',
      output_format: 'mp3',
      mp3_bitrate: 320,
    },
  },
  'basic-pitch': {
    version: 'a7cf33cf63fca9c71f2235332af5a9fdfb7d23c459a0dc429daa203ff8e80c78',
    defaultInput: {},
  },
} as const;

type ModelName = keyof typeof MODELS;

interface CreateRequest {
  action: 'create';
  model: ModelName;
  input: Record<string, unknown>;
}

interface PollRequest {
  action: 'poll';
  predictionId: string;
}

type PredictRequest = CreateRequest | PollRequest;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  const { action } = req.body as PredictRequest;

  try {
    // ===== CREATE prediction =====
    if (action === 'create') {
      const { model, input } = req.body as CreateRequest;

      if (!model || !MODELS[model]) {
        return res.status(400).json({
          error: `Invalid model. Must be one of: ${Object.keys(MODELS).join(', ')}`,
        });
      }

      const modelConfig = MODELS[model];
      const mergedInput = { ...modelConfig.defaultInput, ...input };

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: modelConfig.version,
          input: mergedInput,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Replicate predict error:', response.status, errorText);
        return res.status(response.status).json({
          error: `Prediction failed: ${response.status}`,
          detail: errorText,
        });
      }

      const prediction = await response.json();
      return res.status(200).json(prediction);
    }

    // ===== POLL prediction =====
    if (action === 'poll') {
      const { predictionId } = req.body as PollRequest;

      if (!predictionId) {
        return res.status(400).json({ error: 'predictionId is required' });
      }

      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Replicate poll error:', response.status, errorText);
        return res.status(response.status).json({
          error: `Poll failed: ${response.status}`,
          detail: errorText,
        });
      }

      const prediction = await response.json();
      return res.status(200).json(prediction);
    }

    return res.status(400).json({ error: 'Invalid action. Use "create" or "poll".' });
  } catch (error: any) {
    console.error('Predict error:', error);
    return res.status(500).json({ error: error.message });
  }
}
