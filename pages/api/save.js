import fs from 'fs';
import path from 'path';

//Saves racingData to a CSV file. If a file already exists, it will increment the number in the filename

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { data } = req.body; // Assuming data is an array of objects

      // Step 1: Convert JSON array to CSV format
      const jsonToCSV = (jsonArray) => {
        const header = Object.keys(jsonArray[0]).join(','); // Get headers from the first object
        const rows = jsonArray.map(row => Object.values(row).join(',')); // Convert each object to a CSV row
        return [header, ...rows].join('\n'); // Join the header and rows with newlines
      };

      const csvData = jsonToCSV(data);

      // Step 2: Find the latest raceData file name
      const publicDir = path.join(process.cwd(), 'public');
      const files = fs.readdirSync(publicDir); // Get all files in the public directory

      // Step 3: Filter files that match the raceData pattern and extract numbers
      const raceDataFiles = files
        .filter(file => file.startsWith('raceData') && file.endsWith('.csv'))
        .map(file => parseInt(file.replace('raceData', '').replace('.csv', ''), 10))
        .filter(num => !isNaN(num)); // Ensure valid numbers

      if (raceDataFiles.length > 0) { //raceData files exist
        let maxRaceDataFileNumber = Math.max(...raceDataFiles); // Find the largest raceData file number
        var currentFileNumber = maxRaceDataFileNumber
        var filename = "raceData" + currentFileNumber + ".csv";

        // Step 4: Save the CSV by overwriting 
        const filePath = path.join(process.cwd(), 'public', filename);
        fs.writeFileSync(filePath, csvData); // Save to the public folder

        var message = "CSV file saved successfully " + filename;
      } else { //No raceData files found
        var filename = "raceData0.csv";

        // Step 4: Save the CSV by creating a blank CSV file
        let csvData = "race,lane,time,speed,team\n";
        fs.writeFileSync(filePath, csvData); // Save to the public folder

        var message = "Created a blank file " + filename;
      }
      res.status(200).json({ message: message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save CSV file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}