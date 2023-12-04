import path from "path";
import fs from "fs";
import { StorageManager } from "./StorageManager";
import { DataStore } from "./types/DataStore";
import { FileProcessor } from "./FileProcessor";
import { generateId } from "@twit2/std-library";

describe('file processor tests', ()=>{
    const BASE_PATH = path.join(process.cwd(), "temp/__test_BASE__");
    const TEMP_PATH = path.join(process.cwd(), "temp/__test_TEMP__");
    const STORES_PATH = path.join(BASE_PATH, "content", "stores");

    beforeAll(async() => {
        // Write test data store
        const store : DataStore = {
            name: 'test',
            limits: {
                allowedTypes: ["image/png"],
                maxUploadSize: 1024,
                maxUploadItems: 2
            },
            processors: []
        };

        await fs.promises.mkdir(STORES_PATH, { recursive: true });
        await fs.promises.writeFile(path.join(STORES_PATH, 'test.json'), JSON.stringify(store), { encoding: 'utf-8' });
        await StorageManager.init(BASE_PATH, TEMP_PATH);
    });

    test('assertFile should reject invalid data store', ()=>{
        try {
            FileProcessor.assertFile('test2', {
                mimetype: 'image/png',
                size: 0
            });
        } catch(e) {
            return;
        }

        throw new Error("assertfile didn't error");
    });

    test('assertFile should reject file larger than max upload size', ()=>{
        try {
            FileProcessor.assertFile('test2', {
                mimetype: 'image/png',
                size: 1025
            });
        } catch(e) {
            return;
        }

        throw new Error("assertfile didn't error");
    });

    test('assertFile should reject file that does not match the mimes', ()=>{
        try {
            FileProcessor.assertFile('test2', {
                mimetype: 'image/jpeg',
                size: 10
            });
        } catch(e) {
            return;
        }

        throw new Error("assertfile didn't error");
    });

    test('process should process single file correctly', async()=>{
        const ds = StorageManager.getStore('test') as DataStore;
        expect(ds).not.toBeUndefined();

        const tempId = generateId({ procId: process.ppid, workerId: process.pid });
        const objName = StorageManager.createObjectName(tempId, 'image/png');
        await fs.promises.writeFile(path.join(TEMP_PATH, objName), 'test');

        const result = await FileProcessor.process(ds, { targetId: tempId, mimetype: 'image/png' });
        expect(result.id).toBe(tempId);
        expect(result.name).toBe(objName);
        expect(result.store).toBe('test');
        expect(result.urlPart).toBe(`/test/${objName}`);
    });

    afterAll(async()=>{
        await fs.promises.rm(BASE_PATH, { recursive: true, force: true });
        await fs.promises.rm(TEMP_PATH, { recursive: true, force: true });
    });
});