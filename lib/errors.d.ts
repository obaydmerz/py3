/**
 * @file Defines error classes for Python interaction in the errors module.
 * @module py3/lib
 */

import { formatFilePath } from "./utils.js";

/**
 * Represents an error when a Python execution times out.
 */
export class TimeoutException extends Error {}

/**
 * Represents an error when there is a state mismatch.
 */
export class MismatchStateError extends Error {}

/**
 * Represents a startup error, such as an interpreter not found or a timeout during startup.
 */
export class StartupError extends Error {}

/**
 * Represents an error when the interpreter is not found.
 */
export class InterpreterNotFound extends StartupError {}

/**
 * Represents an error when the startup process times out.
 */
export class StartTimeoutException extends StartupError {
  /**
   * The error message for a startup timeout.
   */
  message: string;
}

/**
 * Represents an error when a command is incomplete.
 */
export class IncompleteCommand extends Error {
  /**
   * The error message for an incomplete command.
   */
  message: string;
}

/**
 * Represents an exception caused by a statement during execution.
 */
export class Exception extends Error {
  /**
   * The error message for the exception.
   */
  message: string;

  /**
   * The line number where the exception occurred.
   */
  line: number;

  /**
   * The position where the exception occurred.
   */
  pos: number;

  /**
   * The name of the exception.
   */
  name: string;

  /**
   * Creates a new Exception instance.
   * @param {string} [message] - The error message.
   * @param {number} [line] - The line number.
   * @param {number} [pos] - The position.
   * @param {string} [name] - The name of the exception.
   */
  constructor(message?: string, line?: number, pos?: number, name?: string);
}

/**
 * Handles and throws an error.
 * @param {Object} errObj - The Python error object.
 * @param {string} [filename="<execution>"] - The filename where the error occurred.
 * @throws {Exception} - The exception corresponding to the Python error.
 */
export function handleError(errObj: object, filename?: string): void;
