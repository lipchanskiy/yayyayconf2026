///|
extern "js" fn is_desktop() -> Bool =
  #| () => typeof globalThis.__MoonBit__?.core?.invokeJson === "function"

///|
fn request(action : @shared.Action, emit : @rabbita.Emit[Msg]) -> @rabbita.Cmd {
  let added = action is Add(_)
  if is_desktop() {
    @desktop.invoke(
      @shared.todos,
      action,
      snapshot => emit(Received(added, Ok(snapshot))),
      error => emit(Received(added, Err(error))),
    )
  } else {
    @http.post("/api/todos")
    .with_json(action)
    .expect_json(emit.map(result => Received(added, result)))
  }
}
