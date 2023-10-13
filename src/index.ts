import zod from "zod";

export interface Env {
  // If you set another name in wrangler.toml as the value for 'binding',
  // replace "DB" with the variable name you defined.
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const apiKeys = await getApiKeys(env);

    const { method } = request;
    const { pathname } = new URL(request.url);
    const ipAddress =
      (await request.headers.get("CF-Connecting-IP")) || "0.0.0.0";
    const providedApiKey = request.headers.get("X-API-Key") || "";

    let response;

    // Handle CORS preflight requests
    if (method === "OPTIONS") {
      return handleOptions(request);
    }

    // Handle requests to /block
    if (pathname === "/block") {
      if (method === "POST") {
        const schema = zod.object({
          appName: zod.string(),
          ethAddress: zod.string().regex(/^0x[a-fA-F0-9]{40}$/),
          msg: zod
            .union([zod.string().length(0), zod.string().max(1000)])
            .optional()
            .transform((e) => (e === undefined ? "" : e)),
        });
        const safeParse = schema.safeParse(await request.json());

        if (!safeParse.success) {
          const response = { success: false, error: safeParse.error };
          console.log("Invalid request", response);
          return new Response(JSON.stringify(response), { status: 400 });
        }

        const { appName, ethAddress, msg } = safeParse.data;

        // Check if the provided API key is valid
        if (apiKeys[providedApiKey] !== appName) {
          console.log(`Invalid API key from ${ipAddress}: `, providedApiKey);
          return new Response("Invalid API key", { status: 401 });
        }

        await env.DB.prepare(
          "INSERT INTO Blocks (ip, address, app_name, msg) VALUES (?, ?, ?, ?)"
        )
          .bind(ipAddress, appName, ethAddress, msg)
          .run();

        response = new Response("Data stored successfully", { status: 200 });
      } else if (method === "GET") {
        // Check if the provided API key is valid
        if (!apiKeys[providedApiKey]) {
          console.log(`Invalid API key from ${ipAddress}: `, providedApiKey);
          return new Response("Invalid API key", { status: 401 });
        }
        
        const { results } = await env.DB.prepare("SELECT * FROM Blocks").all();
        response = Response.json(results);
      } else {
        response = new Response("Method not allowed", { status: 405 });
      }
    } else {
      // Any other path returns a 404
      response = new Response("Page not found", { status: 404 });
    }

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    return response;
  },
};

const getApiKeys = async (env: Env) => {
  const { results } = await env.DB.prepare("SELECT * FROM ApiKeys").all();

  const keys = results.reduce((acc, obj) => {
    acc[obj.api_key] = obj.app_name;
    return acc;
  }, {});

  return keys;
};

//
// CORS handling
//

// Reference: https://developers.cloudflare.com/workers/examples/cors-header-proxy
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get(
        "Access-Control-Request-Headers"
      ),
    };
    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    });
  }
}
