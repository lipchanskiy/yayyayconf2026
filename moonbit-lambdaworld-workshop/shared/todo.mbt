///|
pub(all) struct Todo {
  id : Int64
  title : String
  completed : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub extend Todo with Eq::{equal, not_equal}

///|
pub extend Todo with Debug::{to_repr}

///|
pub extend Todo with ToJson::{to_json}

///|
pub extend Todo with FromJson::{from_json}

///|
// Both HTTP and desktop IPC carry the same request and response types.
pub(all) enum Action {
  List
  Add(String)
  SetCompleted(Int64, Bool)
  // TODO(exercise-delete): Add an action carrying the ID of the todo to delete.
  Delete(Int64)
} derive(ToJson, FromJson)

///|
pub extend Action with ToJson::{to_json}

///|
pub extend Action with FromJson::{from_json}

///|
pub(all) struct Snapshot {
  todos : Array[Todo]
} derive(Eq, ToJson, FromJson)

///|
pub extend Snapshot with Eq::{equal, not_equal}

///|
pub extend Snapshot with ToJson::{to_json}

///|
pub extend Snapshot with FromJson::{from_json}

///|
pub let todos : @contract.Command[Action, Snapshot] = @contract.command("todos")
