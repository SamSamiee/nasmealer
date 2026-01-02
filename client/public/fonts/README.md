# Font Setup Instructions

## Monkey Hat Font

1. Download the font from: https://www.1001fonts.com/silly-fonts.html?page=2
   - Look for "Monkey Hat DEMO" by Pizzadude
   - Click "Download" button

2. Extract the font file(s) from the downloaded ZIP

3. Place the font file(s) in this directory (`client/public/fonts/`)
   - The font file should be named: `MonkeyHatDEMO-Regular.otf` or `MonkeyHatDEMO-Regular.ttf`
   - If the file has a different name, you can rename it to match, or update the `@font-face` declaration in `client/src/index.css`

4. The font is already configured in `client/src/index.css` and ready to use!

## Using the Font

You can use the Monkey Hat font in any component by:

1. **Using the CSS variable:**
   ```css
   font-family: var(--font-monkey-hat);
   ```

2. **Or directly:**
   ```css
   font-family: 'Monkey Hat', sans-serif;
   ```

The font is currently applied to the navbar logo. You can add it to any other component by using the CSS variable or font name.





