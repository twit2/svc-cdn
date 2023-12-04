import { StorageManager } from "./StorageManager";
import path from 'path';
import fs from 'fs';
import { DataStore } from "./types/DataStore";
import { generateId } from "@twit2/std-library";

describe('storage manager tests', ()=>{
    const BASE_PATH = path.join(process.cwd(), "temp/__test_BASE__");
    const TEMP_PATH = path.join(process.cwd(), "temp/__test_TEMP__");
    const OBJECTS_PATH = path.join(BASE_PATH, "content", "objects");
    const STORES_PATH = path.join(BASE_PATH, "content", "stores");

    beforeAll(async() => {
        await StorageManager.init(BASE_PATH, TEMP_PATH);
    });

    test('parse valid data store', async ()=>{
        const store : DataStore = {
            name: "attachments",
            limits: {
                maxUploadSize: 12345,
                allowedTypes: [],
                maxUploadItems: 1
            }
        };

        await StorageManager.parseStore(JSON.stringify(store));
    });

    test('reject data store without name', async () => {
        const store = {
            limits: {
                maxUploadSize: 12345,
                allowedTypes: []
            }
        };

        try {
            await StorageManager.parseStore(JSON.stringify(store));
        } catch(e) {
            return;
        }

        throw new Error('Data store was parsed!');
    });

    test('reject data store without limits', async () => {
        const store = {
            name: "attachments"
        };

        try {
            await StorageManager.parseStore(JSON.stringify(store));
        } catch(e) {
            return;
        }

        throw new Error('Data store was parsed!');
    });

    test('get object store', async ()=>{
        // Write some test stores.
        let testStore : DataStore = {
            name: "test",
            limits: {
                maxUploadItems: 1,
                allowedTypes: ["text/plain"]
            },
        };

        const testJson = JSON.stringify(testStore);

        const TEST_PATH = path.join(STORES_PATH, 'test.json');
        await fs.promises.writeFile(TEST_PATH, testJson, { encoding: 'utf-8' });
        const procStore = await StorageManager.addStore(TEST_PATH);

        expect(procStore).not.toBeUndefined();
        expect(JSON.stringify(procStore)).toBe(testJson);
    });

    test('create object name', ()=>{
        StorageManager.createObjectName('12345', 'image/png');
    });

    test('create object name with invalid mime should fail', ()=>{
        try {
            StorageManager.createObjectName('123456', 'fail mime');
        } catch(e) {
            return;
        }

        throw new Error('Object name was created.');
    });

    test('create temp file name', ()=>{
        const tempName = StorageManager.createTempFileName('12345', 'image/png');
        const genTempDir = tempName.substring(0, TEMP_PATH.length);
        expect(genTempDir).toBe(TEMP_PATH);
    });

    test('temp object should be placed properly', async()=>{
        const id = generateId({ procId: process.ppid, workerId: process.pid });
        const objectName = StorageManager.createObjectName(id, 'image/png');
        const tempPath = StorageManager.createTempFileName(id, 'image/png');
        await fs.promises.writeFile(tempPath, 'abc');
        await StorageManager.placeFile(tempPath, 'test');
        
        // Check if file was placed properly
        await fs.promises.access(path.join(OBJECTS_PATH, 'test', objectName), fs.constants.F_OK);
    });

    test('temp object should be deleted', async ()=> {
        const id = generateId({ procId: process.ppid, workerId: process.pid });
        const objectName = StorageManager.createObjectName(id, 'image/png');
        const tempPath = StorageManager.createTempFileName(id, 'image/png');
        await fs.promises.writeFile(tempPath, 'abc');
        await StorageManager.deleteTempFile(tempPath);
        
        // Check if file was placed properly
        try {
            await fs.promises.access(tempPath, fs.constants.F_OK);
        } catch(e) {
            return;
        }

        throw new Error("File was not deleted.");
    });
});