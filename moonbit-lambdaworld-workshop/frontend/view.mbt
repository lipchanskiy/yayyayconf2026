///|
using @html {button, div, form, h1, input, li, p, span, ul}

///|
fn view(model : Model, emit : @rabbita.Emit[Msg]) -> @html.Html {
  let remaining = model.todos.filter(todo => !todo.completed).length()
  div(class="todo-app") <| [
    div(class="app-header") <| [
      div <| [
        p(class="eyebrow") <| "A LITTLE MORE FOCUS",
        h1 <| "My tasks",
        p(class="subtitle") <| "Make room for what matters.",
      ],
      button(
        class="refresh-button",
        disabled=model.busy,
        on_click=emit(Run(List)),
      ) <| "Refresh",
    ],
    div(class="workspace") <| [
      form(class="add-form", on_submit=emit(Add)) <| [
        input(
          id="title",
          value=model.draft,
          placeholder="What needs doing?",
          attrs=@html.Attrs::build().aria_label("New task").disabled(model.busy),
          on_input=emit.map(value => DraftChanged(value)),
        ),
        button(
          class="add-button",
          type_="submit",
          disabled=model.busy || model.draft.trim() == "",
        ) <| "Add task",
      ],
      div(class="list-header") <| [
        p(class="list-title") <| "Your tasks",
        span(class="task-count") <| "\{remaining} of \{model.todos.length()} remaining",
      ],
      if model.todos.is_empty() {
        div(class="empty-state") <| [
          p(class="empty-title") <| (if model.busy {
            "Loading your tasks"
          } else {
            "A fresh start"
          }),
          p <| (if model.busy {
            "Your list will be ready in a moment."
          } else {
            "Add your first task and take it one step at a time."
          }),
        ]
      } else {
        ul(class="task-list") <| [
          for todo in model.todos => {
            li(
              class=if todo.completed {
                "task-row is-completed"
              } else {
                "task-row"
              },
            ) <| [
              button(
                class="toggle-button",
                disabled=model.busy,
                attrs=@html.Attrs::build()
                  .aria_label(
                    if todo.completed {
                      "Mark incomplete: " + todo.title
                    } else {
                      "Complete: " + todo.title
                    },
                  )
                  .aria_pressed(todo.completed.to_string()),
                on_click=emit(Run(SetCompleted(todo.id, !todo.completed))),
              ) <| [
                span(class="check-mark") <| "",
              ],
              span(class="task-title") <| todo.title,
              button(
                class="delete-button",
                disabled=model.busy,
                attrs=@html.Attrs::build().aria_label(
                  "Delete task: " + todo.title,
                ),
                on_click=emit(Run(Delete(todo.id))),
              ) <| "Delete",
            ]
          }
        ]
      },
      p(
        class=if model.error != "" { "status is-error" } else { "status" },
        attrs=@html.Attrs::build().role("status"),
      ) <| (if model.busy { "Updating your list..." } else { model.error }),
    ],
    p(class="footer-note") <| "One task at a time.",
  ]
}
