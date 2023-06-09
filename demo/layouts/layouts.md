---
template: ../../src-main/assets/templates/standard
title: Layouts
theme: white
defaults:
  class: text-3xl 
layout: base
---
<style>
.slot-box {
  flex-grow: 1; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: white; 
  font-weight:600; 
  padding: 20px;"
}
</style>

<div class="slot-box" style="background-color: var(--color-indigo)">
  Slot 1
</div>
---
layout: cols-3
---

<div class="slot-box" style="background-color: var(--color-indigo)">
  Slot 1
</div>
***
<div class="slot-box" style="background-color: var(--color-purple)">
  Slot 2
</div>
***
<div class="slot-box" style="background-color: var(--color-pink)">
  Slot 3
</div>

---
layout: grid-3
---

<div class="slot-box" style="background-color: var(--color-indigo)">
  Slot 1
</div>
***
<div class="slot-box" style="background-color: var(--color-purple)">
  Slot 2
</div>
***
<div class="slot-box" style="background-color: var(--color-pink)">
  Slot 3
</div>

---
layout: title-cols-2
---

<div class="slot-box" style="background-color: var(--color-indigo)">
  Slot 1
</div>
***
<div class="slot-box" style="background-color: var(--color-purple)">
  Slot 2
</div>
***
<div class="slot-box" style="background-color: var(--color-pink)">
  Slot 3
</div>
