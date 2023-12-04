import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { DataStore } from "../types/DataStore";
import { Processor } from "../types/Processor";
import { UploadState } from "../types/UploadState";

export class UserAvatarProcessor extends Processor {
    /** RPC client (globally set) */
    private static rpcClient?: RPCClient;

    static setRPCClient(client: RPCClient) {
        this.rpcClient = client;
    }

    constructor() {
        super();
        this.name = "user-avatar-proc";
    }

    async init(): Promise<void> {
        // Nothing to init
    }
    
    async process(store: DataStore, uploadState: UploadState, tempPath: string): Promise<void> {
        // TODO inform user service of avatar upload

    }
}