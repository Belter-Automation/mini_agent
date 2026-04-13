# Shell launches Python process

[Back to diagram map](diagram_hierarchy.html)

**Parent diagram:** [Info flow: enter to first response](info_flow_enter_to_first_response.md)

**Child diagrams:** none

```mermaid
graph TD;
    A["User types command and presses Enter in shell"];
    B["Shell parses command line"];
    C["Shell resolves executable path"];
    D["Shell locates Python interpreter"];
    E["Shell spawns new Python process"];
    F["Python runtime initializes"];
    G["Python loads interpreter executable"];
    H["Python initializes memory and runtime state"];
    I["Python parses sys.argv and imports modules"];
    J["Python executes script entrypoint"];
    K["mini_coding_agent.py main() begins"];

    A --> B;
    B --> C;
    C --> D;
    D --> E;
    E --> F;
    F --> G;
    F --> H;
    G --> I;
    H --> I;
    I --> J;
    J --> K;
```