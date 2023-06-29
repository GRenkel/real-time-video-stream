# Video Streaming using Node.js Native Modules

This project demonstrates how to implement video streaming using only native modules of Node.js. The server streams video content to clients in small chunks, allowing smooth playback and efficient data transfer.

## Prerequisites

- Node.js installed on your system

## Installation

1. Clone the repository or download the source code files.
2. Navigate to the project directory.
3. Install dependencies by running the following command:

   ```
   npm install
   ```

## Usage

1. Place the video file you want to stream in the project directory.
2. Open the `index.html` file located in the `public/views` directory and modify it as needed (e.g., update the video source URL).
3. Start the server by running the following command:

   ```
   npm run run-server
   ```

4. Access the application in your browser at `http://localhost:3001` (or the specified `PORT`).

## How It Works

The project utilizes the following Node.js native modules:

- `http`: Allows the creation of an HTTP server to handle incoming requests.
- `fs`: Provides file system operations, including reading video files.
- `stream/promises`: Enables asynchronous stream handling using promises.
- `events`: Implements an event emitter to log server events.
- `path`: Resolves file paths and handles file-related operations.

The server responds to requests for video streaming by providing video content in small chunks. The `videoStream` function creates a readable stream for the requested video file. The `serveVideoStream` function handles the streaming process by setting appropriate headers, calculating chunk sizes, and piping the video stream to the response object.

The server also serves the main HTML page (`index.html`) when requested. The `serveMainPage` function reads the HTML file and sends it as the response.

The `requestHandler` function determines the content type based on the request URL and calls the appropriate handler function accordingly.

## Configuration

- The default API port is set to `3001`. You can modify it by changing the `API_PORT` variable.
- The chunk size for video streaming is set to `1e6` bytes (1 megabyte). You can adjust it by modifying the `CHUNK_SIZE` constant.

## Logging

The server logs various events using the `serverLogEmitter` event emitter. The log messages are written to separate log files:

- `requestLogs.txt`: Logs the HTTP method and URL of incoming requests.
- `requestChunks.txt`: Logs details of the requested byte range, content length, etc., for video streaming requests.
- `errorLogs.txt`: Logs any encountered errors during request handling.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

This project utilizes the power and flexibility of Node.js and its native modules to implement video streaming without the need for additional third-party libraries.