import type { ServiceEntry } from "@/data/services/schema";
import socialMedia from "@/data/services/social-media.json";
import dataBrokers from "@/data/services/data-brokers.json";

export function getAllServices(): ServiceEntry[] {
  return [...(socialMedia as ServiceEntry[]), ...(dataBrokers as ServiceEntry[])];
}

export function getServiceById(id: string): ServiceEntry | undefined {
  return getAllServices().find((service) => service.id === id);
}

export function getServicesByCategory(category: ServiceEntry["category"]): ServiceEntry[] {
  return getAllServices().filter((service) => service.category === category);
}
