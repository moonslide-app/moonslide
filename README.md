# Moonslide 🌛🛝

![](./docs/moonslide-screenshot.png)

Moonslide is a markdown based presentation editor.

[![Run CI](https://github.com/reveal-editor/reveal-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/reveal-editor/reveal-editor/actions/workflows/ci.yml)

[Link to Markdown Syntax](#markdown-syntax)
[Link to Demos](#demos)

## Features ⚽️
-   **Markdown-based:** Write your presentation in Markdown with useful syntax extentions.
-   **Reveal.js under the hood:** Uses the power of Reveal.js to create stunning HTML presentations.
-   **Export Possibilities:** Export your presentation to HTML and PDF.
-   **Code Editor:** Write your presentation directly in the code editor of the program.
-   **Live Previews:** Your presentation is previewed at hot-reloaded as you write it.
-   **Templates & Themes:** Write custom templates and themes to configure the behaviour and looks of your presentations.
-   **Desktop Program:** Install Moonslide on the operating system of your choice.

## Demos
Take a look at the [demos](./demos).

## Installation 
Download the latest release [here](https://github.com/reveal-editor/reveal-editor/releases).

## Philosophy
There are two ways to use Moonslide. 
1. Use it as a normal person: Enjoy the convenience of the standard template, which provides you with everything you need to create stunning Markdown presentations.
2. Use it as a hacker: Create your own template and configure every aspect of your Reveal.js Presentation. You have control over basically everything! Use the standard template as a starting point.

## What is a Template?
A template is a folder which contains all relevant assets to generate the Reveal.js presentation from the Markdown presentation. It consists rougly of the following parts:
- The used Reveal.js distribution
- The definition of the available themes.
- The definition of the available layouts.
- Additional stylesheets with utility classes. 
- The configuration of the toolbar inside the app.

Take a look at the standard template **TODO**. If you want to create your own template, take a look at the section **TODO**. 

## Create your first Presentation
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

# Markdown Syntax
In the Markdown-Blocks of the presentations, standard Markdown formatting options are supported. The [markdown-it](https://github.com/markdown-it/markdown-it) parser is used to parse the content. Some markdown extensions are used to add the possibility to style indiviual components.

### Slide and Slot Separators
The horizontal rule (`<hr>`) markers `---` and `***` have a special meaning when they are used at the start of a line. `---` marks the separation between a Markdown and a YAML block and splits the content up into indivdual slides. `***` seperates indiviual *slots* inside a slide. These are important when working with **TODO** layouts.

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
## Red Roses { style="color: red;" data-rose="true" }
<h2 style="color: red;" data-rose="true">Red Roses</h2>

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
### Presentation Configuration
In the Front Matter block of the first slide, there are some attributes which configure the whole presentation.

```yaml
---
# standard or ./path/to/your-template
template: standard 
# black or white (for standard template)
theme: black
# title and author of the presentation
title: My First Presentation
author: Markdown Enthusiast
# Apply default values for all slides (-> Slide Configuraton)
defaults: 
  transition: zoom
  layout: title-content
---
```

### Slide Configuration
There are configuration options which can be applied to every slide individually.

#### Layout
Every slide uses a layout to structure its contents in a certain way. Every layout has a number of *slots*, which are containers for your content. Use the slot-separator `***` to fill content into the next slot. Take a look at all layouts available in the standard template. **TODO**.

```yaml
---
# This layout splits the content in to two columns.
layout: cols-2
---

# Left Side 

***

# Right Side
```

#### Custom Classes 
Custom classes can be added to every slide. These classes are usually defined inside the template. The standard template comes with a lot of useful classes to style your slides with. In some cases it may be more useful to only style a custom element using the Markdown-Attributes Syntax **TODO: Link**.

```yaml
---
class:
  - position-center  # Centers the content vertically
  - text-center      # Centers the text horizontally
  - text-red         # Changes the text color to red 
---

# My Customized Heading
```

#### Reveal.js Data-Attributes
You can specify every other keyword on the slide, and it will be directly passed to the HTML-Elemnt of the slide as a data-tag. In this way a lot of features of Reveal.js can be used. E.g., `transition: slide` will be transformed to `data-transition="slide"`. These are some possible values, which are available in Reveal.js:

```yaml
---
transition: slide
background-transition: slide
transition-speed: fast

background-image: ./my-image.jpg 
background-video: ./my-video.mp4
background-opacity: 0.5
background-size: contain
background-position: center

auto-animate: true
---
```

> Note: Make sure to start local relative paths with `./` or `../`. The paths are automatically transformed and can not be recognized if just the filename is present (`my-image.jpg` does not work).

You can find more information under [Transition (Reveal.js)](https://revealjs.com/transitions/), [Backgrounds (Reveal.js)](https://revealjs.com/backgrounds/) and [Auto-Animate (Reveal.js)](https://revealjs.com/auto-animate/).

## Standard Template
There is a standard template that comes with Moonslide. This section present the most important parts of the template. You will find basically everything described here inside the different items of the toolbar, when the standard template is used in the presentation.

### Themes
There are two themes which you can choose from `black` and `white`. Every theme includes its own CSS stylesheets, which changes the apperance of the whole presentation.

| `theme: black` | `theme:white` |
|:--|:--|
| ![](./docs/theme-black.png) | ![](./docs/theme-white.png) |

### Layouts
The standard template offers 18 layouts grouped into four categories: 

- **`Base`**: The `base` layout is the default and consits of just one slot which fills the whole slide.
- **`Cols`**: Groups the content into vertical columns. Available layouts are `cols-2`, `cols-3` and `cols-4`.
- **`Grid`**: Groups the content into a grid with various amount of items. Available layouts are `grid-3`, `grid-3-right`, `grid-4`, `grid-5`, `grid-6`, `grid-7`, `grid-8` and `grid-9`. 
- **`Title`**: Groups the content into a title and a sublayout. Available layouts are `title-content`, `title-cols-2`, `title-cols-3`, `title-grid-3`, `title-grid-3-right` and `title-grid-4`.

Take a look at an example of every category:

| Layout | Image |
|:--|:--|
| `layout: base` | ![](./docs/layout-base.png) |
| `layout: cols-3` | ![](./docs/layout-cols-3.png) |
| `layout: grid-3` | ![](./docs/layout-grid-3.png) |
| `layout: title-cols-2` | ![](./docs/layout-title-cols-2.png) |


### Utility  Classes
The standard template offers a range of utility CSS-classes. They are available in the toolbar properties `Style`, `Animation` and `Slide Styles`. Here is a list of the some utitliy classes (not nearly complete):

- **Vertical Position (`position-`)**: `top`, `center`, `bottom`
- **Text-Alignment (`text-`)**: `left`, `center`, `right`
- **Font-Size (`text-`)**: `xs`, `sm`, `base`, `lg`, `xl`, ...
- **Font-Color (`text-`)**: `main`, `white`, `black`, `red`,  `green`, `blue`, ...
- **Image (image-)**: `cover`, `contain`, `center`, ...
- **Width (w-)**: `full`, `half`, `0`, `1`, `2`, `3`, `4`, ...
- **Height (h-)**: `full`, `half`, `0`, `1`, `2`, `3`, `4`, ...
- **Margin (m-)**: `0`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, ...

## Create your own Template
You can create your own template and use it in your presentation by specifying the path to your template folder in the Front Matter Configuration of the first slide.

```yaml
---
template: ./path/to/your-template-folder
---
```

Start off by selecting `Menu / File / Create Template`. This will copy the standard template to your desired location. This is important, because you probably don't want to start from scratch.

### The `config.yml` File
At the top-level of your template-directory, there has to be a `config.yml` file. It is the heart of the template and references all other needed files. 

> Be aware, that all files referenced in `config.yml` have to be inside the template folder.

Take a look at the standard templates `config.yml` file. Some entries are explained in more detail below.

```yaml
# Entry point script which must call `RevealEditor.configure()`.
entry: ./index.js
# Entry point script and stylesheet(s) of the reveal.js distribution.
reveal:
  entry: ./reveal_js/dist/reveal.js
  stylesheets: ./reveal_js/dist/reveal.css
# Additional stylesheets which are loaded after reveal and theme stylesheets.
stylesheets: ./styles/index.css
# Additional scripts which are loaded after the reveal entry script, but before the entry script
# This property is suitable to specify additional (reveal.js) plugins.
scripts:
  - ./reveal_js/plugin/highlight/highlight.js
  - ./reveal_js/plugin/math/math.js
  - ./reveal_js/plugin/search/search.js
  - ./reveal_js/plugin/zoom/zoom.js
# HTML file which allows to define a wrapper around all slides. 
# Must contain a `@@content@@` token where the slide content will be placed.
slide: ./slide.html
# Definition of themes which add additional stylesheets.
themes:
  - name: black
    default: true
    stylesheets:
      - ./reveal_js/dist/theme/black.css
      - ./styles/colors/black.css
      - ./styles/code/stackoverflow-dark.css
  - name: white
    stylesheets:
      - ./reveal_js/dist/theme/white.css
      - ./styles/colors/white.css
      - ./styles/code/stackoverflow-light.css
# Definition of layouts which are used to build the slides.
# Every layout must contain at least one `@@slot@@` token where the content is placed.
layouts:
  - name: base
    default: true
    path: ./layouts/base.html
  - name: cols-3
    path: ./layouts/cols-3.html
  - name: grid-3
    path: ./layouts/grid-3-left.html
  - name: title-cols-2
    path: ./layouts/title-cols-2.html
# For every section of the toolbar a separate file can be specified 
# which lists all items to show in this section
toolbar:
  layouts: ./toolbar/layouts.yml
  styles: ./toolbar/styles.yml
  animation: ./toolbar/animation.yml
  slide: ./toolbar/slide.yml
  slideStyles: ./toolbar/slideStyles.yml
```

### Entry Script (`entry`)
The specified entry script **must** initialize Reveal.js. Otherwise the presentations using your template will not be displayed. In a normal Reveal.js presentation, we would have to call [`Reveal.initialize()`](https://revealjs.com/initialization/). When using MoonSlide, you have to call `MoonSlide.initialize()` instead, so we can override some options for the live previews. The function calls are forwarded to the `Reveal` object, so the API is exactly the same as it is in Reveal.js. Here is an example entry script.

```js
Moonslide.initialize({ 
  controls: true,
  progress: true,
  history: true,
  plugins: [RevealHighlight, RevealMath]
})
```

Take a look at all [configuration options](https://revealjs.com/initialization/).

### Slide Customization (`slide`)
If you want to define a wrapper for all slides, e.g., to a header or footer to your presentation, you can provide you custom `slide.html` file. The contents of the file will be wrapped around every slide from the presentation individually. There has to be the token `@@content@@` inside the HTML-file, where the slides will be injected. Have a look at the `slide.html` file of the standard template, which can be used as a starting point to add a header or a footer.

```html
<div class="slide-wrapper">
    <!-- <div>Insert header here</div> -->
    @@content@@
    <!-- <div>Insert footer here</div> -->
</div>
```

### Define Layouts (`layouts`)
To define your own layout, just create a HTML-file with your layout and reference it inside `config.yml`. Put the token `@@slot@@` for every slot there is inside the layout. Take a look at the `cols-3.html` file, which defines the layout `cols-3` (with 3 slots).

```html
<div class="layout cols cols-3">
    <div class="slot">@@slot@@</div>
    <div class="slot">@@slot@@</div>
    <div class="slot">@@slot@@</div>
</div>
```

### Customize Toolbar (`toolbar`)