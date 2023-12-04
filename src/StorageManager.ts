import fs from 'fs';
import path from 'path';
import { DataStore } from './types/DataStore';
import Ajv from 'ajv';
import { APIError, APIResponseCodes } from '@twit2/std-library';
import { Mimetype } from './types/Mimetype';
let mimes : Mimetype[] = [];

const DEFAULT_UL_SIZE = 1024 * 1024; // 1 megabyte
const ajv = new Ajv();
const dataStores : DataStore[] = [];
let basePath : string;
let tempPath : string;
let storePath : string;
let objectsPath : string;

const storeObjectSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        processors: { type: "array" },
        limits: {
            type: "object",
            properties: {
                allowedTypes: { type: "array" },
                maxUploadSize: { type: "number", minimum: 1 },
                maxUploadItems: { type: "number", minimum: 1 }
            },
            required: ["allowedTypes"],
            additionalProperties: false
        }
    },
    required: ["name", "limits"],
    additionalProperties: false
};

const validateStoreObject = ajv.compile<DataStore>(storeObjectSchema);

/**
 * Parses a data store.
 * @param storeText The raw JSON of the store to parse.
 */
async function parseStore(storeText: string) {
    const storeObject : DataStore = JSON.parse(storeText);

    // Validate store object schema
    if(!validateStoreObject(storeObject)) {
        for(let e of (validateStoreObject.errors ?? []))
            console.error(`Parsing error: ${e.message}`);

        throw new Error('Validation failed.');
    }

    console.log(`Loaded store definition for '${storeObject.name}'.`);
    return storeObject;
}

/**
 * Adds a data store.
 * @param fn The path of the datastore to add.
 */
async function addStore(fn: string) {
    console.log(`Loading store from '${fn}'`);
    const storeObject : DataStore = await parseStore(await fs.promises.readFile(fn, { encoding: 'utf-8' }));
    let storeIdx = dataStores.push(storeObject) - 1;
    await fs.promises.mkdir(path.join(objectsPath, storeObject.name), { recursive: true });
    return dataStores[storeIdx];
}

/**
 * Gets a data store.
 * @param name The name of the data store to get.
 * @returns The data store.
 */
function getStore(name: string) {
    return dataStores.find(x => x.name == name);
}

/**
 * Loads the storage manager.
 */
async function init(inBasePath?: string, inTempPath?: string) {
    console.log("Loading mimetypes...");
    mimes = require('../data/mimes.json');

    basePath = inBasePath ?? process.cwd(); // Default to current working dir as base path
    tempPath = inTempPath ?? path.join(basePath, "content", "temp");
    storePath = path.join(basePath, "content", "stores");
    objectsPath = path.join(basePath, "content", "objects");

    for(let p of [tempPath, storePath, objectsPath])
        if(!fs.existsSync(p))
            fs.mkdirSync(p, { recursive: true });

    console.log("Loading stores...");

    for(let item of await fs.promises.readdir(storePath)) {
        const fullPath = path.join(storePath, item);
        await addStore(fullPath);
    }
}

/**
 * Creates a new object filename.
 * @param mimetype The mimetype of the file.
 */
function createObjectName(targetId: string, mimetype: string) {
    const mime = mimes.find(x => x.type == mimetype);

    if(!mime)
        throw new Error("Mimetype not found.");

    return `${targetId}${mime.extensions[0]}`;
}

/**
 * Creates a new temp file name.
 * @param mimetype The mimetype of the file.
 */
function createTempFileName(targetId: string, mimetype: string) {
    return path.join(tempPath, createObjectName(targetId, mimetype));
}

/**
 * Places the file in the specified data store.
 * @param fn The path of the file to place.
 * @param store The store to place the file in.
 */
async function placeObject(fn: string, store: string) {
    const ds = getStore(store);
    
    if(!ds)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND);

    const basename = path.basename(fn);
    await fs.promises.rename(fn, path.join(objectsPath, ds.name, basename));
}

/**
 * Deletes a temp file.
 * @param path The path of the temp file to delete.
 */
async function deleteTempFile(path: string) {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
        await fs.promises.rm(path);
    } catch(e) {
        // Don't care
    }
}

export const StorageManager = {
    DEFAULT_UL_SIZE,
    tempPath: ()=>tempPath,
    createObjectName,
    createTempFileName,
    deleteTempFile,
    init,
    addStore,
    getStore,
    parseStore,
    placeFile: placeObject
}