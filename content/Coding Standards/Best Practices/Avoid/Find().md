---
title: Find()
description: Why Find() is bad?
---

# Why You Should Avoid `Find()` in Unity

Unity provides several `Find()` methods such as `GameObject.Find()`, `Transform.Find()`, and `FindObjectOfType()` to locate objects in your scene. While they may seem convenient, overusing them leads to performance issues, poor code maintainability, and hidden dependencies. Understanding why `Find()` is problematic — and what to use instead — is key to writing clean, efficient, and scalable Unity projects.

---

## Problems with `Find()`

### 1. Hierarchy Traversal (Performance Cost)
`Find()` works by **searching through the entire scene hierarchy** until it locates the target object. The larger and more complex your hierarchy, the more expensive this search becomes.

- Every call traverses objects in memory.
- Cost grows with scene size.
- Using `Find()` in [`Update()`](Update()) or frequent logic creates **serious performance bottlenecks**.
  
---

### 2. Fragile Code
`Find()` relies on **string-based names** or scene hierarchy paths. This is brittle because:

- If you rename a `GameObject`, all `Find()` calls break silently.
- If the hierarchy changes (e.g., nesting objects differently), your code no longer works.
- No compile-time safety — typos in names won’t be caught until runtime.

This makes debugging more difficult and increases maintenance overhead.

---

### 3. Hidden Dependencies
Using `Find()` creates hidden connections between objects. A script may rely on something existing elsewhere in the scene, but this isn’t obvious when reading the code.

This breaks the principle of **explicit dependencies**, making systems harder to reuse and test.

---

### 4. Not Scalable
On small projects, you might not notice the cost of `Find()`. But as your project grows:

- More objects in the hierarchy = slower lookups.
- Frequent calls amplify the problem.
- Code becomes tightly coupled to fragile object names.

What was “good enough” in a prototype quickly becomes a scaling issue.

---

## Bad vs. Good Examples

### Bad: Using `GameObject.Find()`
```csharp
private void Start()
{
    // Finds player by name in the scene hierarchy
    GameObject player = GameObject.Find("Player");
}
```

### Better: `Inspector Reference`
```csharp
public class Enemy : MonoBehaviour
{
    [SerializeField] private GameObject player;

    private void Start()
    {
        // Safe reference assigned in Inspector
        Debug.Log(player.name);
    }
}
```

Problems:
- Performance hit (searches whole scene).
- Breaks if Player is renamed.
- Hidden dependency on scene setup.

---

## Best Practices: Alternatives to `Find()`

### Inspector References
Drag-and-drop dependencies into [SerializeField] fields instead of relying on runtime lookups.

### Dependency Injection
Tools like Zenject or your own lightweight system can pass references explicitly.

### Events / Messaging Systems
Use event-driven communication (e.g., UnityEvent, C# events, or a message bus) instead of objects searching for each other.

---

## When is `Find()` Acceptable?

There are limited cases where `Find()` is fine, such as:
- One-time lookups during development or prototyping.
- Editor scripts and debugging utilities.
- Small, throwaway projects where performance and scalability don’t matter.

Even then, `cache` the result immediately instead of calling `Find()` repeatedly.