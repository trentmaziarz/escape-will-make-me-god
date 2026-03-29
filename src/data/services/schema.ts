export interface ServiceEntry {
  id: string;
  name: string;
  category: "social-media" | "data-broker" | "email" | "shopping" | "finance" | "other";
  difficulty: "auto" | "easy" | "medium" | "hard";
  deletionUrl?: string;
  deletionEmail?: string;
  privacyPolicyUrl?: string;
  description: string;
  instructions?: string;
  gdprApplicable: boolean;
  ccpaApplicable: boolean;
}
