import type { AccessTokenPayload } from "../../../domain/ports/token-service.port.js";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
