///|
test "the same JSON protocol works across HTTP and IPC" {
  let actions : Array[@shared.Action] = [
    List,
    Add("Learn MoonBit"),
    SetCompleted(42L, true),
  ]
  for action in actions {
    let decoded : @shared.Action = @json.from_json(action.to_json())
    assert_eq(decoded.to_json(), action.to_json())
  }
  let snapshot : @shared.Snapshot = {
    todos: [{ id: 42L, title: "Learn MoonBit", completed: true, }],
  }
  let decoded : @shared.Snapshot = @json.from_json(snapshot.to_json())
  assert_eq(snapshot.todos, decoded.todos)
}

///|
test "delete action round trips through the shared JSON protocol" {
  let request : Json = ["Delete", "42"]
  let action : @shared.Action = @json.from_json(request)
  assert_eq(action.to_json(), request)
}
