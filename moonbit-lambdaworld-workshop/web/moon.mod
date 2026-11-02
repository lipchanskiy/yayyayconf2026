name = "workshop/todo_web"

version = "0.1.0"

import {
  "workshop/todo_shared@0.1.0",
  "moonbitlang/moonback@0.8.9",
  "moonbitlang/async@0.22.5",
}

options(
  preferred_target: "wasm",
  supported_targets: "wasm+native",
)
