///|
struct Model {
  draft : String
  todos : Array[@shared.Todo]
  busy : Bool
  error : String
} derive(Eq)

///|
enum Msg {
  DraftChanged(String)
  Add
  Run(@shared.Action)
  Received(Bool, Result[@shared.Snapshot, Error])
}

///|
fn update(
  model : Model,
  msg : Msg,
  emit : @rabbita.Emit[Msg],
) -> (Model, @rabbita.Cmd) {
  match msg {
    DraftChanged(draft) => ({ ..model, draft, }, @rabbita.none)
    Add | Run(_) if model.busy => (model, @rabbita.none)
    Add if model.draft.trim() == "" => (model, @rabbita.none)
    Add =>
      ({ ..model, busy: true, error: "", }, request(Add(model.draft), emit))
    Run(action) => ({ ..model, busy: true, error: "", }, request(action, emit))
    Received(added, Ok(snapshot)) =>
      (
        {
          draft: if added {
            ""
          } else {
            model.draft
          },
          todos: snapshot.todos,
          busy: false,
          error: "",
        },
        @rabbita.none,
      )
    Received(_, Err(error)) =>
      ({ ..model, busy: false, error: error.to_string(), }, @rabbita.none)
  }
}
