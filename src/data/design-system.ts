// What the design system page says about the system. The values themselves (hex, sizes, durations)
// are never written here: they are read from the stylesheets (src/lib/design-system.ts), and
// design-system.test.ts fails when a token has no entry below, or an entry has no token.

export const principles = [
  {
    title: "The sheet is the layout",
    text: "White cells bounded by hairlines on a gray ground. Structure is drawn by the content's own edges, never by a decorative grid.",
  },
  {
    title: "The frame is quiet, the works are loud",
    text: "Type, colour and space stay sober. Colour comes from the shader, the project visuals and the posters.",
  },
  {
    title: "Engineering first",
    text: "Data is set as data, in mono with tabular figures. Facts come before adjectives, and nothing is claimed that is not shown.",
  },
  {
    title: "One continuous motion",
    text: "The hero shader moves. Everything else answers the visitor briefly and stops.",
  },
  {
    title: "Accessible by construction",
    text: "Every colour pair is measured against WCAG 2.2 AA on this page, motion stops under reduced motion, and every image has its alt text.",
  },
] as const;

export const colorUse: Record<string, string> = {
  "--color-ground": "Page background, between sheets.",
  "--color-surface": "Cells.",
  "--color-text": "Text, titles and the wordmark.",
  "--color-text-muted": "Labels, captions and dates.",
  "--color-line": "Hairlines. Decorative, so below text contrast on purpose.",
  "--color-accent": "Underlines, award frames and hovered image frames.",
  "--color-accent-text": "Teal text at body size.",
  "--color-link": "Links, on white cells only.",
  "--color-focus": "The focus ring, 2px with a 2px offset.",
  "--color-selection": "The background of selected text.",
  "--color-shader-ground": "The shader's darkest ink, and the background of its still frame.",
};

export const shaderUse: Record<string, string> = {
  ink: "The darkest ink",
  deep: "Teal-12",
  teal: "Teal-9",
  coral: "What acts on the others",
  ivory: "The one in focus",
};

export interface ContrastPairSpec {
  foreground: string;
  background: string;
  kind: "text" | "non-text";
  use: string;
  /** A pair the system does not use, because it fails. */
  refused?: boolean;
}

/** The pairs the system uses, and the two it refuses. */
export const contrastPairs: readonly ContrastPairSpec[] = [
  { foreground: "--color-text", background: "--color-surface", kind: "text", use: "Body text in cells" },
  { foreground: "--color-text", background: "--color-ground", kind: "text", use: "Text on the page ground" },
  {
    foreground: "--color-text-muted",
    background: "--color-surface",
    kind: "text",
    use: "Labels and captions in cells",
  },
  { foreground: "--color-text-muted", background: "--color-ground", kind: "text", use: "Labels on the ground" },
  { foreground: "--color-link", background: "--color-surface", kind: "text", use: "Links, in white cells" },
  { foreground: "--color-accent-text", background: "--color-surface", kind: "text", use: "Teal text at body size" },
  { foreground: "--color-text", background: "--color-selection", kind: "text", use: "Selected text" },
  { foreground: "--color-accent", background: "--color-surface", kind: "non-text", use: "Underlines and frames" },
  { foreground: "--color-focus", background: "--color-ground", kind: "non-text", use: "The focus ring" },
  {
    foreground: "--color-link",
    background: "--color-ground",
    kind: "text",
    use: "Links on the gray ground",
    refused: true,
  },
  {
    foreground: "--color-surface",
    background: "--color-accent",
    kind: "text",
    use: "White text on teal",
    refused: true,
  },
];

export const faces: Record<string, { face: string; setting: string }> = {
  "--font-wordmark": { face: "Archivo", setting: "800, width 125%" },
  "--font-title": { face: "Stack Sans Headline", setting: "700" },
  "--font-text": { face: "Stack Sans Text", setting: "300 to 600" },
  "--font-email": { face: "Stack Sans Notch", setting: "700" },
  "--font-data": { face: "Fragment Mono", setting: "400" },
  "--font-code": { face: "The system monospace", setting: "SF Mono, Menlo, Consolas" },
};

export const typeUse: Record<string, string> = {
  "--font-wordmark": "The name, and only the name.",
  "--font-title": "Titles, project names and the footer email on inner pages.",
  "--font-text": "Everything else. Long reads are set at 300, so their bold carries.",
  "--font-email": "The email address, at display size.",
  "--font-data": "Coordinates, dates, handles and figures.",
  "--font-code": "Code blocks and inline code, in the face developers already read code in.",
  "--font-weight-light": "Running text in case studies and notes.",
  "--font-weight-text": "Body text elsewhere.",
  "--font-weight-strong": "Tags and emphasised links.",
  "--font-weight-bold": "Bold inside running text.",
  "--font-weight-title": "Titles.",
  "--font-weight-wordmark": "The wordmark.",
  "--font-stretch-wordmark": "The wordmark's width.",
  "--font-size-step-minus-1": "Labels, captions and metadata.",
  "--font-size-step-0": "Running text.",
  "--font-size-step-1": "Section titles inside a long read.",
  "--font-size-step-2": "Small headings and the hero's email.",
  "--font-size-step-3": "The titles of the home page's sections.",
  "--font-size-step-4": "A note's title.",
  "--font-size-step-5": "The wordmark and the contact email.",
  "--font-size-media-name": "The name on a project's title card, drawn in the media kit.",
  "--font-size-email": "The email, fitted to its own cell on one line.",
  "--font-size-email-large": "The same in the contact section, where it is the display line.",
  "--font-size-data": "Mono, set a little under the text beside it.",
  "--line-height-tight": "The wordmark and the page's h1.",
  "--line-height-title": "Titles.",
  "--line-height-text": "Running text.",
  "--line-height-lede": "Lead paragraphs and tags.",
  "--letter-spacing-wordmark": "Tightened, as the wordmark grows.",
  "--letter-spacing-title": "Titles.",
};

export const layoutUse: Record<string, string> = {
  "--layout-columns": "Columns of the sheet from 60rem. Below, one column.",
  "--layout-gutter": "The page's side margin, and the gap above the pinned breadcrumb.",
  "--layout-measure": "The longest line of running text.",
  "--layout-measure-wide": "Case study bodies beside their section titles, about 75 characters.",
  "--hero-shader-height": "The shader cell's height.",
  "--artwork-height": "Artworks hang at one height, each at its own ratio.",
  "--border-width-hairline": "The hairline's width.",
  "--border-hairline": "The line on every cell edge.",
  "--border-hairline-overlap": "Pulls a cell onto the hairline above it, so its own top line covers that one.",
  "--tap-size": "The touch target of a small link or button.",
  "--focus-ring": "The focus outline.",
  "--focus-offset": "The space between an element and its focus ring.",
  "--trail-clearance": "Where anchors land, below the pinned breadcrumb.",
  "--trail-band-bleed": "How far the band of ground above the breadcrumb reaches past the sheet.",
  "--trail-index-offset": "Where the list of sections sticks beside a long read.",
  "--layer-trail": "Stacking: the pinned breadcrumb covers the page scrolling under it.",
  "--layer-skip-link": "Stacking: the skip link covers everything.",
  "--layer-card-link": "Stacking: a card's link, spread over its media.",
  "--layer-transition-top": "Stacking: the page snapshot that covers the other during a transition.",
};

export const spaceUse = "Multiples of 0.25rem: the number in the name is the multiple.";

export const motionUse: Record<string, string> = {
  "--duration-quick": "Colour feedback.",
  "--duration-draw": "A link's line being drawn.",
  "--duration-fade": "The shader fading in over its still frame.",
  "--duration-page": "Page transitions.",
  "--ease-snap": "Feedback.",
  "--ease-out": "Movement: fast start, long settle.",
};

export const imageFrames = [
  { ratio: "16 / 10", label: "16:10", use: "A project's cover and gallery." },
  { ratio: "4 / 3", label: "4:3", use: "An experiment's thumbnail." },
  { ratio: "1 / 1", label: "1:1", use: "The portrait, in black and white." },
] as const;

/** Every component of ui/ and site/: the test fails when one is missing. */
export const componentRoles: Record<string, string> = {
  ArticleBody: "The body of a case study or a note, ruled like a specification, with its list of sections beside it.",
  Breadcrumbs: "The way back home from inner pages: the sheet's first cell, pinned one gutter below the top.",
  Cell: "One cell: right and bottom hairlines, white surface, a span out of 12, flush for media.",
  CodeText: "A line of frontmatter where backticks mark identifiers, set as inline code.",
  EmailLink: "The email in Notch, fitted to its cell, on one line at every width.",
  ExternalMark:
    "Inside a link that leaves the site: a drawn arrow in the link's colour, and the fact for screen readers.",
  FactList: "Term and value pairs. Data values are set in mono, lists are shown as tags.",
  LoopMedia: "A Media with an optional preview loop over it, played by an ancestor's hover or focus.",
  Media: "Images as AVIF with a hairline frame and an optional ratio.",
  ScrambleText: "Mono data that scrambles when an ancestor is pointed at. The real text stays readable.",
  SectionIndex: "The body's sections, numbered like their titles and kept in view. Marks the one being read.",
  SectionTitle: "The title cell of a section, with an optional aside link.",
  Sheet: "A block of cells: draws the top and left hairlines.",
  SiteFooter: "The year, the legal notice and this page.",
  SkipLink: "The first stop of a keyboard: jumps over the page to its main content.",
  TagList: "Technologies as small tags framed by a hairline, in the text face.",
  ZoomMedia: "A Media that opens larger in a viewer: a sheet of ground over the page, closed by Close or Escape.",
};
