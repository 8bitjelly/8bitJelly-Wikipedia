---
title: Code Reviews
description: How Code Reviews works?
---

# Code Reviews
Code reviews are **mandatory** for all pull requests.  
They help maintain code quality, catch bugs early, and encourage knowledge sharing among the team.

---

### Reviewers Should Focus On
- **Code readability and clarity**
    - Is the code self-explanatory, or does it need unnecessary effort to understand?
    - Could naming be improved (variables, methods, classes)?

- **Adherence to coding standards**
    - Does the code follow the style guide defined in this project?
    - Are conventions like PascalCase for classes and camelCase for variables respected?

- **Potential bugs or logical errors**
    - Could this code cause crashes, null reference exceptions, or undefined behavior?
    - Are edge cases considered (e.g., empty lists, null checks, invalid inputs)?

- **Performance considerations**
    - Does the code avoid unnecessary allocations (e.g., excessive `new`, `Instantiate`, or `GetComponent` calls)?
    - Is it optimized for Unity’s update loop (avoiding heavy operations inside `Update()`)?

- **Dependencies between files/objects**
    - Is the script tightly coupled with other scripts or components unnecessarily?
    - Could the functionality be decoupled using **events, interfaces, or ScriptableObjects**?
    - Does this change create hidden dependencies in prefabs, scenes, or assets?

- **Architecture alignment**
    - Does the new code fit the **overall project architecture**?
    - Could parts of this logic be generalized and reused instead of copied?
    - Are responsibilities properly separated (no “God classes” doing everything)?

- **Use of existing systems**
    - Is the developer reinventing something that already exists in the project?
    - Example: If there’s a global `HealthSystem`, are they reusing it instead of making another `Health` class?

- **Scalability and maintainability**
    - Will this code be easy to extend if requirements change?
    - Is it well-structured enough for other developers to build on top of it?

---

### Guidelines for Authors
- Submit smaller pull requests when possible (easier to review).
- Provide **context** in the pull request description. Explain the *why* behind the changes, not just the *what*.
- Test your changes before submitting them for review.
- Run the project and verify your code works as expected.
- Look at your diff in Git and remove unnecessary changes (formatting, whitespace, unrelated edits).

---

### Guidelines for Reviewers
- Use **constructive feedback**: suggest improvements rather than only pointing out flaws.
- Ask questions if something is unclear, rather than assuming it’s wrong.
- Approve only when the code meets project standards.

---

### Benefits
- Improves team collaboration.
- Prevents hidden bugs from slipping through.
- Keeps the codebase **consistent and maintainable**.  

---