import fs from 'fs';
import path from 'path';

//Starts a blank csv file for new races. If no raceData files exists it creates one called raceData0.csv, otherwise raceData#.csv is incremented by 1 to ensure the previous race data is saved.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const files = fs.readdirSync(publicDir); // Get all files in the public directory

      // Filter files that match the raceData pattern and extract numbers
      const raceDataFiles = files
        .filter(file => file.startsWith('raceData') && file.endsWith('.csv'))
        .map(file => parseInt(file.replace('raceData', '').replace('.csv', ''), 10))
        .filter(num => !isNaN(num)); // Ensure valid numbers

      if (raceDataFiles.length > 0) {
        let maxRaceDataFileNumber = Math.max(...raceDataFiles); // Find the largest raceData file number
        var currentFileNumber = maxRaceDataFileNumber + 1; //increment the file number
        var filename = "raceData" + currentFileNumber + ".csv";
      } else {
        var filename = "raceData0.csv";
      }

      const filePath = path.join(process.cwd(), 'public', filename);
      let csvData = "race,lane,time,speed,team\n";
      fs.writeFileSync(filePath, csvData); // Save to the public folder
      let message = "Created a blank file " + filename;
      res.status(200).json({ message: message });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to load CSV file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}