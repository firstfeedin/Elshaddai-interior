import { LeadsService } from './leads.service';
export declare class LeadsController {
    private service;
    constructor(service: LeadsService);
    create(body: any): Promise<{
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
