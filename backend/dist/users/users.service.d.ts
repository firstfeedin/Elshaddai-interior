import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updateProfile(id: string, data: any): Promise<{
        name: string;
        email: string;
        phone: string;
        id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getDesigners(orgId?: string): Promise<{
        name: string;
        id: string;
        avatar: string;
        profile_data: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
