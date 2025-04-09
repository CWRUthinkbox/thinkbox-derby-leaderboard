import Head from 'next/head';
import { useRef, useState, useEffect } from 'react';
import * as pd from 'danfojs';
import Timer from './Timer';
import Lane from './Lane';
import { parse } from 'path';

let racingData = null; //stores all data for all races in a DataFrame

export default function Home() {
  const [dropdownDisabled, setDropdownDisabled] = useState(false);
  const [teamNames, setTeamNames] = useState([]);
  const [currentRaceData, setCurrentRace] = useState(null);
  const [prevRaceData, setPrevRace] = useState(null);
  const [leaderboardData, setLeaderboard] = useState(null);
  const [crawlClub, setCrawlClub] = useState(null);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [team3, setTeam3] = useState(null);
  const [team4, setTeam4] = useState(null);
  //create state for each lane time and speed
  const [lane1Time, setLane1Time] = useState(null);
  const [lane1Speed, setLane1Speed] = useState(null);
  const [lane2Time, setLane2Time] = useState(null);
  const [lane2Speed, setLane2Speed] = useState(null);
  const [lane3Time, setLane3Time] = useState(null);
  const [lane3Speed, setLane3Speed] = useState(null);
  const [lane4Time, setLane4Time] = useState(null);
  const [lane4Speed, setLane4Speed] = useState(null);
  const [lane1Position, setLane1Position] = useState(null);
  const [lane2Position, setLane2Position] = useState(null);
  const [lane3Position, setLane3Position] = useState(null);
  const [lane4Position, setLane4Position] = useState(null);
  const [showLeaders, setShowLeaders] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);

  useEffect(() => { // Code that should run only when the page first loads
    loadData();
  }, []);

  function updateLeaderboards() {
    //check if dataframe is empty, by looking at second row (row after headers)
    if (racingData.shape[0] < 2) {
      console.log("updateLeaderboards(): racingData is empty. Setting leaderboards to null.");

      setCurrentRace(null);
      setPrevRace(null);
      setLeaderboard(null);
      setCrawlClub(null);
    } else {
      //update previous race
      let lastRace = racingData["race"].max(); //Find last race by getting max value in race column of racingData
      let prevRaceData = racingData.loc({ rows: racingData["race"].eq(lastRace) }); //segment the dataframe to only include recent race
      let prevRaceSorted = prevRaceData.sortValues("time", { ascending: true }); //sort values by time
      prevRaceSorted.resetIndex({ inplace: true });
      setPrevRace(prevRaceSorted);

      //update leaderboard
      let leaderboard = racingData.sortValues("time", { ascending: true }).head(5); //return top 5 fastest finishing times
      leaderboard.resetIndex({ inplace: true });
      console.log("leaderboard", leaderboard.print())
      setLeaderboard(leaderboard);

      //update crawl club
      let crawlClub = racingData.sortValues("time", { ascending: false }).head(5); //return top 5 slowest finishing times
      crawlClub.resetIndex({ inplace: true });
      setCrawlClub(crawlClub);
    }
  }

  function newRace(racingData) {
    resetTimer();
    setDropdownDisabled(false);

    //clear current race data
    setCurrentRace(null);

    //clear speed and time displays
    setLane1Time(null);
    setLane2Time(null);
    setLane3Time(null);
    setLane4Time(null);
    setLane1Speed(null);
    setLane2Speed(null);
    setLane3Speed(null);
    setLane4Speed(null);

    //clear finish positions
    setLane1Position(null);
    setLane2Position(null);
    setLane3Position(null);
    setLane4Position(null);

    //clear team names
    setTeam1(null);
    setTeam2(null);
    setTeam3(null);
    setTeam4(null);

    let practiceModeValue = document.getElementById("practiceMode").checked //get the value of the checkbox when state fails to update

    if (racingData == null) {
      console.log("newRace() racingData is null");
      updateLeaderboards();
    } else if (practiceModeValue) {
      console.log("Practice Mode is on. Not updating leaderboards.");
    } else {
      updateLeaderboards();
    }

    if (leaderboardData) {
      console.log("leaderboardData");
      leaderboardData.print();
    }
  }

  const saveCSV = async (data) => {
    try {
      const jsonData = pd.toJSON(data); // Convert DataFrame to JSON
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: jsonData }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Failed to save CSV:', error);
    }
  };

  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) {
      timerRef.current.startTimer();
    }
    setDropdownDisabled(true)
  };

  const stopTimer = () => {
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      timerRef.current.resetTimer();
    }
  };

  const pullTeamData = async () => {
    try {
      const response = await fetch('/api/getSheetData');
      let data = await response.json();
      data = data.sort(); //alphabetize
      //data.unshift(""); //push blank option to top of list
      setTeamNames(data);
      console.log("team data:", data);
    }
    catch (error) {
      console.error('pullTeamData: Error fetching data:', error);
    }
  };

  const isRaceOver = (currRace) => {
    //count how many lanes are in use, by analyzing team1, team2, team3, and team4
    let lanesInUse = 0;
    if (team1) lanesInUse++;
    if (team2) lanesInUse++;
    if (team3) lanesInUse++;
    if (team4) lanesInUse++;

    //check if all lanes in use have reported a time
    //if (lanesInUse == ){}
    //if currentRaceData has 4 rows, clear the currentRaceData

    if (currentRaceData) { //if currentRaceData is not null
      if ((currentRaceData.shape[0] > 3) || currentRaceData.shape[0] == lanesInUse) {
        stopTimer();
      }
    }
  }

  useEffect(() => {
    if (currentRaceData) { //This triggers isRaceOver when currentRaceData is updated
      isRaceOver(currentRaceData);
      setLane1Position(getFinishPosition(lane1Time));
      setLane2Position(getFinishPosition(lane2Time));
      setLane3Position(getFinishPosition(lane3Time));
      setLane4Position(getFinishPosition(lane4Time));
    } else { // Clear the plot_div element when currentRaceData is null
      const plotDiv = document.getElementById('plot_div');
      if (plotDiv) {
        plotDiv.innerHTML = '';
      }
    }
  }, [currentRaceData, lane1Time, lane2Time, lane3Time, lane4Time]);

  const updateLaneData = (data) => {
    switch (data.lane) {
      case 1:
        setLane1Time(data.time);
        setLane1Speed(data.speed);
        break;
      case 2:
        setLane2Time(data.time);
        setLane2Speed(data.speed);
        break;
      case 3:
        setLane3Time(data.time);
        setLane3Speed(data.speed);
        break;
      case 4:
        setLane4Time(data.time);
        setLane4Speed(data.speed);
        break;
      default:
        console.error(`Invalid lane number: ${data.lane}`);
    }
  };

  const processData = (data) => {
    if (data.command === "START") { //if data is a command, start the timer
      startTimer();
      return;
    } else if (data.command === "FINISHED") {
      return; //ignore this command
    } else if (data.command === "RESET") {
      newRace(racingData);
      return;
    } else { //if data is race data, process it into a dataframe
      // Correlate the incoming data with proper lane and team
      const teams = [team1, team2, team3, team4];
      const teams2 = [document.getElementById("dropdown1").value, document.getElementById("dropdown2").value, document.getElementById("dropdown3").value, document.getElementById("dropdown4").value] //Get team names if state fails to update
      const team = teams2[data.lane - 1] || "";
      data["team"] = team //append team name to incoming data

      //const columnNames = ["race", "lane", "time", "speed"];
      if (!racingData) { //if no dataframe exists, create one.
        let df = new pd.DataFrame([data]);
        setCurrentRace(df); //state update to trigger re-render
        racingData = df;

        //update speed and time displays for each lane
        updateLaneData(data);

        //save all race data to a CSV file
        saveCSV(racingData);
      } else { //append data to existing dataframe
        //if lane has already reported data, ignore incoming data
        let laneData = racingData.loc({
          rows: racingData["lane"].eq(data.lane).and(racingData["race"].eq(data.race)) //if both lane and race match an existing entry, ignore the incoming data
        });
        if (laneData.shape[0] > 0) {
          console.log("Lane", data.lane, "has already reported data. Ignoring incoming data.");
          return;
        }
        let df = new pd.DataFrame([data]); //add incoming data to a new dataframe
        racingData = pd.concat({ dfList: [racingData, df], axis: 0 }); //combine incoming data with existing data

        //segment racingData to only include the current race
        let currentRace = data.race //get currentRace number
        let currentRaceData = racingData.loc({ rows: racingData["race"].eq(currentRace) });
        currentRaceData = currentRaceData.sortValues("time", { ascending: true }); //ensure finish times are sorted properly

        setCurrentRace(currentRaceData); //state update to trigger re-render

        //update speed and time displays for each lane
        updateLaneData(data);

        //save all race data to a CSV file
        saveCSV(racingData);
      }
      //console.log("racingData:");
      //racingData.print();
    }
  }

  const getSimulatedData = async () => {
    try {
      const response = await fetch('/api/simulateSerialData');
      const data = await response.json();
      processData(data);
    } catch (error) {
      console.error('getSimulatedData: Error fetching data:', error);
    }
  };

  const getFinishPosition = (laneTime) => {
    if (!currentRaceData) return null;
    const times = currentRaceData["time"].values.slice(); // Create a copy of the times array
    times.sort((a, b) => a - b); // Sort the times in ascending order

    let position = 1;
    let positions = {};

    //The position variable is updated only when the current time is different from the previous time, ensuring that ties receive the same position.
    for (let i = 0; i < times.length; i++) {
      if (i > 0 && times[i] !== times[i - 1]) {
        position = i + 1;
      }
      positions[times[i]] = position;
    }

    return positions[laneTime];
  };

  const swapLeaderboard = () => {
    setShowLeaders(!showLeaders);
  }

  const changePracticeMode = () => {
    setPracticeMode(!practiceMode);
  }

  useEffect(() => { //Use Server Side Events to listen for serial data
    const eventSource = new EventSource('/api/serial-events');

    eventSource.onmessage = (event) => {
      console.log('Received raw serial data:', event.data);
      let data = event.data;

      //Reformat incoming data when necessary
      if (data == "START" || data == "FINISHED" || data == "RESET") {
        data = { "command": data }; //These commands are sent from the teensy as a string. Convert to JSON object.
      } else if (data.includes(":")) {
        data = JSON.parse(data) //These commands are sent in this format {"race":1,"lane":2,"time":3,"speed":4}. Convert to JSON object.
      } else {
        console.log("Invalid data format:", data); //if its in neither format ignore the data.
        console.log("Ignoring data...")
        return;
      }

      //console.log('Parsed data:', data);
      //console.log("data", data, "typeof", typeof data);

      processData(data);

      /*if (data == "Connected to server") { //ignore initial connection message
        console.log("ignoring command:", data);
      } else {
        //processData(data);
      }*/
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // EventSource will automatically try to reconnect
    };

    return () => {
      eventSource.close(); // Clean up on component unmount
    };
  }, []);

  const handleFindSerialPorts = async () => {
    try {
      const response = await fetch('/api/findSerialPorts');
    } catch (error) {
      console.error('Error fetching serial data:', error);
    }
  }

  const resetData = async () => { //Starts a blank csv file for new races. raceData#.csv is incremented by 1 to save the previous race data.
    try {
      const response = await fetch('/api/reset');
      const result = await response.json();
      result.message ? console.log(result.message) : console.log("Error resetting data");

      racingData = null;
      setCurrentRace(null);
      setPrevRace(null);
      setLeaderboard(null);
      setCrawlClub(null);

      setLane1Position(null);
      setLane2Position(null);
      setLane3Position(null);
      setLane4Position(null);
      setLane1Speed(null);
      setLane2Speed(null);
      setLane3Speed(null);
      setLane4Speed(null);
      setLane1Time(null);
      setLane2Time(null);
      setLane3Time(null);
      setLane4Time(null);
      setTeam1(null);
      setTeam2(null);
      setTeam3(null);
      setTeam4(null);
      //updateLeaderboards(); //update prevRaceData, leaderboardData, crawlClub
      resetTimer();
    } catch (error) {
      console.error('resetData failed with error:', error);
    }
  };

  const loadData = async () => {
    try {
      const response = await fetch('/api/load');
      const result = await response.json();
      const data = result.raceData;
      console.log("loaded data:", data, "typeof data", typeof data);

      //finding headers
      let dataLines = data.split('\n');
      let headers = dataLines[0]
      headers = headers.split(",");

      //finding data
      dataLines.shift(); // Removes the first element of the array (the headers)
      let csvData = dataLines
      csvData = csvData.map(row => row.split(","));

      //parse csv data into correct data types
      let parsedCSVData = csvData.map(innerArray => [
        parseFloat(innerArray[0]), //race
        parseFloat(innerArray[1]), //lane
        parseFloat(innerArray[2]), //time
        parseFloat(innerArray[3]), //speed
        innerArray[4] //team
      ]);

      //convert parsedCSVData into DataFrame...
      let df = new pd.DataFrame(parsedCSVData, { columns: headers });

      //console.log("headers:", headers, "typeof headers", typeof headers);
      console.log("parsedCSVData:", parsedCSVData, "typeof parsedCSVData", typeof parsedCSVData);
      //console.log("csvData:", csvData, "typeof csvData", typeof csvData);
      //df.print();

      if (csvData.length < 2) { //if CSV contains less than 2 rows, set racingData and leaderboards to null
        racingData = null;
        setCurrentRace(null);
        setPrevRace(null);
        setLeaderboard(null);
        setCrawlClub(null);
      } else {
        racingData = df;
        updateLeaderboards(); //update prevRaceData, leaderboardData, crawlClub
      }

      setLane1Position(null);
      setLane2Position(null);
      setLane3Position(null);
      setLane4Position(null);
      setLane1Speed(null);
      setLane2Speed(null);
      setLane3Speed(null);
      setLane4Speed(null);
      setLane1Time(null);
      setLane2Time(null);
      setLane3Time(null);
      setLane4Time(null);
      setTeam1(null);
      setTeam2(null);
      setTeam3(null);
      setTeam4(null);

      pullTeamData(); //pull team names from Google Sheets as operator may forget.
      resetTimer();
    } catch (error) {
      console.error('loadData failed with error:', error);
    }
  };

  return (
    <>
      <Head>
        <title>think[box] Derby</title>
        <meta name="description" content="Interface by: Joseph Minnich" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div>
          <div id="controls">
            <button onClick={pullTeamData}>Pull Car Names</button>
            <label>
              <input type="checkbox" onClick={changePracticeMode} id="practiceMode" />
              Practice Mode
            </label>
          </div>

          <br />
          <div id="header">
            <img src="/thinkbox_derby_logo.png" alt="Think[box] Derby" id="derby_logo"></img>
            <Timer ref={timerRef} />
            <div id="right">
              <h6>Register</h6>
              <img src="/car_registration_qr.jpg" alt="Registration QR Code" id="qr"></img>
            </div>
          </div>

          <br />
          <div className="separator"></div>
          <br />

          <div className="lanes-container">
            <Lane
              laneNumber={1}
              finishPosition={lane1Position}
              time={lane1Time}
              speed={lane1Speed}
              team={team1}
              teamNames={teamNames}
              dropdownDisabled={dropdownDisabled}
              onTeamChange={setTeam1}
              practiceMode={practiceMode}
            />
            <Lane
              laneNumber={2}
              finishPosition={lane2Position}
              time={lane2Time}
              speed={lane2Speed}
              team={team2}
              teamNames={teamNames}
              dropdownDisabled={dropdownDisabled}
              onTeamChange={setTeam2}
              practiceMode={practiceMode}
            />
            <Lane
              laneNumber={3}
              finishPosition={lane3Position}
              time={lane3Time}
              speed={lane3Speed}
              team={team3}
              teamNames={teamNames}
              dropdownDisabled={dropdownDisabled}
              onTeamChange={setTeam3}
              practiceMode={practiceMode}
            />
            <Lane
              laneNumber={4}
              finishPosition={lane4Position}
              time={lane4Time}
              speed={lane4Speed}
              team={team4}
              teamNames={teamNames}
              dropdownDisabled={dropdownDisabled}
              onTeamChange={setTeam4}
              practiceMode={practiceMode}
            />
          </div>
          <br />
        </div>

        <div className="separator"></div>

        <div id="results-bottom">
          <div id="prevRaceResults">
            <h1>Previous Race Results</h1>

            {prevRaceData && (
              <div>
                <div className="ranking">
                  <h5 style={{ textAlign: "center" }}>Rank</h5>
                  <h5>Team</h5>
                  <h5 style={{ textAlign: "center" }}>Time</h5>
                  <h5 style={{ textAlign: "center" }}>Speed</h5>
                </div>
                <div className="rankings">
                  {prevRaceData.shape[0] > 0 && (
                    <div className="ranking">
                      <div className="rank"><h4>1</h4></div>
                      <h2 className="teamName">{prevRaceData.at(0, "team")}</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(0, "time")} s</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(0, "speed")} mph</h2>
                    </div>)}
                  {prevRaceData.shape[0] > 1 && (
                    <div className="ranking">
                      <div className="rank"><h4>2</h4></div>
                      <h2 className="teamName">{prevRaceData.at(1, "team")}</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(1, "time")} s</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(1, "speed")} mph</h2>
                    </div>)}
                  {prevRaceData.shape[0] > 2 && (
                    <div className="ranking">
                      <div className="rank"><h4>3</h4></div>
                      <h2 className="teamName">{prevRaceData.at(2, "team")}</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(2, "time")} s</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(2, "speed")} mph</h2>
                    </div>)}
                  {prevRaceData.shape[0] > 3 ? (
                    <div className="ranking">
                      <div className="rank"><h4>4</h4></div>
                      <h2 className="teamName">{prevRaceData.at(3, "team")}</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(3, "time")} s</h2>
                      <h2 style={{ textAlign: "center" }}>{prevRaceData.at(3, "speed")} mph</h2>
                    </div>) : ( //If there are less than 4 entries, display blank entry to maintain formatting
                    <div className="ranking">
                      <div className="rank"><h4></h4></div>
                      <h2></h2>
                      <h2 style={{ textAlign: "center" }}></h2>
                      <h2 style={{ textAlign: "center" }}></h2>
                    </div>
                  )}
                </div>
              </div>)}
          </div>

          <div className="vertical-separator"></div>

          <div id="leaderboard">
            <button onClick={swapLeaderboard}>
              <svg xmlns="http://www.w3.org/2000/svg" width="2vw" height="2vw" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
              </svg>
            </button>

            <div className="leaders" style={{ display: showLeaders ? 'block' : 'none' }}>
              <h1 className="leaders">Leaderboard</h1>

              {leaderboardData && (
                <div>
                  <div className="ranking">
                    <h5 style={{ textAlign: "center" }}>Rank</h5>
                    <h5>Team</h5>
                    <h5 style={{ textAlign: "center" }}>Time</h5>
                    <h5 style={{ textAlign: "center" }}>Speed</h5>
                  </div>
                  <div className="rankings">
                    {leaderboardData.shape[0] > 0 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/1st_place.svg" className="firstPlace"></object></div>
                        <h2 className="teamName">{leaderboardData.at(0, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(0, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(0, "speed")} mph</h2>
                      </div>)}
                    {leaderboardData.shape[0] > 1 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/2nd_place.svg" className="secondPlace"></object></div>
                        <h2 className="teamName">{leaderboardData.at(1, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(1, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(1, "speed")} mph</h2>
                      </div>)}
                    {leaderboardData.shape[0] > 2 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/3rd_place.svg" className="thirdPlace"></object></div>
                        <h2 className="teamName">{leaderboardData.at(2, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(2, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(2, "speed")} mph</h2>
                      </div>)}
                    {leaderboardData.shape[0] > 3 && (
                      <div className="ranking">
                        <div className="rank"><h4>4</h4></div>
                        <h2 className="teamName">{leaderboardData.at(3, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(3, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(3, "speed")} mph</h2>
                      </div>)}
                    {leaderboardData.shape[0] > 4 && (
                      <div className="ranking">
                        <div className="rank"><h4>5</h4></div>
                        <h2 className="teamName">{leaderboardData.at(4, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(4, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{leaderboardData.at(4, "speed")} mph</h2>
                      </div>)}
                  </div>
                </div>)}
            </div>

            <div className="crawlers" style={{ display: showLeaders ? 'none' : 'block' }}>
              <h1>The Crawl Club</h1>

              {crawlClub && (
                <div>
                  <div className="ranking">
                    <h5 style={{ textAlign: "center" }}>Rank</h5>
                    <h5>Team</h5>
                    <h5 style={{ textAlign: "center" }}>Time</h5>
                    <h5 style={{ textAlign: "center" }}>Speed</h5>
                  </div>
                  <div className="rankings">
                    {crawlClub.shape[0] > 0 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/turtle-king.svg" className="firstPlace"></object></div>
                        <h2 className="teamName">{crawlClub.at(0, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(0, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(0, "speed")} mph</h2>
                      </div>)}
                    {crawlClub.shape[0] > 1 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/turtle.svg" className="secondPlace"></object></div>
                        <h2 className="teamName">{crawlClub.at(1, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(1, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(1, "speed")} mph</h2>
                      </div>)}
                    {crawlClub.shape[0] > 2 && (
                      <div className="ranking">
                        <div className="rank"><object type="image/svg+xml" data="/turtle.svg" className="thirdPlace"></object></div>
                        <h2 className="teamName">{crawlClub.at(2, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(2, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(2, "speed")} mph</h2>
                      </div>)}
                    {crawlClub.shape[0] > 3 && (
                      <div className="ranking">
                        <div className="rank"><h4>4</h4></div>
                        <h2 className="teamName">{crawlClub.at(3, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(3, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(3, "speed")} mph</h2>
                      </div>)}
                    {crawlClub.shape[0] > 4 && (
                      <div className="ranking">
                        <div className="rank"><h4>5</h4></div>
                        <h2 className="teamName">{crawlClub.at(4, "team")}</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(4, "time")} s</h2>
                        <h2 style={{ textAlign: "center" }}>{crawlClub.at(4, "speed")} mph</h2>
                      </div>)}
                  </div>
                </div>)}
            </div>
          </div>
        </div>

        <br />

        <details>
          <summary>Debug</summary>

          <button onClick={handleFindSerialPorts}>Find Serial Ports</button>
          <button onClick={() => newRace(racingData)}>New Race / Reset</button>
          <button onClick={loadData}>Load Race Data</button>
          <button onClick={resetData}>Clear All Race Data</button>
          <br />
          <button onClick={startTimer}>Start Timer</button>
          <button onClick={stopTimer}>Stop Timer</button>
          <button onClick={resetTimer}>Reset Timer</button>
          <br />
          <button onClick={getSimulatedData}>Simulate Serial Data</button>
          <button onClick={() => setDropdownDisabled(!dropdownDisabled)}>Toggle Dropdown Locking</button>
          <br />

          <h1>All race data</h1>
          <div id="all_race_data_plot"></div>
          {racingData ? (
            <p>{racingData.plot("all_race_data_plot").table()}</p>
          ) : (
            <p>No data to display</p>
          )
          }

          <h1>Current race data</h1>
          <div id="plot_div"></div>
          {currentRaceData ? (
            <p>{currentRaceData.plot("plot_div").table()}</p>
          ) : (
            <p>No data to display</p>
          )
          }

          <h1>Previous race data</h1>
          <div id="prev_race_plot"></div>
          {prevRaceData ? (
            <p>{prevRaceData.plot("prev_race_plot").table()}</p>
          ) : (
            <p>No data to display</p>
          )
          }

          <h1>Leaderboard</h1>
          <div id="leaderboard_plot"></div>
          {leaderboardData ? (
            <p>{leaderboardData.plot("leaderboard_plot").table()}</p>
          ) : (
            <p>No data to display</p>
          )
          }
        </details>
      </main >
    </>
  )
}