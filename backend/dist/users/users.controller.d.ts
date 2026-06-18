import { UsersService } from './users.service';
export declare class UsersController {
    private service;
    constructor(service: UsersService);
    updateProfile(id: string, body: any): Promise<{
        name: string;
        email: string;
        phone: string;
        id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getDesigners(orgId: string): Promise<{
        name: string;
        id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findById(id: string): Promise<{
        organisation: {
            name: string;
            id: string;
            slug: string;
        };
        name: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        org_id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
        created_at: Date;
    }>;
}
