OPEN ALL NIGHT — PLAYTEST BUILD
================================

This is a pre-release playtest build. It is NOT the final game and is NOT a Steam build.

Build commit:  {{COMMIT}}
Branch:        visual/graphics-overhaul-pass-6
Build type:    Windows x64 portable playtest

HOW TO RUN
----------
1. Unzip the entire folder somewhere on your PC (Desktop, Downloads, wherever).
2. Keep every file in the folder together - don't move "Open All Night.exe" out on its own.
3. Double-click "Open All Night.exe".

That's it - no installer, no Node.js, no dev tools, nothing else to set up.

CONTROLS
--------
WASD       Move
Mouse      Look
Shift      Sprint
E          Interact
ESC        Release mouse
F11        Toggle fullscreen (added by this playtest shell - the game itself has no in-game
           fullscreen setting yet, so use F11 or the window's own maximize button)

The game boots straight to the normal title menu - no developer flags, no debug overlays, no
experimental-asset flags are active by default.

DEVELOPER / TIME-JUMP CONTROLS (OPTIONAL)
------------------------------------------
If you want access to the developer time-jump panel used for testing specific nights/times, run
"OPEN_ALL_NIGHT_DEV.bat" instead of the .exe directly. This launches the exact same game with the
developer controls enabled - it does not change or duplicate any game files. Nothing about your
normal save is affected either way.

SAVE DATA
---------
Your progress is saved automatically to this build's own local browser storage (localStorage),
scoped to the packaged app's local web server, not to any real website. It persists across closing
and reopening the game as long as you keep the same unzipped folder in the same location on disk -
closing and relaunching "Open All Night.exe" from the same folder will pick your save back up.
Deleting the folder deletes the save. Moving the folder to a different path on the same PC should
be fine; copying it to a different PC starts a fresh save there.

OFFLINE
-------
This build is fully self-contained - it does not need an internet connection to play. All
characters, merchandise, checkout/coffee/restroom/office assets, textures and packaging label art
are bundled inside this folder.

KNOWN ISSUES IN THIS PLAYTEST PACKAGE
--------------------------------------
See PACKAGING_NOTES.txt if included for anything packaging-specific that came up while building
this playtest .zip. This is a graphics/content playtest build - if something looks or plays oddly,
please use PLAYTEST_NOTES_TEMPLATE.txt to tell us what you saw.

HOW TO REPORT BUGS
-------------------
Fill out PLAYTEST_NOTES_TEMPLATE.txt (one copy per issue is fine, or list several) and send it
back however you were given this build. Screenshots help a lot - Windows' own Win+Shift+S snip
tool or PrintScreen both work fine against this window.

Thanks for playtesting!
