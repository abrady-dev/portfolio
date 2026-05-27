# favicon_io — banani.dev

Drop this whole folder into your site's public/static directory (so the files
are served at `/favicon_io/*`), then add this to your `<head>`:

```html
<link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png">
<link rel="manifest" href="/favicon_io/site.webmanifest">
```

## Files

| File                          | Use                          |
|-------------------------------|------------------------------|
| favicon-16x16.png             | browser tab (small)          |
| favicon-32x32.png             | browser tab (retina)         |
| favicon-48x48.png             | windows / desktop shortcut   |
| favicon-96x96.png             | misc                         |
| apple-touch-icon.png (180px)  | iOS home screen              |
| android-chrome-192x192.png    | android home screen          |
| android-chrome-512x512.png    | PWA splash / store           |
| site.webmanifest              | PWA manifest                 |

Remove any older favicon `<link>` tags from your HTML when wiring this in.
