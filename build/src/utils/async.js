/*--------------------------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
 *-------------------------------------------------------------------------------------------------------------*/

import fs from "fs";
import https from "https";
import crypto from "crypto";
import rimrafCb from "rimraf";
import mkdirpCb from "mkdirp";
import copyFilesCb from "copyfiles";
import { spawn as spawnCb, exec as execCb } from "child_process";

// async forEach
export async function forEach(array, cb) {
  for (let i = 0; i < array.length; i++) {
    await cb(array[i], i, array);
  }
}

// async spawn
export async function spawn(command, args, opts) {
  console.log(
    `(*) Spawn: ${command}${args.reduce((prev, current) => `${prev} ${current}`, "")}`,
  );

  opts = opts || { stdio: "inherit", shell: true };
  let echo = false;
  if (opts.stdio === "inherit") {
    opts.stdio = "pipe";
    echo = true;
  }
  return new Promise((resolve, reject) => {
    let result = "";
    const proc = spawnCb(command, args, opts);
    proc.on("close", (code, signal) => {
      if (code !== 0) {
        if (!echo) {
          console.error(result);
        }
        const err = new Error(`Non-zero exit code: ${code} ${signal || ""}`);
        err.result = result;
        err.code = code;
        err.signal = signal;
        reject(err);
        return;
      }
      resolve(result);
    });
    if (proc.stdout) {
      proc.stdout.on("data", (chunk) => {
        const stringChunk = chunk.toString();
        result += stringChunk;
        if (echo) {
          process.stdout.write(stringChunk);
        }
      });
    }
    if (proc.stderr) {
      proc.stderr.on("data", (chunk) => {
        const stringChunk = chunk.toString();
        result += stringChunk;
        if (echo) {
          process.stderr.write(stringChunk);
        }
      });
    }
    proc.on("error", reject);
  });
}

export async function exec(command, opts) {
  console.log(`(*) Exec: ${command}`);

  opts = opts || { stdio: "inherit", shell: true };
  return new Promise((resolve, reject) => {
    let result = "";
    const proc = execCb(command, opts);
    proc.on("close", (code, signal) => {
      if (code !== 0) {
        console.log(result);
        const err = new Error(`Non-zero exit code: ${code} ${signal || ""}`);
        err.result = result;
        err.code = code;
        err.signal = signal;
        reject(err);
        return;
      }
      resolve(result);
    });
    if (proc.stdout) {
      proc.stdout.on("data", (chunk) => (result += chunk.toString()));
    }
    if (proc.stderr) {
      proc.stderr.on("data", (chunk) => (result += chunk.toString()));
    }
    proc.on("error", reject);
  });
}

// async rename
export async function rename(from, to) {
  return new Promise((resolve, reject) => {
    fs.rename(from, to, (err) => (err ? reject(err) : resolve()));
  });
}

// async readFile
export async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) =>
      err ? reject(err) : resolve(data.toString()),
    );
  });
}

// async writeFile
export async function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, "utf8", (err) =>
      err ? reject(err) : resolve(filePath),
    );
  });
}

// async mkdirp
export async function mkdirp(pathToMake) {
  return new Promise((resolve, reject) => {
    mkdirpCb(pathToMake, (err, made) => (err ? reject(err) : resolve(made)));
  });
}

// async rimraf
export async function rimraf(pathToRemove, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    rimrafCb(pathToRemove, opts, (err) =>
      err ? reject(err) : resolve(pathToRemove),
    );
  });
}

// async copyfiles
export async function copyFiles(source, blobs, target) {
  return new Promise((resolve, reject) => {
    process.chdir(source);
    copyFilesCb(blobs.concat(target), { all: true }, (err) =>
      err ? reject(err) : resolve(target),
    );
  });
}

// async copyfile
export async function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, (err) => (err ? reject(err) : resolve()));
  });
}

// async chmod
export async function chmod(src, mod) {
  return new Promise((resolve, reject) => {
    fs.chmod(src, mod, (err) => (err ? reject(err) : resolve()));
  });
}

// async readdir
export async function readdir(dirPath, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, opts, (err, files) =>
      err ? reject(err) : resolve(files),
    );
  });
}

// async exists
export async function exists(filePath) {
  return fs.existsSync(filePath);
}

// async gen SHA 256 hash for file
export async function shaForFile(filePath) {
  return new Promise((resolve, reject) => {
    const fd = fs.createReadStream(filePath);
    const hash = crypto.createHash("sha256");
    hash.setEncoding("hex");
    fd.on("end", function () {
      hash.end();
      resolve(hash.read());
    });
    fd.on("error", (err) => {
      reject(err);
    });
    fd.pipe(hash);
  });
}

// async gen SHA 256 hash for string
export async function shaForString(content) {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}

// async HTTPS get
export async function getUrlAsString(url) {
  return new Promise((resolve, reject) => {
    let content = "";
    const req = https.get(url, function (res) {
      res.on("data", function (chunk) {
        content += chunk.toString();
      });
    });
    req.on("error", reject);
    req.on("close", () => resolve(content));
  });
}
