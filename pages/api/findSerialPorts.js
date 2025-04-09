const { SerialPort } = require('serialport');

async function listPorts() {
  try {
    const ports = await SerialPort.list();
    console.log("Available Ports:", ports);
  } catch (error) {
    console.error("Error finding or opening port:", error);
  }
}

listPorts();
