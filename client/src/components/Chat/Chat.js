import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

import './Chat.css';

import TextContainer from '../TextContainer/TextContainer';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import DrawingBoard from '../DrawingBoard/DrawingBoard'; // Import the DrawingBoard component

let socket;

const Chat = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const ENDPOINT = 'localhost:5000';

    const location = useLocation();

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        socket = io(ENDPOINT, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        setRoom(room);
        setName(name);

        socket.emit('join', { name, room }, () => {});

        return () => {
            socket.emit('disconnect');
            socket.off();
        };
    }, [ENDPOINT, location]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        });

        return () => {
            socket.off('message');
            socket.off('roomData');
        };
    }, []);

    const sendMessage = (event) => {
        event.preventDefault();

        if (message) {
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    };

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <div className="drawing-container-wrapper">
                <DrawingBoard socket={socket} room={room} />
            </div>
            <div className="sideContainer">
                <TextContainer users={users} />
            </div>
        </div>
    );
};

export default Chat;
