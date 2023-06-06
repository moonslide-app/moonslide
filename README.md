# Moonslide 🌛🛝

![](./docs/moonslide-screenshot.png)

Moonslide is a markdown based presentation editor.

[![Run CI](https://github.com/reveal-editor/reveal-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/reveal-editor/reveal-editor/actions/workflows/ci.yml)

## Features ⚽️
-   **Markdown-based:** Write your presentation in Markdown with useful syntax extentions.
-   **Reveal.js under the hood:** Uses the power of Reveal.js to create stunning HTML presentations.
-   **Export Possibilities:** Export your presentation to HTML and PDF.
-   **Code Editor:** Write your presentation directly in the code editor of the program.
-   **Live Previews:** Your presentation is previewed at hot-reloaded as you write it.
-   **Templates & Themes:** Write custom templates and themes to configure the behaviour and looks of your presentations.
-   **Desktop Program:** Install Moonslide on the operating system of your choice.

## Philosophy
There are two ways to use Moonslide. 
1. Use it as a normal person: Enjoy the convenience of the standard template, which provides you with everything you need to create stunning Markdown presentations.
2. Use it as a hacker: Create your own template and configure every aspect of your Reveal.js Presentation. You have control over basically everything! Use the standard template as a starting point.

## Installation 
Download the latest release [here](https://github.com/reveal-editor/reveal-editor/releases).

## Getting Started
Presentations are written in Markdown. For every slide there is a configuration block written in YAML inside the seperators `---` similar to Front Matter. The following example shows the definition of two simple slides.
```yaml
---
layout: base
transition: zoom
---

# First Slide
## This is the first slide.

---
layout: cols-2
---

# Second Slide
```

## Markdown Syntax
In the Markdown-Blocks of the presentations, standard Markdown formatting options are supported. The [markdown-it](https://github.com/markdown-it/markdown-it) parser is used to parse the content. Some markdown extensions are used to add the possibility to style indiviual components.

### Horizontal Rule aka. Separators
The horizontal rule (`<hr>`) markers `---` and `***` have a special meaning when they are used at the start of a line.
- `---` marks the separation between a Markdown and a YAML block and splits the content up into indivdual slides.
- `***` seperates indiviual *slots* inside a slide. These are important when working with **TODO** layouts.

```yaml
---
layout: cols-2
---

## Slide 1 - Slot 1
***
## Slide 1 - Slot 2

---
layout: cols-3
---

## Slide 2 - Slot 1 
***
## Slide 2 - Slot 2
***
## Slide 2 - Slot 3
```


### Attributes
It is possible to apply any attributes like classes, styles or data tags to a block. Take a look at [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) for the whole documentation. Here are some examples how it works: 

```html
<!-- Add custom classes -->
# Heading { .first-class .second-class } 
<h1 class="first-class second-class">Heading</h1>

<!-- Add style and data attribute -->
## Red Roses { style="background-red" data-rose="true" }
<h2 style="background-red" data-rose="true">Red Roses</h2>

<!-- Inline Elements --> 
The roses are **red**{ .text-red }.
<p>The roses are <strong class="text-red">red</strong>.</p>
```

### Bracketed Spans
If an arbitrary text should be wrapped inside a span in order to style it, a bracketed span can be used. For this the extension [markdown-it-bracketed-spans](https://github.com/mb21/markdown-it-bracketed-spans) is used. Here are some examples how it works:

```html
<!-- Add class to part of heading -->
# Heading [Red]{ .text-red }
<h1>Heading <span class="text-red">Red</span></h1>

<!-- Don't add a space between brackets and braces -->
# Heading [Red] { .text-red }   
<h1 class="text-red">Heading [Red]</h1>
```

### Media 
Include images using the standard markdown syntax. 

```html
<!-- Include Local Image --->
![house](./media/house.jpg)

<!-- Include Image via url --->
![house](https://www.images.com/house)
``` 

#### Block Level vs. Inline Images
If an image is the only item inside a pargraph it is transformed to a background-image of a `div`, so it fills out the container.  The CSS classes `image` and `image-block` are applied, which can be customized inside the template.

```html
<!-- Block Level Image --->
![house](./media/house.jpg)
<div alt="house" style="background-image: url(./media/house.jpg);" class="image image-block"></div>
``` 

If there are other elements in the same paragraph, it is transformed to a normal `img` tag and the classes `image` and `image-inline` are applied.

 ```html
<!-- Inline Image --->
Image: ![house](./media/house.jpg)
Image: <img alt="house" src="./media/house.jpg" class="image image-inline" />
``` 

#### Videos
If the file extension is `.mp4`, `.mov` or `.vp9` it is parsed as a `<video>` tag. **TODO**
 ```html
<!-- Include Video --->
![nature](./media/nature.mp4)
<video src="./media/nature.mp4" />
``` 

### Inline HTML
Use inline HTML at any point in your presentation.
```html
# My Markdown Heading
<h2>My HTML Subheading</h2>
``` 

## Front Matter Configuration
- Presentation Config
	- template -> choose template, see standard template
	- theme -> themes defined on standard template
	- title 
	- author
	- defaults -> Slide Config

Attention file paths

- Slide Config
	- layout: choose layout for slide -> Layouts
	- class: Apply css-classes to your slide (provided by template)
	- Reveal Attributes 
## Standard Template
- All is visible in toolbar
### Themes
### Layouts
### Helper Classes

## Create your own Template
- Menu: Create own template -> don't start from scratch
- Explain config.yml
- Toolbar
- block vs. inline images
