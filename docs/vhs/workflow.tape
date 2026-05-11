# Workflow demo for the CLI section — the "useful story".
# Render with: vhs docs/vhs/workflow.tape
# Output: docs/vhs/workflow.gif

Output docs/vhs/workflow.gif

Set Theme "Catppuccin Mocha"
Set FontSize 18
Set Width 1200
Set Height 700
Set Padding 24
Set TypingSpeed 60ms

Hide
Type "clear"
Enter
Show

Sleep 500ms
Type "tsarr doctor"
Sleep 400ms
Enter
Sleep 2500ms

Type "tsarr radarr movie search --term ""Dune Part Two"""
Sleep 400ms
Enter
Sleep 2500ms

Type "tsarr radarr movie add 693134 --quality Ultra-HD"
Sleep 400ms
Enter
Sleep 2s

Sleep 1s
