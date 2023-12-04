export interface WithUploadState {
    uploadState: UploadState;
};

export interface UploadState {
    targetId: string;
    mimetype: string;
};