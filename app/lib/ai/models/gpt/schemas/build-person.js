import { z } from "zod";

export default z.object({
    features: z.object({
        name: z.string(),
        age: z.string(),
        location: z.string(),
        job: z.string(),
        education: z.object({
            degree: z.string(),
            fieldOfStudy: z.string(),
            institution: z.string(),
            graduationYear: z.string(),
        }),
        hobbies: z.array(z.string()),
        languages: z.array(z.string()),
        favoriteFoods: z.array(z.string()),
        lifeEvents: z.array(z.object({
            event: z.string(),
            date: z.string(),
        })),
        goals: z.array(z.string()),
    }),
    imageDescription: z.string(),
    summary: z.string(),
});