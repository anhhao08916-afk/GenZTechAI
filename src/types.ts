/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GiaiDoan {
  phaseName: string;
  duration: string;
  deliverables: string[];
}

export interface TinhNăng {
  name: string;
  details: string;
  icon: string;
}

export interface CongNghe {
  category: string;
  tech: string;
  reason: string;
}

export interface BangDuLieu {
  tableName: string;
  description: string;
  columns: string[];
}

export interface AnalysisResult {
  projectTitle: string;
  executiveSummary: string;
  recommendedArchitecture: string;
  estimatedTimeline: GiaiDoan[];
  keyFeatures: TinhNăng[];
  techStack: CongNghe[];
  databaseSchema: BangDuLieu[];
  budgetAssessment: string;
}

export interface Registration {
  id: string;
  industry: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  proposedPrice: number;
  submittedAt: string;
  status: 'pending' | 'analyzed' | 'confirmed';
  analysisResult?: AnalysisResult;
}
