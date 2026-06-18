import { MessagesService } from './messages.service';
export declare class MessagesController {
    private service;
    constructor(service: MessagesService);
    getHistory(projectId: string, cursor?: string): Promise<({
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
    send(projectId: string, userId: any, body: any): Promise<{
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
