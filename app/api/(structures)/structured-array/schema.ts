import { z } from "zod";

export const pokemonSchema = z.object({
  name: z.string().min(1),
  abilities: z.array(z.string()),
});

export const pokemonUISchema = z.array(pokemonSchema);
