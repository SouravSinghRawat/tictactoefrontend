import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8080/ws-game';

class WebSocketService {
    constructor() {
        this.client = null;
    }

    connect(gameId, onMessageReceived) {
        const socket = new SockJS(SOCKET_URL);
        this.client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                // We subscribe to the specific gameId "room"
                this.client.subscribe(`/topic/game/${gameId}`, (message) => {
                    onMessageReceived(JSON.parse(message.body));
                });
            },
        });
        this.client.activate();
    }

    sendMove(gameId, player, cellId) {
        // Sends a move message to the backend
        this.client.publish({
            destination: '/app/game.move',
            body: JSON.stringify({ gameId, sender: player, cellId, type: 'MOVE' })
        });
    }
}

const wsService = new WebSocketService();
export default wsService;