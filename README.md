# Yay-Yay Conf 2026 — Workshop Projects

Projects I built during hands-on workshops at [Yay-Yay Conf 2026](https://yayyay.events/), held on October 29–30 in Torremolinos, Málaga, Spain.

Yay-Yay brings together J On The Beach, Wey Wey Web, and Lambda World, covering data, AI, cloud and systems; frontend, UX and product; and functional programming, languages and verification. Its theme, “The Conference for the AI Apocalypse,” feels particularly appropriate for the first project here.

## Projects

### [BestLang — a fictional language that keeps programmers essential](./crazy-landing-page/)

**Workshop:** Building Better UI With AI (Without Creating Slop)

A deliberately over-the-top landing page and interactive builder, made by following the workshop's process for building a UI with AI.

The pitch: a new programming language designed to protect programmers from AI. It writes the code itself, but only a programmer can download and run it. Job security, built into the language.

Describe a system and the builder uses DeepSeek to generate an architecture and fictional BestLang code. Explore the modules in an interactive 3D view, then pass a short programming quiz to unlock the download.

BestLang does not exist. There is no compiler or runtime: the downloaded archive contains illustrative source and a runbook explaining the human work still required. The programmer check is part of the joke.

See the [project README](./crazy-landing-page/README.md) for setup, implementation details, and demo limitations.

### [MoonBit TodoList — full-stack web and desktop app](./moonbit-lambdaworld-workshop/)

**Workshop:** Full-stack development with MoonBit (Lambda World)

A TodoList application built with MoonBit across the frontend and backend. A Rabbita UI talks to a MoonBack web server over HTTP or to a Proton desktop app over IPC. Both backends use the same typed protocol and SQLite store.

This version includes the completed delete exercise alongside adding and completing todos, plus customizations to the frontend. The web backend supports Wasm and native targets; the desktop app uses the native runtime.

Based on the [original workshop project](https://github.com/Milky2018/moonbit-lambdaworld-workshop). See the [project README](./moonbit-lambdaworld-workshop/README.md) for setup, commands, and architecture, and the [exercise](./moonbit-lambdaworld-workshop/EXERCISE.md) for the task completed during the workshop.
