import { RequestHandler } from 'express';

// Wraps async route handlers to forward errors to Express error middleware
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
