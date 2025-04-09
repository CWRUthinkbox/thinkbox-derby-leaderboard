import fs from 'fs';
import path from 'path';

//Finds the CSV file with the largest number in the filename (most recent data). If no files are found, creates a blank CSV file with the number 0 in the filename.

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
        var currentFileNumber = maxRaceDataFileNumber;
        let filename = "raceData" + currentFileNumber + ".csv";
        const filePath = path.join(process.cwd(), 'public', filename);
        let csvData = fs.readFileSync(filePath, 'utf8');
        csvData = csvData.replace(/\r/g, ''); // Remove any carriage return characters. Apple Numbers automatically adds these to CSV files.
        console.log("csvData = ", csvData);
        res.status(200).json({ message: "found raceData", raceData: csvData });
      } else {
        console.log("No raceData files found. Creating a blank file.")
        const filePath = path.join(process.cwd(), 'public', 'raceData0.csv');
        let csvData = "race,lane,time,speed,team\n";
        fs.writeFileSync(filePath, csvData); // Save to the public folder
        res.status(200).json({ message: "no raceData file found, created a blank file", raceData: csvData });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to load CSV file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}