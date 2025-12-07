import { Posts } from "@/collections/posts";
import { posts } from "@deesse/schema";
import { defineConfig } from "@deessejs/collections";

export const db = defineConfig({
  databaseUrl: "1234",
  collections: [Posts],
});