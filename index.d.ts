/**
 * @file Defines the Py class and related types for Python interaction.
 * @module py3
 */

declare module "py3" {
  import { ChildProcessWithoutNullStreams } from "node:child_process";
  import { Result } from "./lib/result";

  /**
   * Configuration options for the Py class.
   */
  interface PyOptions {
    /**
     * Additional shell names to access python.
     *
     * Ex: `["python3", "python"]`
     *
     * @note The list is ordered, so `Py` will choose by order.
     */
    additionalShellNames?: string[];
    /**
     * Should `Py`'s constructor call `start()`
     */
    autoStart?: boolean;
    /**
     * Args to start the shell with
     *
     * Ex: `["-i"]`
     */
    args?: string[];

    /**
     * A callback function to handle global uncaught python print statements.
     */
    onPrint?: (result: any) => void;
  }

  /**
   * Represents a Python interaction class.
   */
  export class Py {
    /**
     * The queue of commands to be executed.
     */
    #queue: object[];

    /**
     * The child process for Python execution.
     */
    #child: ChildProcessWithoutNullStreams;

    /**
     * The readout from the Python execution.
     */
    #readout: string | null;

    /**
     * Indicates whether the Python session has started.
     */
    #started: boolean;

    /**
     * The active shell being used.
     */
    #shell: string;

    /**
     * Indicates whether the Py instance is currently working on a query.
     */
    #working: boolean;

    /**
     * Timeouts for various operations.
     */
    #timeouts: {
      start: NodeJS.Timeout | null;
    };

    /**
     * Gets the active shell.
     */
    get shell(): string;

    /**
     * Starts the Python interaction.
     * @returns {Promise<void>} A promise that resolves when the startup is complete.
     * @throws {StartupError} - If the startup process encounters an error.
     */
    start(): Promise<void>;

    /**
     * Creates a new Py instance.
     * @param {PyOptions} [options] - The configuration options.
     * @throws {InterpreterNotFound} - If a Python interpreter is not found.
     */
    constructor(options?: PyOptions);

    /**
     * Processes the Python execution result.
     * @param {string} out - The output from the Python execution.
     */
    #process(out: string): void;

    /**
     * Executes a Python command.
     * @async
     * @param {string|Object} config - The configuration for the execution.
     * @param {Function} [onPrint] - A callback function to handle Python print statements. Only effective if
     * config is a string, else see `config.onPrint`.
     * @property {string} [config.command] - The Python command to execute.
     * @property {number} [config.timeout=20000] - The timeout for the execution in milliseconds.
     * @property {(result: any): void} [config.onPrint] - A callback function to handle Python print statements.
     * @returns {Promise<any>} A promise that resolves with the result of the execution.
     * @throws {TimeoutException} - If the execution exceeds the specified timeout.
     * @throws {IncompleteCommand} - If the provided Python command is incomplete.
     * @public
     */
    exec(
      config:
        | string
        | {
            command?: string;
            timeout?: number;
            onPrint?: (result: any) => void;
          },
      onPrint?: (result: any) => void
    ): Promise<any>;

    /**
     * Exits the Python interaction.
     * @returns {boolean} True if the exit was successful, false otherwise.
     */
    exit(): boolean;
  }

  export { Result };
}
