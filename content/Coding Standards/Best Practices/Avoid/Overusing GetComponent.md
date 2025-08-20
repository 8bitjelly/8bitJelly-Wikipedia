---
title: Overusing GetComponent
description: Does it matter where we put GetComponent?
---

# Overusing `GetComponent` – Why It’s Bad and How to Avoid It

When developing games in Unity, one of the most common mistakes beginners (and sometimes even experienced developers) make is **overusing `GetComponent` calls**. While `GetComponent<T>()` is a powerful method that allows you to access other components attached to the same GameObject (or its children/parents), relying on it too heavily can hurt both **performance** and **code quality**.

---

## Why `GetComponent` Overuse Is Problematic

### 1. Performance Cost
- `GetComponent` isn’t *free*. Every time you call it, Unity searches through the components on the GameObject to find the requested type.
- In small projects, this may not be noticeable, but in **larger projects with thousands of objects**, repeated calls inside [`Update()`](Update()) or physics loops can cause **serious frame drops**.
- Example:
  ```csharp
  private void Update()
  {
      // BAD: This will search for the Rigidbody every single frame
      Rigidbody rb = GetComponent<Rigidbody>();
      rb.AddForce(Vector3.forward);
  }
  ```

If your game runs at 60 FPS, that’s 60 expensive lookups per second – per object.

---

### 2. Garbage Collection Pressure

- Calling `GetComponent` repeatedly can sometimes create unnecessary memory allocations, depending on the overload used.

- These allocations build up and eventually trigger Garbage Collection (GC), leading to stutters or lag spikes during gameplay.

---

### 3. Code Readability and Maintainability
- Excessive `GetComponent` calls make your code harder to read and more error-prone
- Imagine working on a team project where `GetComponent` is scattered everywhere – it becomes difficult to know which components are essential to the script and which are optional.
- This reduces the clarity of your code’s dependencies.

---

## Best Practices to Use Instead

### 1. Cache the Component
Store the component reference once, typically in `Awake()` or `Start()`, and reuse it:

```csharp
private Rigidbody rb;

private void Awake()
{
    // Cache the reference once
    rb = GetComponent<Rigidbody>();
}

private void SetRigidbodyMass(int value)
{
    // Use the cached reference instead
    rb.mass = value;
}
```

### 2. Avoid GetComponent in Update / FixedUpdate
- Never call GetComponent repeatedly inside per-frame methods.
- If you must fetch components dynamically, do it once and cache the result.

---

## When It’s Okay to Use GetComponent
- One-time lookups (e.g., in `Awake`, `Start`, or during initialization).
- Editor scripts or debugging tools where performance is not critical.
- Occasional dynamic lookups for optional/rare behavior (just don’t do it every frame).

---

