### Variables Passed via Method Arguments
- When naming **method arguments**, use camelCase and descriptive names that clearly represent the value being passed. Method arguments are local to the method and should be concise yet meaningful.
  ```csharp
  public void SetPlayerHealth(int healthPoints)
  {
    _playerHealth = healthPoints;  // 'healthPoints' is a method argument
  }

  public void AddScore(int pointsToAdd)
  {
    _score += pointsToAdd;  // 'pointsToAdd' is a method argument
  }
  ```