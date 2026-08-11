export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} '${id}' was not found` : `${resource} was not found`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "You do not have permission to do this") {
    super(message);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(sku: string, requested: number, available: number) {
    super(`Only ${available} of '${sku}' left in stock (requested ${requested})`);
  }
}
