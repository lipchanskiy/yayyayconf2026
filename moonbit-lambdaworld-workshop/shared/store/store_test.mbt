///|
test "create and complete with parameter binding" {
  let store = @store.Store::open(":memory:")
  defer store.close()
  assert_eq(store.execute(List).todos.length(), 0)
  let added = store.execute(Add("  Learn 'MoonBit'; DROP TABLE todos; --  "))
  assert_eq(added.todos.length(), 1)
  let todo = added.todos[0]
  assert_eq(todo.title, "Learn 'MoonBit'; DROP TABLE todos; --")
  assert_false(todo.completed)
  let completed = store.execute(SetCompleted(todo.id, true))
  assert_true(completed.todos[0].completed)
  let reopened = store.execute(SetCompleted(todo.id, false))
  assert_false(reopened.todos[0].completed)
}

///|
test "delete removes only the selected todo and keeps it deleted" {
  let store = @store.Store::open(":memory:")
  defer store.close()
  let kept = store.execute(Add("Keep me")).todos[0]
  let removed = store.execute(Add("Delete me")).todos[1]
  let delete : @shared.Action = @json.from_json(["Delete", Json(removed.id)])
  assert_eq(store.execute(delete).todos, [kept])
  assert_eq(store.execute(List).todos, [kept])
  assert_eq(store.execute(delete).todos, [kept])
  let delete_kept : @shared.Action = @json.from_json(["Delete", Json(kept.id)])
  assert_eq(store.execute(delete_kept).todos.length(), 0)
  let next = store.execute(Add("Next lesson")).todos[0]
  assert_true(next.id > removed.id)
}

///|
test "reject an empty title without changing stored data" {
  let store = @store.Store::open(":memory:")
  defer store.close()
  store.execute(Add("Keep me")) |> ignore
  try store.execute(Add(" \t\n ")) catch {
    @store.EmptyTitle => ()
    error => raise error
  } noraise {
    _ => fail("expected EmptyTitle")
  }
  assert_eq(store.execute(List).todos.length(), 1)
}
