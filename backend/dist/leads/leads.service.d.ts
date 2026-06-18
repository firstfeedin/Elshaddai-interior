import { PrismaService } from '../prisma/prisma.service';
export declare class LeadsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        message: string | null;
        name: string;
        email: string;
        phone: string;
        city: string | null;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        property_type: import(".prisma/client").$Enums.PropertyType | null;
        status: import(".prisma/client").$Enums.LeadStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        notes: string | null;
        budget_range: string | null;
        assigned_to: string | null;
        follow_up_at: Date | null;
        source: string;
    }>;
    findAll(): Promise<{
        message: string | null;
        name: string;
        email: string;
        phone: string;
        city: string | null;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string | null;
        property_type: import(".prisma/client").$Enums.PropertyType | null;
        status: import(".prisma/client").$Enums.LeadStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        notes: string | null;
        budget_range: string | null;
        assigned_to: string | null;
        follow_up_at: Date | null;
        source: string;
    }[]>;
}
