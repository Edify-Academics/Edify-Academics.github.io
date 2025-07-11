import { kv } from '@vercel/kv';
import cors from 'utils/cors';

export default async function handler(req, res) {
  await cors(req, res);

  const { method } = req;

  if (method === 'GET') {
    const { user } = req.query;

    // Fetch chat history from KV
    const chats = await kv.lrange(`chat:${user}`, 0, -1);
    const chatHistory = chats.map(item => JSON.parse(item));

    return res.status(200).json(chatHistory);
  }

  if (method === 'POST') {
    const { user, chat } = req.body;

    // Add new chat message to KV
    await kv.rpush(`chat:${user}`, JSON.stringify(chat));

    // ✅ Publish message to a global Redis pubsub channel
    await kv.publish('chat:global', JSON.stringify(chat));

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
