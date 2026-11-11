# Medu

A hieroglyph reader you touch. The signs are the interface: choose one, read what it depicts and how it sounds, and carve it into a line.

Medu reads sign by sign. It does not translate a sentence.

## Use it

The alphabet is the front door, twenty-four signs a newcomer can learn. The other groups are the basic Egyptian hieroglyphs from Unicode. Search stays on this screen. Drag a sign onto the line, or press Carve. The line is written right to left, and you can flip it.

Copy the rubbing to share the line. The link is the signs themselves, as Gardiner codes: `#F35-I9-D21`. Save rubbing downloads a picture of the line.

## Run it locally

```bash
npm install
npm run dev
```

`npm run signs` rebuilds `src/data/signs.json` from the Unicode Unikemet catalog.

## Sources

- Sign list, depictions, and functions for the catalog: [Unicode Unikemet](https://www.unicode.org/Public/UCD/latest/ucd/Unikemet.txt), Unicode, Inc. Used under the [Unicode Terms of Use](https://www.unicode.org/terms_of_use.html).
- The alphabet and the common signs Medu introduces are written for this project.
- Glyphs: [Noto Sans Egyptian Hieroglyphs](https://fonts.google.com/noto/specimen/Noto+Sans+Egyptian+Hieroglyphs), Copyright 2022 The Noto Project Authors, licensed under the SIL Open Font License 1.1. The license is in `src/assets/OFL.txt`.
- Latin type: Fraunces and Outfit.
