import { PrismaService } from '../prisma/prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    getByProject(projectId: string): Promise<{
        expenses: ({
            user: {
                name: string;
                id: string;
            };
        } & {
            description: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            project_id: string;
            gst_amount: import("@prisma/client/runtime/library").Decimal | null;
            approved: boolean;
            date: Date;
            category: import(".prisma/client").$Enums.ExpenseCategory;
            amount: import("@prisma/client/runtime/library").Decimal;
            gst_rate: import("@prisma/client/runtime/library").Decimal | null;
            vendor: string | null;
            invoice_no: string | null;
            receipt_url: string | null;
        })[];
        summary: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ExpenseGroupByOutputType, "category"[]> & {
            _sum: {
                amount: import("@prisma/client/runtime/library").Decimal;
            };
        })[];
    }>;
    create(projectId: string, userId: string, data: any): Promise<{
        description: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        project_id: string;
        gst_amount: import("@prisma/client/runtime/library").Decimal | null;
        approved: boolean;
        date: Date;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        gst_rate: import("@prisma/client/runtime/library").Decimal | null;
        vendor: string | null;
        invoice_no: string | null;
        receipt_url: string | null;
    }>;
    approve(id: string): Promise<{
        description: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        project_id: string;
        gst_amount: import("@prisma/client/runtime/library").Decimal | null;
        approved: boolean;
        date: Date;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        amount: import("@prisma/client/runtime/library").Decimal;
        gst_rate: import("@prisma/client/runtime/library").Decimal | null;
        vendor: string | null;
        invoice_no: string | null;
        receipt_url: string | null;
    }>;
}
