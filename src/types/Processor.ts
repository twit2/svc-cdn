import { DataStore } from "./DataStore";
import { UploadState } from "./UploadState";

/**
 * Represents a file processor.
 */
export abstract class Processor {
    public name = "generic";

    /**
     * Initializes the processor.
     */
    abstract init(): Promise<void>;

    /**
     * Processes the specified file.
     * @param store The target data store.
     * @param uploadState The upload state.
     * @param tempPath The temporary path of the item to process.
     */
    abstract process(store: DataStore, uploadState: UploadState, tempPath: string): Promise<void>;
}