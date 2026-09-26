# Old Portfolio — Layout Analysis, Extracted Design System, and Hermes Implementation Prompt

Source of truth for this document:

| File | Lines | What was read |
|---|---|---|
| `index.html` | 950 | Full markup, 6 sections, 3 script blocks |
| `style.css` | 2,737 | Tokens, all component rules, all breakpoints |
| `app.js` | 1,004 | Loading screen, nav, reveal, particles, tilt, magnetic buttons, popup |
| inline scripts in `index.html` | 624–950 | Lenis smooth scroll, highlight sweep, hero scroll, skill conic ring |

Analyzed at commit `d0f204e` ("Remove 3D portfolio experience and all abyss-card references") plus `95606b0` (footer edit), which is the current `Main` tip.

---

# A. OLD PORTFOLIO LAYOUT ANALYSIS

## Global frame

- **One shared container**, not a 12-column system. `.container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }` (style.css:58-62). Every content section is `.container > .sec-label + .sec-title + <one grid>`.
- **No 12-column grid exists anywhere.** The layout is an asymmetric *fraction* grid system: `1fr 1fr`, `3fr 2fr`, `repeat(2, 1fr)`, `repeat(3, 1fr)`.
- **Section rhythm:** every section is `padding: 6rem 0` (96px) — hero/about/skills/education/projects/contact. 1px gradient separator line via `section::after { position: absolute; bottom: 0; height: 1px; }` on hero/about/skills/education/projects (style.css:2243-2260).
- **Section header block is identical everywhere:** `.sec-label` (0.82rem mono, `margin-bottom: 0.6rem`) → `.sec-title` (`clamp(2rem, 4vw, 3.2rem)`, `line-height: 1.15`, `margin-bottom: 3rem`). Every grid therefore starts at the same y-offset.
- **Overflow discipline:** `html, body { overflow-x: hidden; max-width: 100vw; }` (style.css:2702-2705). This is load-bearing — the photo stickers deliberately overhang the frame by `-18px`.
- **Decorative layers are pseudo-elements, never layout children:** per-section radial "atmosphere" `::before` (380–500px, `pointer-events: none`, `z-index: 0`) with `.container { position: relative; z-index: 1 }` so content sits above (style.css:2203-2265).

## Breakpoints (exact, from code)

| Query | What changes |
|---|---|
| `min-width: 1400px` | `.hero-wrap` + `.nav-container` → 1300px, `.container` → 1200px, `.photo-frame` → 420px |
| `max-width: 1024px` | `.about-grid` → 1 col; `.hero-wrap` → 1 col `gap: 2.5rem`, `.hero-right { order: -1 }`, `.photo-frame` → 280px; `.skills-grid` gap → 1.2rem; `.container` padding → 20px |
| `max-width: 900px` | `.edu-cards-grid` → 1 col |
| `max-width: 768px` | nav → hamburger; `.projects-grid`, `.contact-grid`, `.skills-grid`, `.edu-cards-grid`, `.about-grid`, `.sc-row` → 1 col; `.hero-btns` → column, `.btn` full-width; `section` padding → 4rem; stickers hidden; footer → column |
| `max-width: 480px` | `.hero-name` → 1.9rem, `.photo-frame` → 180px, `.project-visual` → 160px, `.container` padding → 14px, `.sec-title` → 1.7rem |
| `max-width: 360px` | `.hero-name` → 1.6rem, `.photo-frame` → 150px |
| `(hover: none) and (pointer: coarse)` | all hover transforms → `transform: none`; tap-target padding bumps on nav-link / btn / social-link |

## Navigation

- `position: fixed; top: 0; width: 100%; z-index: 1000; padding: 0.85rem 0; backdrop-filter: blur(20px); border-bottom: 1px solid` (style.css:253-264). **Never `sticky`; never hides on scroll.**
- `.nav-container { max-width: 1180px; display: flex; align-items: center; gap: 1.5rem; padding: 0 24px; }`
- Four children in fixed order: `.nav-logo` (`flex-shrink: 0`) → `.nav-menu` (`margin-left: auto`, so it self-centers in remaining space) → `.nav-pills` (`flex-shrink: 0`) → `.hamburger` (`display: none`).
- 5 links (Home, About, Skills, Education, Projects) + 2 pills (GitHub outline, "Get in Touch" solid). **#contact is reachable only via a pill, never a link** — deliberate asymmetry.
- `.nav-link { padding: 0.38rem 0.85rem; font-size: 0.88rem; border-radius: 7px; }` in a `gap: 0.2rem` flex row. `.nav-pill { padding: 0.38rem 1rem; border-radius: 100px; }` in a `gap: 0.55rem` row.
- **≤768px:** `.nav-menu` and `.nav-pills` both `display: none`, hamburger becomes `display: flex` (3 × 22×2px bars, `gap: 5px`, `rotate(45deg)` X transform). Open state is a *separate fixed sheet*, not an inline list: `.nav-menu.active { position: fixed; top: 60px; left: 0; right: 0; flex-direction: column; gap: 0.4rem; padding: 1rem 1.5rem; z-index: 999; }`. Because it's `top: 60px`, the hero's `padding-top: 5rem` is the desktop equivalent clearance.
- No body scroll-lock, no ESC handler, no focus trap. Document click outside closes it.

## Hero

- `.hero { min-height: 100vh; display: flex; align-items: center; position: relative; overflow: hidden; padding-top: 5rem; will-change: transform; }`
- `.hero-wrap { max-width: 1180px; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; padding: 2rem 24px 4rem; z-index: 2; }`
- **Strict 4-layer z-stack:** decoration (`z-index: 0` — particle canvas `inset: 0`, crow video `inset: 0; object-fit: cover`, 8 crow SVGs, 3 blurred orbs 300/250/200px) → atmosphere (`z-index: 0/1`) → content (`.hero-wrap`, `z-index: 2`).
- **Left column** is a single vertical text stack, left-aligned: pill badge → 2-line `h1` (`clamp(2.8rem, 5.5vw, 5rem)`, `display: flex; flex-direction: column; gap: 0.05em`, with "Alish" underlined via `text-underline-offset: 6px; text-decoration-thickness: 3px`) → 3 wrapping role chips (`gap: 0.45rem`) → bio paragraph (`clamp(1rem, 1.5vw, 1.15rem)`, `line-height: 1.8`) → 2 buttons (`gap: 0.85rem`, `flex-wrap: wrap`) → inline availability row (8px pulsing dot).
- **Right column** is `display: flex; justify-content: center; align-items: center` containing `.photo-frame { width: 360px; max-width: 100%; perspective: 1200px; }`.
- **The photo is a fixed-ratio box, not a stretching image:** `.hero-photo { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 18px; }`. Two pill stickers are absolutely positioned to **overhang the frame edges** — `top: 22px; right: -18px` and `bottom: 30px; left: -18px` — which is why `overflow-x: hidden` on body is mandatory.
- **Tablet (≤1024) is a reorder, not just a stack:** `.hero-right { order: -1 }` puts the photo **above** the text. Gap 4rem → 2.5rem, frame 360 → 280px, name → `clamp(2.2rem, 5vw, 3.5rem)`.
- **≤768:** padding `1.5rem 20px 3rem`, gap 2rem, frame → 220px, buttons → `flex-direction: column` with `.btn { width: 100% }` (full-width tap targets).
- **≤480:** frame → 180px, name → 1.9rem, and the stickers are **pulled back on-screen** (`right: -10px`, `top: 10px`) because a 180px frame can no longer absorb an 18px overhang.
- **≤360:** frame → 150px, name → 1.6rem, badge 0.7rem.
- 6 floating sticker decorations are `display: none` at ≤768 — pure desktop atmosphere.

## About

- `.about-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 3rem; align-items: start; }` — deliberately **asymmetric 60/40**, not 1:1. `align-items: start` (not `stretch`) so the short side column does not stretch.
- **Left (3fr):** 3 `.bio-p` paragraphs (`clamp(1rem, 1.4vw, 1.12rem)`, `line-height: 1.85`, `margin-bottom: 1.1rem`) → `.about-cards` = `flex-direction: column; gap: 0.9rem; margin-top: 2rem`, 3 × `.acard`.
- `.acard { display: flex; align-items: flex-start; gap: 1rem; padding: 1.15rem; border-radius: 14px; }` with a `44×44` `flex-shrink: 0` icon (`border-radius: 10px`) + a text column. Icon is top-aligned, not center-aligned — so cards of differing text length keep their icon on the same visual line.
- **Right (2fr):** two stacked boxes, both `border-radius: 14px`, `padding: 1.4rem` — `.beyond-box` (heading + `.beyond-tags` flex-wrap `gap: 0.45rem` of 8px-radius chips, `margin-bottom: 1.3rem`) then `.facts-box` (`flex column; gap: 0.9rem`) of `.fact` rows: `36×36` icon + stacked `strong`/`.span` column at `gap: 0.05rem`.
- **Both columns collapse to 1 col at ≤1024**; gap tightens to 2rem and `.acard` padding drops to 1rem at ≤768.

## Skills

- `.skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.6rem; }` — 4 category cards.
- `.skill-cat { border-radius: 18px; padding: 1.8rem 1.6rem; overflow: hidden; position: relative; }`
- Each card is a **header row + a nested 2×2 grid**: `.skill-cat-header { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.2rem; }` with a `42×42` radius-12 icon, then `.sc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }`.
- Each `.sc` is `width: 100%` inside its wrapper — so **every skill chip in a category is exactly equal width regardless of label length**. This is the core "grid integrity" rule: label text never sizes the box.
- **Responsive is a two-level collapse:** ≤1024 the outer grid stays 2-up (gap 1.2rem) and the inner `.sc-row` stays 2-up; ≤768 the outer goes 1-up *and* the inner `.sc-row` goes 1-up — a 2×2 block becomes a 1×4 list.

## Education

- `.edu-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.8rem; margin-top: 3rem; }` → 1 col at ≤900.
- `.edu-card { display: flex; flex-direction: column; gap: 0.9rem; border-radius: 20px; padding: 2.4rem 2rem 2rem; overflow: hidden; }` — asymmetric padding (more top than bottom) plus a decorative `160×160` glow at `top: -40px; right: -40px`.
- **Equal-height mechanism:** `.edu-card-desc { flex: 1 }`. Cards stretch to the tallest in the row via grid, and the description absorbs the slack so the tag rows all align at the bottom.
- Internal stack: top row (`46×46` radius-12 icon + status pill `justify-content: space-between`) → title `1.2rem` → school `0.92rem` (+ `.edu-sub-school` at 0.74rem on a second line) → location row `0.72rem` with 0.65rem icon → description → `.edu-card-tags` flex-wrap `gap: 0.38rem`, 100px-radius pills at 0.67rem with `white-space: nowrap`.
- **A second, unused education system exists:** `.timeline { padding-left: 3rem; display: flex; flex-direction: column }` with a `2px` gradient rail at `left: 11px` and `24×24` dots at `left: -2.5rem`, items `padding-bottom: 2.8rem`; ≤768 → `padding-left: 2rem`, dots `left: -1.8rem`. It is fully styled but no `.timeline` markup remains.

## Projects

- `.projects-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }` → 1 col at ≤768.
- `.project-card { border-radius: 14px; overflow: hidden; }` and is a **strict vertical stack of three regions**:
  1. `.pc-chrome { padding: 0.65rem 1rem; display: flex; align-items: center; gap: 0.75rem; }` — 3 × 10px traffic-light dots (`gap: 5px`) + `.pc-url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }` (long URLs truncate, they never wrap or widen the card).
  2. `.project-visual { height: 200px; display: flex; align-items: center; justify-content: center; overflow: hidden; }` — **a fixed-height band, not an aspect-ratio**. Drops to 160px at ≤480.
  3. `.pc-body { padding: 1.4rem; }` — h3 `1.08rem` → description `0.84rem / 1.6` → `.pc-tags` flex-wrap `gap: 0.38rem` → `.pc-links` flex `gap: 0.55rem` with exactly 2 buttons (Code, Demo).
- **Important structural consequence:** because the visual is a fixed 200px band and the body is content-sized, total card height varies with description length. Grid row stretch equalizes the two cards in a row, and the *visual bands stay at 200px each* — the extra height lands in the body text, not the image.
- Hover triggers three simultaneous things: card `translateY(-5px)` + `box-shadow: 0 24px 50px`, orbit animation speeds up (5s → 1.2s, 9s → 2.5s), and 3 paper elements eject with `transition-delay: 0s / 0.1s / 0.2s`.
- Under `(hover: none) and (pointer: coarse)` the hover lift is `transform: none`.

## Contact

- `.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }` → 1 col at ≤768. **No form exists.**
- **Left:** intro paragraph (`1rem / 1.75`, `margin-bottom: 2rem`) then `.contact-cards` = flex column `gap: 0.9rem`, each `.cc { display: flex; align-items: center; gap: 1rem; padding: 1.1rem; border-radius: 14px; }` with a `42×42` radius-10 `flex-shrink: 0` icon and a `.cc-text` block (`strong` block 0.8rem + link/span 0.85rem).
- **Right:** `h3.social-h` (1.05rem, `margin-bottom: 1.1rem`) then `.social-list` = flex column `gap: 0.65rem` of 5 `.social-link { display: flex; gap: 0.8rem; padding: 0.7rem 1.1rem; border-radius: 11px; border: 1px solid transparent; }` rows, each with an `i { width: 18px; text-align: center }` icon slot so icons form a left-aligned column.

## Footer

- `padding: 2.8rem 0 1.4rem; border-top: 1px solid`.
- `.footer-top { display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap; margin-bottom: 2rem; }` — brand (logo + tagline, `gap: 0.9rem`) → `.footer-nav { flex; gap: 1.4rem; margin-left: auto }` (self-right-aligned) → `.footer-social { flex; gap: 0.75rem }` of `34×34` radius-8 squares.
- `.footer-bottom { border-top: 1px solid; padding-top: 1.4rem; text-align: center; }` at 0.82rem.
- **≤768:** `.footer-top` → `flex-direction: column; align-items: flex-start; gap: 1.4rem` and `.footer-nav { margin-left: 0 }` — the `margin-left: auto` right-alignment trick is what makes the desktop row work, so it must be neutralized on collapse. **≤480:** social squares → 30×30.

## Interaction architecture that shapes layout

- **Scroll reveal:** `IntersectionObserver { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }` over `.project-card, .acard, .skill-cat, .edu-card, .cc, .social-link, .btn, .chip, .hero-btns, .hero-chips`. Base CSS pre-hides 6 of them at `opacity: 0; translateY(30px); transition: .6s ease` and JS injects a `<style>` block with `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`. Stagger is CSS `transition-delay` on `:nth-child(1..4)` = **0s / 0.1s / 0.2s / 0.3s**. Observers never unobserve, so re-entry replays.
- **The "About Me highlighting" (the effect referenced):** `IntersectionObserver { threshold: 0.25, rootMargin: '0px 0px -30px 0px' }` on each `.bio-p`. It adds `.revealed` to every `.hl` span with a **`i * 160ms` stagger** (forcing reflow first so the transition re-fires) and **removes it on exit** so the sweep replays on every scroll-in. The sweep is `background-size: 0% 88% → 100% 88%` over `0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)`, i.e. a left-to-right marker wipe using `background-repeat: no-repeat; background-position: left center`. The hero's `.ihl` variant is the same wipe but pure CSS `animation … forwards` with `animation-delay: 3.4s / 3.7s / 4.0s`.
- **Section blend:** `section[id] { opacity: .92; transition: .6s ease }` → `.section-visible { opacity: 1 }` at `threshold: 0.15`. (Side effect worth knowing: off-screen sections sit dimmed at 0.92.)
- **Card tilt:** `.project-card, .acard, .skill-cat, .edu-card` all get `perspective(800px) rotateX(∓8deg) rotateY(±8deg) translateY(-5px)` on mousemove, normalized by card half-size, reset on leave — and it **overrides** every CSS `:hover` transform for those selectors.
- **Magnetic buttons:** `.btn, .nav-pill` translate to `x * 0.15, y * 0.15` of the pointer offset from center; `transition: none` on enter, `0.3s ease` back to 0 on leave.
- **Photo card:** separate mechanism — `perspective: 1200px` on the frame, and the card transforms via CSS custom properties `translateY(var(--ty,-12px)) scale(var(--sc,1.06)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))`, JS setting `--rx/--ry` to ±12deg. So the photo is *permanently* lifted and scaled 1.06 by default.
- **Smooth scroll:** Lenis, `duration: 1.2`, easeOutExpo `Math.min(1, 1 - 2**(-10t))`, `wheelMultiplier: 1`, `touchMultiplier: 2`, own rAF pump.
- **Scroll-spy:** `section.offsetTop - 100` compared against `pageYOffset` on every scroll event.

## Structural bugs that must NOT be reproduced

1. `.about`'s third `.fact` is unclosed and `.about-side` is never closed (index.html:277-279) — the browser repairs the nesting, so the actual rendered structure differs from the source. Verify computed structure, not source nesting.
2. `section#projects` never closes its `.container` (index.html:527-528) — the parser auto-closes, making `.projects-grid` a direct child of the section.
3. Orphan `</script>` at index.html:622.
4. **Two competing scroll-spies** (offset-based at 100px wins over an IntersectionObserver at 0.3) and **three competing writers to `.sticker` transform** (scroll parallax vs mouse parallax) — inline styles clobber each other.
5. **Two competing anchor-scroll handlers** with different offsets (80px, 60px for #about) vs Lenis `scrollTo` with `offset: 0` → net offset 0, and there is **no `scroll-margin-top` anywhere**, so every section heading lands under the 60px fixed navbar.
6. `initTilt` overrides CSS hover; `.btn`/`.nav-pill` magnetic transform makes `.btn-primary:hover { translateY(-2px) }` unreachable.
7. Dead code referencing nonexistent selectors: `.education-card`, `.about-content`, `.contact-container`, `.skill-progress`, `#typed-name`, `.typed-cursor`, `img[data-src]`, `sw.js`.
8. `prefers-reduced-motion` is **never** handled anywhere — every animation runs unconditionally.

## Note on the missing Experience section

There is no Experience section in this codebase. It was removed in commit `d0f204e` ("Remove 3D portfolio experience and all abyss-card references"), which is the commit now on the `Main` branch. The Education section is the closest structural analogue (3-column card grid with a `flex: 1` equal-height rule). If an Experience section is wanted, it needs a new spec rather than an old one.

---

# B. EXTRACTED DESIGN SYSTEM

**Container & rhythm**

```text
.container            max-width: 1180px; margin: 0 auto; padding: 0 24px
@media min-width:1400px   .container → 1200px | .nav-container, .hero-wrap → 1300px
@media max-width:1024px   .container padding → 0 20px
@media max-width:480px    .container padding → 0 14px
section (all)        padding: 6rem 0        → 4rem 0 at ≤768
html, body           overflow-x: hidden; max-width: 100vw
```

**Section header block (identical in all 6 sections)**

```text
.sec-label    font-size: .82rem; margin-bottom: .6rem
.sec-title    font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.15; margin-bottom: 3rem
              → 1.7rem fixed at ≤480
section::after  height: 1px gradient separator, bottom: 0
section::before radial atmosphere 380–500px, pointer-events: none, z-index: 0
section .container  position: relative; z-index: 1
```

**Grid inventory**

```text
.hero-wrap            1fr 1fr   gap 4rem    align center   → 1fr, gap 2.5rem @1024 → gap 2rem @768
.about-grid           3fr 2fr   gap 3rem    align start    → 1fr @1024 (gap 2rem @768)
.skills-grid          repeat(2,1fr) gap 1.6rem              → 1.2rem @1024 → 1fr, gap 1rem @768
.sc-row               1fr 1fr   gap .7rem                   → 1fr @768
.edu-cards-grid       repeat(3,1fr) gap 1.8rem margin-top 3rem → 1fr @900 (gap 1.2rem @768)
.projects-grid        1fr 1fr   gap 2rem                     → 1fr @768
.contact-grid         1fr 1fr   gap 3rem    align start     → 1fr @768
.footer-top           flex, align center, gap 2.5rem, wrap  → column, align flex-start, gap 1.4rem @768
```

**Nav**

```text
.navbar               position: fixed; top: 0; width: 100%; z-index: 1000; padding: .85rem 0
                      backdrop-filter: blur(20px); border-bottom: 1px solid
.nav-container        flex; align-items: center; gap: 1.5rem; padding: 0 24px
.nav-menu             flex; gap: .2rem; margin-left: auto      (self-centering)
.nav-link             padding: .38rem .85rem; font-size: .88rem; border-radius: 7px
.nav-pills            flex; gap: .55rem; flex-shrink: 0
.nav-pill             padding: .38rem 1rem; border-radius: 100px; font-size: .82rem
.hamburger            display: none → flex @768; bars 22×2px, gap 5px
.nav-menu.active      position: fixed; top: 60px; left/right: 0; column; gap: .4rem;
                      padding: 1rem 1.5rem; z-index: 999
```

**Cards & boxes (radius / padding / icon slots)**

| Component | Radius | Padding | Icon | Inner gap |
|---|---|---|---|---|
| `.acard` | 14px | 1.15rem (1rem @768) | 44×44 r10, `flex-shrink:0`, top-aligned | 1rem |
| `.beyond-box` / `.facts-box` | 14px | 1.4rem | 36×36 r8 | .9rem col |
| `.skill-cat` | 18px | 1.8rem 1.6rem | 42×42 r12 | header .85rem, mb 1.2rem |
| `.sc` chip | 10px | .55rem .5rem, `width:100%` | 1rem icon | .45rem |
| `.edu-card` | 20px | 2.4rem 2rem 2rem | 46×46 r12 | .9rem col |
| `.project-card` | 14px | `overflow:hidden` | 3 × 10px dots | chrome .75rem |
| `.cc` contact row | 14px | 1.1rem | 42×42 r10 | 1rem |
| `.social-link` | 11px | .7rem 1.1rem | `i` width 18px | .8rem |
| `.footer-social a` | 8px | 34×34 (30×30 @480) | — | .75rem |
| `.btn` | 10px | .7rem 1.45rem | — | .45rem, gap .85rem row |
| `.pl-btn` | 8px | .42rem .95rem | — | .38rem, gap .55rem row |
| `.btag` / `.pt` / `.edu-tag` | 8 / 6 / 100px | — | — | .45 / .38 / .38 |
| `.chip` | 100px | .28rem .75rem | — | .45rem row |

**Fixed / constrained boxes (never stretch-with-content)**

```text
.photo-frame      width: 360px; max-width: 100%; perspective: 1200px
                  → 280px @1024 → 220px @768 → 180px @480 → 150px @360 → 420px @1400+
.hero-photo       width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: 18px
.photo-sticker    .ps-top top:22 right:-18 | .ps-bottom bottom:30 left:-18
                  → @480 pulled to -10px so it stays on-screen
.project-visual   height: 200px; display:flex; center; overflow:hidden → 160px @480
.pc-url           flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap
.loading-progress width: 280px
.welcome-popup    position: fixed; bottom: 2rem; right: 2rem → left/right 1rem, bottom 1rem @768
```

**Equal-height mechanisms**

```text
grid default stretch  →  .about-cards, .skill-cat, .edu-card, .project-card rows
.edu-card-desc       { flex: 1 }   pushes tag rows to a common baseline
align-items: start   →  .about-grid, .contact-grid (short side column must not stretch)
.sc                  { width: 100% }  label length never sizes the box
```

**Typography scale (structure, not theme)**

```text
.hero-name     clamp(2.8rem, 5.5vw, 5rem) / 1.1      → clamp(2.2,5vw,3.5) @1024 → 1.9rem @480 → 1.6rem @360
.sec-title     clamp(2rem, 4vw, 3.2rem) / 1.15
.hero-bio      clamp(1rem, 1.5vw, 1.15rem) / 1.8
.bio-p         clamp(1rem, 1.4vw, 1.12rem) / 1.85
.edu-card-title 1.2rem | .pc-body h3 1.08rem | .skill-cat-title 1rem | .acard h4 .88rem
body line-height 1.6 | muted paragraph line-heights 1.5–1.85
```

**Motion tokens**

```text
reveal          .6s ease, translateY(30px)→0, stagger :nth-child 0/.1/.2/.3s, threshold .15, rootMargin 0 0 -50px
.hl sweep       background-size 0% 88% → 100% 88%, .7s cubic-bezier(.25,.46,.45,.94), stagger i*160ms, threshold .25, rootMargin 0 0 -30px
section blend   opacity .92 → 1, .6s ease, threshold .15
card tilt       perspective(800px) ±8deg + translateY(-5px)
photo tilt      perspective(1200px), --rx/--ry ±12deg, --ty -12px, --sc 1.06
magnetic        translate(x*.15, y*.15), transition none → .3s ease
smooth scroll   Lenis duration 1.2, easeOutExpo, wheel 1, touch 2
scroll-spy      offsetTop - 100
sk hover        scale(1.12) translateY(-8px), conic sweep 850ms easeInOutCubic, label fade .25s
micro-hover     .2s–.3s ease on border/box-shadow/transform
touch guard     (hover:none) and (pointer:coarse) → all hover transforms: none
```

**Class naming system (flat, section-scoped, BEM-ish)**

```text
section wrapper   .hero .about .skills .education .projects .contact
container         .container | .nav-container | .hero-wrap
header            .sec-label .sec-title
card              .acard .skill-cat .edu-card .project-card .cc
card internals     .pc-chrome .pc-visual .pc-body .pc-tags .pc-links
                  .edu-card-top .edu-card-glow .edu-card-desc .edu-card-tags
state             .active .revealed .sc-active .show .visible .fade-out
modifier          .btn-primary .btn-ghost .pl-accent .pill-solid .pill-outline
                  .chip-teal .pt-orange .hl-y .ihl-purple .edu-card-featured .status-done
per-item color    inline custom props: --ic .acard-icon | --eic .edu-card-icon | --cc .sc | --rot .sticker
```

---

# C. FINAL HERMES IMPLEMENTATION PROMPT

Copy everything between the fences below into Hermes.

```text
You are working on my new portfolio. Keep the new theme and visual identity exactly as
currently established. However, rebuild the page structure using the layout architecture
extracted from my previous portfolio.

CONTEXT
The old portfolio was a dark "cinematic abyss" themed single-page site. You are NOT
recreating its look. You are reproducing its LAYOUT DNA — the grid architecture, box
proportions, spacing rhythm, image containment rules, and responsive collapse behavior —
using the NEW theme that already exists in this project.

HARD RULES
1. INSPECT FIRST. Read the current new portfolio's HTML, CSS, JS, and asset structure
   completely before changing anything. Map its current sections, components, and tokens.
2. PRESERVE ALL WORKING FEATURES. Do not delete existing functionality, components,
   handlers, animations, or assets. Do not create duplicate components for the same job.
3. DO NOT REVERT RECENT WORK. Check git log/diff; treat the last few commits as intentional.
4. DO NOT RESTRUCTURE THE PROJECT. Do not migrate build tools, change frameworks, convert
   to React/Vue/Tailwind, or reorganize files. Work inside the existing stack and file
   layout.
5. THE NEW THEME OWNS ALL VISUAL APPEARANCE. Colors, gradients, backgrounds, typography
   families, shadows, glows, and decorative graphics come from the new theme. Never import
   old values for these.
6. NO AI-GENERATED DECORATION. Do not add random gradients, glassmorphism, neon glows,
   blob backgrounds, gradient text, or animation that is not already part of the new theme.
   Structural motion listed in this spec (scroll reveal, highlight sweep) is required; new
   decoration is not.
7. Use the old portfolio ONLY as a layout/UX reference. Match its grid, proportions,
   spacing, containment, and responsive behavior — not its colors or ornament.
8. Keep new-portfolio assets unless a box needs a structural adjustment (e.g. a fixed
   height or aspect ratio). Do not replace or re-export images.
9. NO COMMENTS in code. Match the existing code style, naming conventions, and file
   structure of the new project.

=============================================================================
PART 1 — GLOBAL LAYOUT SYSTEM (preserve)
=============================================================================

Container
  One shared centered container. Sections are: container > section-header > one grid.
  .container      { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
  @media (min-width: 1400px) { .container { max-width: 1200px; } }
  @media (max-width: 1024px) { .container { padding: 0 20px; } }
  @media (max-width: 480px)  { .container { padding: 0 14px; } }

  Do NOT introduce a 12-column grid. The old site deliberately used asymmetric fraction
  grids. Reproduce them per section below.

Section rhythm
  Every content section: padding: 6rem 0  (96px)
  @media (max-width: 768px) { section { padding: 4rem 0; } }   (64px)

Section header block — identical in every section, so all sections start on the same axis
  .sec-label  monospace, font-size .82rem, margin-bottom .6rem
  .sec-title  font-weight 700, line-height 1.15, margin-bottom 3rem,
              font-size: clamp(2rem, 4vw, 3.2rem)
              @media (max-width: 480px) { .sec-title { font-size: 1.7rem; } }

  Apply this header to every section that has one, in the same order: label, then title,
  then the grid. The 3rem title margin is load-bearing — it is what keeps section content
  on a consistent grid.

Section separation and decoration layers
  - 1px separator line at the bottom of each adjacent section (1px tall, full width).
    Implement it as a pseudo-element on the section, `position: absolute; bottom: 0;
    left: 0; right: 0; height: 1px; pointer-events: none;` — NOT a margin.
  - Sections that carry a decorative background layer must be `position: relative`, with
    the decoration at `position: absolute; pointer-events: none; z-index: 0`, and the
    inner `.container` at `position: relative; z-index: 1` so content is never covered.
  - Do not let decoration pseudo-elements ever establish height or push content.

Breakpoints (use these exact values; do not invent new ones)
  min-width: 1400px   large desktop
  max-width: 1024px   tablet
  max-width: 900px    education card collapse
  max-width: 768px    mobile
  max-width: 480px    small phones
  max-width: 360px    very small phones
  (hover: none) and (pointer: coarse)   touch device

Overflow
  html, body { overflow-x: hidden; max-width: 100vw; }
  This is mandatory, not cosmetic: the old layout deliberately overhangs elements past
  their containers (see the hero photo stickers). Verify no horizontal scrollbar at 320px.

=============================================================================
PART 2 — NAVIGATION (preserve structure, retheme surface)
=============================================================================

Desktop (> 768px), three zones in one fixed bar
  .navbar  { position: fixed; top: 0; width: 100%; z-index: 1000; padding: .85rem 0; }
            Surface treatment (background, blur, border) comes from the new theme.
            It must remain FIXED — the old site never used position: sticky and never
            hid the nav on scroll. Keep it always visible.

  .nav-container { max-width: 1180px; margin: 0 auto; padding: 0 24px;
                    display: flex; align-items: center; gap: 1.5rem; }
  @media (min-width: 1400px) { .nav-container { max-width: 1300px; } }
  @media (max-width: 480px)  { .nav-container { padding: 0 14px; } }

  Child order and flex roles — preserve exactly:
    1. .nav-logo     flex-shrink: 0
    2. .nav-menu     margin-left: auto   ← this is what pushes it right; do not replace
                     with justify-content
    3. .nav-pills   flex-shrink: 0
    4. .hamburger   display: none (shown only ≤768)

  .nav-menu  { display: flex; gap: .2rem; }
  .nav-link  { display: block; padding: .38rem .85rem; font-size: .88rem;
               border-radius: 7px; }
  .nav-pills { display: flex; gap: .55rem; flex-shrink: 0; }
  .nav-pill  { display: inline-flex; align-items: center; gap: .4rem; white-space: nowrap;
               padding: .38rem 1rem; border-radius: 100px; font-size: .82rem;
               font-weight: 600; }

  Active link: a subtle filled pill background + full-strength text color, driven by a
  single .active class. Colors from the new theme.

Mobile (≤ 768px) — structure change, not just hiding
  .nav-menu, .nav-pills  → display: none
  .hamburger             → display: flex; flex-direction: column; gap: 5px
  bars: 22×2px, border-radius 2px, margin-left auto
  .active state: bar 1 rotate(45deg), bar 2 opacity 0, bar 3 rotate(-45deg)

  Open menu is a SEPARATE FIXED SHEET, not an inline expanded list:
    .nav-menu.active { display: flex; flex-direction: column; position: fixed;
                       top: 60px; left: 0; right: 0; gap: .4rem;
                       padding: 1rem 1.5rem; z-index: 999; }
    + a bottom border from the new theme.
  The `top: 60px` sheet assumes a ~60px bar. If the new theme's bar is a different
  height, set the sheet's top to the bar's real height instead — do not leave a gap.

  Required behavior: hamburger click toggles both the menu and the hamburger; a document
  click outside both closes the menu; a nav-link click closes the menu AND clears the
  hamburger's active state (the old site left the X stuck — fix it).

Scroll-spy: use ONE mechanism, not two. The old site ran an offset-based spy and an
IntersectionObserver spy simultaneously and they fought. Use a single
IntersectionObserver over all `section[id]` with `threshold: 0.3`, and set `.active` on
the matching nav link. Pick the most-visible intersecting section when several qualify.

Anchor scroll offset: the old site had NO `scroll-margin-top`, so every anchor landed
under the fixed bar. Fix it: set `scroll-margin-top` on every scroll-target section equal
to the bar height + a small offset (e.g. 80px), and make the smooth-scroll handler use
that same offset. Anchor links must never hide a section heading behind the navbar.

Touch: under `(hover: none) and (pointer: coarse)`, increase nav-link tap padding to
`.5rem 1rem` and font-size to .95rem. Minimum 44px tap targets.

=============================================================================
PART 3 — HERO (preserve structure, retheme surface)
=============================================================================

Layout
  .hero { min-height: 100vh; display: flex; align-items: center; position: relative;
          overflow: hidden; padding-top: 5rem; }
  The 5rem top padding is the fixed-navbar clearance. Keep it (or the new theme's
  equivalent). The hero must be exactly one viewport tall minimum — not taller.

  .hero-wrap { max-width: 1180px; margin: 0 auto; width: 100%;
               display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
               align-items: center; padding: 2rem 24px 4rem; z-index: 2; }
  @media (min-width: 1400px) { .hero-wrap { max-width: 1300px; } }

  Two columns, equal width, vertically centered. Left = text stack, right = photo.

Left column — one left-aligned vertical stack, in this order
  pill badge → two-line h1 → row of role chips → bio paragraph → button row →
  availability/status row.
  h1: font-weight 700, line-height 1.1, display flex column, gap .05em, two spans.
      font-size: clamp(2.8rem, 5.5vw, 5rem)
      → clamp(2.2rem, 5vw, 3.5rem) @1024 → 1.9rem @480 → 1.6rem @360
      The old site underlined the first name with text-underline-offset 6px and
      text-decoration-thickness 3px. Keep the two-line structure; the underline
      treatment is a style decision — apply only if the new theme has an equivalent.
  chips row: display flex, flex-wrap wrap, gap .45rem; chips are 100px-radius pills,
      padding .28rem .75rem, font-size .8rem → .7rem / .22rem .6rem @480
  bio: line-height 1.8, font-size clamp(1rem, 1.5vw, 1.15rem)
  button row: display flex, gap .85rem, flex-wrap wrap
  .btn: inline-flex, gap .45rem, padding .7rem 1.45rem, border-radius 10px, .92rem
  availability row: inline-flex, gap .45rem, .82rem, with an 8px circular dot
      (flex-shrink: 0)

Right column — centered image box
  .hero-right { display: flex; justify-content: center; align-items: center; }
  .photo-frame { width: 360px; max-width: 100%; position: relative; }
  Image containment is the important part:
    .hero-photo { width: 100%; aspect-ratio: 4 / 5; object-fit: cover;
                  display: block; }
  The image is a FIXED 4:5 box that crops; it must never stretch to page width and must
  never push the layout wider than its column.

  Photo stickers: 2 pill labels absolutely positioned to overhang the frame —
    top:    top 22px,  right -18px
    bottom: bottom 30px, left -18px
    padding .38rem .8rem, radius 100px, font-size .78rem, white-space nowrap
    @480px pull them back on-screen: top 10px / right -10px, bottom 20px / left -10px,
    font-size .65rem, padding .25rem .6rem
  If the new theme's photo is not 4:5, keep the frame width and the overflow behavior;
  the overhang offsets are what require body `overflow-x: hidden`.

Optional per-item decoration slots (only if the new theme has them)
  6 floating sticker glyphs positioned around the hero, each rotated via a CSS custom
  property (--rot: -9deg / 7deg / -5deg / 11deg / 4deg), floating with a 6s ease-in-out
  translateY(-14px) + rotate(+3deg) animation, base opacity .5.
  These MUST be `display: none` at ≤768px. They are desktop-only atmosphere.

Layering contract (preserve)
  The hero has exactly three depth layers. Never add a fourth, and never let decoration
  enter the layout flow:
    z-index 0 — full-bleed background layer(s) inside .hero, `position: absolute;
                inset: 0; pointer-events: none;` (canvas / image / ambient shapes)
    z-index 1 — optional vignette or overlay, also absolute + pointer-events none
    z-index 2 — .hero-wrap, the only element that scrolls content
  All decoration must be `position: absolute` and must not affect grid or flex sizing.

Tablet (≤ 1024px) — this is a REORDER, not only a stack
  .hero-wrap { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero-right { order: -1; }         ← photo moves ABOVE the text. Required.
  .photo-frame { width: 280px; }
  .hero-name  { font-size: clamp(2.2rem, 5vw, 3.5rem); }

Mobile (≤ 768px)
  .hero-wrap  { padding: 1.5rem 20px 3rem; gap: 2rem; }
  .hero-right { order: -1; }         (inherited)
  .photo-frame { width: 220px; }
  .hero-btns   { flex-direction: column; gap: .6rem; }
  .btn         { width: 100%; justify-content: center; }   ← full-width tap targets
  .hero-bio    { font-size: clamp(.9rem, 2vw, 1.05rem); }

Small phones (≤ 480px)
  .photo-frame { width: 180px; }
  .hero-name   { font-size: 1.9rem; }
  .hero-wrap   { padding: 1rem 16px 2.5rem; }
  .hero-chips  { gap: .3rem; }
  .btn         { padding: .6rem 1.1rem; font-size: .82rem; }
  .project-visual { height: 160px; }   (see Projects)

Very small phones (≤ 360px)
  .hero-name { font-size: 1.6rem; }
  .photo-frame { width: 150px; }
  .hero-badge { font-size: .7rem; padding: .3rem .7rem; }
  .chip       { font-size: .65rem; }

Large desktop (min-width: 1400px)
  .photo-frame { width: 420px; }

=============================================================================
PART 4 — ABOUT (preserve)
=============================================================================

  .about-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 3rem;
                align-items: start; }
  @media (max-width: 1024px) { .about-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px)  { .about-grid { grid-template-columns: 1fr; gap: 2rem; } }

  The 3fr / 2fr asymmetry (60/40) is intentional. Do not flatten it to 1fr 1fr.
  `align-items: start` is intentional: the side column is shorter and must not stretch.

Left column (3fr)
  - 2–3 bio paragraphs: font-size clamp(1rem, 1.4vw, 1.12rem), line-height 1.85,
    margin-bottom 1.1rem
  - then a vertical stack of 3 mini-cards:
    .about-cards { display: flex; flex-direction: column; gap: .9rem; margin-top: 2rem; }
    .acard { display: flex; align-items: flex-start; gap: 1rem; padding: 1.15rem;
             border-radius 14px; }
             → @768 padding: 1rem
    .acard-icon { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
                  display: flex; align-items: center; justify-content: center; }
    Icon is TOP-aligned (align-items: flex-start), not centered, so icons line up
    visually even when card text lengths differ.
    Per-card accent color is passed in as an inline custom property (e.g. --ic), not a
    hard-coded color class.

Right column (2fr) — two stacked boxes, both radius 14px, padding 1.4rem
  Box 1: a titled box containing a wrapping chip cloud.
    .beyond-tags { display: flex; flex-wrap: wrap; gap: .45rem; }
    .btag { display: inline-flex; align-items: center; gap: .38rem; padding: .32rem .65rem;
            border-radius: 8px; font-size: .8rem; }
    Box has margin-bottom 1.3rem so the two boxes separate clearly.
  Box 2: a facts list.
    .facts-box { display: flex; flex-direction: column; gap: .9rem; padding: 1.4rem;
                 border-radius: 14px; }
    .fact { display: flex; align-items: center; gap: .75rem; }
    .fact-ic { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
               display: flex; align-items: center; justify-content: center; }
    .fact text column: display flex, flex-direction column, gap: .05rem
        strong: .8rem, weight 600
        span:   .8rem
  No image in the About section. Both columns are text-and-box only.

The sliding highlight (REQUIRED — this is the signature About behavior)
  Inline `<span class="hl">` markers inside the bio paragraphs sweep in left-to-right
  when the paragraph scrolls into view.
  CSS mechanism (layout-safe, no reflow):
    .hl { padding: .1em .4em; border-radius: 5px; font-weight: 700;
          font-size: inherit; display: inline;
          background-repeat: no-repeat; background-position: left center;
          background-size: 0% 88%;
          transition: background-size .7s cubic-bezier(.25,.46,.45,.94); }
    .hl.revealed { background-size: 100% 88%; }
  The highlight color comes from a theme token passed per variant class — never
  hard-code the old red/purple values. Keep the variant-class pattern
  (e.g. .hl-y, .hl-t, .hl-p, .hl-v, .hl-g, .hl-o) so the theme can remap them.
  JS: one IntersectionObserver on the bio paragraphs,
      { threshold: 0.25, rootMargin: '0px 0px -30px 0px' }
      on enter: for each .hl, remove .revealed, force reflow (void el.offsetWidth),
                then add .revealed after i * 160ms
      on exit:  remove .revealed  → the sweep REPLAYS every time the paragraph
                re-enters. Preserve that replay behavior.
  IMPORTANT: this animates background-size only, so it causes zero layout shift. Do not
  reimplement it with width/animation that reflows the paragraph.
  A hero-paragraph variant may auto-play instead of scroll-triggering: same wipe at
  82% height, pure CSS animation with `forwards`, staggered
  animation-delay 3.4s / 3.7s / 4.0s. Only if the new theme uses it.

=============================================================================
PART 5 — SKILLS (preserve)
=============================================================================

  .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.6rem; }
  @media (max-width: 1024px) { .skills-grid { gap: 1.2rem; } }   ← stays 2-up at tablet
  @media (max-width: 768px)  { .skills-grid { grid-template-columns: 1fr; gap: 1rem; } }

  This is a TWO-LEVEL grid. Each category card contains a nested 2×2 skill grid:
    .skill-cat { border-radius: 18px; padding: 1.8rem 1.6rem; position: relative;
                 overflow: hidden; }
    .skill-cat-header { display: flex; align-items: center; gap: .85rem;
                        margin-bottom: 1.2rem; }
    .skill-cat-icon   { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
                         display: flex; align-items: center; justify-content: center; }
    .skill-cat-title  { font-size: 1rem; font-weight: 700; }
    .sc-row { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; }
    @media (max-width: 768px) { .sc-row { grid-template-columns: 1fr; } }

  CRITICAL grid-integrity rule: every skill chip is `width: 100%` inside its wrapper.
  Label text must NEVER size the box. A long label and a 3-character label occupy the
  same cell. Keep `white-space` handling so long labels truncate or wrap inside the cell
  without widening the grid.

  Per-skill color is an inline custom property (--cc) read by the icon and by the hover
  ring. Preserve the inline custom-property pattern.

  Optional proficiency hover (if the new theme wants it): on hover, a conic-gradient
  ring is injected around the chip that sweeps from -90deg to the skill's `data-percent`
  over 850ms with easeInOutCubic, plus a small percentage label fading in above the
  chip (top: -24px, left: 50%, translateX(-50%), font-size .68rem, .25s). Elements are
  created on mouseenter and removed on mouseleave, so the sweep replays each time.
  Gate this to `@media (hover: hover)` — the old version fired synthetic hover events on
  touch and built DOM with no visible result. That is a bug to fix.
  Chip hover: scale(1.12) translateY(-8px) with z-index 10 so the scaled chip escapes
  its cell; disabled under (hover: none) and (pointer: coarse).

=============================================================================
PART 6 — EDUCATION (preserve)
=============================================================================

  .edu-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr);
                    gap: 1.8rem; margin-top: 3rem; }
  @media (max-width: 900px) { .edu-cards-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .edu-cards-grid { grid-template-columns: 1fr; gap: 1.2rem; } }

  .edu-card { display: flex; flex-direction: column; gap: .9rem; border-radius: 20px;
              padding: 2.4rem 2rem 2rem; position: relative; overflow: hidden; }
  Note the asymmetric padding — more top than bottom. Preserve it.
  Per-card accent via inline custom property (--eic) for the icon.

  Equal-height contract (REQUIRED):
    Grid rows stretch by default, so all three cards match the tallest. Then
    `.edu-card-desc { flex: 1; }` absorbs the slack, which pushes the tag row of every
    card to the same bottom baseline. Without flex: 1 the tag rows float at different
    heights. Keep it.

  Internal stack, in order:
    .edu-card-top   display flex, align-items center, justify-content space-between,
                    margin-bottom .3rem
      icon: 46×46, radius 12px, flex-shrink 0
      status pill: .7rem, 100px radius, padding .22rem .65rem (e.g. Completed / Current)
    .edu-card-title  1.2rem, weight 700
    .edu-card-school .92rem, weight 600, line-height 1.4
      optional second line .edu-sub-school at .74rem, weight 400
    .edu-card-loc    .72rem, inline-flex, gap .35rem, icon .65rem
    .edu-card-desc   .88rem, line-height 1.65, flex 1
    .edu-card-tags   flex wrap, gap: .38rem; tags .67rem, 100px radius,
                     padding .22rem .6rem, white-space: nowrap
  Optional decorative corner glow: 160×160 circle at top -40px / right -40px,
  absolute, pointer-events none, opacity .12 → .22 on hover. Only if the new theme has
  an equivalent. It must not affect layout.

  A vertical-timeline variant also exists in the old CSS and may be used instead if the
  new theme prefers it — if so: `.timeline { padding-left: 3rem; display: flex;
  flex-direction: column; }` with a 2px rail at `left: 11px` (top 0 / bottom 0) and
  24×24 round dots at `left: -2.5rem; top: 1.6rem; border: 3px solid <page bg>`, items
  `padding-bottom: 2.8rem` (last child 0). @768: padding-left 2rem, dots left -1.8rem.

=============================================================================
PART 7 — PROJECTS (preserve)
=============================================================================

  .projects-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  @media (max-width: 768px) { .projects-grid { grid-template-columns: 1fr; } }

  Each .project-card is `border-radius: 14px; overflow: hidden;` and a strict vertical
  stack of exactly three regions:

  1. Browser chrome bar
     .pc-chrome { display: flex; align-items: center; gap: .75rem; padding: .65rem 1rem;
                  border-bottom: 1px solid; }
     .pc-dots { display: flex; gap: 5px; }  each dot 10×10, border-radius 50%
     .pc-url  { flex: 1; font-size: .72rem; padding: .22rem .65rem; border-radius: 6px;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
     The URL MUST truncate. It must never wrap and never widen the card.

  2. Visual band — FIXED HEIGHT, not aspect-ratio
     .project-visual { height: 200px; display: flex; align-items: center;
                       justify-content: center; position: relative; overflow: hidden; }
     @media (max-width: 480px) { .project-visual { height: 160px; } }
     Do not convert this to aspect-ratio. A fixed-height band is what keeps all cards'
     media aligned in a row.

  3. Content body
     .pc-body { padding: 1.4rem; }
     h3    1.08rem, weight 700, margin-bottom .45rem
     p     .84rem, line-height 1.6, margin-bottom .95rem
     .pc-tags  display flex, flex-wrap wrap, gap: .38rem, margin-bottom .95rem
       .pt  padding .22rem .55rem, radius 6px, .73rem, weight 600
     .pc-links display flex, gap: .55rem   (exactly 2 buttons: Code, Demo)
       .pl-btn  inline-flex, gap .38rem, padding .42rem .95rem, radius 8px, .8rem,
                weight 600
       .pl-accent is the emphasized variant of the second button
     The buttons must not wrap to a second line on desktop; they shrink or the
     description above them wraps first.

  Card height model (preserve, do not "fix")
    Total card height = chrome + fixed 200px band + content-driven body.
    Cards in the same grid row are equalized by grid stretch, and the extra height lands
    in the BODY text, not in the media band. Do not add aspect-ratio to the card or set a
    fixed card height — that would fight the text.

  Hover behavior (structure, not theme)
    .project-card:hover { transform: translateY(-5px); } + a deeper shadow
    Card hover ALSO accelerates whatever loops run inside the visual band.
    Under (hover: none) and (pointer: coarse): transform: none.

=============================================================================
PART 8 — CONTACT (preserve)
=============================================================================

  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
                  align-items: start; }
  @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
  `align-items: start` — the side column is shorter and must not stretch.

  Left column
    .contact-desc { font-size: 1rem; line-height: 1.75; margin-bottom: 2rem; }
    .contact-cards { display: flex; flex-direction: column; gap: .9rem; }
    .cc { display: flex; align-items: center; gap: 1rem; padding: 1.1rem;
          border-radius: 14px; }
    .cc-icon { width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
               display: flex; align-items: center; justify-content: center; }
    .cc-text strong { display: block; font-size: .8rem; margin-bottom: .18rem; }
    .cc-text a / span { font-size: .85rem; }

  Right column
    .social-h { font-size: 1.05rem; font-weight: 700; margin-bottom: 1.1rem; }
    .social-list { display: flex; flex-direction: column; gap: .65rem; }
    .social-link { display: flex; align-items: center; gap: .8rem; padding: .7rem 1.1rem;
                   border-radius: 11px; font-size: .88rem; font-weight: 600;
                   border: 1px solid transparent; }
    .social-link i { width: 18px; text-align: center; font-size: 1rem; }
    The fixed 18px icon slot is what aligns every icon into a clean left column even
    when the glyph widths differ. Preserve it.
    Under (hover: none) and (pointer: coarse): .social-link padding .85rem 1.2rem

  If the new portfolio includes a contact FORM, place it as the left column and keep the
  two-column 1fr 1fr / 3rem / align-items:start contract and the ≤768px single-column
  collapse. Label above input, full-width inputs, 44px+ control height.

=============================================================================
PART 9 — FOOTER (preserve)
=============================================================================

  .footer { border-top: 1px solid; padding: 2.8rem 0 1.4rem; }
  .footer-top { display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap;
                margin-bottom: 2rem; }
    .footer-brand { display: flex; align-items: center; gap: .9rem; }
    .footer-nav   { display: flex; gap: 1.4rem; margin-left: auto; }  ← self-right-aligns
    .footer-social{ display: flex; gap: .75rem; }
      a: 34×34, radius 8px, flex center
      @480: 30×30, font-size .8rem
  .footer-bottom { border-top: 1px solid; padding-top: 1.4rem; text-align: center; }
    p: .82rem

  @media (max-width: 768px) {
    .footer-top   { flex-direction: column; align-items: flex-start; gap: 1.4rem; }
    .footer-nav   { margin-left: 0; }        ← REQUIRED; the auto margin must be reset
  }
  The `margin-left: auto` on .footer-nav is what creates the desktop right-alignment.
  When the row becomes a column it must be neutralized or the links drift right.

=============================================================================
PART 10 — STRUCTURAL MOTION (preserve behavior, theme the appearance)
=============================================================================

These are layout-safe and part of the old site's identity. Keep them. Do not add
similar effects that were not here.

1. Scroll reveal
   One IntersectionObserver, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }.
   Observe: every card/box component and every button/chip/button-row wrapper.
   Base state: opacity 0, transform translateY(30px),
               transition opacity .6s ease, transform .6s ease
   Revealed:   opacity 1, transform translateY(0)
   Stagger:    transition-delay on :nth-child(1..4) = 0s / .1s / .2s / .3s
   IMPORTANT: if the base state is set in CSS, the revealed state must win. The old site
   set the base state in CSS and the revealed state in JS-injected inline styles, which
   required `!important`. Put BOTH states in the stylesheet — do not inject a <style>
   element from JS.
   Do NOT unobserve: re-entry replays the reveal. That is the intended behavior.

2. About highlight sweep — see Part 4. Threshold 0.25, rootMargin 0 0 -30px,
   160ms per-span stagger, replays on re-entry. Animates background-size only.

3. Section blend
   One observer, { threshold: 0.15 }, on every section[id].
   section[id] { opacity: .92; transition: opacity .6s ease; }
   section[id].section-visible { opacity: 1; }
   Add a guard: only sections that are actually in view go to 1. Do not dim the whole
   page to .92 permanently.

4. Card tilt (optional — only if the new theme wants it)
   For project cards, about mini-cards, skill cards, education cards:
     perspective(800px) rotateX(∓8deg) rotateY(±8deg) translateY(-5px)
   normalized by the card's half-height/half-width, reset on mouseleave.
   CRITICAL: pick ONE owner for the transform. The old site had both a CSS :hover rule
   and a JS tilt writing inline styles, so they permanently overrode each other. Choose
   either CSS hover or JS tilt — not both. Prefer CSS-only hover if the theme allows.
   Gate any JS tilt behind `(hover: hover)`.

5. Magnetic buttons (optional)
   .btn and .nav-pill translate toward the pointer by x * 0.15, y * 0.15 of the offset
   from center; transition: none on enter, .3s ease back to 0 on leave.
   Same one-owner rule: this overrode the CSS hover lift in the old site.

6. Smooth scroll
   If the new portfolio already has a smooth-scroll solution, keep it and make anchors
   respect `scroll-margin-top`. If not, use a lightweight approach. Whichever you use,
   anchor clicks must land with the section heading clear of the fixed navbar — the old
   site had a two-handler conflict that resolved to offset 0 and hid every heading.
   Use exactly ONE anchor handler.

7. Loading screen (only if the new theme has one)
   Fixed, inset 0, centered content, progress bar (width: 280px, height: 4px,
   radius 10px, fill width 0→100% with a .3s ease width transition), then a fade-out
   (.5s) and display:none. If progress is simulated, drive it from actual load progress
   or cap the total at ~2.5s. Do not block scrolling behind it, and REMOVE the node from
   the DOM after hiding (the old one only set display:none and left the tree).

8. Floating notification/toast (only if the new theme has one)
   position: fixed; bottom: 2rem; right: 2rem; z-index below any overlay;
   @768: left 1rem; right 1rem; bottom 1rem; min-width auto.
   Auto-dismiss. A click anywhere dismisses it. Add an ESC handler and a real close
   control. Give it role="dialog" and aria-modal.

REDUCED MOTION (REQUIRED, and absent from the old site)
  Wrap the non-essential motion — card tilt, magnetic buttons, reveal transitions,
  section blend, any looping background animation — in
  `@media (prefers-reduced-motion: no-preference)`, or explicitly disable it inside a
  `@media (prefers-reduced-motion: reduce)` block. Reduced-motion users must get the
  final state immediately, not a stuck pre-reveal state. This is a hard requirement.

=============================================================================
PART 11 — DO NOT COPY FROM THE OLD SITE
=============================================================================

Do NOT carry over:
  - any color value, background, gradient stop, or glow color
  - the dark background, the "abyss" surface palette, or the purple/red/amber accents
  - Font Awesome icon choices, the Space Grotesk / Space Mono pairing, or any font
    import — unless the new theme already uses them
  - the particle canvas, the crow video, the flying crow SVGs, the blurred orbs, the
    dot-grid background, or the "atmosphere" radial blobs
  - the text-scramble loading name, the welcome popup, the notification pop sound
  - the sticky-label / glow / conic-ring decorations unless the new theme has them
  - the inline custom property color values (--cc, --ic, --eic, --yellow, --purple, …);
    keep the PATTERN, take the values from the new theme's tokens
  - the old CSS variable names if the new theme already has its own token set
  - any hard-coded hex/rgba in a component rule — components should reference theme
    tokens so a theme swap is a token swap

DO carry over (structure):
  container widths and paddings, section padding rhythm, all grid-template-columns and
  gaps, align-items values, card radii/padding/icon dimensions, the fixed photo width
  ladder, aspect-ratio 4/5 on the portrait, the fixed 200/160px project visual band, the
  ellipsis URL bar, the flex:1 equal-height rule, the 100%-width skill chips, the
  nav-menu margin-left:auto mechanism, the fixed mobile menu sheet at top:60px, the
  hero order:-1 reorder, the .85rem btn padding, all breakpoint values, the reveal and
  highlight-sweep timings and thresholds.

=============================================================================
PART 12 — ACCEPTANCE CHECKS
=============================================================================

Before you report done, verify and state results for each:

1. No horizontal scrollbar at 320px, 375px, 768px, 1024px, 1440px, and 1920px. Every
   overhanging element (photo stickers, decorative shapes) is clipped by an
   `overflow: hidden` ancestor or by body `overflow-x: hidden`.
2. Grid integrity: in the skills grid, all chips in a row are equal width regardless of
   label length. In the projects grid, all media bands are the same height regardless of
   description length. In the education grid, all tag rows sit on the same baseline.
3. Every anchor link lands with its section heading fully visible below the fixed
   navbar, on desktop AND mobile.
4. Stacking: no element overlaps text content. Decorative layers are absolute +
   pointer-events: none, at a lower z-index than the content container.
5. Tap targets: nav links, buttons, and social links are at least 44px tall on touch.
6. Reveal animation: with JS disabled or before it fires, no content stays invisible.
   Content must be visible by default; the pre-reveal state must not be the resting
   state.
7. prefers-reduced-motion: reduce produces a fully readable, static page.
8. Hero is exactly 100vh minimum at 1440px, does not overflow horizontally, and the
   photo is a cropped 4:5 box — not a stretched full-width image.
9. No console errors. No duplicate component classes. No dead CSS referencing selectors
   that no longer exist — remove unused rules you touch.
10. Diff review: `git diff` shows only structural/layout changes plus the reduced-motion
    and anchor-offset fixes. Colors, fonts, and decorative assets are untouched.

Report back: the file list you changed, the breakpoint-by-breakpoint column changes per
section, any place where you deliberately deviated from this spec and why, and the
results of checks 1–10.
```

---

## Appendix — file paths referenced in the analysis

| Reference | Path |
|---|---|
| Section markup | `index.html:41` nav, `:70` hero, `:194` about, `:284` skills, `:368` education, `:444` projects, `:531` contact, `:590` footer |
| Highlight CSS | `style.css:85-129` |
| Container | `style.css:58-62` |
| Navbar | `style.css:253-368` |
| Hero layout | `style.css:371-380`, `:668-679`, `:859-917` |
| About | `style.css:1007-1178` |
| Skills | `style.css:1189-1354` |
| Education cards | `style.css:2101-2195` |
| Education timeline (unused) | `style.css:1363-1422` |
| Projects | `style.css:1518-1807` |
| Contact | `style.css:1815-1919` |
| Footer | `style.css:1922-1993` |
| Section rhythm / separators | `style.css:2203-2265` |
| Breakpoints (block 1) | `style.css:2268-2341` |
| Breakpoints (block 2) | `style.css:2491-2680` |
| Large desktop | `style.css:2683-2699` |
| Touch overrides | `style.css:2708-2737` |
| Reveal / stagger | `style.css:2444-2459` |
| Section blend | `style.css:2432-2439` |
| Loading screen JS | `app.js:61-199` |
| Scroll reveal JS | `app.js:885-919` |
| Tilt JS | `app.js:860-880` |
| Magnetic JS | `app.js:948-969` |
| Scroll-spy JS | `app.js:234-254` |
| Highlight sweep JS | `index.html:661-695` |
| Hero scroll JS | `index.html:702-732` |
| Lenis setup | `index.html:793-819` |
| Skill conic ring | `index.html:868-946` |
