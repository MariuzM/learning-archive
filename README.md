# learning-archive

Consolidated archive of old learning exercises and small experiments, merged from separate
repositories into one. Each folder keeps its **full git history** (imported via `git subtree`) and
carries its own `README.md` describing what it is and the stack it uses.

**67 projects** across React, Next.js, React Native, Node tooling and systems languages.

## React (web)

| Project | What it is |
| --- | --- |
| [`react-vite-starter`](react-vite-starter) | Minimal React + TypeScript + Vite starter. |
| [`react-webpack-starter`](react-webpack-starter) | Bare React app wired up manually with Babel and Webpack. |
| [`cra-ts-emotion-test`](cra-ts-emotion-test) | Create React App template wired for TypeScript and Emotion. |
| [`react-typescript-cheatsheet`](react-typescript-cheatsheet) | Reference snippets for typing React with TypeScript. |
| [`react-context-cheat-sheet`](react-context-cheat-sheet) | Reference examples for the React Context API. |
| [`react-functional-components`](react-functional-components) | Functional-component patterns with Parcel. |
| [`react-redux-testing`](react-redux-testing) | Redux state-management practice. |
| [`react-state-managers`](react-state-managers) | Comparison of Redux Toolkit and XState. |
| [`react-form-validation-yup`](react-form-validation-yup) | Form validation using Yup schemas and regex. |
| [`react-rest-api`](react-rest-api) | Consuming a REST API from React with routing. |
| [`react-comic-api`](react-comic-api) | App fetching and displaying comics from a public API. |
| [`react-chat-app`](react-chat-app) | Real-time chat app powered by PubNub. |
| [`react-auto-complete`](react-auto-complete) | Autocomplete/typeahead input built in React. |
| [`react-dnd`](react-dnd) | Drag-and-drop UI demo using react-dnd. |
| [`react-tic-tac-toe`](react-tic-tac-toe) | Classic tic-tac-toe built in React. |
| [`react-mortgage-calculator`](react-mortgage-calculator) | Mortgage repayment calculator. |
| [`react-npm-package-selector`](react-npm-package-selector) | Pick npm packages and copy an install command. |
| [`react-product-listing`](react-product-listing) | Product listing/grid UI. |
| [`react-color-change-button`](react-color-change-button) | Button that cycles colours on click. |
| [`react-add-button-with-views`](react-add-button-with-views) | Context/Hooks/API experiment with swipeable views. |
| [`react-shopping-cart-test`](react-shopping-cart-test) | Shopping-cart component with transitions. |
| [`react-shopping-site`](react-shopping-site) | Multi-page shopping site on React + Webpack. |
| [`react-double-log-issue`](react-double-log-issue) | Minimal repro of Strict Mode double-render behaviour. |
| [`react-monorepo-template`](react-monorepo-template) | Template housing multiple React apps in one workspace. |
| [`item-list-app`](item-list-app) | React item-list UI with charts and routing. |
| [`player-cards`](player-cards) | CRA experiment rendering a set of player cards. |
| [`vip-ml`](vip-ml) | React UI experiment built with React Bootstrap. |
| [`marius-dev-portfolio`](marius-dev-portfolio) | Early personal portfolio with scroll-driven sections. |
| [`react-pdf`](react-pdf) | React + Vite app experimenting with PDF rendering via react-pdf. |

## Next.js

| Project | What it is |
| --- | --- |
| [`nextjs-i18n`](nextjs-i18n) | Next.js app demonstrating i18next internationalisation. |
| [`nextjs-emotion`](nextjs-emotion) | Next.js styled with Emotion, plus Storybook. |
| [`supabase-nextjs`](supabase-nextjs) | Next.js app integrated with Supabase. |
| [`web3-client-only`](web3-client-only) | Client-only crypto wallet (Web3Modal, wagmi, ethers). |
| [`framework-samples`](framework-samples) | Minimal apps in Next.js and React + TanStack Router. |

## React Native / Expo

| Project | What it is |
| --- | --- |
| [`expo-starter`](expo-starter) | Expo / React Native starter with navigation and tabs. |
| [`expo-web-scraper`](expo-web-scraper) | Expo Router app that scrapes and displays web content. |
| [`tractiv-fitness-app`](tractiv-fitness-app) | Fitness activity-tracking mobile app. |

## Apps

| Project | What it is |
| --- | --- |
| [`payment-form`](payment-form) | Payment form app: form handling, validation and i18n. |
| [`pos`](pos) | Point-of-sale web app UI. |

## Node, backend & tooling

| Project | What it is |
| --- | --- |
| [`netlify-react-functions`](netlify-react-functions) | React front end wired to Netlify serverless functions. |
| [`nodejs-netlify-backend`](nodejs-netlify-backend) | Small Express backend deployed as Netlify functions. |
| [`node-typescript-setup`](node-typescript-setup) | Baseline Node.js + TypeScript project configuration. |
| [`node-ts-webscraper`](node-ts-webscraper) | TypeScript Node script for automated web scraping. |
| [`sharp-esbuild-issues`](sharp-esbuild-issues) | Repro of bundling sharp with esbuild. |
| [`bun-workspace`](bun-workspace) | Minimal Bun monorepo/workspace setup. |
| [`server-performance-comparison`](server-performance-comparison) | Benchmark of Node Fastify, Go Fiber and Bun Elysia servers. |
| [`vscode-formatter-jai`](vscode-formatter-jai) | VS Code extension that formats Jai source via token-aware re-indenting. |

## Systems languages

| Project | What it is |
| --- | --- |
| [`cpp-rectangle`](cpp-rectangle) | Console 2D rectangle exercise in C++. |
| [`go-basics`](go-basics) | Introductory Go program and module setup. |
| [`go-rust-snippets`](go-rust-snippets) | Tiny side-by-side snippets in Go and Rust. |
| [`rust-examples`](rust-examples) | Rust cheat sheet and assorted examples. |
| [`rust-rocket-server`](rust-rocket-server) | Web server built with the Rust Rocket framework. |
| [`zig-pdf-generator`](zig-pdf-generator) | PDF generation library written in Zig. |
| [`jai`](jai) | Starter project for the Jai language with a build metaprogram. |
| [`jai-work-examples`](jai-work-examples) | Progressive set of runnable Jai lessons, numbered in order. |
| [`jai-sdl3-ui`](jai-sdl3-ui) | Small SDL3 + SDL3_ttf GUI (text input, button, label) in Jai. |
| [`memory-viewer-jai`](memory-viewer-jai) | Terminal tool mapping where Jai data lives in memory and how structs are laid out. |
| [`webapp-with-wasm`](webapp-with-wasm) | Zig (+C) compiled to WebAssembly, with an Odin port, driving a web page. |
| [`lut-to-lightroom-camera-profile`](lut-to-lightroom-camera-profile) | macOS Zig app converting a `.cube` LUT into a Lightroom creative profile. |
| [`pdf-image-extractor`](pdf-image-extractor) | Same PDF image-counter implemented in C, Jai, Odin, Rust and Zig. |

## Vanilla web & misc

| Project | What it is |
| --- | --- |
| [`js-basics`](js-basics) | Scratch file of plain-JavaScript experiments. |
| [`js-tic-tac-toe`](js-tic-tac-toe) | Plain-JS tic-tac-toe (originally a git-practice repo). |
| [`single-page-app`](single-page-app) | Static one-page site in HTML and SCSS. |
| [`svg-animation-test`](svg-animation-test) | Experiment animating SVG paths and shapes. |
| [`flex-resize-on-click`](flex-resize-on-click) | CSS flexbox panels that expand on click. |
| [`all-in-phuket`](all-in-phuket) | Prototype listings/booking site for Phuket. |
| [`ai-playground`](ai-playground) | AI/LLM API scratch projects in Python, Bun and React. |
