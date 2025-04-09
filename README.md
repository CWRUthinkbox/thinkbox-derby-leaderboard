# Think[box] Derby Live Interactive Leaderboard

## Background / Purpose

This web app serves as a **live interactive leaderboard** for the **think[box] Derby** at Case Western Reserve University. The think[box] Derby is an annual (almost) anything goes design and build competition where participants construct cars and race them on an undulating track. This app maintains a leaderboard by interacting with a Teensy microcontroller connected to sensors which measure finish times and speeds.

## Usage

This app is designed to run on a laptop connected to **display screens** near the track. The track is equipped with sensors that measure the **racers' speed and finish time** via a Teensy microcontroller connected to the laptop through **USB**.

1. **Racer Registration**: Racers register their car by submitting a [Google Form](https://bit.ly/register-derby).
2. **Pull Car Names**: After racers register, the race operator presses the "Pull Car Names" button to retrieve them.
3. **Lane Assignment**: Before each race, the race operator assigns cars to each lane using the dropdowns, leaving lanes unassigned if there are fewer than 4 racers.
4. **Race Results**: The leaderboard is automatically updated with times and speeds for each racer.

## Important Notes

- **Browser**: This app is designed to work best in **Firefox**. Point Firefox to `localhost:3000`.
- **Full Screen Mode**: Make the page full screen and hide the toolbar. After entering full screen, right-click an empty spot on the toolbar and select **"Hide Toolbars"**.
- **Practice Mode**: Check the **"Practice Mode"** checkbox for races that don't need to be counted toward the leaderboard.
- **Team Names**: Ensure team names are set before starting the race. Lanes **lock** after the race starts.
- **Team Name Edits**: Team names can be modified if necessary using this [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1_Uxb9VFDJrWEm3yKclyQykPoSZGImDZIc5a9XchwoEk/edit?usp=sharing) before the race starts. Remember to click **"Pull Car Names"** after editing.
- **CSV File**: The app saves data as you go to a CSV file (`/public/raceData#.csv`). Pressing "Clear All Race Data" under the debug menu starts a new set of races. 
- **Swap Leaderboards**: Press the swap icon to toggle between the fastest and slowest time leaderboards.
- **Race Setup**: Each race should have **3 or 4 racers**. The styling may look off if there are fewer than 3 racers.

## Setup

1. Clone the repository:
```git clone https://github.com/masterminnich/thinkbox-derby.git```
2. Install dependencies:
```npm install```
3. Run the app:
```npm run dev```