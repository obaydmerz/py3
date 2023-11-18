/**
 * @file Defines the Result class for representing Python execution results.
 * @module py3/lib
 */

/**
 * Represents the result of a Python execution.
 */
export class Result extends Array {
  /**
   * Creates a new Result instance.
   * @param {Object|Array} obj - The object or array to initialize the Result with.
   */
  constructor(obj: object | any[]);

  /**
   * Converts the Result to an array.
   * @returns {Array} The Result as an array.
   */
  toArray(): any[];
}
