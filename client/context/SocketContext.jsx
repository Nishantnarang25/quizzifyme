// context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(
      import.meta.env.MODE === 'development'
        ? 'http://localhost:3000'
        : import.meta.env.VITE_SERVER_URL
    );

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
