import { NextFunction, Request, Response } from "express";
import { FileProcessor } from "../FileProcessor";
import { WithUploadState } from "../types/UploadState";
import { WithDataStore } from "../types/WithDataStore";
import { APIError, APIResponseCodes } from "@twit2/std-library";
import { DataObject } from "../types/DataObject";

/**
 * Handles the object upload route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleUploadObject(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');

    if(!req.files)
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);
    
    const newReq = req as Request & WithDataStore;
    const files = (req.files as unknown as (File & WithUploadState)[]) ?? [];
    const results : DataObject[] = [];

    for(let file of files)
        results.push(await FileProcessor.process(newReq.store, file.uploadState));

    res.send(results);
}