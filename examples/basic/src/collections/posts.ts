import { collection, field, text } from "@deessejs/collections";

export const Posts = collection({
  slug: "posts",
  fields: {
    title: field({
      type: text(),
    }),
    content: field({
      type: text(),
    }),
  },
});
