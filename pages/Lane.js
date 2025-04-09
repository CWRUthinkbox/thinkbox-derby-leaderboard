import React from 'react';
import { useState, useEffect } from 'react';

const Lane = ({ laneNumber, finishPosition, time, speed, team, teamNames, dropdownDisabled, onTeamChange, practiceMode }) => {
  const [isGrey, setIsGrey] = useState(false);

  // If race is started and no team is selected, grey out the lane
  useEffect(() => {
    if (dropdownDisabled && team === "" || dropdownDisabled && team === null) {
      setIsGrey(true);
    } else {
      setIsGrey(false);
    }
  }, [dropdownDisabled, team]);

  return (
    <div className={`Lane ${isGrey ? 'grey' : ''}`}>
      <h3>Lane {laneNumber}</h3>
      {!practiceMode && finishPosition === 1 ? (
        <object type="image/svg+xml" data="/1st_place.svg" className="firstPlace"></object>
      ) : !practiceMode && finishPosition === 2 ? (
        <object type="image/svg+xml" data="/2nd_place.svg" className="secondPlace"></object>
      ) : !practiceMode && finishPosition === 3 ? (
        <object type="image/svg+xml" data="/3rd_place.svg" className="thirdPlace"></object>
      ) : null}
      <select
        name={`dropdown${laneNumber}`}
        id={`dropdown${laneNumber}`}
        disabled={dropdownDisabled}
        value={team || ""}
        onChange={(e) => onTeamChange(e.target.value)}
      >
        <option value="">Select a car</option>
        {teamNames.map((team, index) => (
          <option key={index} value={team}>
            {team}
          </option>
        ))}
      </select>
      {time ? (
        <div className="finishTime" id={`lane${laneNumber}`}>{time} s</div>
      ) : (
        <div className="finishTime" id={`lane${laneNumber}`}>-</div>
      )}
      {speed ? (
        <div className="speed" id={`lane${laneNumber}`}>{speed} mph</div>
      ) : (
        <div className="speed" id={`lane${laneNumber}`}>-</div>
      )}
    </div>
  );
};

export default Lane;