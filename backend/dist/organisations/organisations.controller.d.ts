import { OrganisationsService } from './organisations.service';
export declare class OrganisationsController {
    private service;
    constructor(service: OrganisationsService);
    getMyOrg(orgId: string): Promise<{
        _count: {
            users: number;
            projects: number;
        };
    } & {
        name: string;
        phone: string | null;
        city: string | null;
        id: string;
        created_at: Date;
        updated_at: Date;
        slug: string;
        logo: string | null;
        website: string | null;
        address: string | null;
        state: string | null;
        gst_number: string | null;
        pan_number: string | null;
        subscription: import(".prisma/client").$Enums.SubscriptionPlan;
        sub_expires_at: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, body: any): Promise<{
        name: string;
        phone: string | null;
        city: string | null;
        id: string;
        created_at: Date;
        updated_at: Date;
        slug: string;
        logo: string | null;
        website: string | null;
        address: string | null;
        state: string | null;
        gst_number: string | null;
        pan_number: string | null;
        subscription: import(".prisma/client").$Enums.SubscriptionPlan;
        sub_expires_at: Date | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getMembers(id: string): Promise<{
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        avatar: string;
        is_active: boolean;
    }[]>;
}
