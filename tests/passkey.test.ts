import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";

const requests: { method?: string; url?: string; body: string }[] = [];
const required = {
  status: "required",
  source: "notification",
  challenge: { challenge: "abc", rpId: "whatsapp.com", allowCredentials: [] },
  origin: "https://web.whatsapp.com",
};
const http = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  requests.push({ method: req.method, url: req.url, body });
  const json = (status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  if (req.url === "/session/qr" || req.url === "/session/qr/text") {
    json(409, { status: 409, detail: "passkey verification pending" });
  } else if (req.url === "/session/passkey" && req.method === "GET") {
    json(200, required);
  } else if (req.url === "/session/passkey/request") {
    json(200, { ...required, source: "requested" });
  } else if (req.url === "/session/passkey" && req.method === "POST") {
    json(200, { status: "submitted" });
  } else if (req.url === "/session/passkey/confirm") {
    res.writeHead(204);
    res.end();
  } else if (req.url === "/groups") {
    json(200, { id: "123@g.us" });
  } else {
    json(404, { status: 404, detail: "not found" });
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
const session = await import("../src/tools/session.js");
const { createGroup } = await import("../src/tools/groups.js");
const { handleError, getUserFriendlyMessage } =
  await import("../src/utils/errors.js");
after(() => {
  http.closeAllConnections();
  http.close();
});

const assertion = {
  id: "cred",
  rawId: "cred",
  type: "public-key",
  response: {
    clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0In0",
    authenticatorData: "auth",
    signature: "sig",
    userHandle: null,
  },
  authenticatorAttachment: "platform",
  clientExtensionResults: {},
};

test("passkey state is read and carries a next step", async () => {
  const result = await session.getPasskeyState.handler({});
  assert.equal(result.passkey.status, "required");
  assert.match(result.nextStep, /web\.whatsapp\.com/);
  assert.deepEqual(requests.at(-1), {
    method: "GET",
    url: "/session/passkey",
    body: "",
  });
});

test("requesting a challenge posts to /session/passkey/request", async () => {
  const result = await session.requestPasskeyChallenge.handler({});
  assert.equal(result.passkey.source, "requested");
  assert.equal(requests.at(-1)?.method, "POST");
  assert.equal(requests.at(-1)?.url, "/session/passkey/request");
});

test("the assertion object is forwarded unchanged as the body", async () => {
  const result = await session.submitPasskey.handler({ assertion });
  assert.equal(result.passkey.status, "submitted");
  assert.equal(requests.at(-1)?.url, "/session/passkey");
  assert.deepEqual(JSON.parse(requests.at(-1)!.body), assertion);
});

test("an assertion passed as a JSON string is accepted", async () => {
  await session.submitPasskey.handler({ assertion: JSON.stringify(assertion) });
  assert.deepEqual(JSON.parse(requests.at(-1)!.body), assertion);
});

test("an assertion without a signature is rejected locally", async () => {
  const count = requests.length;
  await assert.rejects(
    session.submitPasskey.handler({
      assertion: { rawId: "cred", response: { clientDataJSON: "x" } },
    }),
    /signature/,
  );
  assert.equal(requests.length, count);
});

test("confirm accepts a 204", async () => {
  const result = await session.confirmPasskey.handler({});
  assert.equal(result.success, true);
  assert.equal(requests.at(-1)?.url, "/session/passkey/confirm");
});

test("409 from the QR endpoints surfaces as PASSKEY_PENDING", async () => {
  for (const tool of [session.getQRCode, session.getQRCodeImage]) {
    const error = handleError(
      await tool.handler({}).then(
        () => assert.fail("expected 409"),
        (e: unknown) => e,
      ),
    );
    assert.equal(error.code, "PASSKEY_PENDING");
    assert.equal(error.statusCode, 409);
    assert.match(getUserFriendlyMessage(error), /whatsapp_get_passkey_state/);
  }
});

test("a group can be created without participants", async () => {
  const result = await createGroup.handler({ name: "Solo" });
  assert.equal(result.groupId, "123@g.us");
  assert.deepEqual(JSON.parse(requests.at(-1)!.body), { name: "Solo" });
  await createGroup.handler({ name: "Empty", participants: [] });
  assert.deepEqual(JSON.parse(requests.at(-1)!.body), {
    name: "Empty",
    participants: [],
  });
});
