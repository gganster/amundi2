# tailwind — usage docs (source: Context7, fetched 2026-10-16)


## installation and setup with Angular

### Create a new Angular project

Source: https://tailwindcss.com/docs/installation/framework-guides/angular

Initializes a new Angular project with CSS styling via Angular CLI and navigates into the created project directory.

```bash
ng new my-project --style csscd my-project
```

### Installation > Install Tailwind CSS with Angular > Create your project

Source: https://tailwindcss.com/docs/installation/framework-guides/angular

Start by creating a new Angular project if you don’t have one set up already. The most common approach is to use Angular CLI.

--------------------------------

### Installation > Install Tailwind CSS with Angular > Import Tailwind CSS

Source: https://tailwindcss.com/docs/installation/framework-guides/angular

Add an `@import` to `./src/styles.css` that imports Tailwind CSS.

--------------------------------

### Installation > Install Tailwind CSS with Angular > Configure PostCSS Plugins

Source: https://tailwindcss.com/docs/installation/framework-guides/angular

Create a `.postcssrc.json` file in the root of your project and add the `@tailwindcss/postcss` plugin to your PostCSS configuration.

--------------------------------

### Installation > Install Tailwind CSS with Angular > Start your build process

Source: https://tailwindcss.com/docs/installation/framework-guides/angular

Run your build process with `ng serve`.


## utility classes, responsive design, dark mode

### Apply dark mode styles with dark variant

Source: https://tailwindcss.com/docs/styling-with-utility-classes

Prefix utilities with `dark:` alongside light mode utilities to target elements when dark mode is active.

```html
<div class="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">  <div>    <span class="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">      <svg        class="h-6 w-6 text-white"        fill="none"        viewBox="0 0 24 24"        stroke="currentColor"        aria-hidden="true"      >        <!-- ... -->      </svg>    </span>  </div>  <h3 class="text-gray-900 dark:text-white mt-5 text-base font-medium tracking-tight ">Writes upside-down</h3>  <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm ">    The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.  </p></div>
```

--------------------------------

### Style notification card component with utility classes

Source: https://tailwindcss.com/docs/styling-with-utility-classes

Combines layout, spacing, typography, and dark mode utility classes directly in HTML markup to construct a notification card component.

```html
<div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">  <img class="size-12 shrink-0" src="/img/logo.svg" alt="ChitChat Logo" />  <div>    <div class="text-xl font-medium text-black dark:text-white">ChitChat</div>    <p class="text-gray-500 dark:text-gray-400">You have a new message!</p>  </div></div>
```

--------------------------------

### Stack condition variants for complex selectors

Source: https://tailwindcss.com/docs/styling-with-utility-classes

Chain multiple modifiers such as dark mode, responsive breakpoints, data attributes, and pseudo-classes on a single utility.

```html
<button class="dark:lg:data-current:hover:bg-indigo-600 ...">  <!-- ... --></button>
```

```css
@media (prefers-color-scheme: dark) and (width >= 64rem) {  button[data-current]:hover {    background-color: var(--color-indigo-600);  }}
```

--------------------------------

### Stack multiple variants

Source: https://tailwindcss.com/docs/hover-focus-and-other-states

Combine multiple variant prefixes like `dark:`, `md:`, and `hover:` to target specific compound conditions such as hovering on a medium screen in dark mode.

```html
<button class="dark:md:hover:bg-fuchsia-600 ...">Save changes</button>
```

### Media and feature queries > prefers-color-scheme

Source: https://tailwindcss.com/docs/hover-focus-and-other-states

The `prefers-color-scheme` media query tells you whether the user prefers a light theme or dark theme, and is usually configured at the operating system level.
Use utilities with no variant to target light mode, and use the `dark` variant to provide overrides for dark mode:
Light mode
Writes upside-down
The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.
Dark mode
Writes upside-down
The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.

Check out the Dark Mode documentation for an in-depth look at how this feature works.


## theme customization and configuration

### Configuring theme() on theme.css import

Source: https://tailwindcss.com/docs/preflight

Place theme configuration options such as theme(static) or theme(inline) on the theme.css import to modify theme variables.

```css
@layer theme, base, components, utilities;@import "tailwindcss/theme.css" layer(theme);@import "tailwindcss/theme.css" layer(theme) theme(static);@import "tailwindcss/utilities.css" layer(utilities);
```

--------------------------------

### Default theme configuration in theme.css

Source: https://tailwindcss.com/docs/theme

Defines default theme variables such as fonts, colors, and shadows inside the @theme directive.

```css
@theme {  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;  --color-red-50: oklch(0.971 0.013 17.38);  --color-red-100: oklch(0.936 0.032 17.717);  --color-red-200: oklch(0.885 0.062 18.334);  /* ... */  --shadow-2xs: 0 1px rgb(0 0 0 / 0.05);  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);  /* ... */}
```

--------------------------------

### Define design tokens using @theme

Source: https://tailwindcss.com/docs/functions-and-directives

Configures project design tokens such as fonts, responsive breakpoints, color palettes, and transition easing curves.

```css
@theme {  --font-display: "Satoshi", "sans-serif";  --breakpoint-3xl: 120rem;  --color-avocado-100: oklch(0.99 0 0);  --color-avocado-200: oklch(0.98 0.04 113.22);  --color-avocado-300: oklch(0.94 0.11 115.03);  --color-avocado-400: oklch(0.92 0.19 114.08);  --color-avocado-500: oklch(0.84 0.18 117.33);  --color-avocado-600: oklch(0.53 0.12 118.34);  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);  /* ... */}
```

### Customizing your theme

Source: https://tailwindcss.com/docs/theme

The default theme variables are very general purpose and suitable for building dramatically different designs, but they are still just a starting point. It's very common to customize things like the color palette, fonts, and shadows to build exactly the design you have in mind.

--------------------------------

### Customizing your colors

Source: https://tailwindcss.com/docs/colors

Use `@theme` to add custom colors to your project under the `--color-*` theme namespace:

Now utilities like `bg-midnight`, `text-tahiti`, and `fill-bermuda` will be available in your project in addition to the default colors.
Learn more about theme variables in the theme variables documentation.
