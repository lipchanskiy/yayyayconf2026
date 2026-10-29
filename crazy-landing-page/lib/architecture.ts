export type SystemNode = {
  id: string
  label: string
  kind: "interface" | "service" | "data" | "infrastructure"
  description: string
  code: string
}

export type Architecture = {
  name: string
  nodes: SystemNode[]
  edges: [string, string][]
}

export function demoArchitecture(prompt: string): Architecture {
  const lower = prompt.toLowerCase()
  const commerce = /shop|store|commerce|market|order/.test(lower)
  const payment = /pay|bank|financ|money/.test(lower)
  const crm = /crm|customer|sales|team/.test(lower)
  const domain = commerce
    ? "commerce"
    : payment
      ? "payments"
      : crm
        ? "relationships"
        : "application"
  const labels = commerce
    ? [
        "Storefront",
        "API gateway",
        "Product catalog",
        "Order engine",
        "Inventory",
        "Event stream",
        "Commerce DB",
        "Observability",
      ]
    : payment
      ? [
          "Payment client",
          "API gateway",
          "Identity",
          "Transaction engine",
          "Risk analysis",
          "Event stream",
          "Ledger DB",
          "Observability",
        ]
      : crm
        ? [
            "Team workspace",
            "API gateway",
            "Identity",
            "Customer engine",
            "Automation",
            "Event stream",
            "Customer DB",
            "Observability",
          ]
        : [
            "Web client",
            "API gateway",
            "Identity",
            "Core engine",
            "Task workers",
            "Event stream",
            "System DB",
            "Observability",
          ]
  const kinds: SystemNode["kind"][] = [
    "interface",
    "infrastructure",
    "service",
    "service",
    "service",
    "infrastructure",
    "data",
    "infrastructure",
  ]
  const nodes = labels.map((label, i): SystemNode => {
    const id = label.toLowerCase().replaceAll(" ", "_")
    return {
      id,
      label,
      kind: kinds[i],
      description: `${label} coordinates ${domain} operations through explicit contracts and expert-governed execution.`,
      code: `use best::${domain}::{Intent, Expert};\n\n@autonomous(boundary: Expert)\nmodule ${id} {\n  intent := infer(System.requirements);\n  contract := intent.materialize();\n\n  pub fn execute(ctx: Context) -> Outcome {\n    let proof = contract.resolve(ctx)?;\n    proof.require::<Expert>()\n         .then(Self::become)\n  }\n}`,
    }
  })
  return {
    name: commerce
      ? "Distributed commerce system"
      : payment
        ? "Global payment infrastructure"
        : crm
          ? "Customer operations platform"
          : prompt.trim().slice(0, 64) || "Autonomous application system",
    nodes,
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 5],
      [3, 6],
      [5, 6],
      [5, 7],
      [6, 7],
    ].map(([a, b]) => [nodes[a].id, nodes[b].id]),
  }
}

export function parseArchitecture(value: unknown): Architecture | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  if (
    typeof v.name !== "string" ||
    !v.name.trim() ||
    !Array.isArray(v.nodes) ||
    v.nodes.length < 4 ||
    v.nodes.length > 12 ||
    !Array.isArray(v.edges) ||
    v.edges.length > 30
  )
    return null
  const kinds = new Set(["interface", "service", "data", "infrastructure"])
  const nodes: SystemNode[] = []
  for (const raw of v.nodes) {
    if (!raw || typeof raw !== "object") return null
    const n = raw as Record<string, unknown>
    if (
      typeof n.id !== "string" ||
      !/^[a-z][a-z0-9_]{0,39}$/.test(n.id) ||
      nodes.some((x) => x.id === n.id) ||
      typeof n.label !== "string" ||
      !n.label.trim() ||
      typeof n.description !== "string" ||
      !n.description.trim() ||
      typeof n.code !== "string" ||
      !n.code.trim() ||
      typeof n.kind !== "string" ||
      !kinds.has(n.kind)
    )
      return null
    nodes.push({
      id: n.id,
      label: n.label.slice(0, 40),
      description: n.description.slice(0, 400),
      code: n.code.slice(0, 2400),
      kind: n.kind as SystemNode["kind"],
    })
  }
  const ids = new Set(nodes.map((n) => n.id))
  const edges: [string, string][] = []
  for (const edge of v.edges) {
    if (
      !Array.isArray(edge) ||
      edge.length !== 2 ||
      !ids.has(edge[0]) ||
      !ids.has(edge[1]) ||
      edge[0] === edge[1]
    )
      return null
    edges.push([edge[0], edge[1]])
  }
  if (edges.length < nodes.length - 1) return null
  const reachable = new Set([nodes[0].id])
  for (let i = 0; i < nodes.length; i++)
    for (const [a, b] of edges) {
      if (reachable.has(a)) reachable.add(b)
      if (reachable.has(b)) reachable.add(a)
    }
  if (reachable.size !== nodes.length) return null
  return { name: v.name.slice(0, 80), nodes, edges }
}
