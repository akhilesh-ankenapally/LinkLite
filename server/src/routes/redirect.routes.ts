import { Router } from 'express';
import { RedirectController } from '../controllers/redirect.controller';

export const redirectRouter = Router();

// Handle short URL redirects at /:shortCode
redirectRouter.get('/:shortCode', RedirectController.handleRedirect);
