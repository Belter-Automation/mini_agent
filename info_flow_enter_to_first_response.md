```mermaid
flowchart TD
    A[User presses Enter on command line to start agent] --> B[Shell launches Python process]
    B --> C[Python imports mini_coding_agent.py]
    C --> D[main() executes]
    D --> E[build_arg_parser() creates CLI parser]
    E --> F[parse command line arguments]
    F --> G[build_agent(args)]
    G --> G1[WorkspaceContext.build(args.cwd)]
    G1 --> G1a[Resolve cwd and repo root]
    G1 --> G1b[Run git commands for branch/default/status/commits]
    G1 --> G1c[Read project docs (README.md, pyproject.toml, AGENTS.md, package.json)]
    G --> G2[Create SessionStore at repo_root/.mini-coding-agent/sessions]
    G --> G3[Create OllamaModelClient]
    G3 --> G3a[Set model, host, temperature, top_p, timeout]
    G --> G4[Create MiniAgent instance]
    G4 --> G4a[Initialize session metadata and memory]
    G4 --> G4b[build_tools() defines structured tools]
    G4 --> G4c[build_prefix() builds static prompt prefix]
    G4 --> G4d[Save initial session JSON]
    D --> H[build_welcome(agent, model, host)]
    H --> I[Print welcome banner to terminal]
    F --> J{args.prompt provided?}
    J -- Yes --> K[agent.ask(prompt)]
    J -- No --> L[Enter REPL loop and wait for user input]
    L --> M[User enters first prompt]
    M --> N{Is slash command?}
    N -- Yes --> O[Handle slash command locally (/help, /memory, /session, /reset, /exit)]
    N -- No --> K
    K --> K1[agent.ask(user_message)]
    K1 --> K2[Set task memory if empty]
    K2 --> K3[Record user message to session history]
    K3 --> K4[Build prompt text]
    K4 --> K4a[Prefix + memory_text + history_text + current request]
    K4 --> K5[model_client.complete(prompt, max_new_tokens)]
    K5 --> K6[Parse model output]
    K6 --> K7{Response type}
    K7 -- final --> K7a[Record assistant final answer and return it]
    K7 -- tool --> K8[validate_tool(name,args)]
    K8 --> K9{Valid?}
    K9 -- No --> K9a[Return error and retry notice]
    K9 -- Yes --> K10{Tool risky?}
    K10 -- Yes --> K10a[approve(name,args) if approval policy is ask/auto/never]
    K10 --> K11[Run tool implementation]
    K11 --> K12[Record tool event to history]
    K12 --> K13[note_tool(name,args,result)]
    K13 --> K14[Loop for next model response]
    K7 -- retry --> K15[Record retry notice and loop]
    K7a --> P[CLI prints first response]
    K11 --> K14
    K15 --> K4
```