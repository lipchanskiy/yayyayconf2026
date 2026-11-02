# MoonBit TodoList workshop

A full-stack MoonBit project from the Lambda World workshops at Yay-Yay Conf
2026, based on the [original workshop repository](https://github.com/Milky2018/moonbit-lambdaworld-workshop).

A minimal application with four MoonBit modules, one Rabbita frontend, and
SQLite persistence. It supports adding, completing, and deleting todos in both
web and desktop versions. This copy includes the completed
[delete exercise](EXERCISE.md) and frontend customizations. In the original
repository, `main` is the exercise starter and `exercise` contains the solution;
those branches are not part of this collection.

```text
moon.work
shared/             Todo, Action, Snapshot, and the typed desktop command
  store/            SQLite schema and operations, shared by both backends
frontend/           Rabbita model, update, view, and transport selection
web/                MoonBack HTTP endpoint and static files
desktop/            Proton window and IPC command binding
```

`shared` is a module; `shared/store` is a package within that module. Browser
code imports the shared types without importing SQLite. Workspace members resolve
the local application modules; all third-party dependencies come from Mooncakes.

## Requirements

- MoonBit toolchain and `moonx` (tested with `moon 0.1.20261023`).
- A native C/C++ toolchain for the native backend and desktop runtime.
- The Proton CEF runtime for desktop development.

Run commands from this directory:

```sh
moon update
make setup
```

`make setup` installs the published `moonbit-community/warren@0.4.5` CLI in
`.tools/bin`. The Makefile adds that directory to `PATH` for its commands.
Warren is a native tool; it is installed with `moon install` rather than `moonx`.
SQLite's native library is bundled by the SQLite dependency.

## Run the web app

```sh
make web-wasm
# Or:
make web-native
```

Open <http://127.0.0.1:3000>. Both commands first build the frontend, then run
the same MoonBack backend with the selected target. Both persist to `web.db`.
Run one backend at a time on the default port.

```sh
TODO_ADDR=127.0.0.1:3001 TODO_DB=another.db make web-native
```

The `wasm` target uses **moonrun**, which provides SQLite and asynchronous I/O
host imports. This backend is not a standalone browser Wasm program. The UI
uses the `js` target in both web and desktop modes.

## Run the desktop app

Install the CEF runtime once, then start development:

```sh
moonx moonbit-community/proton_cli@0.6.0 cef setup
make desktop
```

The published Proton CLI starts Warren and the native backend, opens a desktop
window, and reloads changes during development. Todos persist to `desktop.db`.
Use `TODO_DB` to choose another database file.

The desktop backend uses Proton's native runtime. The shared SQLite store and
the web backend support **both `wasm` and `native`**; the desktop window itself
requires `native`.

## Follow a request

1. `frontend/view.mbt` emits a message for a user action.
2. `model.mbt` updates UI state and returns a command.
3. `transport.mbt` sends the shared `Action` through HTTP or Proton IPC.
4. The backend delegates to `shared/store`, which binds SQL parameters, performs
   the operation, and returns a fresh `Snapshot`.
5. The frontend renders that snapshot. Refresh reads the current database again.

The web endpoint is `POST /api/todos`. For example:

```sh
curl http://127.0.0.1:3000/api/todos \
  -H 'Content-Type: application/json' -d '["Add","Learn MoonBit"]'
curl http://127.0.0.1:3000/api/todos \
  -H 'Content-Type: application/json' -d '"List"'
```

MoonBit derives JSON encoding for `Action` and `Snapshot`. `Int64` IDs are
encoded as JSON strings. The desktop command uses exactly the same types.
`proton_rabbita.invoke` integrates IPC callbacks with Rabbita's update loop.

The UI disables writes while a request is pending. Empty titles are rejected;
failed requests preserve the draft and show an error. A failed write response
does not prove the write failed: use Refresh to check before retrying. Multiple
windows do not synchronize automatically; each reads on startup, after its own
write, or when Refresh is pressed. There is no authentication or deployment setup.

## Check and test

```sh
make check
make test
moon build --target js,wasm,native
moon fmt --check
```

Tests exercise shared JSON round trips, SQLite create/complete/delete operations,
title validation, and SQL parameter binding. The protocol runs on JS, Wasm, and
native; SQLite tests run on Wasm and native.

Dependencies are pinned in each `moon.mod`: Rabbita `0.17.0`, MoonBack `0.8.9`,
Proton `0.6.0`, SQLite `0.2.3`, and async `0.22.5`. Async `0.22.6` requires a
newer core API than the toolchain used here.

Upstream: [Rabbita](https://github.com/moonbit-community/rabbita),
[MoonBack](https://github.com/moonbitlang/moonback),
[Proton](https://github.com/moonbit-community/proton),
[SQLite bindings](https://github.com/moonbit-community/sqlite3.mbt).
