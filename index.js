import http from "http";
import fs from "fs";
import { pipeline } from "stream/promises";
import EventEmitter from "events";
import { serverLogger } from "./serverLogger.js";

const API_PORT = process.env.PORT || 3001;
const filePath = "./01_Introduçao_ao_capitulo.mp4";
const CHUNCK_SIZE = 8e6;

const serverLogEmitter = new EventEmitter()
serverLogEmitter.on('log', (message, logFileName) => serverLogger(message, logFileName))


async function* videoStream() {
  const readStream = fs.createReadStream(filePath);
  for await (const chunk of readStream) {
    yield chunk;
  }
}

async function requestHandler(request, response) {
  serverLogEmitter.emit('log', `${request.method}\t${request.url}`, 'requestLogs.txt')
  try {
    const controller = new AbortController();
    response.headers = {
      "Content-Type": "video/mp4",
    };
    pipeline(videoStream, response, { signal: controller.signal });
  } catch (error) {
    serverLogEmitter.emit('log', `${error.name} - ${error.message}`, 'errorLogs.txt')
  }
}

http
  .createServer(requestHandler)
  .listen(API_PORT, () => console.log(`server listening o port ${API_PORT}`));

