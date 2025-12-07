import { withCollections } from "@deessejs/collections";

export default function (phase, config) {
  return withCollections(phase, {
    reactStrictMode: true,
  });
}
