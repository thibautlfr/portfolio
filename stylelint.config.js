// Tokens are the only place raw values may appear: everywhere else a colour,
// a size, a space or a duration must come from a custom property.
/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-html/astro"],
  plugins: ["stylelint-declaration-strict-value"],
  rules: {
    "scale-unlimited/declaration-strict-value": [
      [
        "/color$/",
        "fill",
        "stroke",
        "background",
        "font-size",
        "font-family",
        "/^(margin|padding|gap|row-gap|column-gap)/",
        "/^inset/",
        "transition-duration",
        "animation-duration",
        "z-index",
      ],
      {
        ignoreValues: ["currentcolor", "transparent", "inherit", "initial", "unset", "none", "0", "auto", "100%"],
        ignoreFunctions: false,
        disableFix: true,
      },
    ],
    // Vite resolves bare package paths in string imports.
    "import-notation": "string",
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
  },
  overrides: [
    {
      files: ["src/styles/tokens/**/*.css", "src/styles/base/reset.css"],
      rules: { "scale-unlimited/declaration-strict-value": null },
    },
  ],
};
