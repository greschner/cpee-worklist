import { io } from 'socket.io-client';

const socket = io('https://greschner.azurewebsites.net/backend/', { transports: ['websocket'] });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
