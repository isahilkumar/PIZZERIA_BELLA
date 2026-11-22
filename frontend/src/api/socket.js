import { io } from 'socket.io-client';

const rawUrl = import.meta.env.VITE_API_URL;
const socketUrl = rawUrl
  ? rawUrl.startsWith('http')
    ? rawUrl.replace(/\/+$/, '')
    : `https://${rawUrl.replace(/\/+$/, '')}`
  : '/';

const socket = io(socketUrl, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export default socket;

