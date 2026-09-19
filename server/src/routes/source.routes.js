import { Router } from 'express';
import {
  createSource,
  getSourceById,
  getSources,
  analyzeSource,
} from '../controllers/source.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { uploadSingleFile } from '../middleware/uploadHandler.js';
import { Source } from '../models/Source.model.js';

const router = Router();

router.use(authenticate);

router.post('/', uploadSingleFile, createSource);
router.get('/', getSources);
router.get('/:id', authorize(Source), getSourceById);
router.post('/:id/analyze', authorize(Source), analyzeSource);

export default router;
