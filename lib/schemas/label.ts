import { z } from 'zod';

export const labelSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Keep it under 40 characters'),
  icon: z.string().min(1, 'Pick an icon'),
});

export type LabelFormValues = z.infer<typeof labelSchema>;
