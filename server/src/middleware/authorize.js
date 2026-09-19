import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authorize = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const resource = await Model.findById(id);

    if (!resource || resource.isDeleted) {
      throw new ApiError(404, `${Model.modelName || 'Resource'} not found`, 'NOT_FOUND');
    }

    if (
      req.user.role !== 'admin' &&
      resource.userId &&
      resource.userId.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, 'You do not have permission to access this resource', 'FORBIDDEN');
    }

    req.resource = resource;
    next();
  });
