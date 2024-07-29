import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      const flow = await prisma.flow.findUnique({
        where: { id: String(id) },
      });
      if (flow) {
        res.status(200).json({
          ...flow,
          nodes: JSON.parse(flow.nodes),
          edges: JSON.parse(flow.edges),
        });
      } else {
        res.status(404).json({ message: 'Flow not found' });
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      res.status(500).json({ message: 'Error loading flow' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}