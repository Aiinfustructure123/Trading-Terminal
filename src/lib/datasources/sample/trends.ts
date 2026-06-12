import { NarrativeCategory, TrendsSource } from "../types";
import { getEngine, simulateLatency } from "./engine";

export const sampleTrendsSource: TrendsSource = {
  async listNarratives(): Promise<NarrativeCategory[]> {
    await simulateLatency(120, 340);
    return getEngine().getNarratives();
  },
};
