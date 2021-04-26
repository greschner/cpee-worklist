import express from 'express';

const router = express.Router();

router.post('/receive', (req, res, next) => {
  console.log(req.headers);
  console.log(req.query);
  console.log(req.body);
  res.set('CPEE-CALLBACK', 'true').sendStatus(200);
});

export default router;
