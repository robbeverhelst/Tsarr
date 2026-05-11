# Workflow demo for the CLI section — the "useful story".
# Render with: vhs docs/vhs/workflow.tape
# Output: docs/vhs/workflow.gif

Output docs/vhs/workflow.gif

Env PATH ".recording-bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

Set Theme "Catppuccin Mocha"
Set FontSize 18
Set Width 1200
Set Height 600
Set Padding 24
Set TypingSpeed 50ms

Hide
Type "clear"
Enter
Show

Sleep 500ms
Type `tsarr radarr movie search --term "Dune Part Two"`
Sleep 300ms
Enter
Sleep 3s

Type `tsarr sonarr series search --term "Severance"`
Sleep 300ms
Enter
Sleep 3s

Sleep 1s
