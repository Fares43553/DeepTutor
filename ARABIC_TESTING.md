# Arabic Language Support - Quick Start Guide

## Verification Steps

### 1. **Verify File Structure**
```bash
# Check all locale directories exist
ls -la web/locales/ar/
# Expected output: app.json, common.json

# Verify locale file sizes (Arabic should be similar to Chinese)
wc -l web/locales/*/app.json
```

### 2. **Verify Code Changes**
```bash
# Check i18n configuration
grep -n "ar" web/i18n/init.ts
# Should show: import arApp, AppLanguage includes "ar", ar in resources

# Check AppShellContext
grep -n "ar" web/context/AppShellContext.tsx
# Should show: AppLanguage includes "ar", normalizeLanguage handles "ar"

# Check settings router
grep -n "ar" deeptutor/api/routers/settings.py
# Should show: Literal includes "ar" in UISettings and LanguageUpdate
```

### 3. **Verify CSS/Font Changes**
```bash
# Check tailwind config
grep -n "font-arabic\|Cairo" web/tailwind.config.js
# Should show: Cairo font import, --font-arabic variable

# Check globals.css for RTL rules
grep -n "dir=\"rtl\"" web/app/globals.css
# Should show: Multiple RTL-specific styles
```

## Testing in Browser

### Manual Testing Steps:

1. **Start the application**
   ```bash
   # In project root
   npm run dev              # Frontend (port 3000)
   python -m deeptutor serve  # Backend (port 8000)
   ```

2. **Navigate to Settings**
   - Go to: `http://localhost:3000/settings`
   - Scroll to find "Language" section

3. **Test Language Switch**
   - Click the "العربية" button (Arabic option)
   - Observe:
     ✓ Page direction changes to RTL
     ✓ All text becomes Arabic
     ✓ Layout mirrors correctly
     ✓ Sidebar appears on right side
     ✓ Buttons/inputs properly aligned

4. **Verify Persistence**
   - Reload the page: `F5` or `Cmd+R`
   - Language should remain Arabic

5. **Test Fallback**
   - Open browser DevTools (F12)
   - Go to Console
   - Type: `i18n.getResourceBundle('ar', 'app')` 
   - Should see Arabic translations loaded

6. **Test RTL Elements**
   - Chat input field (text should be right-aligned)
   - Settings form (labels and inputs)
   - Navigation sidebar
   - Modal dialogs
   - Dropdown menus

## Automated Testing

### Run Translation Parity Check:
```bash
cd web
npm run i18n:parity
# Expected output: [i18n:parity] OK
```

### Run Unit Tests (if any):
```bash
cd web
npm run test
# Search for i18n related tests
```

## Debugging Tips

### If Arabic text doesn't appear:
1. Check browser console for errors
2. Verify `web/locales/ar/app.json` exists and is valid JSON
3. Check that i18n imported Arabic correctly
4. Clear browser cache: `Ctrl+Shift+Delete` or `Cmd+Shift+Delete`

### If RTL direction doesn't apply:
1. Open DevTools → Elements
2. Check `<html>` tag has `dir="rtl"`
3. Check CSS rules: `html[dir="rtl"]` being applied
4. Verify Cairo font is loading (Network tab → Fonts)

### If layout is broken:
1. Check all CSS RTL rules in `globals.css` are present
2. Verify `margin-left` → `margin-right` flips in RTL
3. Check custom components don't override direction
4. Run: `npm run build` to check for build errors

## Performance Check

### Bundle Size:
```bash
# Check locale file sizes
du -h web/locales/*/app.json

# Expected: ~100-150KB each (gzipped: ~30-40KB)
```

### Loading Time:
1. Open DevTools → Network tab
2. Filter by: `app.json`
3. Check:
   - Load time < 200ms
   - Size < 150KB (uncompressed)
   - No 404 errors

## Browser Compatibility

### Tested On:
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues:
- None reported yet

## Rollback Instructions

If you need to revert Arabic support:

```bash
# 1. Remove Arabic locale files
rm -rf web/locales/ar/

# 2. Revert i18n/init.ts
git checkout web/i18n/init.ts

# 3. Revert AppShellContext.tsx
git checkout web/context/AppShellContext.tsx

# 4. Revert settings router
git checkout deeptutor/api/routers/settings.py

# 5. Revert all other changes
git checkout .

# 6. Clear node modules and rebuild
rm -rf node_modules
npm install
npm run build
```

## Translation Quality Checklist

- [x] English source strings are comprehensive
- [x] Arabic translations are professional and natural
- [x] No literal Google Translate (manually reviewed)
- [x] Technical terminology is accurate
- [x] All special characters render correctly
- [x] Text direction flows properly
- [x] No missing translations (fallback to English)
- [x] Font displays Arabic ligatures properly

## Support & Documentation

For issues or questions about Arabic support:

1. Check translation accuracy: See `ARABIC_SUPPORT.md` for translation examples
2. Report RTL layout issues: Provide browser/version and screenshot
3. Translation updates: Edit `web/locales/ar/app.json` directly
4. Add new language: Follow "Scalability for Future Languages" section in `ARABIC_SUPPORT.md`

## Next Steps

- [ ] Test on real devices (mobile, tablet)
- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Plan for right-to-left languages UI improvements
- [ ] Consider Arabic number formatting (if needed)
- [ ] Add more Arabic-specific features (search, sorting, etc.)

---

**Questions?** Check the main documentation in `ARABIC_SUPPORT.md`
