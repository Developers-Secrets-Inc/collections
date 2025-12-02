import {
  collection,
  field,
  required,
  text,
  unique,
} from "@deessejs/collections";

export const Posts = collection({
  slug: "posts",
  name: "Posts",
  admin: {
    title: "Posts",
    group: "Content",
  },
  permissions: {
    create: async (ctx) => ctx.user.role === "admin",
  },
  fields: {
    title: unique(
      required(
        field({
          type: text({ min: 1, max: 100 }),
          permissions: {
            create: async (ctx) => ctx.user.role === "admin",
          },
        }),
      ),
    ),
    content: field({
      type: text({ min: 1, max: 1000 }),
    }),
  },
  hooks: {
    beforeCreate: async (data) => {
      console.log("hey");
    },
    afterCreate: async (data) => {
      console.log("hey");
    },
  },
});
