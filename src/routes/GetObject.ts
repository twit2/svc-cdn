import { APIError, APIResponseCodes } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { StorageManager } from "../StorageManager";

/**
 * Handles the object retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetObject(req: Request, res: Response, next: NextFunction) {
    const store = req.params.store;
    const item = req.params.id;

    if((!store) || (!item))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    res.sendFile(await StorageManager.getObjectPath(store, item));
}