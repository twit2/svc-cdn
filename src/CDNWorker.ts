import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue, SessionVerifierMiddleware } from "@twit2/std-library";
import { UserAvatarProcessor } from "./processors/UserAvatarProcessor";

/**
 * Initializes the worker.
 * @param url MQ url.
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup rpc client
    const rpcc = new MsgQueue.rpc.RPCClient(mq);
    await rpcc.init('t2a-session-verif');
    await SessionVerifierMiddleware.init(rpcc);

    // Setup user svc rpc
    const userRpc = new MsgQueue.rpc.RPCClient(mq);
    await userRpc.init('t2-user-service');
    UserAvatarProcessor.setRPCClient(userRpc);
}

export const CDNWorker = {
    init
}