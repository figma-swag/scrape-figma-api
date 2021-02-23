const BASE_SPECIFICATION = {
  openapi: "3.0.3",
  info: {
    title: "Figma",
    version: "1.0.0",
  },
  paths: {
    // "/me": {
    //   get: {
    //     description: "gets info about me!",
    //     responses: {
    //       "200": {
    //         description: "user info",
    //         content: {
    //           "application/json": {
    //             schema: {
    //               type: "object",
    //               properties: {
    //                 id: {
    //                   description: "User ID",
    //                   type: "string",
    //                 },
    //                 handle: {
    //                   description: "User handle",
    //                   type: "string",
    //                 },
    //                 image_url: {
    //                   description: "User profile picture",
    //                   type: "string",
    //                 },
    //                 email: {
    //                   description: "User email",
    //                   type: "string",
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
  },
  security: [
    {
      // @ts-ignore
      api_key: [],
    },
  ],
  components: {
    securitySchemes: {
      api_key: {
        type: "apiKey",
        name: "X-FIGMA-TOKEN",
        in: "header",
      },
    },
  },
};

console.log(JSON.stringify(BASE_SPECIFICATION, null, 2));
