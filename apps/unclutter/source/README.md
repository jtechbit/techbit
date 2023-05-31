# Code documentation

Basic code documentation for extension review and open-source contribution purposes. For more, see the source code at https://github.com/lindylearn/reader-extension.

## Functionality

This browser extension adjusts and changes the CSS of webpages to make them more readable.

## File structure

This web extension uses the following script entry points:

-   `content-script/boot.js` to boostrap the extension functionality inside a tab if the user configured it as such. This minimal script is injected into every tab before DOM construction.
-   `content-script/enhance.js` to enable the full extension functionality inside a tab. This script is only injected for URLs the user allowlisted (as determined by `boot.js`).
-   `overlay/outline/TopLeftContainer.svelte` for the article outline UI.
-   `sidebar/App.tsx` for the sidebar iframe used to display social comments and highlights.
-   `settings-page/Options.tsx` for the extension settings page.
-   `background/events.js` to handle persistent background events like extension icon clicks.

## Bundling

The content scripts are bundled as 'immediately invoked functions' with inlined dependencies, the background scripts and React views use ES modules for code readability.

All library code in the `node_modules` folders is unmodified but bundled using Rollup. For the used dependency versions see `package.json`.
