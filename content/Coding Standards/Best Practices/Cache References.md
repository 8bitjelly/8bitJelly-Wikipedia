---
title: Cache References
description: Cache references from GetComponent
---

# Caching References in Unity

## The Problem: Calling `GetComponent` Repeatedly

It’s very common for beginners to write code like this:

```csharp
private void FixedUpdate()
{
    Rigidbody rb = GetComponent<Rigidbody>();
    rb.AddForce(Vector3.forward);
}
```
At first glance, it works just fine. But under the hood, `GetComponent` is not free.
Every time you call it, Unity needs to search through the `GameObject`’s components to find the requested one.

If you call it once or twice, that’s no big deal.
But if you call it hundreds of times per frame across multiple scripts, it quickly adds up and impacts performance.

---

## The Solution: Cache References
Instead of calling `GetComponent` repeatedly, you should store the reference once in `Awake()` or `Start()` and reuse it:

```csharp
private Rigidbody rb;

private void Awake()
{
    rb = GetComponent<Rigidbody>(); // Cache the reference once
}

private void FixedUpdate()
{
    rb.AddForce(Vector3.forward); // Use cached reference
}
```

Now Unity only has to look up the component one time, not every frame.

---

## Benefits of Caching References

### 1. Performance
- Avoids repeated lookups during gameplay.
- Especially important in performance-critical scripts (AI, movement, physics, etc.).

### 2. Cleaner Code
- Your methods look cleaner when they use variables instead of `GetComponent<T>()` everywhere.

### 3. Reliability
- If a component is missing, you’ll know immediately in `Awake()`/`Start()`, rather than discovering it mid-gameplay.

### 4. Easier Maintenance
- Centralizes where components are retrieved.
- If you need to adjust how references are set (e.g., from `GetComponent` to inspector injection), you only change it once.

---

## When to Cache
- Always cache components on the same GameObject (`GetComponent<T>()`).
- Cache child/parent components if they’re accessed frequently (`GetComponentInChildren`, `GetComponentInParent`).

> If you’re going to use it more than once → cache it.

---