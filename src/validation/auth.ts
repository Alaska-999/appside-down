import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Invalid email"));

const strongPasswordSchema = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[0-9]/, "Must contain at least one number");

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
    email: emailSchema,
    username: z
        .string()
        .trim()
        .min(3, "At least 3 characters")
        .max(20, "Max 20 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores, and hyphens allowed"),
    password: strongPasswordSchema,
});

export const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: strongPasswordSchema,
        confirmPassword: z.string().min(1, "Confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
        message: "New password must be different from the current one",
        path: ["newPassword"],
    });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;