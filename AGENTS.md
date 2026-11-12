<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ma-soi** (939 symbols, 1957 relationships, 38 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).
- **MUST always use GitNexus for audits, code checks, new functions, and checking game rules:**
  - **Audits (`audit` / security / quality / consistency):** MUST run GitNexus (`query`, `context`, `explain`, `impact`) to inspect call graphs, data flows, and architecture before assessing. Never rely on blind regex/text audits alone.
  - **Code Checks & Review:** MUST check caller graphs, dependencies, and execution paths using GitNexus before verifying behavior or bug hunting.
  - **New Functions & Features:** MUST use GitNexus to inspect integration points, identify callers/callees, verify architectural cluster placement, run `impact` before implementation, and run `detect_changes` before committing.
  - **Checking Game Rules & Logic:** MUST use GitNexus (`query({search_query: "..."})` or execution traces `gitnexus://repo/ma-soi/processes`) whenever checking, validating, or modifying Werewolf / Ma Sói game rules (phase cycles, night wizard order, character roles, voting, win conditions).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.
- NEVER conduct audits, code checks, or add new functions relying solely on text search without consulting GitNexus.
- NEVER verify, validate, or change game rules without checking existing game execution flows via GitNexus.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/ma-soi/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ma-soi/clusters` | All functional areas |
| `gitnexus://repo/ma-soi/processes` | All execution flows |
| `gitnexus://repo/ma-soi/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

# Project Core Rules

## Mandatory GitNexus Usage

Always use GitNexus when performing any of the following:

1. **Audits (`audit` / security / code quality / integrity checks):**
   - Use GitNexus (`query`, `context`, `explain`, `impact`) or CLI (`node .gitnexus/run.cjs ...`) to trace full call graphs, symbol dependencies, and taint paths.
   - Do not rely on naive grep or unverified assumptions.

2. **Code Checks & Review:**
   - Inspect upstream callers and downstream dependencies with GitNexus before reaching conclusions or confirming fixes.

3. **Adding New Functions / Features:**
   - Locate existing integration points and patterns with GitNexus (`query`, `context`, clusters).
   - Run `impact` analysis on affected components prior to adding functions.
   - Run `detect_changes` to verify blast radius before committing.

4. **Checking Rules of the Game Code:**
   - Consult GitNexus execution flows (`gitnexus://repo/ma-soi/processes` or `query`) for game mechanics, night action order, day voting, role permissions, and win conditions before reasoning about or altering game logic.
