---
name: OpenAPI numeric fields
description: Compatibility note for generated Zod schemas in this workspace.
---

When defining count, progress, percentage, or duration fields in `lib/api-spec/openapi.yaml`, prefer `type: number` over `type: integer` with the current workspace dependencies.

**Why:** The installed generated-schema toolchain emits `zod.int()` for OpenAPI integer fields, but the workspace's installed Zod version does not expose that helper, causing library typechecking to fail after codegen.

**How to apply:** Use numeric fields at the API boundary and keep integer-like values in application logic where needed. If the dependency versions are intentionally upgraded together later, re-evaluate this constraint.