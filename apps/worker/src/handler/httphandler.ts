export interface HttpHandler {
  url: "string";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}
export async function httphandler(data: HttpHandler): Promise<void> {
  const timeout = data.timeout ?? 10_000;
  const controller = new AbortController();

  const clearTimeOut = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = fetch(data.url, {
      method: data.method,
      headers: {
        "Content-type": "application/json",
        ...data.headers,
      },
      body:
        data.method === "GET"
          ? undefined
          : data.body
            ? JSON.stringify(data.body)
            : undefined,
      signal: controller.signal,
    });
  } catch (error) {}
}
