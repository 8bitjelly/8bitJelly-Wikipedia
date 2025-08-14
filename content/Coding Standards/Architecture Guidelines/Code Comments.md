## Code Comments

- **Comment important sections of code** to explain logic, especially if it's complex or not immediately clear.
- **Use summary comments** for methods and classes:
  ```csharp
  /// <summary>
  /// Calculates the player's score based on current game state.
  /// </summary>
  public int CalculateScore()
  {
      // Method implementation
  }
  ```
- **Avoid obvious comments**:
    - **Correct:**
      ```csharp
      // Increase the player's score by 10
      playerScore += 10;
      ```
    - **Incorrect:**
      ```csharp
      // Add 10 to playerScore
      playerScore += 10;
      ```
    