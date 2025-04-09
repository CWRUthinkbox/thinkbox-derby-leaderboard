// This API endpoint simulates incoming serial data without needing to connect to the Teensy.

if (typeof global.requestCount === 'undefined') { //Keeps track of how many requests have been made to cycle through simulated data.
  global.requestCount = 0;
  console.log("Initializing global requestCount");
}

export default function handler(req, res) {

  const simulatedData = [
    { command: "START" }, //1st place tie
    { race: 1, "lane": 3, "time": 20, "speed": 1.9 },
    { race: 1, "lane": 1, "time": 20, "speed": 1.9 },
    { race: 1, "lane": 2, "time": 21, "speed": 2.1 },
    { race: 1, "lane": 4, "time": 23, "speed": 2.1 },
    { command: "START" }, //only 3 racers
    { race: 10, "lane": 3, "time": 18, "speed": 1.8 },
    { race: 10, "lane": 1, "time": 19, "speed": 1.9 },
    { race: 10, "lane": 2, "time": 20, "speed": 2.1 },
    { command: "START" }, //times arrive out of order (3rd place)
    { race: 3, "lane": 3, "time": 13, "speed": 1.5 },
    { race: 3, "lane": 4, "time": 14, "speed": 1.2 },
    { race: 3, "lane": 1, "time": 16, "speed": 1.3 },
    { race: 3, "lane": 2, "time": 15, "speed": 1.1 },
    { command: "START" }, //2nd place tie
    { race: 4, "lane": 1, "time": 12, "speed": 1.1 },
    { race: 4, "lane": 3, "time": 13, "speed": 1.6 },
    { race: 4, "lane": 4, "time": 13, "speed": 1.3 },
    { race: 4, "lane": 2, "time": 15, "speed": 1.4 },
    { command: "START" }, //only 3 racers
    { race: 5, "lane": 4, "time": 9, "speed": 1.8 },
    { race: 5, "lane": 2, "time": 10, "speed": 1.9 },
    { race: 5, "lane": 3, "time": 11, "speed": 2.1 },
  ]

  if (req.method === 'GET') {
    try {
      console.log(`requestCount: ${global.requestCount}`)

      let jsonData = simulatedData[global.requestCount]

      //loop through the simulated data
      if (global.requestCount >= simulatedData.length - 1) {
        global.requestCount = 0;
        console.log("resetting requestCount...")
      } else {
        global.requestCount++;
      }

      res.status(200).json(jsonData); // Return parsed data
    } catch (err) {
      res.status(500).json({ error: 'Failed to parse JSON' });
      console.log("error parsing JSON", err)
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}