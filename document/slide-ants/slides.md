---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://images.unsplash.com/photo-1580133750060-05e667fe0318?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
# some information about your slides (markdown enabled)
title: Welcome to Slidev
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply UnoCSS classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
---

# Welcome to Ants Project

## Project: Web Platform for Renting and Listing Rooms

<!-- <div @click="$slidev.nav.next" class="mt-12 py-1" hover:bg="white op-10">
  Next page <carbon:arrow-right />
</div> -->
---
src: ./pages/page2.md
---

---
src: ./pages/page3.md
---

---
src: ./pages/page4.md
---

---
src: ./pages/page5.md
---

---
src: ./pages/page6.md
---

---
src: ./pages/page7.md
---

---
src: ./pages/page8.md
---

---
src: ./pages/page9.md
---

---
src: ./pages/page10.md
---


---
# Features
---
::code-group

```sh [npm]
npm i @slidev/cli
```

```sh [yarn]
yarn add @slidev/cli
```

```sh [pnpm]
pnpm add @slidev/cli
```

::

---
# Line number
---
```ts {6,7}{lines:true,startLine:5}
function add(
  a: Ref<number> | number,
  b: Ref<number> | number
) {
  return computed(() => unref(a) + unref(b))
}
```
---
# Monaco Editor
---
# Example with Reactjs
Slidev provides built-in Monaco Editor support.
<br />
Add `{monaco}` to the code block to turn it into an editor:
Example with Reactjs:

```tsx {4|9|8|*}{lines:true,startLine:1}
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
export default App;
```
---
# Monaco Runner
---

```ts {monaco-run} {autorun:false}
function distance(x: number, y: number) {
  return Math.sqrt(x ** 2 + y ** 2)
}
console.log(distance(3, 4))
```

---
# Magic move
---

````md magic-move {at:4, lines: false}
```js
console.log(`Step ${1}`);
```
```js
console.log(`Step ${1 + 1}`)
```
```ts
console.log(`Step ${3}` as string)
```
````

---
# Icons
---
## <tabler-a-b-2 /> Xin chào

### <tabler-home-cog width="96" height="96" /> Hello
### <tabler-shopping-cart width="96" height="96" /> Hi

---
# Icons using
---

# Using Iconify icons in Slidev
Install the icon package first:

```sh {bash}
npm i @iconify/json
```

|idea|icon|
|--|--|
|Home|<tabler-home-cog width="48" height="48" />|
|Settings|<tabler-settings width="48" height="48" />|
|User|<tabler-user width="48" height="48" />|
|Shopping|<tabler-shopping-cart width="48" height="48" />|
-----