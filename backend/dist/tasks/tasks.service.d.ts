import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    getKanban(projectId: string): Promise<Record<string, any[]>>;
    create(projectId: string, data: any, creatorId: string): Promise<{
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        tags: string[];
        status: import(".prisma/client").$Enums.TaskStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        position: number;
        due_date: Date | null;
        project_id: string;
        parent_id: string | null;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignee_id: string | null;
        creator_id: string;
        estimated_hrs: import("@prisma/client/runtime/library").Decimal | null;
        actual_hrs: import("@prisma/client/runtime/library").Decimal | null;
        attachments: string[];
    }>;
    update(id: string, data: any): Promise<{
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        tags: string[];
        status: import(".prisma/client").$Enums.TaskStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        position: number;
        due_date: Date | null;
        project_id: string;
        parent_id: string | null;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignee_id: string | null;
        creator_id: string;
        estimated_hrs: import("@prisma/client/runtime/library").Decimal | null;
        actual_hrs: import("@prisma/client/runtime/library").Decimal | null;
        attachments: string[];
    }>;
    moveCard(id: string, status: TaskStatus, position: number): Promise<{
        type: import(".prisma/client").$Enums.TaskType;
        description: string | null;
        title: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        tags: string[];
        status: import(".prisma/client").$Enums.TaskStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        position: number;
        due_date: Date | null;
        project_id: string;
        parent_id: string | null;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assignee_id: string | null;
        creator_id: string;
        estimated_hrs: import("@prisma/client/runtime/library").Decimal | null;
        actual_hrs: import("@prisma/client/runtime/library").Decimal | null;
        attachments: string[];
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getTimeline(projectId: string): Promise<{
        type: import(".prisma/client").$Enums.TaskType;
        title: string;
        id: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        due_date: Date;
        priority: import(".prisma/client").$Enums.TaskPriority;
        estimated_hrs: import("@prisma/client/runtime/library").Decimal;
        actual_hrs: import("@prisma/client/runtime/library").Decimal;
        assignee: {
            name: string;
            avatar: string;
        };
    }[]>;
}
