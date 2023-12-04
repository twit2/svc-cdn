import { configDotenv } from 'dotenv';
import express from 'express';
import { ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { StorageManager } from './StorageManager';
import { handleGetObject } from './routes/GetObject';
import { handleUploadObject } from './routes/UploadObject';
import { UploadMiddleware } from './middleware/UploadMiddleware';
import bodyParser from 'body-parser';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT ?? 3400;

app.use(bodyParser.urlencoded({extended: true}));

app.get('/:store/:id', handleGetObject);

// Use session verifier
// TODO app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------
app.post('/:store', UploadMiddleware.handle, handleUploadObject);

app.use(ErrorHandlingMiddleware.handle);

/**
 * Main entry point for program.
 */
async function main() {
    await StorageManager.init();

    // Listen at the port
    app.listen(port, () => {
        console.log(`CDN service active at port ${port}`);
    });
}

main();