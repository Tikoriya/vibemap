import { z } from 'zod';

export const spotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
});

export type SpotFormValues = z.infer<typeof spotSchema>;

// Creating a spot also requires choosing which city it belongs to. Edit forms
// reuse the base schema, where the city is fixed and not part of the form.
export const createSpotSchema = spotSchema.extend({
  cityId: z
    .number({ error: 'Please select a city' })
    .int()
    .positive('Please select a city'),
});

export type CreateSpotFormValues = z.infer<typeof createSpotSchema>;
