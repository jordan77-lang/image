// Netlify Function: Version and Deployment Info
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const pkgPath = path.join(__dirname, '..', '..', 'package.json');
    let pkg = { name: 'app', version: '0.0.0' };
    // Prefer bundler-friendly require so Netlify includes the JSON file in the function bundle
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      pkg = require(pkgPath);
    } catch (rErr) {
      try {
        const raw = fs.readFileSync(pkgPath, 'utf-8');
        pkg = JSON.parse(raw);
      } catch (e) {
        // ignore, fallback to defaults
      }
    }

    const payload = {
      name: pkg.name || 'app',
      version: pkg.version || '0.0.0',
      timestamp: new Date().toISOString(),
      netlify: !!process.env.NETLIFY,
      context: process.env.CONTEXT || null,
      branch: process.env.HEAD || process.env.BRANCH || null,
      commit: process.env.COMMIT_REF || null,
      deploy_id: process.env.DEPLOY_ID || null,
      deploy_url: process.env.DEPLOY_URL || null
    };

    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load version info' }) };
  }
};
