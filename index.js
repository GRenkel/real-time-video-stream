import http from "http";
import fs from "fs";
import { pipeline } from "stream/promises";
import EventEmitter from "events";
import { serverLogger } from "./serverLogger.js";
import { getRequestContentType } from "./serverHelper.js";
import path from "path";
const fsPromises = fs.promises;

const API_PORT = process.env.PORT || 3001;
const CHUNK_SIZE = 1e6; //megabytes

const serverLogEmitter = new EventEmitter();
serverLogEmitter.on("log", (message, logFileName) =>
  serverLogger(message, logFileName)
);

async function* videoStream(videoPath, options) {
  const readStream = fs.createReadStream(videoPath, options);
  for await (const chunk of readStream) {
    yield chunk;
  }
}

async function serveVideoStream(request, response) {
  try {
    const controller = new AbortController();
    const pathToStreamingVideo = path.basename(request.url)
    const videoSize = (await fsPromises.stat(pathToStreamingVideo)).size; //bytes

    const requestedRange = request.headers.range;
    const start = Number(requestedRange.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    serverLogEmitter.emit(
      "log",
      `\nStarting byte: ${start}\nEnding byte: ${end}\nContent length:${contentLength}\n`,
      "requestChunks.txt"
    );

    response.statusCode = 206;
    response.setHeader("Accept-Ranges", "bytes");
    response.setHeader("Content-Range", `bytes ${start}-${end}/${videoSize}`);
    response.setHeader("Content-Length", contentLength);

    await pipeline(videoStream(pathToStreamingVideo, { start, end }), response, {
      signal: controller.signal,
    });
  } catch (error) {
    serverLogEmitter.emit(
      "log",
      `${error.name} - ${error.message}`,
      "errorLogs.txt"
    );
  }
}

const serveMainPage = async (response) => {
  try {
    const rawData = await fsPromises.readFile(
      path.join("./", "public", "views", "index.html")
    );
    response.end(rawData);
  } catch (err) {
    serverLogEmitter.emit("log", `${err.name}: ${err.message}`, "errLog.txt");
    response.statusCode = 500;
    response.end();
  }
};

async function requestHandler(request, response) {
  serverLogEmitter.emit(
    "log",
    `${request.method}\t${request.url}`,
    "requestLogs.txt"
  );

  try {
    const contentType = getRequestContentType(request.url);

    response.setHeader("Content-Type", contentType);

    contentType === "text/html"
      ? serveMainPage(response)
      : serveVideoStream(request, response);
  } catch (error) {
    serverLogEmitter.emit(
      "log",
      `${error.name} - ${error.message}`,
      "errorLogs.txt"
    );
  }
}

http
  .createServer(requestHandler)
  .listen(API_PORT, () => console.log(`server listening o port ${API_PORT}`));
