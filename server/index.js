import express from 'express';
import session from 'express-session';
import BetterSqlite3Store from 'better-sqlite3-session-store';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { db, closeDb } from '../db/index.js';
import { migrate } from '../db/migrate.js';
import { validateSchema } from '../db/validateSchema.js';

// Run migrations and validate schema
migrate();
validateSchema();

// Route imports
import autonomousHandler from '../api/autonomous.js';
import compressMemoryHandler from '../api/compress-memory.js';
import contextRecapHandler from '../api/context-recap.js';
import createSubpersonaHandler from '../api/create-subpersona.js';
import feedbackHandler from '../api/feedback.js';
import gaugeHandler from '../api/gauge.js';
import parseQueryHandler from '../api/parse-query.js';
import summarizeLogsHandler from '../api/summarize-logs.js';
import taskHandler from '../api/task.js';
import testWriteHandler from '../api/test-write.js';

dotenv.config({ path: '.env.local' });

const app = express();
const SQLiteStore = BetterSqlite3Store(session);

app.use(cors({
    origin: 'http://localhost:3000', // Adjust if your frontend is on a different port
    credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
    store: new SQLiteStore({
        client: db,
        table: 'sessions'
    }),
    secret: 'a-secret-key-for-sessions', // Should be in env vars
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// Middleware to ensure user_id and chatroom_id are in the session
app.use((req, res, next) => {
    if (!req.session.user_id) {
        req.session.user_id = uuidv4();
    }
    if (!req.session.chatroom_id) {
        req.session.chatroom_id = uuidv4();
    }
    console.log('Session data:', req.session);
    next();
});

// API routes
app.post('/api/autonomous', autonomousHandler);
app.post('/api/compress-memory', compressMemoryHandler);
app.post('/api/context-recap', contextRecapHandler);
app.post('/api/create-subpersona', createSubpersonaHandler);
app.all('/api/feedback', feedbackHandler);
app.get('/api/gauge', gaugeHandler);
app.post('/api/parse-query', parseQueryHandler);
app.post('/api/summarize-logs', summarizeLogsHandler);
app.all('/api/task', taskHandler);
testWriteHandler(app);


// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

if (import.meta.url.startsWith('file://') && process.argv[1].endsWith('server/index.js')) {
    app.listen(PORT, HOST, () => {
        console.log(`Server listening on http://${HOST}:${PORT}`);
    });
}

for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
        console.log(`Received ${sig}, shutting down...`);
        closeDb();
        process.exit(0);
    });
}
process.on('uncaughtException', (e) => {
    console.error('Uncaught exception:', e);
    closeDb();
    process.exit(1);
});
process.on('unhandledRejection', (e) => {
    console.error('Unhandled rejection:', e);
    closeDb();
    process.exit(1);
});
