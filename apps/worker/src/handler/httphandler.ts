export interface HttpHandler {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
}

export interface HttpHandlerResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export async function httphandler(
  data: HttpHandler,
  timeoutMs = 30_000,
): Promise<HttpHandlerResult> {
  if (!data.url) {
    throw new Error("HTTP request URL is required");
  }

  if (!data.method) {
    throw new Error("HTTP request method is required");
  }

  if (timeoutMs <= 0) {
    throw new Error("HTTP request timeout must be greater than 0");
  }

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(data.url, {
      method: data.method,

      headers: {
        "Content-Type": "application/json",
        ...data.headers,
      },

      body:
        data.method === "GET" || data.method === "DELETE"
          ? undefined
          : data.body !== undefined
            ? JSON.stringify(data.body)
            : undefined,

      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";

    let responseBody: unknown;

    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    const responseHeaders: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    if (!response.ok) {
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText}`,
      );
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`HTTP request timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
