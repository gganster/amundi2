# spartan — usage docs (source: Context7, fetched 2026-10-16)


## installation and setup with Angular and Tailwind

### Install Core Dependencies

Source: https://spartan.ng/documentation/installation

Manually install the brain primitives and Angular CDK.

```bash
pnpm add @spartan-ng/brain
```

```bash
pnpm add @angular/cdk
```

--------------------------------

### Configure UI Theme

Source: https://spartan.ng/documentation/cli

Initialize the theme and Tailwind settings for your project.

```bash
ng g @spartan-ng/cli:ui-theme
```

```bash
npx nx g @spartan-ng/cli:ui-theme
```

--------------------------------

### Configure CSS Layers

Source: https://spartan.ng/documentation/installation

Define Tailwind CSS layers in your global styles file.

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
```

--------------------------------

### Angular CLI Project components.json Configuration

Source: https://spartan.ng/documentation/components-json

Configuration structure for standard Angular CLI projects.

```json
{
	"componentsPath": "libs/ui",
	"importAlias": "@spartan-ng/helm",
	"style": "nova" | "vega" | "lyra" | "maia" | "mira" | "luma",
}
```

### Manual Setup > Configure Tailwind CSS

Source: https://spartan.ng/documentation/installation

To ensure correct styling, you must configure CSS layers in your main stylesheet and import the spartan/ui Tailwind preset. Theme variables can be managed either by using the CLI's theme generator for automatic configuration or by manually defining the required CSS variables in your root stylesheet.


## using Spartan UI components and primitives (brain and helm)

### Install Core Dependencies

Source: https://spartan.ng/documentation/installation

Manually install the brain primitives and Angular CDK.

```bash
pnpm add @spartan-ng/brain
```

```bash
pnpm add @angular/cdk
```

--------------------------------

### Import spartan/ui Preset

Source: https://spartan.ng/documentation/installation

Include the spartan preset in your CSS file.

```css
@import "@spartan-ng/brain/hlm-tailwind-preset.css";
```

--------------------------------

### Implement Typography in Angular Component

Source: https://spartan.ng/documentation/typography

Use the provided hlm typography directives to style standard HTML elements within an Angular component template.

```typescript
import { Component } from '@angular/core';
import { hlmBlockquote, hlmH1, hlmH2, hlmH3, hlmLead, hlmP, hlmUl } from '@spartan-ng/helm/typography';

@Component({
  selector: 'spartan-typography-preview',
  template: `
    <h1 class="${hlmH1}">The Joke Tax Chronicles</h1>
    <p class="${hlmLead} mt-4">
      Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day,
      his advisors came to him with a problem: the kingdom was running out of money.
    </p>
    <h2 class="${hlmH2} mt-10">The King's Plan</h2>
    <p class="${hlmP}">
      The king thought long and hard, and finally came up with a brilliant plan : he would tax the jokes in the kingdom.
    </p>
    <blockquote class="${hlmBlockquote}">
      "After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the privilege."
    </blockquote>
    <h3 class="${hlmH3} mt-8">The Joke Tax</h3>
    <p class="${hlmP}">The king's subjects were not amused. They grumbled and complained, but the king was firm:</p>
    <ul class="${hlmUl}">
      <li>1st level of puns: 5 gold coins</li>
      <li>2nd level of jokes: 10 gold coins</li>
      <li>3rd level of one-liners : 20 gold coins</li>
    </ul>
    <p class="${hlmP}">
      As a result, people stopped telling jokes, and the kingdom fell into a gloom. But there was one person who refused
      to let the king's foolishness get him down: a court jester named Jokester.
    </p>
    <h3 class="${hlmH3} mt-8">Jokester's Revolt</h3>
    <p class="${hlmP}">
      Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the
      king's pillow, in his soup, even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester.
    </p>
    <p class="${hlmP}">
      And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they
      couldn't help but laugh. And once they started laughing, they couldn't stop.
    </p>
    <h3 class="${hlmH3} mt-8">The People's Rebellion</h3>
    <p class="${hlmP}">
      The people of the kingdom, feeling uplifted by the laughter, started to tell jokes and puns again, and soon the
      entire kingdom was in on the joke.
    </p>
    <p class="${hlmP}">
      The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.
      Jokester was declared a hero, and the kingdom lived happily ever after.
    </p>
    <p class="${hlmP}">
      The moral of the story is: never underestimate the power of a good laugh and always be careful of bad ideas.
    </p>
  `,
})
export default class TypographyPreviewComponent {}
```

--------------------------------

### Apply Muted Typography

Source: https://spartan.ng/documentation/typography

Use hlmMuted to style a muted text element.

```typescript
import { Component } from '@angular/core';
import { hlmMuted } from '@spartan-ng/helm/typography';

@Component({
  selector: 'spartan-muted',
  template: `
    <p class="${hlmMuted}">Enter your email address.</p>
  `,
})
export default class MutedComponent {}
```

### Introduction > How it works

Source: https://spartan.ng/documentation/introduction

The architecture consists of two layers: spartan/ui/brain and spartan/ui/helm. Brain provides unstyled, accessible primitives via npm that handle ARIA attributes, keyboard navigation, and focus management. Helm provides styled components inspired by shadcn/ui, which are copied directly into your codebase, allowing for complete control over styling without needing to learn a complex theming API.


## theming and CLI

### Configure UI Theme

Source: https://spartan.ng/documentation/cli

Initialize the theme and Tailwind settings for your project.

```bash
ng g @spartan-ng/cli:ui-theme
```

```bash
npx nx g @spartan-ng/cli:ui-theme
```

--------------------------------

### Angular CLI Project components.json Configuration

Source: https://spartan.ng/documentation/components-json

Configuration structure for standard Angular CLI projects.

```json
{
	"componentsPath": "libs/ui",
	"importAlias": "@spartan-ng/helm",
	"style": "nova" | "vega" | "lyra" | "maia" | "mira" | "luma",
}
```

--------------------------------

### Configure style in components.json

Source: https://spartan.ng/documentation/styles

Update the style field in components.json to change the visual theme of generated components.

```json
{
  "style": "nova",
  ...
}
```

--------------------------------

### Define Zinc Theme CSS Variables

Source: https://spartan.ng/documentation/theming

Configures the Zinc theme using CSS variables for light and dark modes.

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.985 0 0);
  --sidebar-primary-foreground: oklch(0.21 0.006 285.885);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.552 0.016 285.938);
}
```

### UI > CLI > Setup Your Theme

Source: https://spartan.ng/documentation/cli

Before adding components, users must configure their theme and Tailwind settings using the CLI's theme generator. This process prompts for application selection, style entry point location, theme choice, and preferred border radius, and only needs to be performed once.
