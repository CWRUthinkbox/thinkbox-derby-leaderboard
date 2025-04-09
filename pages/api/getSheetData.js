const { google } = require('googleapis');
const sheets = google.sheets('v4');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      /*
      // Previously, I used a method to fetch data from a Google Sheet using a public CSV link.
      // This method was prone to caching issues, so I switched to using the Google Sheets API.
      

      // This Google Sheet was made publically available using "Publish to web".
      //const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROl0jVJp_UJar0b17t21NruR_z_aJYXrt_0YIdbiurEIvfw98RuzFLUWcEk30q4VaRp-y3v_MZUE7M/pub?output=csv';
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTC_-ZxtTTxDtgBrNe_uHN1eXwFj1Jv4Ls_Yp0ZyiXS01TGGx-IzpayoPoTpbM25KOSsg11vw1AQwFk/pub?output=csv'; //I tried using a duplicate Google Sheet with IMPORTRANGE to forcibly update the data. This didn't work.
      const urlWithCacheBuster = `${sheetUrl}&nocache=${new Date().getTime()}`; // Add a cache buster to the URL

      // Fetch the data from the CSV link while preventing caching. 
      const response = await fetch(urlWithCacheBuster, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store, must-revalidate', //'no-cache',  // Tell browser to bypass cache
          'Pragma': 'no-cache',         // Older HTTP1.x compatibility
          'Expires': '0'                // Prevents caching of the response
        }
      });
      const data = await response.text();

      // Parse the CSV data
      const cleanData = data.split('\n').map(row =>
        row.split(',').map(cell => cell.replace(/\r$/, '')) // Remove \r from each cell
      );

      //Pull out the team names
      let teamNames = [];
      for (let i = 1; i < cleanData.length; i++) { //skip the header row
        teamNames.push(cleanData[i][1]); //team name is in the second column
      }
      console.log("Fetched teamNames:", teamNames);*/


      // Fetch data from Google Sheets using Google Sheets API
      const auth = new google.auth.GoogleAuth({
        keyFile: 'google_credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const client = await auth.getClient();
      const spreadsheetId = '1_Uxb9VFDJrWEm3yKclyQykPoSZGImDZIc5a9XchwoEk';
      const range = 'Form Responses 1!B2:B200'; // Specify the range you want to fetch

      const response = await sheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId: spreadsheetId,
        range: range,
      });

      let data = response.data.values;
      let flatData = data.flat().filter(item => item);
      let teamNames = flatData
      console.log('Fetched Team Names:', flatData);

      // Set headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Return the parsed data as JSON
      res.status(200).json(teamNames);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data from Google Sheets' });
    }
  }
}