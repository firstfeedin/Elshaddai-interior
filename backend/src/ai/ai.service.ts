import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const STYLE_PALETTES: Record<string, any> = {
  Modern: {
    primary: '#2C3E50', accent: '#E74C3C', neutral: '#ECF0F1',
    materials: ['Polished concrete', 'Brushed steel', 'Tempered glass', 'Oak veneer'],
    description: 'Clean lines, minimal ornamentation, functional elegance',
  },
  Contemporary: {
    primary: '#1A1A2E', accent: '#E94560', neutral: '#F5F5F0',
    materials: ['Italian marble', 'Lacquered MDF', 'Chrome fixtures', 'Fabric upholstery'],
    description: 'Current trends blending comfort with sophistication',
  },
  Traditional: {
    primary: '#5D4037', accent: '#FFB300', neutral: '#FFF8E1',
    materials: ['Solid teak wood', 'Jali work', 'Handcrafted tiles', 'Brass hardware'],
    description: 'Rich heritage, intricate craftsmanship, timeless warmth',
  },
  Minimalist: {
    primary: '#212121', accent: '#BDBDBD', neutral: '#FAFAFA',
    materials: ['White plaster', 'Birch plywood', 'Concrete floors', 'Linen textiles'],
    description: 'Less is more — negative space as a design element',
  },
  'Industrial Chic': {
    primary: '#37474F', accent: '#FF6F00', neutral: '#EFEBE9',
    materials: ['Exposed brick', 'Raw steel', 'Reclaimed wood', 'Edison bulbs'],
    description: 'Urban warehouse aesthetic with curated raw materials',
  },
  Bohemian: {
    primary: '#6D4C41', accent: '#F4511E', neutral: '#FBE9E7',
    materials: ['Jute rugs', 'Rattan furniture', 'Terracotta pots', 'Macramé'],
    description: 'Eclectic, colourful, layered with global influences',
  },
};

@Injectable()
export class AiService {
  constructor(private config: ConfigService) {}

  async generateDesign(data: {
    property_type: string;
    area: number;
    rooms: string[];
    budget: number;
    style: string;
    name: string;
    preferences?: string;
  }) {
    const palette = STYLE_PALETTES[data.style] || STYLE_PALETTES['Modern'];
    const budgetPerSqft = Math.round(data.budget / data.area);
    const tier = budgetPerSqft < 1500 ? 'Economy' : budgetPerSqft < 3000 ? 'Premium' : 'Ultra-Luxury';

    const boq = this.generateBOQ(data.rooms, data.area, data.budget, tier);

    return {
      design_brief: {
        project_name: `${data.name}'s ${data.style} ${data.property_type}`,
        style: data.style,
        tier,
        area: data.area,
        budget: data.budget,
        budget_per_sqft: budgetPerSqft,
        palette,
        concept: palette.description,
        key_materials: palette.materials,
        rooms_included: data.rooms,
        estimated_duration_weeks: Math.ceil(data.area / 150) * 4,
      },
      boq,
      cost_breakdown: {
        civil_work: Math.round(data.budget * 0.20),
        flooring: Math.round(data.budget * 0.12),
        kitchen: Math.round(data.budget * 0.18),
        wardrobes: Math.round(data.budget * 0.15),
        electrical: Math.round(data.budget * 0.08),
        plumbing: Math.round(data.budget * 0.06),
        painting: Math.round(data.budget * 0.07),
        furniture: Math.round(data.budget * 0.10),
        decor: Math.round(data.budget * 0.04),
      },
      assigned_designer: {
        name: 'Architect Priya Krishnaswamy',
        experience: '12 years',
        specialisation: data.style,
        portfolio_count: 48,
        rating: 4.9,
      },
    };
  }

  async suggestLayout(projectId: string, area: number, rooms: string[]) {
    return {
      suggestions: [
        {
          name: 'Open Plan Living',
          description: 'Integrated living, dining and kitchen for spacious feel',
          ideal_for: area < 1000,
        },
        {
          name: 'Zone-Based Design',
          description: 'Clearly defined zones for each function',
          ideal_for: area >= 1000,
        },
      ],
    };
  }

  async recommendMaterials(style: string, budget: number, area: number) {
    const palette = STYLE_PALETTES[style] || STYLE_PALETTES['Modern'];
    return {
      recommended: palette.materials,
      palette: { primary: palette.primary, accent: palette.accent, neutral: palette.neutral },
    };
  }

  private generateBOQ(rooms: string[], area: number, budget: number, tier: string) {
    const items = [
      { item: 'Modular Kitchen', unit: 'Running ft', qty: 12, rate: tier === 'Ultra-Luxury' ? 4500 : tier === 'Premium' ? 2800 : 1500 },
      { item: 'Master Bedroom Wardrobe', unit: 'Running ft', qty: 8, rate: tier === 'Ultra-Luxury' ? 3500 : 2000 },
      { item: 'Flooring (Italian Marble / Vitrified)', unit: 'Sq ft', qty: area, rate: tier === 'Ultra-Luxury' ? 250 : 120 },
      { item: 'False Ceiling with Cove Lighting', unit: 'Sq ft', qty: Math.round(area * 0.7), rate: 180 },
      { item: 'Electrical Points & Wiring', unit: 'Points', qty: Math.ceil(area / 15), rate: 1200 },
      { item: 'Interior Painting (2 coats + primer)', unit: 'Sq ft', qty: area * 3.5, rate: 28 },
      { item: 'Bathroom Fittings & Fixtures', unit: 'Per bath', qty: Math.max(1, Math.ceil(rooms.length / 3)), rate: 75000 },
    ];

    return items.map((i) => ({
      ...i,
      amount: i.qty * i.rate,
    }));
  }
}
