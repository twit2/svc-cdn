import ExifTransformer from "exif-be-gone";
import { DataStore } from "../types/DataStore";
import { Processor } from "../types/Processor";
import { UploadState } from "../types/UploadState";
import fs from 'fs';
import { pipeline } from "stream/promises";
import path from "path";

const SUPPORTED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/tiff"];

export class ExifBeGoneProcessor extends Processor {
    private tempDir: string;

    constructor(tempDir: string) {
        super();
        this.name = "exif-be-gone";
        this.tempDir = tempDir;
    }

    async init(): Promise<void> {
        // Nothing to init
        await fs.promises.mkdir(this.tempDir, { recursive: true });
    }
    
    async process(store: DataStore, uploadState: UploadState, tempPath: string): Promise<void> {
        if(!SUPPORTED_MIMES.includes(uploadState.mimetype)) {
            console.log(`File '${uploadState.targetId}' cannot be processed with exif-be-gone, skipping...`);
            return;
        }

        const name = path.basename(tempPath);
        const exifTmpFile = path.join(this.tempDir, name);
        
        await pipeline(
            fs.createReadStream(tempPath),
            new ExifTransformer(),
            fs.createWriteStream(exifTmpFile)
        );

        await fs.promises.copyFile(exifTmpFile, tempPath);
        await fs.promises.rm(exifTmpFile);
    }
}