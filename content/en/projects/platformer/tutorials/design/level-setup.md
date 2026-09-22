---
title: Level Setup
description: How to setup a Level in Platformer
headline: Level Setup Guide for Designers
---

This guide walks you through the process of setting up a level in Unity using prefabs. Each step explains which prefab to add, what it does, and any special configuration required. Images are included for visual reference.

---

## 1. Open the Level Setup Prefab
Navigate to:

```csharp
Assets/Prefabs/Level Setup
```


![Level Setup Prefab](https://i.imgur.com/9KkmIOd.png)

---

## 2. Add Gameplay Elements
Drag the **GameplayElements** prefab into the scene.  
This prefab contains:
- The **Player**
- All required systems that support player functionality

After placing it in the scene:
- **Move the Player object to the correct spawn point** so the game starts with the player in the right location.

![Gameplay Elements](https://i.imgur.com/wMkFzw0.png)

---


## 3. Scene Settings
Next, drag the **SceneSettings** prefab into the scene.  
This prefab controls the general scene environment. Usually, there is **nothing to configure**, except possibly **lighting**.

![Scene Settings](https://i.imgur.com/0cwo8ra.png)

---

## 4. Camera Controller
The **CameraController** prefab is responsible for handling:
- Camera zones
- Dolly Tracks (for cinematic movement)

### Steps:
1. Place the **CameraController** prefab into your scene.
2. Inside the prefab, locate the **ZoneManager** and create the necessary **zones** for your level.
3. Set up all the **dolly tracks** for smooth camera transitions.


## Once you’ve configured the zones and dolly tracks:

### Click **Update Player for Cameras**
This ensures all cameras and dolly tracks are correctly following the Player
![Camera Controller](https://i.imgur.com/48unYq4.png)

### Click **Update Zones**
This refreshes the ZoneManager’s list with the zones you created, ensuring proper camera zone handling.
![Camera Controller2](https://i.imgur.com/oXsXLwU.png)

> ⚠️ If you skip these steps, the cameras may not track the Player correctly, and zones may not be registered.




---



---

## 5. Water Prefab
The **Water** prefab includes:
- Splash effects
- A **Falling Area** (when entered, the player dies)

There is no extra configuration here - just drag the prefab into the scene and it should work out of the box.


---

## 6. Level Switch
The **LevelSwitch** prefab allows the player to transition to the next level.

Steps:
1. Place the prefab in the correct position in your scene.
2. Adjust its **rotation** properly - incorrect rotation causes the camera to face the wrong direction.

### Correct Setup:  
![Correct Level Switch Setup](https://i.imgur.com/XxHMG4T.png)

### Incorrect Setup:  
![Incorrect Level Switch Setup](https://i.imgur.com/BXzLe6r.png)

---

## 7. Cloud Generator
The **CloudGenerator** prefab is responsible for spawning clouds in the scene.

Steps:
1. Place the prefab in your scene.
2. Adjust its **position**.
3. Use the **Box Collider** to define the spawning area.
4. Optionally, tweak the **number of clouds** to match the scene’s look.

![Cloud Generator](https://i.imgur.com/zUUikyO.png)

---

## Final Notes
- Always double-check rotations, especially for **LevelSwitch** and **CameraController** prefabs.
- Most prefabs work out of the box, but small adjustments (like lighting or cloud density) can enhance the scene’s atmosphere.
