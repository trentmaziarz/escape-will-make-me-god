export interface ServiceEntry {
  // Identity
  id: string;
  name: string;
  domain: string;
  category:
    | "social-media"
    | "data-broker"
    | "big-tech"
    | "shopping"
    | "ad-network"
    | "other";
  icon: string;

  // Discovery
  hibpBreachNames: string[];

  // Deletion
  deletionMethod: "auto-api" | "auto-email" | "user-email" | "manual-guide";
  deletionDifficulty: "auto" | "easy" | "medium" | "hard";

  // For auto-api: the endpoint to hit
  autoDeleteEndpoint?: string;
  autoDeleteMethod?: "POST" | "GET" | "DELETE";
  autoDeletePayload?: Record<string, string>;

  // For auto-email and user-email: the address to send to
  dpoEmail?: string;
  deletionEmail?: string;

  // For manual-guide: step-by-step instructions
  manualSteps?: string[];
  deletionUrl?: string;

  // Legal
  gdprApplicable: boolean;
  ccpaApplicable: boolean;
  templateOverride?: string;

  // Metadata
  expectedResponseDays: number;
  resistsRequests: boolean;
  relistsAfterRemoval: boolean;
  requiresIdentityVerification: boolean;
  notes?: string;

  // Timestamps
  lastVerified: string;
}

export type ServiceCategory = ServiceEntry["category"];
export type DeletionMethod = ServiceEntry["deletionMethod"];
export type DeletionDifficulty = ServiceEntry["deletionDifficulty"];
