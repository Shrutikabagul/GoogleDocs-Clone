import express from 'express';
import http from 'http';

import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Connection from './database/db.js';
import { getDocument, updateDocument } from './controller/document-controller.js';

const PORT = process.env.PORT || 9000;
const app = express();

// Allow CORS from your client URL
app.use(cors({
    origin: 'https://googledocs-clone-zljk.onrender.com',
    methods: ['GET', 'POST'],
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'https://googledocs-clone-zljk.onrender.com',
        methods: ['GET', 'POST'],
    },
});

Connection();

io.on('connection', socket => {
    console.log('New client connected');

    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
