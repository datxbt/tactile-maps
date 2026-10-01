# Product brief

## Problem

Blind and low-vision visitors rarely get a tactile map of a building before they arrive. Making one is a slow, specialist job: a designer studies the building, lays out the map by hand and produces it. A consumer 3D printer can already make the physical object; the design is the bottleneck.

## Users

- Accessibility staff at libraries, museums, campuses and offices who want a tactile map of their building.
- Blind and low-vision visitors who read the printed map.

## Core features

1. Upload a floor-plan image.
2. A parser agent extracts walls, doors, rooms and key features (stairs, elevator, entrance, restroom), each with a confidence score.
3. A person reviews and corrects the result in an editor, by hand or through an edit agent.
4. Deterministic code converts the result into a tactile design that follows fixed standards (BANA 2022 tactile graphics guidelines, ADA §703 braille).
5. 3D preview, then STL download of the map plate and a braille legend plate.

## Principle

AI proposes, deterministic code disposes: the model only reads the drawing; sizes, spacing and braille geometry are fixed constants in code.

## Out of scope (for now)

PDF input, furniture and outdoor paths, multi-plate maps for large buildings, automatic repair of rule violations, user accounts.

## Success criteria

- A clean floor plan becomes a printable map with no manual CAD work.
- Every element the AI was unsure about is flagged for review.
- The exported plate follows the tactile standards (door gaps ≥ 5 mm, braille dots 0.7 mm high, symbols spaced ≥ 3 mm apart).
