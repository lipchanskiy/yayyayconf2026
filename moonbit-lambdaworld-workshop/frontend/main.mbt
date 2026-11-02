///|
fn main {
  @rabbita.new(() => {
    let (model, emit) = @rabbita.create_state_with_init(
      init=emit => {
        ({ draft: "", todos: [], busy: true, error: "", }, request(List, emit))
      },
      update~,
    )
    model.view(model => view(model, emit))
  }).mount("app")
}
