import React from 'react';

import onlineIcon from '../../icons/onlineIcon.png';
// import closeIcon from '../../icons/closeIcon.png';

import './InfoBar.css';

const InfoBar = ({ room }) => (
  <div className="infoBar">
    <div className="leftInnerContainer">
      <img className="onlineIcon" src={onlineIcon} alt="online icon" />
      <h3>{room.toUpperCase()}</h3>
    </div>
    <div className="rightInnerContainer">
      <a href="/">
        <button className="leaveButton">Leave</button>
      </a>
    </div>

  </div>
);

export default InfoBar;