import { defineConfig, inAppProvider } from "@deessejs/collections";
import { Posts } from "./collections/posts";
import { success, unit } from "@deessejs/functions";
import { defineContext, rpc } from "@deessejs/functions";
import z from "zod";

export const db = defineConfig({
  provider: inAppProvider(),
  collections: [Posts],
  plugins: [],
});

const context = { userId: "123", db };

const { t, createAPI } = defineContext(context).withExtensions([rpc]);

const createPost = t.mutation({
  args: z.object({ title: z.string() }),
  handler: async (ctx, args) => {
    console.log(await ctx.db.posts.create({ title: args.title, content: "" }));
    return success(unit);
  },
});

const api = createAPI({
  root: t.router({ createPost }),
});

const run = async () => {
  const res = await api.createPost({ title: "Alice" });
  // console.log("Result:", res);
};

run();
