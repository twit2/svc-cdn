import fs from 'fs';
import path from 'path';
import { DataStore } from './types/DataStore';
import Ajv from 'ajv';

const ajv = new Ajv();
const STORE_PATH = path.join(process.cwd(), "content", "stores")
const OBJECTS_PATH = path.join(process.cwd(), "content", "objects")

const storeObjectSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        limits: {
            type: "object",
            properties: {
                allowedTypes: { type: "array" },
                maxUploadSize: { type: "number", minimum: 1 }
            },
            required: ["allowedTypes"],
            additionalProperties: false
        }
    },
    required: ["name", "limits"],
    additionalProperties: false
};

/**
 * Loads the storage manager.
 */
async function init() {
    for(let p of [STORE_PATH, OBJECTS_PATH])
        if(!fs.existsSync(p))
            fs.mkdirSync(p);

    console.log("Loading stores...");

    for(let item of await fs.promises.readdir(STORE_PATH)) {
        const fullPath = path.join(STORE_PATH, item);
        const storeObject : DataStore = JSON.parse(await fs.promises.readFile(fullPath, { encoding: 'utf-8' }));
        
        // Validate store object schema
        if(!ajv.validate(storeObjectSchema, storeObject))
            throw new Error('Incomplete store object - schema validation failed.');

        console.log(`Loaded store definition "${storeObject.name}" from "${item}"`);
    }
}

export const StorageManager = {
    init
}