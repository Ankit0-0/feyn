import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters long"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long"),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .transform((value) => value.toLowerCase()),

    password: z.string().min(1, "Password is required"),
  }),
});

export type SignupBody = z.infer<typeof signupSchema>["body"];
export type SigninBody = z.infer<typeof signinSchema>["body"];
