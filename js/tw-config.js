/* 404TABLE V2 — Tailwind design tokens (Rebellious Ink × 文化科技) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        "paper-cream": "#F6F3EB",
        "paper-warm": "#EFE3D1",
        "forest-deep": "#0B332B",
        "forest-700": "#1E5F4E",
        "marker-yellow": "#F2C14E",
        "rebel-orange": "#FF6B4A",
        "tech-cyan": "#00BFC2",
        "ink-black": "#111111",
        "surface": "#fcf9f1",
        "surface-container": "#f1eee6",
        "surface-container-low": "#f6f3eb",
        "surface-container-high": "#ebe8e0",
        "surface-variant": "#e5e2da",
        "surface-dim": "#dcdad2",
        "on-surface": "#1c1c17",
        "on-surface-variant": "#414846",
        "outline": "#717976"
      },
      fontFamily: {
        "display": ["Bricolage Grotesque", "Noto Sans TC", "sans-serif"],
        "body-md": ["Noto Sans TC", "Noto Sans", "sans-serif"],
        "body-lg": ["Noto Sans TC", "Noto Sans", "sans-serif"],
        "headline-md": ["Bricolage Grotesque", "Noto Sans TC", "sans-serif"],
        "headline-lg": ["Bricolage Grotesque", "Noto Sans TC", "sans-serif"],
        "display-lg": ["Bricolage Grotesque", "Noto Sans TC", "sans-serif"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "mono": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "30px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "800" }]
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px"
      },
      spacing: {
        base: "8px",
        "card-gap": "16px",
        "container-padding": "20px",
        "section-margin": "40px"
      }
    }
  }
};
