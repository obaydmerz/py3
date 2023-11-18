import { spawn } from "node:child_process";
import { assert, extractData } from "./lib/utils.js";
import { Result } from "./lib/result.js";
import {
  IncompleteCommand,
  InterpreterNotFound,
  MismatchStateError,
  StartTimeoutException,
  StartupError,
  TimeoutException,
  handleError,
} from "./lib/errors.js";

const beforerun = `import sys
import json
import traceback

py_original_print = print

class py_encoder(json.JSONEncoder):
  def default(self, obj):
    try:
      return super().default(obj)
    except TypeError:
      try:
        return vars(obj)
      except TypeError:
        try:
          return obj.__dict__
        except AttributeError:
          return str(obj)

def print(value, *args):
  py_original_print('¬-' + json.dumps(value, cls=py_encoder) + '-¬')

def py_display(value):
  if value is not None:
    py_original_print('¬¬' + json.dumps(value, cls=py_encoder) + '¬¬')

def py_except(type, value, traceback_obj):
    filename, line_number, line_text, line_pos, error_code = None, None, None, None, None
    tb_list = traceback.extract_tb(traceback_obj)
    if tb_list:
        filename, line_number, function_name, line_text = tb_list[-1]
        line_pos = traceback_obj.tb_frame.f_lasti
        error_code = value.args[0] if value.args else None
    py_original_print('¬*' + json.dumps({'fn': filename, 'line': line_number, 'msg': error_code, 'name': type.__name__, 'pos': line_pos}, cls=py_encoder) + '*¬')

sys.excepthook = py_except
sys.displayhook = py_display
py_original_print('¬¬*¬¬')
`;

export class Py {
  #queue = [];
  #child = null;

  #readout = null; // Null is used to ignore the first result
  #started = false;
  #shell = "";
  #print_stream = null;

  #global_print_listener = (e) => {};

  #working = true; // Busy with an existing query! At first we are busy waiting ps init.

  #timeouts = {
    start: null,
  };

  get shell() {
    // Used shell
    return this.#shell;
  }

  async start() {
    assert(this.#started == false, "Cannot start twice!", StartupError);
    assert(this.#child != null, "Cannot restart a stopped PY!", StartupError);

    this.#child.stdin.write(beforerun);

    this.#started = true;
    this.#timeouts.start = setTimeout(() => {
      this.#started = false;
      this.#working = false;
      throw new StartTimeoutException();
    }, 8000);
  }

  constructor({
    additionalShellNames = [],
    autoStart = true,
    onPrint = (e) => {},
    args = undefined,
  } = {}) {
    additionalShellNames =
      Array.isArray(additionalShellNames) && additionalShellNames.length
        ? additionalShellNames
        : ["python3", "python"];

    args = Array.isArray(args) ? args : ["-i"];

    this.#global_print_listener =
      typeof onPrint == "function" ? onPrint : (e) => {};

    // Find optimal shell
    for (const sname of additionalShellNames) {
      try {
        this.#child = spawn(sname, args);
        this.#shell = sname;
        break;
      } catch (e) {}
    }

    if (this.#child == null) {
      throw new InterpreterNotFound(
        "Cannot find a python interpreter! Try installing python or adding your one!"
      );
    }

    const onData = (data) => {
      data = data.toString();

      if (data.includes("¬-") || data.includes("-¬")) {
        const startIndex = data.indexOf("¬-");
        const endIndex = data.indexOf("-¬");

        this.#print_stream =
          this.#print_stream != null ? this.#print_stream : "";
        this.#print_stream += data.substring(
          startIndex != -1 ? startIndex + 2 : 0,
          endIndex > 0 ? endIndex : undefined
        );

        if (endIndex > 0) {
          let res;
          try {
            res = JSON.parse(this.#print_stream);
          } catch (error) {
            res = this.#print_stream;
          }

          this.#processPrint(res);
          this.#print_stream = null;
        }
      } else if (data.includes("¬¬*¬¬")) {
        if (this.#readout != null) {
          this.#readout += data.substring(0, data.indexOf("¬¬*¬¬"));
          this.#process(this.#readout);
        } else {
          this.#working = false; // Python Session is initiated!
          clearTimeout(this.#timeouts.start);
        } // No process() because we need to bypass introduction data (like Python version...)

        this.#readout = "";
      } else if (
        data.startsWith("...") &&
        this.#readout != null &&
        (this.#readout.length == 0 || this.#readout.endsWith("\n"))
      ) {
        // Incomplete command!!!
        this.#readout = "";
        if (this.#working && this.#queue[0]) {
          this.#child.stdin.write("\x03"); // Close that
          if (this.#queue[0].started)
            this.#queue.shift().trigger.incompleteCommand();
        }
      } else {
        if (this.#print_stream != null) this.#print_stream += data;
        else if (this.#readout != null) this.#readout += data;
      }
    };

    this.#child.stderr.on("data", onData);
    this.#child.stdout.on("data", onData);

    const update = () => {
      if (!this.#working) {
        if (
          typeof this.#queue[0] == "object" &&
          this.#queue[0].started == false
        ) {
          let command =
            this.#queue[0].command.trim() + "\npy_original_print('¬¬*¬¬')\n";
          this.#child.stdin.write(command);
          this.#queue[0].started = true;
          this.#working = true;
        }
      }
      if (this.#child != null) setTimeout(update, 200); // Update every 200ms
    };

    update();

    if (autoStart) {
      this.start();
    }
  }

  #process(out) {
    if (typeof this.#queue[0] == "object" && this.#queue[0].started)
      this.#queue.shift().resolve(out);
    this.#working = false;
  }

  #processPrint(out) {
    if (
      typeof this.#queue[0] == "object" &&
      this.#queue[0].started &&
      typeof this.#queue[0].onPrint == "function"
    ) {
      return this.#queue[0].onPrint(out);
    }

    return this.#global_print_listener(out);
  }

  exec(config = {}, onPrint = undefined) {
    assert(
      this.#started == true,
      "The shell isn't started yet!!",
      MismatchStateError
    );

    if (typeof config == "string") {
      // Here config is the command
      config = { command: config, onPrint };
    }

    config = {
      command: "",
      timeout: 20000,
      ...(typeof config == "object" ? config : {}),
    };

    return new Promise((resolve, reject) => {
      let tm = null;
      if (config.timeout > 0) {
        tm = setTimeout(function () {
          reject(
            new TimeoutException(
              "Your code exceeded the timeout of " + config.timeout + "ms!"
            )
          );
        }, config.timeout);
      }

      this.#queue.push({
        ...config,
        started: false,
        trigger: {
          incompleteCommand() {
            reject(new IncompleteCommand());
          },
        },
        resolve(out) {
          if (tm != null) clearTimeout(tm);
          const { json, errjson } = extractData(out);

          if (errjson != null) {
            return handleError(errjson, errjson.fn || "<console>");
          }

          if (["number", "string"].includes(typeof json)) resolve(json);
          else resolve(json ? new Result(json) : undefined);
        },
      });
    });
  }

  exit() {
    if (this.#started != true) return false;

    if (this.#child && this.#child.stdin) {
      this.#child.stdin.write("exit()\n");
      this.#child = null;
      this.#started = false;

      return true;
    }
  }
}

export { Result };
