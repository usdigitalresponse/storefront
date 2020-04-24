import { Base } from 'airtable';
import { NowRequest, NowResponse } from '@now/node';

const base: Base = require('airtable').base(process.env.AIRTABLE_BASE_ID);

export default async (req: NowRequest, res: NowResponse) => {
  const records = await base('CMS')
    .select({ view: 'Grid view' })
    .firstPage();

  res.json(records);
};
