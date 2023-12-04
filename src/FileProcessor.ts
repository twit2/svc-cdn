import path from "path";
import { StorageManager } from "./StorageManager";
import { DataObject } from "./types/DataObject";
import { DataStore } from "./types/DataStore";
import { IntermediateFile } from "./types/IntermediateFile";
import { APIResponseCodes, APIError } from "@twit2/std-library";
import { UploadState } from "./types/UploadState";
import { ProcessorManager } from "./ProcessorManager";

/**
 * Processes an intermediate file.
 * @param store The target store.
 * @param targetId The target object ID.
 */
async function process(store: DataStore, uploadState: UploadState): Promise<DataObject> {
    const objName = StorageManager.createObjectName(uploadState.targetId, uploadState.mimetype);
    const tempFile = path.join(StorageManager.tempPath(), objName);
    console.log(`Processing file '${objName}' for '${store.name}'...`);

    // For future update: implement file processors
    for(let p of store.processors ?? []) {
        const proc = await ProcessorManager.getProcessor(p);

        if(!proc)
            throw new Error(`Processor "${p}" not found.`);

        console.log(`Executing processor '${p}'...`);
        await proc.process(store, uploadState, tempFile);
        console.log(`Processor '${p}' has completed.`);
    }

    // Move file in place
    await StorageManager.placeFile(tempFile, store.name);

    // Always delete temp file if we can
    await StorageManager.deleteTempFile(tempFile);

    console.log(`Process complete for file '${objName}'`);

    return {
        id: uploadState.targetId,
        name: objName,
        store: store.name,
        urlPart: `/${store.name}/${objName}`
    };
}

/**
 * Asserts a file upload.
 * @param store The target data store.
 * @param file The file to upload.
 */
function assertFile(store: string, file: IntermediateFile) {
    const ds = StorageManager.getStore(store);

    if(!ds)
        throw new APIError({ success: false, message: "Data store not found.", code: APIResponseCodes.NOT_FOUND });

    if(!ds.limits.allowedTypes.includes(file.mimetype))
        throw new APIError({ success: false, message: "Mimetype not allowed.", code: APIResponseCodes.GENERIC });
    else if((file.size ?? 0) > (ds.limits.maxUploadSize ?? StorageManager.DEFAULT_UL_SIZE))
        throw new APIError({ success: false, message: "File too large.", code: APIResponseCodes.GENERIC });
}

export const FileProcessor = {
    process,
    assertFile
}