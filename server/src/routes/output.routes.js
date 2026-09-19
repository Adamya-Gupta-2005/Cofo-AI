import { Router } from 'express';
import {
  getOutputById,
  updateOutput,
  regenerateOutput,
  approveOutput,
  exportOutput,
} from '../controllers/output.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateOutputSchema } from '../validators/transformation.validators.js';
import { Output } from '../models/Output.model.js';

const router = Router();

router.use(authenticate);

router.get('/:id', authorize(Output), getOutputById);
router.patch('/:id', authorize(Output), validate(updateOutputSchema), updateOutput);
router.post('/:id/regenerate', authorize(Output), regenerateOutput);
router.post('/:id/approve', authorize(Output), approveOutput);
router.get('/:id/export', authorize(Output), exportOutput);

export default router;
