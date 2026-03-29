export interface ReportData {
  email: string;
  servicesRequested: string[];
  timestamp: string;
}

export async function generateReport(_data: ReportData): Promise<Buffer> {
  // TODO: Implement PDF report generation with @react-pdf/renderer or Puppeteer
  throw new Error("Not implemented");
}
