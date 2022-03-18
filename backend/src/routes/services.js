import express from 'express';
import logger from '../logger';
import { serviceSchema } from '../schemata';
import { schemaValidation } from '../middleware';

const router = express.Router();

router.post('/pcheck', schemaValidation(serviceSchema.POST_PCHECK, 'body'), (req, res) => {
  const { createdids, finishids } = req.body;
  // difference between createdids and finishids
  const unfinishedPlates = createdids.filter(
    ({ plateid: pid1 }) => !finishids.some(({ plateid: pid2 }) => pid1 === pid2),
  );
  logger.info(unfinishedPlates);
  res.json(unfinishedPlates);
});

export default router;
