import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './App.css';

function App() {
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [isConnected, setIsConnected] = useState(false); // Track real connection status
  const stompClient = useRef(null);

  useEffect(() => {
    const socket = new SockJS("https://tictactoebackend-1-wl9g.onrender.com");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("SUCCESS: Connected to STOMP Broker");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("Disconnected from STOMP Broker");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker error: ' + frame.headers['message']);
        setIsConnected(false);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);

  const createGame = () => {
    // SAFETY CHECK: The "Underlying STOMP connection" fix
    if (!stompClient.current || !stompClient.current.connected) {
      alert("Please wait for the server to connect (🟢 status)");
      return;
    }

    const tempTopic = `/topic/game/create/${player}`;

    stompClient.current.subscribe(tempTopic, (msg) => {
      const newGame = JSON.parse(msg.body);
      setGame(newGame);
      // Now listen to the specific game room
      stompClient.current.subscribe(`/topic/game/${newGame.gameId}`, (m) => setGame(JSON.parse(m.body)));
    });

    stompClient.current.publish({
      destination: '/app/game.create',
      body: player
    });
  };

  const joinGame = () => {
    if (!stompClient.current || !stompClient.current.connected) return;

    stompClient.current.subscribe(`/topic/game/${roomInput}`, (msg) => {
      setGame(JSON.parse(msg.body));
    });

    stompClient.current.publish({
      destination: '/app/game.join',
      body: JSON.stringify({ gameId: roomInput, sender: player })
    });
  };

  const makeMove = (index) => {
    if (!game || game.currentStatus === 'FINISHED') return;

    stompClient.current.publish({
      destination: '/app/game.move',
      body: JSON.stringify({
        gameId: game.gameId,
        sender: player,
        cellId: index
      })
    });
  };

  return (
    <div className="App">
      {!game ? (
        <div className="login">
          <h1>Tic-Tac-Toe</h1>
          {/* Visual Status Indicator */}
          <div style={{ color: isConnected ? '#4caf50' : '#f44336', marginBottom: '10px' }}>
            {isConnected ? "🟢 Server Connected" : "🔴 Connecting to Server..."}
          </div>

          <input
            placeholder="Your Name"
            value={player}
            onChange={e => setPlayer(e.target.value)}
          />
          <br />
          <button onClick={createGame} disabled={!isConnected}>Create Room</button>
          <hr />
          <input
            placeholder="Room Code"
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
          />
          <button onClick={joinGame} disabled={!isConnected}>Join Room</button>
        </div>
      ) : (
        <div className="game-screen">
          <h2>Room: {game.gameId}</h2>
          <h3>Current Turn: {game.currentTurn}</h3>
          <div className="board">
            {game.board.map((val, i) => (
              <div key={i} className="cell" onClick={() => makeMove(i)}>
                {val === 'EMPTY' ? '' : val}
              </div>
            ))}
          </div>
          {game.currentStatus === 'FINISHED' && (
            <div className="winner">
              <h1>Winner: {game.winner}</h1>
              <button onClick={() => window.location.reload()}>New Game</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;