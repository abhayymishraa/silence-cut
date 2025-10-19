"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            
            // Add workspace headers from DOM meta tags (set by middleware)
            if (typeof document !== "undefined") {
              const workspaceId = document.querySelector('meta[name="x-workspace-id"]')?.getAttribute('content');
              const workspaceSlug = document.querySelector('meta[name="x-workspace-slug"]')?.getAttribute('content');
              const workspaceName = document.querySelector('meta[name="x-workspace-name"]')?.getAttribute('content');
              const workspaceColor = document.querySelector('meta[name="x-workspace-color"]')?.getAttribute('content');
              const workspaceLogo = document.querySelector('meta[name="x-workspace-logo"]')?.getAttribute('content');
              
              // Always set a default workspace ID if none is found
              if (workspaceId) {
                console.log("Using workspace ID from meta tag:", workspaceId);
                headers.set("x-workspace-id", workspaceId);
              } else {
                console.log("Using default workspace ID");
                headers.set("x-workspace-id", "default");
              }
              
              if (workspaceSlug) headers.set("x-workspace-slug", workspaceSlug);
              if (workspaceName) headers.set("x-workspace-name", workspaceName);
              if (workspaceColor) headers.set("x-workspace-color", workspaceColor);
              if (workspaceLogo) headers.set("x-workspace-logo", workspaceLogo);
              
              // Log the headers being sent
              console.log("tRPC headers:", {
                "x-workspace-id": headers.get("x-workspace-id"),
                "x-workspace-slug": headers.get("x-workspace-slug"),
              });
            }
            
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
