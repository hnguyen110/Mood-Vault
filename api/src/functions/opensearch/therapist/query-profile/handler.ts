import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { Client } from "@opensearch-project/opensearch";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
});

const handler: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  try {
    console.log(event);

    const response = await client.search({
      from: parseInt(event.queryStringParameters?.from || "0"),
      size: parseInt(event.queryStringParameters?.size || "10"),
      index: process.env.OPENSEARCH_RECIPE_INDEX,
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  pk: "THERAPIST_PROFILE",
                },
              },
              {
                query_string: {
                  fields: [
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                    "business.name",
                    "business.addressLine",
                    "business.unit",
                    "business.city",
                    "business.province",
                    "business.postalCode",
                    "business.country",
                    "education.field",
                    "education.school",
                    "education.degree",
                    "licenses.name",
                    "licenses.issuingOrganization",
                    "licenses.url",
                  ],
                  query: `*${event.queryStringParameters?.q}*` || "*",
                },
              },
            ],
          },
        },
      },
    });
    return formatJSONResponse({
      ...(response?.body?.hits || {}),
    });
  } catch (e) {
    console.log(e);
    return formatJSONResponse({
      message: "Internal Server Error",
    });
  }
};

export const main = middyfy(handler);
