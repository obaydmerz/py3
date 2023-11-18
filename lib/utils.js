export function assert(cond, err, cls = Error) {
  if (!cond) {
    throw new cls(err);
  }
}

export function extractData(dt) {
  // Used to return json (order by last) or an empty object
  const out = dt.match(/¬¬([\s\S]+?)¬¬/gm) || [];
  const err = dt.match(/¬\*([\s\S]+?)\*¬/gm) || [];
  let json = null;
  let errjson = null;

  for (const i of out.reverse()) {
    try {
      json = JSON.parse(i.substring(2, i.length - 2).replace(/[\r\n]/gm, ""));
      break;
    } catch (error) {}
  }

  for (const i of err.reverse()) {
    try {
      errjson = JSON.parse(
        i.substring(2, i.length - 2).replace(/[\r\n]/gm, "")
      );
      break;
    } catch (error) {}
  }

  return {
    json,
    errjson,
  };
}

export function formatFilePath(filePath, lineNumber, columnNumber) {
  const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
  return `${fileUrl}${lineNumber != undefined ? ":" + lineNumber : ""}${
    columnNumber != undefined ? ":" + columnNumber : ""
  }`;
}
