export default {
  type: "object",
  properties: {
    title: { type: "string" },
    user: { type: "string" },
  },
  required: ["user"],
} as const;
