# Any-List — Frontend Architecture & Build Brief

> **Purpose.** This is the starting brief for Claude Code. It defines the component tree, the List-screen state machine, the mock-data interface, and the Figma token + node map. Build the **frontend only**, against **mock data**, in the order in §9. Wire a real backend later.
>
> **Stack.** React + TypeScript + Tailwind CSS.
>
> **Sources of truth.**
> - **Behavior / rules / data model** → the PRD (`Anything-List_PRD_v1.docx`, **v1.1**).
> - **Visuals** → the Figma file (file key `txZvDpeQ1eXzdzwVtbfOdC`, "Any-List"). Pull each state/component via the Figma MCP using the node IDs in §8.
> - **Alignment** → this document and PRD v1.1 agree. §7 records the key product decisions (tabs, unified removal) that both reflect. If they ever drift again, fix the doc that owns that concern (rules → PRD; component/state/layout detail → this file).

---

## 0. How to use this file with Claude Code

1. Place this file in the repo root as `ARCHITECTURE.md`.
2. Connect the Figma MCP (Pro tier, full seats — fully available):
   `claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp`
   (or the remote server). Confirm it can read file `txZvDpeQ1eXzdzwVtbfOdC`.
3. Tell Claude Code: *"Treat ARCHITECTURE.md as the spec. The 12 Figma frames are states of ONE List screen, not 12 pages. Build one stateful screen against the mock data layer. Pull each state/component from the Figma node IDs in §8 via the MCP. Work in the §9 order; do not one-shot all states."*
4. Build against the mock `DataStore` (§6). Do not add auth or a network layer yet.

---

## 1. Critical framing

The Figma board is **one screen** (the List screen) drawn in different **states**, plus an empty state. It is **not** a set of pages. Build a single `<ListScreen>` whose rendering is driven by a state value (§5). The Figma MCP gives you layout and styling; it does **not** give you behavior — every interaction is wired by you against §5 and §6.

---

## 2. Design tokens (from Figma variables → Tailwind)

The file uses an SDS-style token set. Most values match Tailwind defaults; the only real additions are the Inter font and two brand colors. Extend `tailwind.config.ts`:

```ts
// tailwind.config.ts (theme.extend)
export default {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: '#1e1e1e', secondary: '#757575', tertiary: '#b3b3b3' }, // text
        line: { DEFAULT: '#d9d9d9', strong: '#303030', muted: '#b2b2b2' },       // borders
        brand: { DEFAULT: '#2c2c2c', on: '#f5f5f5' },                            // dark button
        surface: { DEFAULT: '#ffffff', neutral: '#e3e3e3' },                     // backgrounds
      },
      boxShadow: {
        // Figma "Drop Shadow/400" — used by the Dialog
        dialog: '0 4px 4px -4px rgba(12,12,13,0.05), 0 16px 32px -4px rgba(12,12,13,0.10)',
        // Figma "Inner Shadow/100" — used by inputs
        'input-inset': 'inset 0 1px 4px 0 rgba(12,12,13,0.05)',
      },
    },
  },
};
```

Type scale (Inter): Title Hero 72px / 700 / tracking ≈ -0.04em (`text-[72px] font-bold tracking-tight`). Heading 24px / 600 / tracking ≈ -0.02em (`text-2xl font-semibold tracking-tight`). Body 16px / 400 (`text-base`). Body small 14px (`text-sm`). Body strong 600.

Spacing & radius map to Tailwind defaults: Space 4/8/12/16/24/32 = `1/2/3/4/6/8`; Radius 4/8 = `rounded`/`rounded-lg`; border width 1 = `border`.

**Load Inter** (e.g. `@fontsource/inter` or a `<link>` to Google Fonts) or the design will not match.

---

## 3. Component inventory (Figma component → React component)

These are real Figma components; reuse them as the React component boundaries.

| React component | From Figma | Notes |
|---|---|---|
| `AppHeader` | Text Title Hero | Full-width centered "A List of Anything", 72px. |
| `ListTabs` / `ListTab` | Tabs / Tab + slot | List switcher. Tabs = each list; one trailing "+ Add New" tab. Replaces the PRD dashboard (see §7.1). |
| `Button` | Button | Variants: `primary` (brand `#2c2c2c`, light text), `secondary` (outline). Height 40px, `rounded-lg`. |
| `IconButton` | Icon Button / Edit 3 | 36×36 (dialog close), 24×24 (row edit pencil). |
| `InputField` | Input Field | Labeled input (label + field), 70px tall block. Used for Name and Note. |
| `Checkbox` | Checkbox Field (control) | Square checkbox + label. |
| `ItemRow` | Checkbox Field (572w) + Edit 3 | One list row: checkbox + **Name** (primary) + **Note** (secondary) + edit icon. 44px tall. |
| `Separator` | Menu Separator | Thin divider between rows (640w). |
| `ListToolbar` | Actions | Toolbar above the list: Select-All on the left, action buttons on the right. Two modes (§5). |
| `AddEditForm` | Frame (2× Input Field + Button) | Inline Name + Note inputs + **Done**. Same component for add and edit. |
| `Dialog` | Dialog Body | 466px modal: heading + body text + button group + close X. `shadow-dialog`. |
| `ButtonGroup` | Button Group | Row of buttons inside a Dialog. |

**Layout.** Centered content column **640px** wide. Header full-width; tabs centered below; content column starts below the tabs. Rows 44px, separated by separators. (These dimensions come straight from the frames; verify exact padding per-component via the MCP.)

**Naming map (UI ↔ data).** The UI labels the two fields **"Name"** and **"Note"**. The data model (PRD §4) calls them `description` and `value`. Mapping: **Name → `description`**, **Note → `value`**. Keep the data fields as `description`/`value` so the FE matches the future API; only the visible labels say Name/Note.

---

## 4. Component tree

```
<App>
├── <AppHeader/>                         // "A List of Anything"
├── <ListTabs>                            // switch between lists; "+ Add New" creates one
│     └── <ListTab/> × n  +  <AddListTab/>
└── <ListScreen listId={activeListId}>    // THE stateful screen (§5)
      ├── <ListToolbar
      │      mode="default" | "selecting"
      │      selectedCount
      │      onRoulette onAddAnother onRemove onSelectAll/>
      ├── <ul> list body
      │     ├── <ItemRow … />  (+ <Separator/> between rows)
      │     │     // row shows checkbox + Name + Note + edit icon
      │     │     // when this row is being edited, it renders <AddEditForm mode="edit"/> in place
      │     └── …
      │     └── <AddEditForm mode="add"/>   // appears at the BOTTOM when adding (§5)
      ├── <EmptyState/>                      // when the list has 0 items (the "Add a thing" button)
      └── modals (overlay, mutually exclusive):
            ├── <Dialog variant="confirm-remove"/>   // Cancel / confirm; text adapts to count
            └── <Dialog variant="roulette-result"/>  // "Your winner: <Name> <Note>"
```

App-level state: `activeListId`. Everything else lives in `<ListScreen>` (§5).

---

## 5. List-screen state machine (the core)

`<ListScreen>` is a state machine over these states. Each maps to a Figma frame (node IDs in §8) you can pull for exact layout.

```
States
──────
EMPTY              list has 0 items → show <EmptyState> ("Add a thing")
DEFAULT            ≥1 item, no selection, no open form
ADDING            add form open at the BOTTOM of the list (form may also open from EMPTY)
EDITING(itemId)   one row is in inline edit mode (its row becomes <AddEditForm mode="edit">)
SELECTING(n)      ≥1 item selected (via row checkbox or Select-All) → toolbar shows Remove
+ overlay modals (can sit on top of DEFAULT / SELECTING):
CONFIRM_REMOVE    confirm dialog before a hard delete
ROULETTE_RESULT   winner dialog
```

```
Transitions
───────────
EMPTY ──"Add a thing"──▶ ADDING(from empty)
ADDING ──Done (valid)──▶ append item (position = max+1), AUTOSCROLL to bottom, close form
                         → DEFAULT   (re-open via "Add another thing" to add more)
ADDING ──Cancel/blur──▶ DEFAULT or EMPTY (if still 0 items)

DEFAULT ──"Add another thing"──▶ ADDING
DEFAULT ──row edit icon──▶ EDITING(itemId)
DEFAULT ──check a row / Select-All──▶ SELECTING(n)
DEFAULT ──"Roulette"──▶ ROULETTE_RESULT (pick 1 item uniformly at random)

EDITING ──Done (valid)──▶ updateItem(patch) → DEFAULT
EDITING ──Cancel/blur──▶ DEFAULT (discard)

SELECTING ──uncheck last item──▶ DEFAULT
SELECTING ──Select-All toggle──▶ select/deselect all
SELECTING ──"Remove"──▶ CONFIRM_REMOVE
SELECTING ──"Roulette"──▶ ROULETTE_RESULT   (roulette stays available)

CONFIRM_REMOVE ──Cancel──▶ back to SELECTING
CONFIRM_REMOVE ──Confirm──▶ deleteItems(selectedIds) [HARD DELETE] → clear selection
                            → DEFAULT (or EMPTY if 0 items remain)

ROULETTE_RESULT ──close / spin again──▶ back to prior state
```

Rules (from PRD, reconciled with the design):
- **Deletion is unified and always confirmed** (Figma reality, see §7.2): selecting 1 item and pressing Remove still opens the confirm dialog; the dialog text reads singular vs plural based on `selectedCount`. There is **no** separate no-confirm single-delete.
- **Deletion is hard delete.** No undo, no soft delete, no trash (PRD §9).
- **Append + autoscroll** on add (PRD §5.7): new item goes to the bottom; scroll it into view; the add form lives at the bottom.
- **Roulette** picks one item uniformly at random; independent each time; available whenever ≥1 item exists (PRD §5.6).
- **Disabled/empty** (PRD §8.1): with 0 items, Roulette / Remove / Select-All / Search are unavailable; only "Add a thing" shows.
- **No list typing, no Sum** in v1 (PRD §12). Do not build a number/text distinction or a Sum control.

---

## 6. Mock-data interface (the swap seam)

Implement an in-memory `DataStore`. Make every method **async** (return Promises, add a small `setTimeout` latency) so swapping in a real network layer later is a one-file change. Seed it with realistic data (e.g. a "Restaurants" list containing "Mamamou" / "Pasta #38 Ngo Duc Ke, just opened") so the UI looks real.

```ts
// types.ts — canonical shapes (match future API per PRD §4)

export interface List {
  id: string;
  name: string;        // shown in the tab; empty/new list placeholder: "Name Your List"
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
  // NO `type` field in v1 (PRD §12).
}

export interface ListItem {
  id: string;
  listId: string;
  description: string; // UI label "Name"  (primary text on the row)
  value: string;       // UI label "Note"  (secondary text); free text in v1
  position: number;    // insertion order; append => max(position)+1
  createdAt: string;   // ISO
}
```

```ts
// dataStore.ts — the ONLY module the UI talks to for data.
// Swap this implementation for a real API/Supabase client in Phase 4.

export interface DataStore {
  // Lists (drive the tabs)
  listLists(): Promise<List[]>;
  createList(name?: string): Promise<List>;            // name optional → "Name Your List"
  renameList(listId: string, name: string): Promise<List>;
  deleteList(listId: string): Promise<void>;           // hard delete; cascades to items

  // Items (within the active list)
  listItems(listId: string): Promise<ListItem[]>;      // ordered by position ASC
  addItem(listId: string, description: string, value: string): Promise<ListItem>; // appends
  updateItem(
    itemId: string,
    patch: { description?: string; value?: string },
  ): Promise<ListItem>;
  deleteItems(itemIds: string[]): Promise<void>;       // hard delete, 1..n (unified remove)
}
```

Notes:
- `deleteItems` takes an **array (1..n)** — this unifies single and bulk removal per §7.2.
- Single-owner v1: no `userId` in the FE mock. When wiring real auth, add `ownerId` to `List` server-side; do **not** restructure the FE for multi-member (single-owner confirmed).
- Generate `id` with `crypto.randomUUID()`. Keep ordering by `position`.

---

## 7. Settled product decisions (PRD v1.1 reflects these)

These two choices came from the Figma design and are now mirrored in PRD v1.1, so the two documents agree. They are recorded here because they shape the component tree and state machine.

### 7.1 Tabs, not a Dashboard
List switching is done via a **Tabs** bar at the top of the single screen, with a trailing **"+ Add New"** tab. There is no separate dashboard route. Build `ListTabs`. (A dashboard can be added later additively.) Reflected in PRD v1.1 §6.1.

### 7.2 Unified select-to-remove
Rows have **only an edit icon — no per-row trash**. All removal goes through Select → **Remove** → **confirm dialog**, with the dialog text adapting to singular/plural. There is no separate frictionless single delete. Reflected in PRD v1.1 §5.4 / §8.2 / §9.

### 7.3 Undesigned areas (out of scope for this brief)
The Figma covers only the logged-in List screen. **Auth/login and account/settings have no designs.** Build them later from the PRD with generic styling, or defer. This brief intentionally scopes to the List screen + tabs.

---

## 8. Figma node map (for MCP pulls)

File key: `txZvDpeQ1eXzdzwVtbfOdC`. Call pattern (in Claude Code):
`get_design_context(fileKey="txZvDpeQ1eXzdzwVtbfOdC", nodeId="<id>")` — returns a screenshot + reference code to adapt (not to paste verbatim).

**States → frames**

| State | Frame name | nodeId |
|---|---|---|
| EMPTY | Blank State | `5:349` |
| ADDING (from empty) | Add 1 | `3:2` |
| DEFAULT (1 item) | Add 2 | `5:381` |
| ADDING (with items) | Add 3 | `5:521` |
| DEFAULT (2 items) | Add 4 / Edit 1 | `5:586` / `5:749` |
| EDITING (inline form) | Edit 2 | `5:867` |
| SELECTING | Select to Remove 1 | `5:954` |
| SELECTING (1 item) | Remove 3 | `5:1803` |
| CONFIRM_REMOVE (dialog) | Remove 2 | `5:1034` |
| ROULETTE_RESULT (dialog) | Roulette | `5:3252` |
| Long-list scroll reference | Very long list - Scroll | `5:1392` |

**Key components → nodes** (pull these once, build the reusable component, then compose):
- Dialog Body (confirm): `5:1286` · Dialog Body (roulette winner): `5:3382`
- Button group in dialog: `12:70` (confirm) · `12:665` (roulette)
- Input Field: e.g. `5:331` / `5:324` · Done button: `5:656`
- Item row (Checkbox Field 572w): e.g. `5:1761` · Row edit icon (Edit 3): e.g. `5:1762`
- Toolbar (Actions): e.g. `5:2466` (default) · `5:1754` (select-to-remove)
- Tabs: e.g. `5:837`

(Whole-board section node: `5:2590`.)

---

## 9. Build order (frontend, against mock data)

Mirrors PRD §13 minus backend/auth. Build incrementally; verify each against its Figma node.

1. **Project setup** — Vite + React + TS + Tailwind; load Inter; apply §2 tokens.
2. **Primitives** — `Button`, `IconButton`, `Checkbox`, `InputField`, `Separator`, `Dialog`, `ButtonGroup`. (Pull from §8 nodes.)
3. **Mock `DataStore`** (§6) — in-memory, async, seeded.
4. **Shell** — `AppHeader` + `ListTabs` (switch lists, "+ Add New"); wire `activeListId`.
5. **List body — read** — `ItemRow` + `Separator`; render items for the active list; `EmptyState`.
6. **Add** — `AddEditForm` at bottom; append + autoscroll; EMPTY→ADDING→DEFAULT.
7. **Edit** — inline edit via row pencil; EDITING→DEFAULT.
8. **Select + Remove** — row checkboxes + Select-All in `ListToolbar`; SELECTING; `Dialog` confirm (adaptive text); hard delete via `deleteItems`.
9. **Roulette** — `Dialog` winner; uniform random pick; available with ≥1 item.
10. **Polish** — disabled states (§8.1), long-list scrolling (node `5:1392`), responsive/mobile breakpoint (px TBD), toasts on add/edit/remove.

Backend/auth (Phase 4, later): replace the mock `DataStore` with a real client; add login + persistence once the stack decision (PRD §11) is finalized.

---

## 10. Still open (decide before/while building)

Tabs-vs-dashboard and the §8.2 removal model are now **settled** (see §7) and reflected in PRD v1.1, so they are no longer open. **Edit UX is resolved**: inline — the row turns into the shared `AddEditForm`. Remaining:

- **Add-form behavior** — after Done, does the add form **close** (default here) or **stay open** for rapid entry? Pick one.
- **Mobile breakpoint** px value (PRD §8.3) — needed for step 10.
- **Validation limits** (PRD §10) — max lengths / counts; enforce in `AddEditForm` and `DataStore`.
- **Roulette dialog actions** — confirm the exact button(s)/labels from node `5:3382` (e.g. spin-again vs close-only).
- **List-delete affordance** — undesigned in Figma; decide how a user deletes a list (e.g. a tab context menu).

These match PRD v1.1 §11.
