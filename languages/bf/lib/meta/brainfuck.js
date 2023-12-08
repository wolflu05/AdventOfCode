const run = (code, input, size) => {
  const mem = new Uint8Array(size).fill(0);

  let mp = 0;
  let ip = 0;
  let inp = 0;
  let out = "";

  const startToEnd = new Map();
  const endToStart = new Map();
  const stack = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === "[") stack.push(i);
    else if (code[i] === "]") {
      const opening = stack.pop();
      if (typeof opening !== "number") throw new Error(`Unexpected ] at ${i}`);
      startToEnd[opening] = i;
      endToStart[i] = opening;
    }
  }

  if (stack.length !== 0) {
    throw new Error(`Missing ] for [ at ${stack.join(",")}`);
  }

  while (ip < code.length) {
    const c = code[ip];

    if (c === "+") {
      if (++mem[mp] > 255) mem[mp] = 0;
    } else if (c === "-") {
      if (--mem[mp] < 0) mem[mp] = 255;
    } else if (c === ",") {
      if (inp < input.length) mem[mp] = input.charCodeAt(inp++);
    } else if (c === ".") {
      out += String.fromCharCode(mem[mp]);
    } else if (c === ">") {
      if (++mp >= mem.length) mp = 0;
    } else if (c === "<") {
      if (--mp < 0) mp = mem.length - 1;
    } else if (c === "[") {
      if (mem[mp] === 0) ip = startToEnd[ip];
    } else if (c === "]") {
      if (mem[mp] !== 0) ip = endToStart[ip];
    }

    ip++;
  }

  return out;
}

module.exports.run = run;
