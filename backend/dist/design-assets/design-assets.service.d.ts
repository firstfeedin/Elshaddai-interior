import { PrismaService } from '../prisma/prisma.service';
export declare class DesignAssetsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(projectId: string, uploaderId: string, data: any): Promise<{
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
