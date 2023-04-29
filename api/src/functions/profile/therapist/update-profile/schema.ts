export default {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    business: {
      type: "object",
      properties: {
        name: { type: "string" },
        addressLine: { type: "string" },
        unit: { type: "string" },
        city: { type: "string" },
        province: { type: "string" },
        postalCode: { type: "string" },
        country: { type: "string" },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
    licenses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          issuingOrganization: { type: "string" },
          issueDate: { type: "string" },
          expiryDate: { type: "string" },
          url: { type: "string", default: "" },
        },
      },
    },
  },
  required: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "business",
    "education",
    "licenses",
  ],
} as const;
