---
theme: white
class: position-center text-2xl
---

# Moonslide 🌛🛝

---
background-image: ./image3.jpg
class: position-center text-white
---

# Background Images


---
layout: grid-4
class: position-center
---

![](./image1.jpg) { .image-cover }

***

![](./image3.jpg) { .image-cover }

***

![](./image2.jpg) { .image-cover }

***

### Mulitple Images

---
layout: title-grid-4
class: text-left text-sm
---

# Code Blocks

***

## JavaScript Code 

``` { data-line-numbers }
function factorial(n) {
  const test = "hello"
  if (n == 0 || n === 1) {
    return 1;
  } else {
    return n * factorial(n - 1)
  }
}
```

***

## Python Code 

``` { data-line-numbers }
def factorial(n):
  if (n==1 or n==0):
    return 1
  else:
    return n * factorial(n - 1)
```

***

- JavaScript Code is very beautiful and does the job well.
- It handles recursion well.
- It is generally good. 

***

- Python Code is less beautiful and does the job less well.
- It handles recursion less well.
- It is generally bad.
---
class: position-center
---
# Math Equations

### Wave Equation {.mt-10}

$$\nabla^2u-\frac{1}{v^2}\frac{\partial^2 u}{\partial t^2}=\frac{\partial^2 u}{\partial x^2}+\frac{\partial^2 u}{\partial y^2}+\frac{\partial^2 u}{\partial z^2}-\frac{1}{v^2}\frac{\partial^2 u}{\partial t^2}=0$$ 

### Other Fancy Equation {.mt-10}

$$v_{\rm g}=\frac{d\omega}{dk}=v_{\rm ph}+k\frac{dv_{\rm ph}}{dk}= v_{\rm ph}\left(1-\frac{k}{n}\frac{dn}{dk}\right)$$
---
layout: title-content
---
# HTML
***

<style>
.box {
  background-color: #7c3aed;
  color: #ddd6fe;
  border: 5px solid #581c87;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<div class="layout grid grid-7">
  <div class="box">HTML Box</div>
  <div class="box">HTML Box</div>
  <div class="box">HTML Box</div>
  <div class="box">HTML Box</div>
  <div class="box">HTML Box</div>
  <div class="box">HTML Box</div>
  <div class="box large-item">HTML Box</div>
</div>

---
auto-animate: true
---

## And a lot more

---
auto-animate: true
class: position-center
---

## And a lot more { .text-red }

**Thanks to the power of [Reveal.js](https://revealjs.com/)** { .fragment .fade-right }
