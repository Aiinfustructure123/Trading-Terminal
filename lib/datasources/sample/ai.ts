import { sourceStatus } from "@/lib/datasources/config";
import { sleep } from "@/lib/utils";
import type { AISource } from "@/lib/datasources/types";

export const sampleAISource: AISource = {
  async generateResearchBrief(tokenId: string) {
    await sleep(520);

    return {
      source: sourceStatus("ai"),
      sections: [
        {
          title: "Executive Summary",
          body: `${tokenId.toUpperCase()} is presented as a sample case file. The rank is explained by momentum, liquidity, holder distribution, and inverse risk inputs only.`
        },
        {
          title: "What the Data Shows",
          body: "Sample flow indicates improving depth and above-baseline buy pressure, with concentration checks still determining risk tier."
        },
        {
          title: "Key Risks",
          body: "This is generated sample data. Live phases must validate contract controls, LP behavior, and holder changes before surfacing a live conclusion."
        }
      ]
    };
  }
};
