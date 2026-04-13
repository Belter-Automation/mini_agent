# Mini Coding Agent Documentation

## Overview

This repository contains a minimal local coding agent that uses an Ollama model backend to inspect, search, and modify files in a local repository through a structured tool interface.

The implementation is designed to be small, safe, and easy to run with Python 3.10+ and a locally served Ollama model.

## Repository Contents

- `mini_coding_agent.py`: Main application and agent runtime.
- `README.md`: High-level introduction, setup, usage, and interactive command notes.
- `EXAMPLE.md`: Hands-on usage example showing a full interactive workflow.
- `pyproject.toml`: Package metadata, entry point, and dependency configuration.
- `tests/test_mini_coding_agent.py`: Pytest coverage for the agent and tools.
- `LICENSE`: Apache License 2.0.

## Purpose

The Mini Coding Agent is a local coding assistant that:

- collects stable workspace and git context
- constructs a stable prompt prefix separate from request-specific state
- exposes a fixed set of structured tools to the language model
- validates inputs and applies approval gating for risky actions
- stores durable session transcripts and distilled memory
- supports bounded delegation to child agents

It can be run directly with Python or through the package entry point.

## Architecture

### WorkspaceContext

`WorkspaceContext.build(cwd)` collects repository metadata from the current working directory and git:

- current path and repo root
- current branch and default branch
- git status summary
- latest commit history
- project docs content from `README.md`, `pyproject.toml`, `AGENTS.md`, and `package.json`

Workspace context is included in the prompt so the model can reason with repository facts.

### SessionStore

`SessionStore` saves and loads session JSON files to `.<agent>/sessions/` under the repository root.

Each session stores:

- `id`
- `created_at`
- `workspace_root`
- `history`
- `memory`

The store also supports loading the latest session file.

### Model Clients

- `OllamaModelClient`: Sends prompt requests to a local Ollama server using `/api/generate`.
- `FakeModelClient`: Used by tests to simulate model output.

### MiniAgent

`MiniAgent` is the core runtime.

It manages:

- model client
- workspace context
- session persistence
- approval policy
- tool definition and execution
- prompt construction
- memory and transcript management
- task retries and final answer production

`MiniAgent.from_session(...)` resumes an existing saved session.

## Prompt and Response Flow

### Prompt Structure

Prompt text consists of:

1. static prefix with tool definitions, rules, and examples
2. distilled memory
3. conversation transcript
4. current user request

### Response Parsing

The agent accepts model replies in one of these forms:

- JSON-style tool calls inside `<tool>...</tool>`
- XML-style tool calls with attributes and body tags
- `<final>...</final>` answers
- plain-text final answers when no tool call is present

### Retry Behavior

If the model output is empty or malformed, the agent records a runtime notice and retries. It stops after a bounded number of attempts.

## Tools

The agent exposes a fixed tool set. Every tool is validated before execution.

### list_files

- Description: List files and directories in the workspace.
- Schema: `{"path": "str='.'"}`
- Risk: safe
- Behavior: excludes ignored workspace state and paging only first 200 entries.

### read_file

- Description: Read a UTF-8 file by line range.
- Schema: `{"path": "str", "start": "int=1", "end": "int=200"}`
- Risk: safe
- Behavior: returns numbered lines and validates the file path.

### search

- Description: Search the workspace using ripgrep if available or a fallback scan.
- Schema: `{"pattern": "str", "path": "str='.'"}`
- Risk: safe
- Behavior: searches text content and ignores the agent's internal directories.

### run_shell

- Description: Run a shell command in the repo root.
- Schema: `{"command": "str", "timeout": "int=20"}`
- Risk: risky
- Behavior: runs command through shell and returns exit code, stdout, and stderr.

### write_file

- Description: Write a text file.
- Schema: `{"path": "str", "content": "str"}`
- Risk: risky
- Behavior: writes UTF-8 content and creates parent directories as needed.

### patch_file

- Description: Replace one exact text block in a file.
- Schema: `{"path": "str", "old_text": "str", "new_text": "str"}`
- Risk: risky
- Behavior: requires a single exact match of `old_text` and writes the updated file.

### delegate

- Description: Ask a bounded read-only child agent to inspect the workspace.
- Schema: `{"task": "str", "max_steps": "int=3"}`
- Risk: safe
- Behavior: creates a nested child agent with `approval_policy="never"` and `read_only=True`.

## Validation and Safety

The code applies multiple checks before executing tools:

- confirms paths exist and remain inside the workspace
- validates file and directory semantics
- checks required arguments and value ranges
- prevents repeated identical tool calls in succession
- gates risky actions with approval policies:
  - `ask`
  - `auto`
  - `never`

Path resolution prevents escapes outside the workspace, including symlink escapes.

## Session and Memory Behavior

The agent tracks:

- full conversation history
- distilled `memory` containing current task, recent files, and notes

Memory is updated when tools are used and when final answers are produced.

## Interactive Usage

### CLI entry point

The package defines:

- `mini-coding-agent = "mini_coding_agent:main"`

### Command-line options

- `--cwd`: workspace directory
- `--model`: Ollama model name
- `--host`: Ollama server URL
- `--ollama-timeout`: request timeout
- `--resume`: session id or `latest`
- `--approval`: `ask`, `auto`, or `never`
- `--max-steps`: maximum tool/model iterations
- `--max-new-tokens`: model output token limit
- `--temperature`: sampling temperature
- `--top-p`: top-p sampling

### REPL commands

When running without a one-shot prompt, the agent REPL supports:

- `/help`
- `/memory`
- `/session`
- `/reset`
- `/exit` / `/quit`

## Example Workflow

`EXAMPLE.md` describes a workflow that includes:

1. creating a fresh repo
2. launching the agent
3. asking the agent to implement code
4. updating the code
5. adding pytest tests
6. running tests
7. reviewing results

This workflow assumes a local Ollama server is available and a model has been pulled.

## Testing

`tests/test_mini_coding_agent.py` covers:

- correct tool invocation and final answer flow
- retry handling for empty or malformed model output
- XML-style tool parsing for `write_file`
- session persistence and resume behavior
- delegation to child agents
- patch file replacement correctness
- input validation and approval behavior
- workspace path security

## Dependencies and Packaging

### Runtime

The project is pure Python standard library during runtime.

The declared runtime dependency is `pytest>=9.0.2`, but the code itself does not require third-party libraries to run the agent.

### Development

The `dev` dependency group includes:

- `pytest>=8.3.5`
- `ruff>=0.4.4`

### Packaging

The package is configured in `pyproject.toml` with `setuptools` backend and exposes a module-level script entry point.

## License

This repository is licensed under the Apache License 2.0.

## Diagram hierarchy

A clickable diagram map is available in `diagram_hierarchy.html`. Use it to navigate from the top-level project flow to deeper explanatory diagrams, such as the shell-to-Python startup flow.

## Notes

- Running the agent directly is supported with `python mini_coding_agent.py`.
- Ollama is required to be installed and serving if using `OllamaModelClient`.
- The default model configured in this project is `qwen3.5:4b`.
