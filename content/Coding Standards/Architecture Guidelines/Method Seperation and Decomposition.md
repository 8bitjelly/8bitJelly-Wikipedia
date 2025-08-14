## Method Separation and Decomposition
- **Decompose large methods** into smaller, more focused methods to enhance readability, maintainability, and reusability.

    - **Initialization:** Create a separate method for initializing variables, objects, or setting up initial states.
      ```csharp
      private void InitializePlayer()
      {
          _playerName = "Hero";
          _score = 0;
      }
      ```

    - **Setting Values:** If a method needs to assign values or configure settings, move this logic to a dedicated method.
      ```csharp
      private void SetPlayerAttributes(int health, int stamina)
      {
          _playerHealth = health;
          _playerStamina = stamina;
      }
      ```

    - **Operations:** The main logic or operations should be encapsulated in their own method. This keeps the method focused and easier to test.
      ```csharp
      private void UpdatePlayerScore(int points)
      {
          _score += points;
      }
      ```

- **Example of Decomposing a Method:**
    - **Before Decomposition:**
      ```csharp
      public void StartGame()
      {
          _playerName = "Hero";
          _score = 0;
          _playerHealth = 100;
          _playerStamina = 50;
          _score += 10;
          Debug.Log("Game started");
      }
      ```

    - **After Decomposition:**
      ```csharp
      public void StartGame()
      {
          InitializePlayer();
          SetPlayerAttributes(100, 50);
          UpdatePlayerScore(10);
          Debug.Log("Game started");
      }
  
      private void InitializePlayer()
      {
          _playerName = "Hero";
          _score = 0;
      }
  
      private void SetPlayerAttributes(int health, int stamina)
      {
          _playerHealth = health;
          _playerStamina = stamina;
      }
  
      private void UpdatePlayerScore(int points)
      {
          _score += points;
      }
      ```

- **Benefits of Method Decomposition:**
    - **Improved readability:** Each method performs a clear and single responsibility.
    - **Easier testing:** Smaller methods can be tested independently.
    - **Enhanced maintainability:** Changes to specific functionality can be made in isolated methods without affecting the rest of the code.
    - **Reusability:** Methods can be reused across different parts of the codebase.  