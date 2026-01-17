// Backend integrado no Next.js
const backendApp = require('../../../../lib/backend');

export default function handler(req, res) {
  const { botId } = req.query;
  req.url = `/api/bots/${botId}`;
  return backendApp(req, res);
}