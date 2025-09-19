export type StepPlan = { type: "plan"; thought: string };
export type StepTool = {
  type: "tool";
  name: string;
  args: Record<string, unknown>;
};
export type StepFinal = {
  type: "final";
  answer: string;
  sources?: string[];
};
export type Step = StepPlan | StepTool | StepFinal;

export type ToolFn = (args: Record<string, unknown>) => Promise<unknown>;
export type ToolRegistry = Record<string, ToolFn>;
