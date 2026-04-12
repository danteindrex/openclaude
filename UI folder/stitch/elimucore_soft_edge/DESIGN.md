# Design System Specification: Tactical Neumorphism & Editorial Depth

## 1. Overview & Creative North Star: "The Tactile Scholar"
This design system moves away from the "plastic" feel of early neumorphism toward a sophisticated, high-end educational environment. Our North Star is **The Tactile Scholar**—an experience that feels as intentional as a premium physical workspace but as fluid as a modern digital interface.

We achieve this by breaking the rigid, boxy templates of traditional LMS platforms. We use **intentional asymmetry**, generous **white space (as a structural element)**, and **tonal layering** to create a sense of calm authority. This system is designed to reduce cognitive load for learners while maintaining a "bespoke" editorial feel that feels private, local, and premium.

---

## 2. Color Theory: Tonal Atmosphere
We utilize a monochromatic base foundation accented by intelligent pops of color to guide the eye.

### The Foundation
*   **Surface Foundation (`#f6f9ff`):** The canvas. It is cool and neutral, providing a calm backdrop for learning.
*   **The "No-Line" Rule:** Prohibit 1px solid borders for sectioning. Boundaries are defined strictly through background color shifts. For example, a navigation sidebar should use `surface-container-low` against the `surface` background, creating a natural break without a "line."

### The Accent Palette
*   **Primary (`#0040df`):** Used for critical focus.
*   **Primary Container (`#2d5bff`):** The signature neumorphic "pop" for buttons and active states.
*   **Success (`secondary` / `#4959a3` variant):** For progress and completion.
*   **Error (`#ba1a1a`):** Used sparingly for destructive actions or critical alerts.

### Signature Textures
Apply a subtle linear gradient to main CTAs (Transitioning from `primary` to `primary_container` at a 135° angle). This adds "soul" and prevents the neumorphic shapes from looking flat or muddy.

---

## 3. Typography: Editorial Authority
The system pairs **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to balance character with extreme readability.

*   **Display (`display-lg` to `sm`):** Set in Manrope. These are your "Editorial Anchors." Use these for module titles or welcome screens. Large sizes (up to 3.5rem) ensure accessibility and a premium feel.
*   **Body (`body-lg` to `sm`):** Set in Inter. These are optimized for long-form reading. Never go below `0.75rem`. Use `body-lg` (1rem) for the majority of educational content to reduce eye strain.
*   **Hierarchy Note:** High-contrast typography is the key to breaking the "template" look. Do not fear large headers paired with generous padding; this conveys intelligence and trust.

---

## 4. Elevation & Depth: The Neumorphic Physics
In this system, light always originates from the **Top-Left (135°)**.

### The Layering Principle
Depth is achieved by "stacking" surface-container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift.

### Neumorphic Shadows (Extruded)
For cards and buttons (Raised state):
*   **Light Shadow:** `-6px -6px 12px` using `#ffffff` (White).
*   **Dark Shadow:** `6px 6px 12px` using `surface-dim` (at 40-50% opacity).
*   **Ambient Fallback:** If a floating effect is needed outside of the neumorphic grid, use a single diffused shadow (24px blur) at 6% opacity using a tinted version of `on-surface`.

### Inset States (The "Hollow" Rule)
Inputs and containers that hold content should feel "pressed" into the surface.
*   **Box Shadow:** `inset 4px 4px 8px` (Dark) and `inset -4px -4px 8px` (Light).

### Glassmorphism & Depth
For floating overlays (Modals, Tooltips), use `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur. This ensures the layout feels integrated and "airy" rather than pasted on.

---

## 5. Components

### Buttons: The Tactile Trigger
*   **Primary:** Uses the Primary-to-Primary-Container gradient. 
    *   *Default:* Soft extrusion (Outer shadows).
    *   *Hover:* Increase shadow blur; subtle scale-up (1.02x).
    *   *Pressed:* Inset shadow; scale-down (0.98x).
*   **Tertiary:** No background. Uses `on-surface` text. Depth is only revealed on hover via a ghost-neumorphic effect.

### Input Fields: Inset Containers
*   **Container:** Must be inset (`box-shadow: inset...`).
*   **Focus State:** The `outline` token appears as a 2px "Ghost Border" at 20% opacity, softly glowing.
*   **Label:** Always use `label-md` or `label-sm` positioned above the inset container.

### Cards: The Content Vessel
*   **Rule:** Forbid the use of divider lines.
*   **Separation:** Use vertical white space (following the 8px grid) and subtle background shifts (e.g., a `surface-container-highest` header area on a `surface-container-low` card body).
*   **Corners:** Use `xl` (1.5rem) for large dashboard cards; `lg` (1rem) for standard content blocks.

### Progress Indicators (The Learning Path)
*   Instead of a flat bar, use a "trough" (inset container) with a "fluid" fill (Primary-to-Secondary gradient). This mimics a physical liquid filling a carved space.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A 3-column grid where the center column is significantly wider than the others creates an editorial feel.
*   **Do** use "Ghost Borders" (`outline-variant` at 10% opacity) if accessibility contrast ratios are not met by shadows alone.
*   **Do** prioritize `surface-container-lowest` for the primary interaction area to make it "glow" against the darker `surface` background.

### Don't
*   **Don't** use 100% black shadows. Shadows must always be a darkened tint of the background color (`surface-dim`).
*   **Don't** use 1px solid borders for containers. It breaks the "Tactile Scholar" illusion.
*   **Don't** crowd the interface. Neumorphism requires "breathing room" (padding) to allow the shadows to render effectively without overlapping.
*   **Don't** use high-contrast dark modes without re-calibrating the light source values; neumorphism is light-dependent.

---

## 7. Accessibility Note
While neumorphism is visually soft, we maintain accessibility by ensuring all **Text vs. Background** and **Icon vs. Background** ratios meet WCAG AA standards using the `on-surface` and `on-primary` tokens. Shadows are decorative; visual hierarchy must be clear even if shadows are removed.