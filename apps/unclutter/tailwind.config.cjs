const template = require("../../tailwind.template.cjs");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...template,
    content: [
        "./source/**/*.svelte",
        "./source/**/*.tsx",
        "../../common/library-components/dist/**/*.js",
    ],
    darkMode: "class",
};
