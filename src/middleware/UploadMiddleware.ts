import { NextFunction, Request, Response } from "express";
import { StorageManager } from "../StorageManager";
import { APIError, APIResponseCodes, generateId } from "@twit2/std-library";
import { StoreUploader } from "../types/StoreUploader";
import multer from "multer";
import { DataStore } from "../types/DataStore";
import path from 'path';
import { FileProcessor } from "../FileProcessor";

const uploaders : StoreUploader[] = [];

function createMulterStorageHandler() {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const ds = (req as any).store as DataStore;
                
                FileProcessor.assertFile(ds.name, {
                    mimetype: file.mimetype,
                    size: file.size
                });

                cb(null, StorageManager.tempPath())

            } catch(e) {
                cb(e as Error, '');
            }
        },
        filename: (req, file, cb) => {
            const targetId = generateId({
                procId: process.ppid,
                workerId: process.pid
            });

            const tempPath = StorageManager.createTempFileName(targetId, file.mimetype);

            (file as any).uploadState = {
                targetId,
                mimetype: file.mimetype
            }
            cb(null, path.basename(tempPath));
        }
    });
}

/**
 * Upload middleware handler.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handle(req: Request, res: Response, next: NextFunction) {
    const storeName = req.params.store;
    const storeObj = StorageManager.getStore(storeName);

    if(!storeObj)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND, 404);

    // Create uploader if it doesn't exist
    let ulObject : StoreUploader | undefined = uploaders.find(x => x.storeName == storeName);

    if(!ulObject) {
        ulObject = {
            storeName,
            uploader: multer({
                limits: {
                    fileSize: storeObj.limits.maxUploadSize ?? StorageManager.DEFAULT_UL_SIZE,
                    files: storeObj.limits.maxUploadItems,
                },
                storage: createMulterStorageHandler()
            })
        }

        uploaders.push(ulObject);
    }

    // Assign store object
    let rawReq = req as any;
    rawReq.store = storeObj;
    return ulObject.uploader.array('files', storeObj.limits.maxUploadItems)(req, res, next);
}

export const UploadMiddleware = {
    handle
}