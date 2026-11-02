# Exercise: delete a todo across web and desktop

This copy already includes the completed exercise. The instructions below describe
the original task; branch names refer to the
[upstream workshop repository](https://github.com/Milky2018/moonbit-lambdaworld-workshop).

The app already adds and completes todos. Restore deletion by filling in the three
`TODO(exercise-delete)` markers. Use the same frontend and shared SQLite store
for both the web and desktop versions.

## 1. Follow the existing flow

Before editing, follow a completed operation from the view to the database:

```text
frontend/view.mbt
  → model.mbt → transport.mbt
    → HTTP → web/main.mbt
    → IPC  → desktop/main.mbt
      → shared/store/store.mbt → SQLite → Snapshot → frontend
```

Inspect the existing `Action` variants in `shared/todo.mbt`. Both backend entry
points decode this shared type and pass it to the shared store. The starter has
no deletion variant or corresponding store branch.

## 2. Complete the three TODOs

- In `shared/todo.mbt`, add an action carrying the selected todo's `Int64` ID.
  Its derived JSON encoding must match the deletion request in the tests.
- In `frontend/view.mbt`, connect each Delete button to the existing message
  and command flow, passing that todo's ID. Keep the `<|` view style.
- In `shared/store/store.mbt`, add the corresponding branch with a prepared SQL
  statement, bind the selected ID, execute it, and finalize the statement.
  The existing code below the match returns the updated snapshot.

Deletion must change SQLite data and preserve all other todos. Deleting an ID
that is already absent should leave the database unchanged. The existing web and
desktop entry points need no changes: both call this shared implementation.

## 3. Verify the behavior

The starter code compiles. The deletion tests describe requests as JSON so they
can compile before the deletion action exists. They initially fail while decoding
that request. After adding the action, implement its store branch to satisfy the
compiler's exhaustive match check and the database assertions. The other tests
should pass throughout.

```sh
make check
moon test shared --target js --filter '*delete*'
moon test shared/store --target wasm,native --filter '*delete*'
make test
```

The store test verifies the database operation. To verify the button wiring,
start either web backend with `make web-wasm` or `make web-native`, then:

1. Add two todos and complete one of them.
2. Delete one; verify the other keeps its title and completion state.
3. Refresh, then restart the backend and reload; the deleted todo stays absent.
4. Repeat these steps in `make desktop`.

Use separate runs for the two web targets, which use the same default port.
The web and desktop apps use separate database files by default.

## Discuss

- How does adding one shared action extend both HTTP and IPC protocols?
- Which shared code runs in JS, Wasm, and native?
- Why can one SQLite implementation serve both HTTP and IPC requests?
- Why does removing a todo only from the frontend model fail the persistence
  check?

The `main` branch is the starter. The `exercise` branch contains the complete
solution, presented as a pull request with `main` as its base. The PR diff shows
the shared protocol, frontend, and store changes needed to complete this exercise.

Use `git diff main...exercise` to inspect the answer locally, or
`git show exercise:<path>` to inspect a solution file without switching branches.
