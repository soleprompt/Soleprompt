import type {
  PipelineContext,
  PipelineStepId,
  PipelineStepResult,
} from "@/lib/studio/pipeline/types";

export interface PipelineModule {
  readonly stepId: PipelineStepId;
  readonly name: string;
  execute(context: PipelineContext): Promise<PipelineStepResult>;
}

export type ModuleRegistry = Record<PipelineStepId, PipelineModule>;
