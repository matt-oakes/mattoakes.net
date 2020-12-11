const path = require("path");

module.exports = {
  plugins: {
    "postcss-import": {
      path: ["assets/css/"],
    },
    lost: {},
    "postcss-typography": {
      baseFontSize: "22px",
      baseLineHeight: 1.8,
      headerFontFamily: ["Alegreya", "serif"],
      headerWeight: "400",
      bodyFontFamily: ['Alegreya Sans', "Helvetica", "Arial", "sans-serif"],
      scaleRatio: 3,
      blockMarginBottom: 1 / 4,
      includeNormalize: false,
    },
    "postcss-cssnext": {},
  },
};
