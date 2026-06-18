import { DesignAssetsService } from './design-assets.service';
export declare class DesignAssetsController {
    private service;
    constructor(service: DesignAssetsService);
    getByProject(projectId: string, type?: string): Promise<({
        uploader: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        type: import(".prisma/client").$Enums.AssetType;
        id: string;
        created_at: Date;
        tags: string[];
        metadata: import("@prisma/client/runtime/library").JsonValue;
        project_id: string;
        version: number;
        uploader_id: string;
        url: string;
        thumbnail: string | null;
        size_bytes: number | null;
        mime_type: string | null;
    })[]>;
    create(projectId: string, userId: any, body: any): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.AssetType;
        id: string;
        created_at: Date;
        tags: string[];
        metadata: import("@prisma/client/runtime/library").JsonValue;
        project_id: string;
        version: number;
        uploader_id: string;
        url: string;
        thumbnail: string | null;
        size_bytes: number | null;
        mime_type: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
