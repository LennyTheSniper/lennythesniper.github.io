# Pokémon Stat Viewer

A simple web application for browsing, analyzing, and experimenting with Pokémon stats using data from the [PokéAPI](https://pokeapi.co/).
The app allows you to view Pokémon base stats, sprites, types, and abilities, while also providing interactive controls for **IVs, EVs, and level scaling**.

---

## ✨ Features

* **Pokémon Browser**

  * Search through all Pokémon (up to Generation IX).
  * Select different forms and varieties.

* **Stat Visualizer**

  * Displays all six stats: HP, Attack, Defense, Special Attack, Special Defense, and Speed.
  * Bars are dynamically color-coded by stat strength.
  * Calculates real stat values based on level, IVs, EVs, and nature multipliers.

* **IV & EV Controls**

  * Enter values manually or adjust EVs with `+ / -` buttons.
  * EV totals automatically calculated with a warning if over 510.
  * Nature multipliers supported with suffixes (`+` = +10%, `-` = −10%).

* **Pokémon Details**

  * Sprite and official artwork display.
  * Type icons (primary/secondary).
  * Regular and hidden abilities shown with formatting.

* **Theme Support**

  * Toggle between **light** and **dark** mode.
  * Remembers your preference via `localStorage`.

---

## 🛠️ Technologies Used

* **HTML5 + CSS3** (with CSS variables for theming)
* **Vanilla JavaScript** (no frameworks, fully client-side)
* **PokéAPI** for live data fetching
* **Canvas API** for stat bar rendering

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/lennythesniper/pokemon-stat-viewer.git
cd pokemon-stat-viewer
```

### 2. Run Locally

Simply open the `index.html` file in any modern browser (Chrome, Firefox, Edge, Safari).
No build step required — everything runs client-side.

---

## 📖 Usage

1. Select a Pokémon from the dropdown.
2. Choose its form/variety if available.
3. View its sprite, types, abilities, and stats.
4. Adjust **level, IVs, and EVs** to see how stats change dynamically.
5. Toggle between **light/dark** themes for your preference.

---

## 📷 Gallery

<img width="1850" height="441" alt="image" src="https://github.com/user-attachments/assets/3361353f-e799-454a-be03-84eab0f403f7" />

---

## 🙌 Credits

* [PokéAPI](https://pokeapi.co/) — for the Pokémon data and sprites.
* Type icons sourced from [PokeAPI sprites](https://github.com/PokeAPI/sprites).
* Created by **LennyTheSniper**.
* Inspired by [Pokémon Showdown](https://pokemonshowdown.com)
