import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";

const bytes = Buffer.from([0, 255, 137, 80, 78, 71, 13, 10]);
const requests: { url?: string; key?: string; instance?: string }[] = [];
const http = createServer((req, res) => {
  requests.push({
    url: req.url,
    key: req.headers["x-api-key"] as string,
    instance: req.headers["x-instance-id"] as string,
  });
  if (req.url?.startsWith("/media/download")) {
    res.writeHead(200, { "Content-Type": "application/octet-stream" });
    res.end(bytes);
  } else if (req.url === "/session/qr") {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(bytes);
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ code: "qr-text" }));
  }
});
http.listen(0, "127.0.0.1");
await once(http, "listening");
const address = http.address();
assert.ok(address && typeof address !== "string");
process.env.WSAPI_API_KEY = "test-key";
process.env.WSAPI_INSTANCE_ID = "test-instance";
process.env.WSAPI_BASE_URL = "http://127.0.0.1:" + address.port;
process.env.LOG_LEVEL = "error";
process.env.NODE_ENV = "test";
const { getQRCodeImage, getQRCode } = await import("../src/tools/session.js");
const { downloadMedia } = await import("../src/tools/media.js");
after(() => {
  http.closeAllConnections();
  http.close();
});

test("QR image is an MCP image with exact binary bytes", async () => {
  const result = await getQRCodeImage.handler({});
  assert.equal(result.content[0].type, "image");
  assert.equal(result.content[0].mimeType, "image/png");
  assert.deepEqual(Buffer.from(result.content[0].data, "base64"), bytes);
  assert.deepEqual(requests.at(-1), {
    url: "/session/qr",
    key: "test-key",
    instance: "test-instance",
  });
});
test("media is an MCP embedded binary resource and its id is encoded", async () => {
  const result = await downloadMedia.handler({ id: "a+/=&" });
  const resource = result.content[0].resource;
  assert.equal(result.content[0].type, "resource");
  assert.equal(resource.mimeType, "application/octet-stream");
  assert.deepEqual(Buffer.from(resource.blob, "base64"), bytes);
  assert.equal(resource.uri, "wsapi://media/a%2B%2F%3D%26");
  assert.equal(requests.at(-1)?.url, "/media/download?id=a%2B%2F%3D%26");
});
test("text QR continues to use JSON", async () => {
  const result = await getQRCode.handler({});
  assert.equal(result.qrCode.code, "qr-text");
});

test("stdio negotiation, full catalog and binary tool calls work end to end", async () => {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } =
    await import("@modelcontextprotocol/sdk/client/stdio.js");
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", "src/index.ts"],
    env: {
      PATH: process.env.PATH || "",
      WSAPI_API_KEY: "test-key",
      WSAPI_INSTANCE_ID: "test-instance",
      WSAPI_BASE_URL: process.env.WSAPI_BASE_URL!,
      WSAPI_ENABLED_CATEGORIES: "",
      WSAPI_ENABLED_TOOLS: "",
      LOG_LEVEL: "error",
      NODE_ENV: "test",
    },
    stderr: "pipe",
  });
  const client = new Client({ name: "contract-test", version: "1.0.0" });
  try {
    await client.connect(transport);
    const catalog = await client.listTools();
    assert.equal(catalog.tools.length, 101);
    assert.equal(new Set(catalog.tools.map((t) => t.name)).size, 101);
    const qr = await client.callTool({
      name: "whatsapp_get_qr_code_image",
      arguments: {},
    });
    const content = qr.content as { type: string; data: string }[];
    assert.equal(content[0].type, "image");
    assert.deepEqual(Buffer.from(content[0].data, "base64"), bytes);
    const media = await client.callTool({
      name: "whatsapp_download_media",
      arguments: { id: "sample" },
    });
    assert.equal((media.content as { type: string }[])[0].type, "resource");
  } finally {
    await client.close();
  }
});
