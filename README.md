# Py3: Python Interaction Library

Py3 is a versatile Node.js library for interacting with Python, providing a seamless bridge between the two languages.

## Key Features

- **100% Pure javascript (no native files included):** Enjoy more flexibility with a lower cost and a shorter setup process.

- **Dependency-less:** Py3 eliminates the need for additional dependencies, ensuring a lightweight and hassle-free integration with your projects.

- **Seamless Python Integration:** Py3 enables you to execute Python commands and scripts directly from your JavaScript or TypeScript code, making it easy to leverage the power of Python within your application.

- **Robust Error Handling:** Py3 includes robust error handling features, allowing you to capture and handle errors gracefully, ensuring your application remains stable even when executing complex Python commands.

- **Asynchronous Execution:** Execute Python commands asynchronously, preventing your application from becoming unresponsive while waiting for script execution to complete.

- **Detailed Results:** Access detailed results of Python script executions, including standard output, standard error, and execution success status. Py3 provides a convenient result object for easy data retrieval.

- **Comprehensive Documentation:** Py3 includes comprehensive TypeScript declaration files (.d.ts) and inline code comments, making it easy to understand and use the module in your projects.

- **Cross-Platform Compatibility:** Py3 is designed to work across different platforms, ensuring consistent Python integration regardless of the operating system.

## Installation

### From github. ( For recent features )

```bash
npm install obaydmerz/py3
```

### Or from npm: ( For stable relases )

```bash
npm install py3
```

## Usage

### Basic Example

```javascript
const { Py } = require("py3");

// Create a Py instance
const pythonShell = new Py();

// Execute a Python command
pythonShell
  .exec('"Hello, Py3!"')
  .then((result) => {
    console.log("Python Output:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

**_Easy, isn't it?_**

## API Documentation

For detailed API documentation, refer to the [index.d.ts](/index.d.ts).
For more information and advanced usage, check out the [Py3 Wiki](https://github.com/obaydmerz/py3/wiki).
