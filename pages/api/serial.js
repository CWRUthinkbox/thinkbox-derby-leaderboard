import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// API Route to handle serial data

export default function handler(req, res) {
  try {
    const portName = '/dev/cu.usbmodem170633401'; // replace with your port name
    const port = new SerialPort({ path: portName, baudRate: 9600 });

    // Create a parser for reading lines of data
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // Handling when the port is successfully opened
    port.on('open', () => {
      console.log('Port is now open and ready for use');
    });

    // Handling data received from the serial port
    port.on('data', (data) => {
      console.log('Received data:', data.toString()); // Ensure data is a string
      res.status(200).json({ serialData: data.toString() });
    });

    // Handling errors on the port
    port.on('error', (err) => {
      console.error('Serial Port Error:', err.message);
      res.status(500).json({ error: 'Serial port error: ' + err.message });
    });

  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ error: 'Unexpected error: ' + error.message });
  }
}