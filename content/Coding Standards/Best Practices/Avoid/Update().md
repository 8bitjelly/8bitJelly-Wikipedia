---
title: Update()
description: Why Update() is not always good?
---

# Why You Should Be Careful with `Update()` in Unity

In Unity, the `Update()` method is often one of the first things developers learn. It runs once per frame, making it tempting to put **all logic** inside it. While `Update()` is useful for some tasks, overusing it leads to wasted CPU cycles, poor scalability, and hard-to-maintain code. Understanding when to use `Update()` — and when to avoid it — is essential for writing clean, performant games.

---

## Problems with Overusing `Update()`

### 1. Runs Every Frame
`Update()` executes **once per frame per script**. If you have 1000 scripts each with an `Update()`, Unity will call all 1000 methods every frame:

- Even empty `Update()` methods incur a function call cost.
- This scales poorly in larger projects.
- Results in unnecessary performance overhead.

---

### 2. Polling Instead of Events
Most uses of `Update()` involve **checking conditions every frame** (polling), like:

```csharp
private void Update()
{
    if (Input.GetKeyDown(KeyCode.Space))
    {
        Jump();
    }
}
```

Polling wastes CPU time. Event-driven approaches (e.g., Unity’s Input System, collision callbacks, delegates) run only when needed.

---

### 3. Hidden Performance Costs
When dozens (or hundreds) of objects each have Update(), performance issues can creep in:
- Harder to profile and optimize.
- Lots of small updates add up to frame drops.
- Developers often don’t realize how much work Update() is doing.

---

### 4. Harder to Maintain

Spreading logic across many Update() methods makes systems harder to debug:
- Where does movement happen? Physics? Update? FixedUpdate?
- Which script is handling input this frame?
- Codebase becomes fragmented and harder to reason about.

---

## Bad vs. Good Examples

### Bad: Using `Update()` for Timers

```csharp
private float timer = 0f;

private void Update()
{
    timer += Time.deltaTime;
    if (timer >= 5f)
    {
        SpawnEnemy();
        timer = 0f;
    }
}
```
Problems:
- Runs every frame, even if nothing happens.
- Scales poorly with many timers.

---

### Good: Using Coroutines

```csharp
private void Start()
{
    StartCoroutine(SpawnEnemyRoutine());
}

private IEnumerator SpawnEnemyRoutine()
{
    while (true)
    {
        yield return new WaitForSeconds(5f);
        SpawnEnemy();
    }
}
```

Advantages:
- Runs only when needed.
- Cleaner, easier to understand.
- No per-frame overhead.

---

### Bad: Using `Update()` for Input

```csharp
private void Update()
{
    if (Input.GetKeyDown(KeyCode.Space))
    {
        Jump();
    }
}
```

---

### Good: Event-Driven Input (New Input System)

```csharp
public void OnJump(InputAction.CallbackContext context)
{
    if (context.performed)
    {
        Jump();
    }
}
```

Advantages:
- No polling every frame.
- Code reacts only when input happens.

---

## When `Update()` Is Appropriate
There are cases where `Update()` is the right tool:

### Frame-based operations
- Checking camera movement.
- Updating UI animations.

### Gameplay logic unrelated to physics
- Input with the old Input Manager.
- Non-physics-driven character movement.

> Rule of Thumb: If it doesn’t need to run every frame, it shouldn’t be in `Update()`.

## Understanding `LateUpdate()` and `FixedUpdate()`
Unity provides `LateUpdate()` and `FixedUpdate()` alongside `Update()`. Each has specific use cases.

### LateUpdate()
- Called once per frame, but after all `Update()` calls.
- Best used for logic that depends on other objects’ movements.
- Commonly used for:
  - Camera following a player after movement.
  - Final adjustments that need to run after all other updates.


```csharp
private void LateUpdate()
{
    // Camera follows player after movement has been applied
    transform.position = player.position + offset;
}
```

---

### FixedUpdate()
- Called at a fixed time interval (default: 0.02s = 50 FPS).
- Independent of frame rate.
- Synced with Unity’s physics engine.
- Best used for:
    - Applying physics forces.
    - Rigidbody movement.
    - Any logic that must remain consistent across different frame rates


```csharp
private void FixedUpdate()
{
    // Apply physics movement
    rb.MovePosition(rb.position + movement * speed * Time.fixedDeltaTime);
}
```

---

> Important: Don’t handle input in `FixedUpdate()`. Input happens per frame, not per physics step — you’ll miss inputs if the frame rate is higher than the physics tick rate.