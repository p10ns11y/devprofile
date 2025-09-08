import { NextApiRequest, NextApiResponse } from 'next';
import cvdata from '../../data/cvdata.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return the actual CV data
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(cvdata));
}
