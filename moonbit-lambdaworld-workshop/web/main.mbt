///|
async fn main {
  let database = @store.Store::open(
    @env.get_env_var("TODO_DB").unwrap_or("web.db"),
  )
  defer database.close()
  let address = @env.get_env_var("TODO_ADDR").unwrap_or("127.0.0.1:3000")
  let server = @http.Server(@socket.Addr::parse(address))
  defer server.close()
  let app = @moonback.App(ctx => {
    ctx.post("/api/todos", (request, response) => {
      let action : @shared.Action = @json.from_json(request.body.json()) catch {
        _ => {
          response.send_json({ "error": "Invalid todo action" }, status=400)
          return
        }
      }
      try {
        let snapshot = database.execute(action)
        response.send_json(snapshot.to_json())
      } catch {
        @store.EmptyTitle =>
          response.send_json({ "error": "Title must not be empty" }, status=400)
        error => raise error
      }
    })
    ctx.add_middleware(
      @static.new(root="frontend/dist", rewrite_trailing_slash_index=true),
    )
  })
  defer app.close()
  println("TodoList: http://\{address}")
  app.serve(server)
}
