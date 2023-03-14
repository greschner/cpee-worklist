// route for base data
import express from 'express';
import { baseDataModel } from '../model/index.js';
import { crudMid } from '../middleware/index.js';

const router = express.Router();

// get base data
router.get('/', crudMid(() => baseDataModel.find({}).sort({ id: 1 }).collation({ locale: 'en_US', numericOrdering: true }).exec() || []));

export default router;
