---
title: Core MVP
description: ""
---

# CEL ZADANIA

Implementacja bazowego wzorca Model-View-Presenter (MVP) dla warstwy interfejsu użytkownika (uGUI) w projekcie AstroGame. Zadanie ma na celu ścisłe oddzielenie logiki biznesowej i danych od komponentów wizualnych, ułatwienie testowania kodu oraz przygotowanie ustandaryzowanego szkieletu pod implementację wszystkich ekranów w grze.

## ZAKRES PRAC I WYMAGANIA TECHNICZNE

### 1. Architektura bazowa i interfejsy (Core MVP)

* **`IView` / `BaseView`**:
  * Komponent bazowy dziedziczący po `MonoBehaviour`.
  * Odpowiada wyłącznie za wizualną stronę interfejsu (referencje do `TextMeshPro`, `Image`, animacji wejścia/wyjścia).
  * Nasłuchuje zdarzeń interakcji użytkownika (integracja z `CustomButtonBase`) i przekazuje je bezpośrednio do Presentera.
  * Metody cyklu życia: `Initialize()`, `Show()`, `Hide()`.
  * Brak jakiejkolwiek logiki biznesowej i brak bezpośredniego dostępu do modelu.

* **`IPresenter` / `BasePresenter<TView, TModel>`**:
  * Czysta klasa C# (brak dziedziczenia po `MonoBehaviour`).
  * Pośredniczy w przepływie danych: subskrybuje zdarzenia z Modelu i zleca Widokowi odświeżenie elementów UI; reaguje na akcje z Widoku i wywołuje metody w Modelu.
  * Właściwa obsługa cyklu życia: metody `Activate()`, `Deactivate()`, `Dispose()`.

* **`IModel`**:
  * Czysta klasa C# (POCO) przechowująca stan danych i reguły biznesowe.
  * Brak zależności od silnika (`UnityEngine`).
  * Powiadamianie o zmianach danych za pomocą standardowych zdarzeń C# (`event Action<T>`).

### 2. Cykl życia i bezpieczeństwo pamięci

* Bezpieczne zarządzanie subskrypcjami zdarzeń C# w celu wyeliminowania wycieków pamięci (memory leaks) po zniszczeniu lub ukryciu prefabu widoku.
* Odpinanie eventów w metodzie `Dispose()` / `Deactivate()`.
* Standaryzacja inicjalizacji: mechanizm wiązania (binding) Widoku z odpowiednim Presenterem i Modelem w momencie otwierania ekranu.

### 3. Referencyjna implementacja PoC (Proof of Concept)

* Utworzenie przykładowego, działającego ekranu w oparciu o architekturę — np. HUD Walut (Gwiezdne Kryształy / Pierwiastki) lub Popup nagród:
  * `CurrencyHUDView` (wyświetlanie licznika kryształów, prosty przycisk testowy).
  * `CurrencyHUDPresenter` (zarządzanie logiką odświeżania i reakcją na kliknięcie).
  * `WalletModel` (przechowywanie liczby kryształów i zdarzenie zmiany stanu).

### 4. Struktura projektu i szablony

* Uporządkowanie struktury katalogów pod dalszy rozwój UI:
  * `Scripts/UI/Core/` (klasy bazowe, interfejsy).
  * `Scripts/UI/Screens/[NazwaEkranu]/` (konkretne widoki, modele i prezentery).
* Przygotowanie szablonu klas (boilerplate) do szybkiego tworzenia kolejnych ekranów przez zespół.

## KRYTERIA AKCEPTACJI

* Widok nie posiada referencji do Modelu i nie decyduje o logice biznesowej.
* Model nie korzysta z `UnityEngine` i może być w pełni pokryty testami jednostkowymi (Unit Tests).
* Zamykanie/chowanie ekranu poprawnie odpina wszystkie zdarzenia C# (brak wycieków pamięci i błędów typu `MissingReferenceException`).
* W scenie testowej znajduje się działający przykład (PoC) prezentujący prawidłowy przepływ danych w obie strony: `Model -> Presenter -> View` oraz `View -> Presenter -> Model`.
* Aktualizacje wartości liczbowych/tekstowych na widoku są zoptymalizowane pod kątem urządzeń mobilnych (brak zbędnych alokacji GC w trakcie odświeżania).

## WAŻNE

* Architektura musi być w pełni kompatybilna z nowym modułem przycisków (`CustomButtonBase`).