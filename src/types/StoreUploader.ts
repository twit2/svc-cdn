import { Multer } from "multer";

export interface StoreUploader {
    storeName: string;
    uploader: Multer;
}