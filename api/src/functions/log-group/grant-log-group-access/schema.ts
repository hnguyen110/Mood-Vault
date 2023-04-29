export default {
  type: "object",
  properties: {
    user: { type: "string" },
  },
  required: ["user"],
} as const;
