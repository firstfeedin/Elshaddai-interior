import { TimeLogsService } from './time-logs.service';
export declare class TimeLogsController {
    private service;
    constructor(service: TimeLogsService);
    start(userId: string, body: any): Promise<{
        description: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        project_id: string | null;
        duration_min: number | null;
        task_id: string | null;
        started_at: Date;
        ended_at: Date | null;
        billable: boolean;
    }>;
    stop(userId: string): Promise<{
        description: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        project_id: string | null;
        duration_min: number | null;
        task_id: string | null;
        started_at: Date;
        ended_at: Date | null;
        billable: boolean;
    } | {
        message: string;
    }>;
    getActive(userId: string): Promise<{
        task: {
            title: string;
        };
    } & {
        description: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        project_id: string | null;
        duration_min: number | null;
        task_id: string | null;
        started_at: Date;
        ended_at: Date | null;
        billable: boolean;
    }>;
    logManual(userId: string, body: any): Promise<{
        description: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        project_id: string | null;
        duration_min: number | null;
        task_id: string | null;
        started_at: Date;
        ended_at: Date | null;
        billable: boolean;
    }>;
    getByProject(projectId: string): Promise<({
        user: {
            name: string;
            id: string;
            avatar: string;
        };
        task: {
            title: string;
            id: string;
        };
    } & {
        description: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        project_id: string | null;
        duration_min: number | null;
        task_id: string | null;
        started_at: Date;
        ended_at: Date | null;
        billable: boolean;
    })[]>;
}
