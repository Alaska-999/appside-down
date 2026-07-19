import { z } from "zod";

// вміст карток не валідуємо — це контент юзера і його відповідальність;
// повністю порожні рядки просто відфільтровуються перед відправкою.
// Єдина вимога — щонайменше 2 непорожні картки (є хоч term, хоч definition)
export const moduleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(60, "Max 60 characters"),
    description: z.string().trim().max(300, "Max 300 characters"),
    flashcards: z.array(
      z.object({
        term: z.string().trim(),
        definition: z.string().trim(),
      }),
    ),
  })
  .refine(
    (module) =>
      module.flashcards.filter((card) => card.term || card.definition).length >=
      2,
    {
      message: "Add at least 2 cards",
      path: ["flashcards"],
    },
  );

export const folderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(40, "Max 40 characters"),
});

export const editModuleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(60, "Max 60 characters"),
    description: z.string().trim().max(300, "Max 300 characters"),
    flashcards: z.array(
      z.object({
        id: z.string(),
        isNew: z.boolean().optional(),
        term: z.string().trim(),
        definition: z.string().trim(),
      }),
    ),
  })
  .refine(
    (module) =>
      module.flashcards.filter((card) => card.term || card.definition).length >=
      2,
    {
      message: "Add at least 2 cards",
      path: ["flashcards"],
    },
  );

export type ModuleForm = z.infer<typeof moduleSchema>;
export type FolderForm = z.infer<typeof folderSchema>;
export type EditModuleForm = z.infer<typeof editModuleSchema>;
