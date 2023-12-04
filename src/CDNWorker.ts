import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue, SessionVerifierMiddleware } from "@twit2/std-library";

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
}

export const CDNWorker = {
    init
}