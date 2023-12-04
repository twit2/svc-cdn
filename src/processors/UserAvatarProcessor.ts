import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { DataStore } from "../types/DataStore";
import { Processor } from "../types/Processor";
import { UploadState } from "../types/UploadState";
import path from "path";

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
        console.log("Informing user service about updated avatar...");
        const basename = path.basename(tempPath);
        await UserAvatarProcessor.rpcClient?.makeCall("update-avatar", { id: uploadState.actingUserId, avatarURL: `/avatars/${basename}` });
    }
}