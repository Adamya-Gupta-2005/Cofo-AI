import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const dataToValidate = req[source];
    const parsed = schema.parse(dataToValidate);
    req[source] = parsed;
    next();
  } catch (error) {
    const details = error.errors
      ? error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
      : [{ message: error.message }];
    next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details));
  }
};
