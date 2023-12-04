export interface DataStore {
    name: string;
    limits: {
        maxUploadSize?: number;
        allowedTypes: string[];
        maxUploadItems: number;
    },
    processors?: string[];
}