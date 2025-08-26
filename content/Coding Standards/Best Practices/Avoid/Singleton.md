---
title: Singleton
description: Why you should be careful with Singletons?
---

# Singletons

Singletons are one of the most common patterns used in Unity development. They provide a global point of access to a single instance of a class — for example, `GameManager.Instance` or `AudioManager.Instance`. While this might feel convenient, **overusing Singletons can introduce more problems than they solve**.

---

## The Downsides of Singletons

### 1. **Hidden Dependencies**
- Classes that rely on a Singleton hide their real dependencies.
- Instead of passing required objects into a method or constructor, the code silently grabs data from a global instance.
- This makes it much harder to see *what a class actually needs to function*.

---

### 2. **Testing and Flexibility Problems**
- Singletons are essentially **global state**.
- In unit tests, it becomes difficult to replace or mock them because the instance is tightly coupled to the global class.
- This limits your ability to write automated tests and makes debugging harder.

---

### 3. **Encourages God Classes**
- Since Singletons are easy to access from anywhere, developers often keep adding more and more responsibilities to them.
- This leads to bloated "god objects" like a `GameManager` that controls gameplay, UI, saving, spawning, and more — violating the **Single Responsibility Principle**.

---

### 4. **Difficult to Scale**
- As your project grows, tightly coupled Singletons make refactoring or reusing code in other contexts painful.
- A class that depends on `GameManager.Instance` can’t easily be used in another project, another scene, or in editor tools.

---

### 5. **Order of Initialization Issues**
- In Unity, the order in which Singletons are created is not always predictable.
- If one Singleton relies on another being initialized first, you can easily run into `NullReferenceException`s during startup.

---

### 6. **False Sense of Simplicity**
- At first, using Singletons feels like a shortcut: no need to pass references around.
- But this simplicity hides long-term costs in **architecture, testability, and debugging**.

---

## When to Use Singletons (Carefully)

Singletons aren’t *always* bad. They can be useful for:
- Truly unique global systems (e.g., InputManager, AudioManager).
- Systems where multiple instances would cause bugs or inconsistencies.
- Temporary prototypes where speed matters more than architecture.

**But:** even in these cases, consider safer alternatives like:
- **Dependency Injection (DI):** Explicitly pass references to what a class needs.
- **ScriptableObjects:** Store global/shared data in Unity-friendly assets.
- **Event systems:** Decouple communication between objects without global state.

---

## Final Thoughts

Singletons are not inherently evil, but **heavy reliance on them can lead to fragile, hard-to-maintain code**.  
Use them sparingly, and always question whether a Singleton is truly necessary — or if a more flexible, testable solution would serve better.

> If you find yourself turning *everything* into a Singleton, your project architecture needs a rethink.
