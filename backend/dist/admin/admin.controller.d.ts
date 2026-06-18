import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
export declare class AdminController {
    private service;
    constructor(service: AdminService);
    stats(): Promise<{
        total_users: number;
        total_projects: number;
        total_leads: number;
        active_projects: number;
        total_expenses: number | import("@prisma/client/runtime/library").Decimal;
        role_breakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        recent_projects: ({
            client: {
                name: string;
                email: string;
            };
        } & {
            name: string;
            description: string | null;
            city: string | null;
            id: string;
            org_id: string | null;
            created_at: Date;
            updated_at: Date;
            address: string | null;
            project_number: string;
            client_id: string;
            designer_id: string | null;
            property_type: import(".prisma/client").$Enums.PropertyType;
            status: import(".prisma/client").$Enums.ProjectStatus;
            total_area_sqft: import("@prisma/client/runtime/library").Decimal | null;
            budget: import("@prisma/client/runtime/library").Decimal | null;
            quoted_amount: import("@prisma/client/runtime/library").Decimal | null;
            approved_amount: import("@prisma/client/runtime/library").Decimal | null;
            start_date: Date | null;
            end_date: Date | null;
            actual_end_date: Date | null;
            requirements: import("@prisma/client/runtime/library").JsonValue;
            scene_data: import("@prisma/client/runtime/library").JsonValue;
            ai_design_data: import("@prisma/client/runtime/library").JsonValue;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        })[];
    }>;
    users(filters: any): Promise<{
        organisation: {
            name: string;
        };
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        org_id: string;
        is_active: boolean;
        last_login: Date;
        created_at: Date;
    }[]>;
    updateRole(id: string, role: Role): Promise<{
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        google_id: string | null;
        org_id: string | null;
        password_hash: string | null;
        avatar: string | null;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
        mfa_enabled: boolean;
        mfa_secret: string | null;
        email_verified: boolean;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    toggleActive(id: string): Promise<{
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        google_id: string | null;
        org_id: string | null;
        password_hash: string | null;
        avatar: string | null;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
        mfa_enabled: boolean;
        mfa_secret: string | null;
        email_verified: boolean;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    leads(status?: string): Promise<{
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
