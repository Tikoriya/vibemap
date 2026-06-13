import { z } from 'zod';

export const spotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
});

export type SpotFormValues = z.infer<typeof spotSchema>;
