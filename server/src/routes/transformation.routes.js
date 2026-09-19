import { Router } from 'express';
import {
  createTransformation,
  getTransformationById,
  getTransformations,
  deleteTransformation,
  streamProgress,
  exportAllOutputs,
} from '../controllers/transformation.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createTransformationSchema } from '../validators/transformation.validators.js';
import { Transformation } from '../models/Transformation.model.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTransformationSchema), createTransformation);
router.get('/', getTransformations);
router.get('/:id', authorize(Transformation), getTransformationById);
router.delete('/:id', authorize(Transformation), deleteTransformation);
router.get('/:id/progress', streamProgress);
router.post('/:id/export-all', authorize(Transformation), exportAllOutputs);

export default router;
