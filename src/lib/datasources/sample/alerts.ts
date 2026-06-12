import type { AlertsSource, AlertRule, AlertEvent } from "../types";

const NOW = new Date().toISOString();

const defaultRules: AlertRule[] = [
  {
    id: "rule-1",
    name: "Momentum Spike",
    condition: "momentum_crosses",
    params: { threshold: 75 },
    enabled: true,
    createdAt: NOW,
  },
  {
    id: "rule-2",
    name: "Liquidity Drain Alert",
    condition: "liquidity_drops",
    params: { pct: 30, window: "1h" },
    enabled: true,
    createdAt: NOW,
  },
  {
    id: "rule-3",
    name: "Risk Tier Worsens",
    condition: "risk_worsens",
    params: {},
    enabled: false,
    createdAt: NOW,
  },
];

const sampleEvents: AlertEvent[] = [
  {
    id: "evt-1",
    ruleId: "rule-1",
    ruleName: "Momentum Spike",
    message: "BONK momentum crossed 80 — current score 83",
    severity: "info",
    at: new Date(Date.now() - 18 * 60e3).toISOString(),
    tokenSymbol: "BONK",
  },
  {
    id: "evt-2",
    ruleId: "rule-2",
    ruleName: "Liquidity Drain Alert",
    message: "REKT liquidity dropped 42% in the last hour",
    severity: "critical",
    at: new Date(Date.now() - 2 * 3600e3).toISOString(),
    tokenSymbol: "REKT",
  },
  {
    id: "evt-3",
    ruleId: "rule-1",
    ruleName: "Momentum Spike",
    message: "AIAGENT momentum crossed 78 — current score 81",
    severity: "info",
    at: new Date(Date.now() - 4 * 3600e3).toISOString(),
    tokenSymbol: "AIAGENT",
  },
];

let rules = [...defaultRules];

export const sampleAlertsSource: AlertsSource = {
  async getRules() { return rules; },
  async getEvents() { return sampleEvents; },
  async createRule(rule) {
    const newRule: AlertRule = { ...rule, id: `rule-${Date.now()}`, createdAt: new Date().toISOString() };
    rules = [...rules, newRule];
    return newRule;
  },
  async updateRule(id, patch) {
    rules = rules.map(r => r.id === id ? { ...r, ...patch } : r);
    return rules.find(r => r.id === id)!;
  },
  async deleteRule(id) {
    rules = rules.filter(r => r.id !== id);
  },
};
