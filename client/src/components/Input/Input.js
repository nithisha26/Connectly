import React from 'react';
import InputEmoji from 'react-input-emoji'; // Import the InputEmoji component
import './Input.css';

const Input = ({ message, setMessage, sendMessage }) =>  (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      {/* Emoji-enabled input field */}
      <InputEmoji
        value={message} // Bind the message state
        onChange={setMessage} // Directly update the message state as the user types or adds an emoji
        cleanOnEnter={false} // Prevent clearing the input automatically
        onKeyDown={event => {
          if (event.key === 'Enter') {
            sendMessage(event);
          }
        }}
        placeholder="Type a message..."
      />
      {/* Send button */}
      <button className="sendButton" onClick={e => sendMessage(e)}>Send</button>
    </form>
  );

export default Input;
