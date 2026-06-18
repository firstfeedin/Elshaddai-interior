import { AiService } from './ai.service';
export declare class AiController {
    private service;
    constructor(service: AiService);
    generate(body: any): Promise<{
        design_brief: {
            project_name: string;
            style: string;
            tier: string;
            area: number;
            budget: number;
            budget_per_sqft: number;
            palette: any;
            concept: any;
            key_materials: any;
            rooms_included: string[];
            estimated_duration_weeks: number;
        };
        boq: {
            amount: number;
            item: string;
            unit: string;
            qty: number;
            rate: number;
        }[];
        cost_breakdown: {
            civil_work: number;
            flooring: number;
            kitchen: number;
            wardrobes: number;
            electrical: number;
            plumbing: number;
            painting: number;
            furniture: number;
            decor: number;
        };
        assigned_designer: {
            name: string;
            experience: string;
            specialisation: string;
            portfolio_count: number;
            rating: number;
        };
    }>;
    suggest(body: any): Promise<{
        suggestions: {
            name: string;
            description: string;
            ideal_for: boolean;
        }[];
    }>;
    materials(body: any): Promise<{
        recommended: any;
        palette: {
            primary: any;
            accent: any;
            neutral: any;
        };
    }>;
}
