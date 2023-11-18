import { formatFilePath } from "./utils.js";

export class TimeoutException extends Error {}

export class MismatchStateError extends Error {}

export class StartupError extends Error {}

export class InterpreterNotFound extends StartupError {}

export class StartTimeoutException extends StartupError {
  message = "Shell took too long to start!";
}

export class IncompleteCommand extends Error {
  message =
    "Your command is incomplete! Verify that you have closed quotes and blocks.";
}

export class Exception extends Error {
  message = "A statement caused an exception!";
  line = 0;
  pos = 0;
  term = "";
  name = "";

  constructor(message, line, pos, name) {
    super();
    this.message = message || this.message;
    this.line = line;
    this.pos = pos;
    this.name = name;
  }
}

export function handleError(errObj, filename = "<execution>") {
  const err = new Exception(
    errObj.msg,
    errObj.line || "-",
    errObj.pos,
    errObj.name
  );
  const stack = err.stack.split("\n");
  stack.splice(
    1,
    1,
    `    at context (${formatFilePath(filename, errObj.line, errObj.pos)})`
  );
  err.stack = stack.join("\n");

  throw err;
}
