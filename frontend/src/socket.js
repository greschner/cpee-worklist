import { io } from 'socket.io-client';

const socket = io('https://greschner.azurewebsites.net', { path: '/backend/socket.io/', transports: ['websocket'] });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
