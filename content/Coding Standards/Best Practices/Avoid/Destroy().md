---
title: Destroy()
description: Why Destroy() is bad?
---

# Why You Should Avoid `Destroy()` in Unity

In Unity, the `Destroy()` method is often one of the first tools developers reach for when they need to remove a `GameObject` or `Component` at runtime. While it seems straightforward, relying on `Destroy()` can create subtle performance issues, memory leaks, and unpredictable behavior in your game. Understanding why `Destroy()` is problematic and what to use instead is essential for writing clean, efficient, and stable code.

---

## Problems with `Destroy()`

### 1. Deferred Execution
`Destroy()` does not remove the object immediately. Instead, Unity marks it for destruction and actually removes it at the end of the frame. This means:

- You can still accidentally access the object after calling `Destroy()`, leading to `MissingReferenceException`s.
- Code that expects the object to be gone *right away* may behave incorrectly.

This deferred behavior makes debugging difficult and introduces hidden state into your game loop.

---

### 2. Garbage Collection Pressure
When you call `Destroy()`, the memory used by the destroyed object is eventually released, but this triggers additional work for Unity’s memory management and the .NET garbage collector. Overuse of `Destroy()` leads to:

- More frequent Garbage Collector spikes.
- Noticeable frame drops, especially in complex scenes or on lower-end devices.
- Higher risk of runtime hitches during gameplay.

---

### 3. Broken References
Other scripts may still hold references to the destroyed object. Since `Destroy()` sets the reference to a "fake null," it doesn’t behave exactly like a C# `null`. This can cause confusing bugs, like conditions evaluating differently than expected:

```csharp
if (myObject != null) {
    // This might be true, even though myObject was destroyed
}
```

---

### 4. Pooling Incompatibility
Destroying and recreating objects repeatedly is one of the biggest sources of performance overhead in Unity. Common examples include:
- Bullets in a shooter
- Enemies in a wave-based game
- Particles or VFX elements

Using `Destroy()` forces Unity to free and reallocate memory over and over again. This not only hurts performance but also increases load on the Garbage Collector. [Object pooling](http://localhost:3000/Coding%20Standards/Best%20Practices/Object%20Pooling) is almost always a better solution.

---

## Best Practices: Alternatives to `Destroy()`
Instead of destroying objects, consider these alternatives:

### Object Pooling
Reuse objects by disabling (`SetActive(false)`) and re-enabling them when needed. This avoids unnecessary allocations and garbage collection.

[Click for more](http://localhost:3000/Coding%20Standards/Best%20Practices/Object%20Pooling)

### Disable Instead of Destroy
For temporary removals (e.g., UI panels, projectiles), disable the object instead of destroying it.

### Custom Lifecycle Management
Create a centralized manager that handles when objects should be recycled or hidden, giving you full control without relying on Unity’s deferred destruction.

### Scene Management Tools
Use additive scenes or addressables to load/unload larger groups of objects efficiently instead of destroying them piecemeal.

### When is `Destroy()` Acceptable?

There are cases where `Destroy()` is fine, such as:

- Cleaning up unique, one-off objects that won’t be reused.
- Removing editor-time objects during setup.
- But even then, be mindful of timing and avoid calling it frequently in tight loops or gameplay-critical code.