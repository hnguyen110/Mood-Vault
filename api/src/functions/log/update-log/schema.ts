export default {
  type: "object",
  properties: {
    title: { type: "string" },
    data: { type: "string" },
  },
  required: ["title", "data"],
} as const;
