// Backend integrado no Next.js
const backendApp = require('../../../lib/backend');

export default function handler(req, res) {
  req.url = '/api/auth/me';
  return backendApp(req, res);
}