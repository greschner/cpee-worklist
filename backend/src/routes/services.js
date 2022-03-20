import express from 'express';
import logger from '../logger';

const router = express.Router();

const dateDiffinHours = (a, b) => (a - b) / (1000 * 60 * 60);

router.post('/pcheck', (req, res) => {
  const createdids = JSON.parse(req.body.createdids);
  const finishids = JSON.parse(req.body.finishids);
  // difference between createdids and finishids
  const unfinishedPlates = createdids.filter(
    ({ plateid: pid1 }) => !finishids.some(({ plateid: pid2 }) => pid1 === pid2),
  );
  const okPlates = unfinishedPlates.filter(
    ({ timestamp, plateid }) => {
      const hoursDiff = dateDiffinHours(new Date(), new Date(timestamp));
      const ok = hoursDiff < 4;
      if (!ok) {
        logger.warn(`Bad Plate: ${plateid} with delta: ${hoursDiff.toFixed(2)} h`);
      }
      return ok;
    },
  );
  logger.info(unfinishedPlates);
  res.json(okPlates);
});

export default router;
