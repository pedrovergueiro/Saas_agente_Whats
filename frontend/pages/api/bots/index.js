// Backend integrado no Next.js
const backendApp = require('../../../lib/backend');

export default function handler(req, res) {
  req.url = '/api/bots';
  return backendApp(req, res);
}