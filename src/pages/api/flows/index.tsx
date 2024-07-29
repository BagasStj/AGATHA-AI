import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, nodes, edges } = req.body;
      const flow = await prisma.flow.create({
        data: {
          name,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
        },
      });
      res.status(201).json(flow);
    } catch (error) {
      console.error('Error saving flow:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error: error.toString() });
      } else {
        res.status(500).json({ message: 'An unknown error occurred', error: String(error) });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}