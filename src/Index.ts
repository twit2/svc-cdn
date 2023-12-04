import { configDotenv } from 'dotenv';
import express from 'express';
import { ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { StorageManager } from './StorageManager';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT ?? 3400;

app.use(express.json());

// Use session verifier
app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------

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