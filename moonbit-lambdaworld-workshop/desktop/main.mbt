///|
async fn main {
  let database = @store.Store::open(
    @env.get_env_var("TODO_DB").unwrap_or("desktop.db"),
  )
  defer database.close()
  @proton.asset("TodoList", "frontend/dist/index.html", width=640, height=600)
  ..config(@proton.load_config())
  ..commands(fn(registrar) raise {
    registrar.bind(@shared.todos, (_context, action) => database.execute(action))
  })
  .run_or_abort()
}
