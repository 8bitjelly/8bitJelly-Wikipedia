---
title: Public Variables
description: Do you need public variables?
---

# Why Public Variables Are a Bad Practice in Unity

Using `public` variables just to make them visible in the Inspector is a common mistake in Unity development. Public fields expose your internal data to **any other script**, breaking encapsulation, increasing the risk of bugs, and making your code harder to maintain.

Even though it might feel convenient at first, overusing public variables leads to messy, fragile projects. A better approach is to use **private fields with `[SerializeField]`**, which allows Inspector access without exposing the field to the entire codebase.

---

## Problems with Public Variables

### 1. Breaks Encapsulation
```csharp
public int health;
```

- Any other script can modify health directly.
- No way to control or validate changes.
- Makes your objects’ internal state fragile.

---

### 2. Harder to Maintain
- Refactoring becomes risky because other scripts might rely on the public variable.
- Adding validation or logic later requires changing all dependent scripts.

---

### 3. Misuse of Inspector Access
Many developers make variables public only to see them in the Inspector, mixing convenience with poor coding practices.

---

## The Better Approach: `[SerializeField]` with Private Fields

```csharp
[SerializeField] private int health;
```

Advantages:
- Private by default → internal state stays safe.
- Visible in Inspector → designers can tweak values.
- Future-proof → easy to add validation or properties:

---

> Never use public fields just for Inspector access.

> Use [SerializeField] private for all fields that need to be tweaked in the Editor.

> Use public only for API methods or read-only properties, not raw data.


