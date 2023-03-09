import httpStatus from "http-status";

export default class APIError extends Error {
  public status: number;
  public stack: any;
  public code: any;
  public metadata: any;
  public data: any;

  constructor(
    message: string = "Internal server error",
    status: number = httpStatus.INTERNAL_SERVER_ERROR,
    stack?: any,
    data?: any,
  ) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, APIError.prototype);

    this.status = status;
    this.stack = stack;
    this.data = data;
  }
}
