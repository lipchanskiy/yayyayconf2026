///|
pub(all) suberror InvalidTodo {
  EmptyTitle
}

///|
pub struct Store {
  db : @sqlite3.Connection
}

///|
pub fn Store::open(path : String) -> Store raise {
  let db = @sqlite3.Connection::open(path)
  errdefer db.close()
  let schema = db.prepare(
    "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0)",
  )
  defer schema.finalize()
  schema.step() |> ignore
  { db, }
}

///|
pub fn Store::close(self : Store) -> Unit raise {
  self.db.close()
}

///|
pub fn Store::execute(
  self : Store,
  action : @shared.Action,
) -> @shared.Snapshot raise {
  match action {
    List => ()
    Add(title) => {
      let title = title.trim().to_owned()
      guard title != "" else { raise EmptyTitle }
      let statement = self.db.prepare("INSERT INTO todos (title) VALUES (?)")
      defer statement.finalize()
      statement.bind(index=1, title)
      statement.step() |> ignore
    }
    SetCompleted(id, completed) => {
      let statement = self.db.prepare(
        "UPDATE todos SET completed = ? WHERE id = ?",
      )
      defer statement.finalize()
      statement.bind(index=1, if completed { 1 } else { 0 })
      statement.bind(index=2, id)
      statement.step() |> ignore
    }
    // TODO(exercise-delete): Handle the deletion action with a bound SQL parameter.
    Delete(id) => {
      let statement = self.db.prepare("DELETE FROM todos WHERE id = ?")
      defer statement.finalize()
      statement.bind(index=1, id)
      statement.step() |> ignore
    }
  }
  let query = self.db.prepare(
    "SELECT id, title, completed FROM todos ORDER BY id",
  )
  defer query.finalize()
  let todos : Array[@shared.Todo] = []
  while query.step() {
    let completed : Int64 = query.column(index=2)
    todos.push({
      id: query.column(index=0),
      title: query.column(index=1),
      completed: completed != 0L,
    })
  }
  { todos, }
}
