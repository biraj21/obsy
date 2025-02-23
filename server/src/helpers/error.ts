export class CustomError extends Error {
  constructor(public message: string, public statusCode: number, public details?: any) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = "bad request", details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = "unauthorized", details?: any) {
    super(message, 401, details);
  }
}

export class PaymentRequiredError extends CustomError {
  constructor(message: string = "payment required", details?: any) {
    super(message, 402, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = "forbidden", details?: any) {
    super(message, 403, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = "not found", details?: any) {
    super(message, 404, details);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = "conflict", details?: any) {
    super(message, 409, details);
  }
}

export class UnprocessableEntityError extends CustomError {
  constructor(message: string = "unprocessable entity", details?: any) {
    super(message, 422, details);
  }
}

export class TooManyRequestsError extends CustomError {
  constructor(message: string = "too many requests", details?: any) {
    super(message, 429, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = "internal server error", details?: any) {
    super(message, 500, details);
  }
}
