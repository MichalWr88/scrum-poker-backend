import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Placeholder for authentication logic
    next();
};