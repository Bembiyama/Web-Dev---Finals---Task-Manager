const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let tasks = [];

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send(JSON.stringify({ type: 'init', tasks }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'add') {
            const { name, task } = data;
            tasks.push({ name, task });
            broadcast({ type: 'add', name, task });
            scheduleTaskExpiration(task);
        } else if (data.type === 'complete') {
            const taskIndex = tasks.findIndex(entry => entry.task.id === data.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].task.completed = true;
                broadcast({ type: 'complete', id: data.id });
            }
        } else if (data.type === 'delete') {
            tasks = tasks.filter(entry => entry.task.id !== data.id);
            broadcast({ type: 'delete', id: data.id });
        } else if (data.type === 'expire') {
            tasks = tasks.filter(entry => entry.task.id !== data.id);
            broadcast({ type: 'expire', id: data.id });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function scheduleTaskExpiration(task) {
    const now = Date.now();
    if (task.deadline <= now) {
        broadcast({ type: 'expire', id: task.id }); 
    } else {
        setTimeout(() => {
            tasks = tasks.filter(entry => entry.task.id !== task.id);
            broadcast({ type: 'expire', id: task.id });
        }, task.deadline - now);
    }
}

console.log('WebSocket server running on ws://localhost:8080');
