import { z } from 'zod';

export const parseQuerySchema = z.object({
  query: z.string().min(1),
});

export const createSubpersonaSchema = z.object({
  name: z.string().min(1),
  status: z.string().optional(),
  capabilities: z.object({}).optional(),
  preferences: z.object({}).optional(),
});

export const compressMemorySchema = z.object({
  memory: z.string().min(1),
});

export const contextRecapSchema = z.object({
  history: z.string().min(1),
  compressedMemory: z.string().min(1),
});

export const summarizeLogsSchema = z.object({
  logs: z.string().min(1),
});

export const taskSchema = z.object({
    goal: z.string().min(1),
    priority: z.string().optional(),
    subtasks: z.array(z.object({
        description: z.string().min(1),
        status: z.string().optional(),
    })),
});

export const updateSubtaskStatusSchema = z.object({
    subtaskId: z.number().int(),
    status: z.string().min(1),
});

export const deleteTaskCardSchema = z.object({
    taskCardId: z.number().int(),
});

export const feedbackSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1),
});

export const autonomousSchema = z.object({
    query: z.string().min(1),
    memory: z.string().optional(),
    logs: z.string().optional(),
    feedback: z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(1),
    }).optional(),
});
