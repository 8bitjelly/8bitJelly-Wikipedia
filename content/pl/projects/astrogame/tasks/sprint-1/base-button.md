---
title: BaseButton
description: ""
---

# CEL ZADANIA
Implementacja modułowego systemu przycisków UI na urządzenia mobilne w oparciu o `UnityEngine.EventSystems` oraz integracja z systemem audio FMOD.

---

## ZAKRES PRAC I WYMAGANIA TECHNICZNE

### 1. Architektura bazowa (`CustomButtonBase`)
- Klasa bazowa dziedzicząca po `MonoBehaviour` oraz interfejsach `EventSystems`.
- Polimorfizm: kluczowe metody cyklu życia dotyku oznaczone jako `virtual` (do łatwego nadpisywania i rozszerzania w podklasach).
- Obsługa stanu `Interactable` (włączenie/wyłączenie przycisku, wizualne wyszarzenie, blokowanie interakcji).
- Opcjonalne zabezpieczenie przed spamem (debounce / kliknięcia w zbyt krótkim odstępie czasu).

### 2. Implementacja typów przycisków
- **InstantButton**:
  - Wyzwala akcję natychmiast w momencie zetknięcia palca z ekranem (`IPointerDownHandler`).
  - Zastosowanie: dynamiczne akcje w gameplayu i mini-grach.
- **HoldButton**:
  - Obsługuje zdarzenia: `IPointerDownHandler`, `IPointerUpHandler`, `IPointerExitHandler`.
  - Udostępnia właściwość sprawdzającą czy przycisk jest obecnie przytrzymywany (np. `bool IsPressed`).
  - Bezpieczne resetowanie stanu przy zjechaniu palcem z przycisku (`PointerExit`).

### 3. Integracja z FMOD Audio
- Pole typu `FMODUnity.EventReference` do wyboru zdarzenia dźwiękowego bezpośrednio z poziomu Inspektora.
- Odtwarzanie dźwięku zoptymalizowane pod UI (`PlayOneShot`).
- Brak odtwarzania dźwięku sukcesu, gdy przycisk ma stan `Interactable = false` (opcjonalny osobny slot na dźwięk "locked/error").

---

## KRYTERIA AKCEPTACJI
- Przyciski działają stabilnie przy multi-touch (kilka palców na ekranie jednocześnie).
- Zjechanie palcem poza obszar `HoldButton` poprawnie przerywa stan wciśnięcia.
- Zdarzenia audio FMOD odpalają się bez opóźnień i nie rzucają błędami przy braku przypisanego eventu w Inspektorze.
- Kod jest odpięty od `UnityEngine.UI.Button` i nie korzysta z powolnego mechanizmu `onClick`.