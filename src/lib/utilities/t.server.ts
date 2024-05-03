import { ZodError } from "zod";
import { initTRPC } from "@trpc/server";

export const t = initTRPC.create({
  errorFormatter(opts) {
    const { shape, error } = opts;

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        httpStatus: error.cause instanceof ZodError ? 400 : shape.data.httpStatus,
        code: error.cause instanceof ZodError ? "BAD_REinstanceofQUEST" : error.code
      }
    };
  }
});
