import path from "path";
import { ExifBeGoneProcessor } from "./processors/ExifBeGoneProcessor";
import { UserAvatarProcessor } from "./processors/UserAvatarProcessor";
import { Processor } from "./types/Processor";
import { UserBannerProcessor } from "./processors/UserBannerProcessor";

const processors : Processor[] = [];

/**
 * Registers all processors.
 */
async function init() {
    registerProcessor(new UserAvatarProcessor());
    registerProcessor(new UserBannerProcessor());
    registerProcessor(new ExifBeGoneProcessor(path.join(process.cwd(), "content", "temp", "exif")));
}

/**
 * Registers a new file processor.
 * @param p The file processor to register..
 */
async function registerProcessor(p: Processor) {
    console.log(`Registering processor '${p.name}'...`);
    await p.init();
    processors.push(p);
}

/**
 * Gets a processor by name.
 * @param name The name of the processor to get.
 */
async function getProcessor(name: string) {
    return processors.find(x => x.name == name);
}

/**
 * Processor manager - manages all file processors.
 */
export const ProcessorManager = {
    init,
    registerProcessor,
    getProcessor
}