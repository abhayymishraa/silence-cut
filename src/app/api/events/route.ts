import { NextRequest } from "next/server";
import { globalEventEmitter } from "~/lib/eventEmitter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Store active clients with their write functions
const activeClients = new Map<string, (data: string) => void>();

export async function GET(req: NextRequest) {
  const clientId = Math.random().toString(36).substring(7);
  
  console.log(`[SSE] Client ${clientId} connecting...`);

  // Create a transform stream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Helper to write SSE messages
  const writeSSE = (data: string) => {
    try {
      writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch (error) {
      console.error(`[SSE] Error writing to client ${clientId}:`, error);
      cleanup();
    }
  };

  // Store this client
  activeClients.set(clientId, writeSSE);
  console.log(`[SSE] Client ${clientId} connected. Total clients: ${activeClients.size}`);

  // Send initial connection message
  writeSSE(JSON.stringify({ type: "connected", clientId }));

  // Event handler for job updates
  const handleJobUpdate = (data: any) => {
    console.log(`[SSE] Broadcasting job update to client ${clientId}`);
    writeSSE(JSON.stringify(data));
  };

  // Register event listener
  globalEventEmitter.on("job_update", handleJobUpdate);
  console.log(`[SSE] Client ${clientId} connected. Total listeners: ${globalEventEmitter.listenerCount("job_update")}`);

  // Keep the connection alive with a ping every 15 seconds
  const pingInterval = setInterval(() => {
    writeSSE(JSON.stringify({ type: "ping" }));
  }, 15000);

  // Cleanup function
  const cleanup = () => {
    console.log(`[SSE] Client ${clientId} disconnecting...`);
    clearInterval(pingInterval);
    globalEventEmitter.off("job_update", handleJobUpdate);
    activeClients.delete(clientId);
    console.log(`[SSE] Client ${clientId} disconnected. Total clients: ${activeClients.size}`);
    try {
      writer.close();
    } catch (e) {
      // Ignore close errors
    }
  };

  // Clean up on disconnect
  req.signal.addEventListener("abort", cleanup);

  // Return the SSE stream
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// Helper to get active connection count
export function getActiveConnectionCount(): number {
  return activeClients.size;
}
