/*// Import required modules using require()
const express = require('express');
const next = require('next');
const { createServer } = require('http');
const WebSocket = require('ws'); // Import WebSocket using CommonJS
const { SerialPort } = require('serialport');

// Setup Next.js application
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = nextApp.getRequestHandler();

// Prepare Next.js app
nextApp.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  // Create WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    const portName = '/dev/cu.usbmodem163685201';  // Replace with your actual serial port name
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    // Read data from the serial port and send it to the WebSocket client
    port.on('data', (data) => {
      console.log('Received data:', data.toString());
      ws.send(data.toString());  // Send serial data to WebSocket client
    });

    // Handle errors on the serial port
    port.on('error', (err) => {
      console.error('Error reading from serial port:', err.message);
      ws.send('Error reading from serial port');
    });

    // Close port when WebSocket connection is closed
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      port.close();
    });
  });

  // Handle all requests using Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server on port 3000
  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
*/




/*const express = require('express');
const next = require('next');
const { createServer } = require('http');
const WebSocket = require('ws'); // Import WebSocket using CommonJS
const { SerialPort } = require('serialport');

// Setup Next.js application
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = nextApp.getRequestHandler();

// Prepare Next.js app
nextApp.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  // Create WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  let currentPort = null; // To store the serial port reference

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    const portName = '/dev/cu.usbmodem163685201';  // Replace with your actual serial port name
    currentPort = new SerialPort({ path: portName, baudRate: 9600 });

    // Read data from the serial port and send it to the WebSocket client
    currentPort.on('data', (data) => {
      console.log('Received data:', data.toString());
      ws.send(data.toString());  // Send serial data to WebSocket client
    });

    // Handle errors on the serial port
    currentPort.on('error', (err) => {
      console.error('Error reading from serial port:', err.message);
      ws.send('Error reading from serial port');
    });

    // Close port when WebSocket connection is closed
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (currentPort && currentPort.isOpen) {
        currentPort.close((err) => {
          if (err) {
            console.error('Error closing the serial port:', err.message);
          } else {
            console.log('Serial port closed');
          }
        });
      }
    });
  });

  // Handle all requests using Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server on port 3000
  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });

  // Graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');

    // Close WebSocket server
    wss.close(() => {
      console.log('WebSocket server closed');
    });

    // Close the serial port before exiting
    if (currentPort && currentPort.isOpen) {
      currentPort.close((err) => {
        if (err) {
          console.error('Error closing the serial port:', err.message);
        } else {
          console.log('Serial port closed');
        }
      });
    }

    // Close the HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0); // Exit the process cleanly
    });
  });
});*/




/*const express = require('express');
const next = require('next');
const { createServer } = require('http');
const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Setup Next.js application
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = nextApp.getRequestHandler();

// Prepare Next.js app
nextApp.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  // Create WebSocket server
  const wss = new WebSocket.Server({
    server: httpServer,
    path: '/api/socket'  // Match the client connection path
  });

  let currentPort = null; // To store the serial port reference
  let parser = null;

  // Initialize the serial port once, not for each connection
  const initializeSerialPort = () => {
    if (currentPort) return; // If port already exists, don't create a new one

    const portName = '/dev/cu.usbmodem163685201';
    try {
      currentPort = new SerialPort({ path: portName, baudRate: 9600 });
      parser = currentPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      parser.on('data', (data) => {
        console.log('Received data:', data);
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      });

      currentPort.on('error', (err) => {
        console.error('Serial port error:', err.message);
      });

      console.log(`Serial port ${portName} opened successfully`);
    } catch (err) {
      console.error('Failed to open serial port:', err.message);
    }
  };

  // Initialize port at server startup
  initializeSerialPort();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Don't close the port here - other clients might be using it
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  });

  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Clean shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');

    // Close all WebSocket connections
    wss.clients.forEach(client => {
      client.close();
    });

    // Close WebSocket server
    wss.close(() => {
      console.log('WebSocket server closed');
    });

    // Close the serial port
    if (currentPort && currentPort.isOpen) {
      currentPort.close(err => {
        if (err) {
          console.error('Error closing serial port:', err.message);
        } else {
          console.log('Serial port closed successfully');
        }
      });
    }

    // Close HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});*/


const express = require('express');
const next = require('next');
const { createServer } = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Setup Next.js application
const nextApp = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = nextApp.getRequestHandler();

// Store connected SSE clients
const clients = new Set();

// Serial port setup
let currentPort = null;
let parser = null;

const initializeSerialPort = () => {
  if (currentPort) return;

  const portName = '/dev/cu.usbmodem170633401';
  try {
    currentPort = new SerialPort({ path: portName, baudRate: 9600 });
    parser = currentPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    parser.on('data', (data) => {
      console.log('Received data:', data);
      // Send data to all connected clients
      clients.forEach(client => {
        client.write(`data: ${data}\n\n`);
      });
    });

    currentPort.on('error', (err) => {
      console.error('Serial port error:', err.message);
    });

    console.log(`Serial port ${portName} opened successfully`);
  } catch (err) {
    console.error('Failed to open serial port:', err.message);
  }
};

// Prepare Next.js app
nextApp.prepare().then(() => {
  const app = express();

  // SSE endpoint
  app.get('/api/serial-events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message
    res.write(`data: Connected to server\n\n`);

    // Add client to the set
    clients.add(res);

    // Remove client when connection closes
    req.on('close', () => {
      clients.delete(res);
      console.log('SSE client disconnected');
    });
  });

  // Initialize serial port
  initializeSerialPort();

  // Handle all other requests with Next.js
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  createServer(app).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});