import { test } from "node:test";
import assert from "node:assert/strict";

process.env.WSAPI_API_KEY ??= "test-key";
process.env.WSAPI_INSTANCE_ID ??= "test-instance";

const modules = await Promise.all([
  import("../src/tools/messaging.js"),
  import("../src/tools/messaging-advanced.js"),
  import("../src/tools/contacts.js"),
  import("../src/tools/groups.js"),
  import("../src/tools/chats.js"),
  import("../src/tools/session.js"),
  import("../src/tools/users.js"),
  import("../src/tools/communities.js"),
  import("../src/tools/newsletters.js"),
  import("../src/tools/status.js"),
  import("../src/tools/calls.js"),
  import("../src/tools/media.js"),
]);

type Tool = {
  name: string;
  description: string;
  annotations?: Record<string, boolean>;
};
// Some tools are exported from more than one group; the server keys them by name.
const byName = new Map<string, Tool>();
const all: Tool[] = modules.flatMap((m) =>
  Object.values(m)
    .filter((v) => v && typeof v === "object" && !("name" in v))
    .flatMap((group) => Object.values(group as Record<string, Tool>)),
);
for (const tool of all) byName.set(tool.name, tool);
const tools = [...byName.values()];

test("every tool is described and annotated", () => {
  assert.equal(tools.length, 101);
  for (const tool of tools) {
    assert.ok(tool.annotations, `${tool.name} has no annotations`);
    assert.equal(tool.annotations.openWorldHint, true, tool.name);
    // A one-line "Do X." is what scored C on Glama; each needs effect and return.
    assert.ok(
      tool.description.length >= 80,
      `${tool.name} description too short`,
    );
    assert.match(
      tool.description,
      /Returns /,
      `${tool.name} does not say what it returns`,
    );
  }
});

test("read-only tools are never marked destructive", () => {
  for (const tool of tools) {
    if (tool.annotations?.readOnlyHint) {
      assert.notEqual(tool.annotations.destructiveHint, true, tool.name);
    }
  }
});
