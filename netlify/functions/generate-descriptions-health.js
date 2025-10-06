// Health / diagnostics endpoint with optional debug info
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  const debug = event?.queryStringParameters?.debug === '1';
  const apiKey = process.env.OPENAI_API_KEY || '';
  const masked = apiKey ? apiKey.slice(0,6) + '...' + apiKey.slice(-4) : null;

  const base = {
    status: 'ok',
    hasApiKey: !!apiKey,
    envKeys: Object.keys(process.env).filter(k => k.startsWith('OPENAI')).sort(),
    timestamp: new Date().toISOString(),
  };

  const body = debug ? { ...base, debug: { maskedKey: masked, keyLength: apiKey.length, nodeVersion: process.version } } : base;

  return { statusCode: 200, headers, body: JSON.stringify(body) };
};
