import { io } from 'socket.io-client';

const socket = io(process.env.VUE_APP_BACKEND);

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
