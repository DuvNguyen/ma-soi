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

## Voice & UI/UX Tone Rules (Mandatory)

1. **Zero Over-Instruction / Meta-Text**:
   - Never write instructional, patronizing, tutorial-like, or "AI-style" meta-text explaining what the user should do or what a button does (e.g. NO "Bấm nút bên dưới để...", NO "Chạm vào ghế để...", NO "Dùng khi chơi trong im lặng...", NO "💡 Chạm vào người đang giữ để...", NO "Hãy sẵn sàng bấm nút...").
   - Operational game interfaces (night phases, voting, modals, banners) are functional control surfaces, not tutorials. Avoid meta explanations of UI interactions.

2. **Visual Hierarchy Speaks for Itself**:
   - Let clear layout, concise action verbs on buttons, and precise state counters (`X/Y`, `Đã chọn`, `Chưa gán`) guide the user.
   - Avoid redundant subheadings, tip callouts, and explanatory tooltips that merely repeat what the visual controls already convey.

3. **Design System Consistency**:
   - Strictly adhere to Soft Bento Minimalism and the dark gothic palette (warm neutrals, charcoal, deep obsidian, gold/blood accents).
   - Avoid generic AI-style pulsing green badges (`emerald-50`, `emerald-200`) or decorative clutter that detracts from the gothic ambiance.

## Role Completeness Standard / Tiêu Chuẩn Hoàn Thiện Role (Mandatory)

Mỗi nhân vật / vai trò (Role) trong game Ma Sói khi được lập trình, kiểm tra hoặc mở rộng phải đáp ứng trọn vẹn 5 tiêu chí bắt buộc ("Code Đủ"):

1. **Đúng Logic (Game Core Mechanics)**:
   - Khởi tạo đầy đủ thuộc tính, vai trò, thời điểm thức dậy/kích hoạt (Đêm, Ngày, Khi chết, Khi biểu quyết hòa...).
   - Đảm bảo đúng thời gian hiệu lực của hiệu ứng (ngay lập tức, 1 đêm, suốt ván, vòng kế tiếp).

2. **Đủ Trường Hợp Tương Tác Sự Kiện Phức Tạp (Complex Interactions & Cascades)**:
   - Xử lý đầy đủ tương tác đa vai và chuỗi phản ứng dây chuyền:
     - Tình nhân (Cupid): Chết chùm, người yêu chết kích hoạt phát súng hấp hối (Thợ Săn, Kẻ Báo Thù).
     - Bảo hộ, cứu & hạ độc: Bảo Vệ, Phù Thủy, Dược Sĩ (cứu trùng, độc trùng, thứ tự ưu tiên).
     - Biến đổi, thức tỉnh & kế thừa: Đứa Trẻ Hoang Dã (mất mẹ hóa sói), Ảnh Tử (chủ thể chết kế thừa vai), Người Đầy Tớ (thừa kế vai khi lynch), Bán Sói (thức tỉnh), Sói Nguyền / Sói Quỷ (lây nhiễm).
     - Phong ấn & nguyền rủa: Già Làng chết oan phong ấn toàn bộ chức năng thần thánh, Nguyệt Nữ khóa phép đêm.
     - Biểu quyết & thách đấu: Thẩm Phán Lắp Bắp (vote thêm), Kị Sĩ thách đấu, Trưởng Làng (x2 phiếu vs cấm vote).
   - Phân biệt rõ chết ban đêm vs chết ban ngày vs chết do tự vẫn / phản đòn.

3. **Có Điều Kiện Thắng / Điều Kiện Thua Rõ Ràng (Win / Loss Conditions)**:
   - Xác định chính xác mục tiêu thắng của nhân vật trong `checkGameEnd`.
   - Xử lý đúng chuyển đổi điều kiện thắng khi thay đổi hình thái hoặc ghép đôi khác phe (Couple).

4. **Về Đúng Phe (Faction Alignment & Transformation)**:
   - Thuộc đúng `faction` và `factionType` (`village`, `werewolf`, `hostile_third_party`, `neutral_objective`, `dynamic`).
   - Cập nhật đúng phe phái ngay khi bị chuyển hóa (hóa sói, lây nhiễm, thức tỉnh).

5. **Có UI Hiển Thị Hỗ Trợ Đủ Cho Quản Trò Để Làm Đúng Hoặc Sửa Sai (GM Support & Mistake Recovery)**:
   - **Hỗ trợ làm đúng**:
     - Nút hành động trực quan tại đúng thời điểm (ví dụ: nút "Người Thế Thân Chết Thay ⚖️" khi hòa phiếu).
     - Huy hiệu (Badge) nhận diện trạng thái rõ ràng trên thẻ người chơi (Cấm vote, Quạ phạt, Mê man...).
     - Banner tóm tắt sắc lệnh / hiệu ứng trên đầu giao diện Ban Ngày & Ban Đêm.
     - Modal chọn mục tiêu thuận tiện (hỗ trợ cả chọn người được phép / người bị cấm, chọn tất cả, bỏ chọn).
   - **Hỗ trợ sửa sai**:
     - Chức năng Hoàn Tác (Undo) khôi phục nguyên vẹn trạng thái trước khi lynch hoặc resolve.
     - Cho phép Quản trò mở lại modal để chỉnh sửa, thêm/bớt danh sách áp dụng hoặc gỡ bỏ sắc lệnh mà không cần reset ván đấu.
     - Ghi nhận chi tiết vào Nhật ký trận đấu (`gameDiary`).
