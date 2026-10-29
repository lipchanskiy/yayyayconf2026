import type { Architecture } from "@/lib/architecture"

/** A standard, uncompressed POSIX tar. No dependency or server upload required. */
export function createSystemArchive(
  architecture: Architecture,
  prompt: string,
  mode: string | null
) {
  const encoder = new TextEncoder()
  const root = "bestlang-system"
  const files = [
    {
      name: "README.md",
      content: `# ${architecture.name}\n\nOnly a programmer can download and run this system.\n\n## What you downloaded\n\nAn architecture and source bundle from the fictional BestLang language preview.\nThese .best files are illustrative source, not executable applications.\nThere is no released BestLang compiler or runtime. Passing the site's programmer\ncheck is part of the experience, not a professional certification.\n\n## Your intent\n\n${prompt}\n\n## Contents\n\n- architecture.json: module descriptions, dependency edges, and generation metadata.\n- src/: the exact BestLang modules shown in your system inspector.\n- RUNBOOK.md: instructions for the essential human dependency.\n\nGenerated using: ${mode === "live" ? "DeepSeek" : "local demonstration"}.\n`,
    },
    {
      name: "RUNBOOK.md",
      content:
        "# Human execution boundary\n\nSTATUS: GENERATED\nDEPENDENCY: Programmer\nAUTOMATION: Exhausted\n\n1. Read architecture.json and inspect every module in src/.\n2. Resolve the requirements, contracts, data model, and operational trade-offs.\n3. Implement the design in a real programming language and runtime.\n4. Review, test, configure, and deploy that implementation yourself.\n\nThere is no install or run command for this fictional syntax. The archive cannot\nexecute a system. No commands, external dependencies, or credentials are included.\n\nThe code wrote itself. The rest is your department.\n",
    },
    {
      name: "architecture.json",
      content:
        JSON.stringify(
          {
            format: "bestlang-architecture/0.0.1",
            generatedAt: new Date().toISOString(),
            generation: mode || "demo",
            intent: prompt,
            ...architecture,
          },
          null,
          2
        ) + "\n",
    },
    ...architecture.nodes.map((node) => ({
      name: `src/${node.id}.best`,
      content: node.code + "\n",
    })),
  ]
  const chunks: Uint8Array[] = []
  for (const file of files) {
    const body = encoder.encode(file.content)
    const header = new Uint8Array(512)
    const write = (offset: number, size: number, value: string) =>
      header.set(encoder.encode(value).subarray(0, size), offset)
    const octal = (value: number, size: number) =>
      value.toString(8).padStart(size - 1, "0") + "\0"
    write(0, 100, `${root}/${file.name}`)
    write(100, 8, octal(0o644, 8))
    write(108, 8, octal(0, 8))
    write(116, 8, octal(0, 8))
    write(124, 12, octal(body.length, 12))
    write(136, 12, octal(Math.floor(Date.now() / 1000), 12))
    write(148, 8, "        ")
    write(156, 1, "0")
    write(257, 6, "ustar\0")
    write(263, 2, "00")
    write(265, 32, "bestlang")
    const checksum = header.reduce((sum, byte) => sum + byte, 0)
    write(148, 8, checksum.toString(8).padStart(6, "0") + "\0 ")
    chunks.push(header, body, new Uint8Array((512 - (body.length % 512)) % 512))
  }
  chunks.push(new Uint8Array(1024))
  const bytes = new Uint8Array(
    chunks.reduce((size, chunk) => size + chunk.length, 0)
  )
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return new Blob([bytes.buffer], { type: "application/x-tar" })
}
