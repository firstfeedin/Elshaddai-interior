import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    getHistory(projectId: string, cursor?: string, take?: number): Promise<({
        sender: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            avatar: string;
        };
    } & {
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        created_at: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        project_id: string;
        sender_id: string;
        content: string;
        file_url: string | null;
        read_by: string[];
    })[]>;
    send(projectId: string, senderId: string, data: any): Promise<{
        sender: {
            name: string;
            id: string;
            avatar: string;
        };
    } & {
        type: import(".prisma/client").$Enums.MessageType;
        id: string;
        created_at: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        project_id: string;
        sender_id: string;
        content: string;
        file_url: string | null;
        read_by: string[];
    }>;
}
