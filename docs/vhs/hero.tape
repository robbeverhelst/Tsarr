# Hero demo for the README — the "homelab flex".
# Render with: vhs docs/vhs/hero.tape
# Output: docs/vhs/hero.gif (or change to .webm/.mp4 via Output directive)

Output docs/vhs/hero.gif

Env PATH ".recording-bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

Set Theme "Catppuccin Mocha"
Set FontSize 18
Set Width 1200
Set Height 600
Set Padding 24
Set TypingSpeed 60ms

Hide
Type "clear"
Enter
Show

Sleep 1500ms
Type "tsarr doctor"
Sleep 800ms
Enter
Sleep 3500ms

Hide
Type "clear"
Enter
Show
Sleep 300ms

Type "tsarr radarr profile list --table"
Sleep 500ms
Enter
Sleep 2500ms

Hide
Type "clear"
Enter
Show
Sleep 300ms

Type `tsarr radarr movie search --term "Dune Part Two"`
Sleep 500ms
Enter
Sleep 3s

Sleep 500ms
