# vscode-google-pinyin

`"ctrl+space"` to enable/disable pinyin

`"1"-"9"` to choose the n-th candidate

`"space"` to choose the first candidate

`"enter"` to type exactly the input (ignore pinyin)

`"-"`, `"+"` to turn to the prev/next page of candidates

To enable pinyin input in the integrated terminal, add the following values to "terminal.integrated.commandsToSkipShell" in settings.json (create the key if it doesn't exist):
```json
"terminal.integrated.commandsToSkipShell": [
    "google-pinyin.toggle",
    "google-pinyin.width",
    "google-pinyin.typing-terminal.a",
    "google-pinyin.typing-terminal.b",
    "google-pinyin.typing-terminal.c",
    "google-pinyin.typing-terminal.d",
    "google-pinyin.typing-terminal.e",
    "google-pinyin.typing-terminal.f",
    "google-pinyin.typing-terminal.g",
    "google-pinyin.typing-terminal.h",
    "google-pinyin.typing-terminal.i",
    "google-pinyin.typing-terminal.j",
    "google-pinyin.typing-terminal.k",
    "google-pinyin.typing-terminal.l",
    "google-pinyin.typing-terminal.m",
    "google-pinyin.typing-terminal.n",
    "google-pinyin.typing-terminal.o",
    "google-pinyin.typing-terminal.p",
    "google-pinyin.typing-terminal.q",
    "google-pinyin.typing-terminal.r",
    "google-pinyin.typing-terminal.s",
    "google-pinyin.typing-terminal.t",
    "google-pinyin.typing-terminal.u",
    "google-pinyin.typing-terminal.v",
    "google-pinyin.typing-terminal.w",
    "google-pinyin.typing-terminal.x",
    "google-pinyin.typing-terminal.y",
    "google-pinyin.typing-terminal.z",
    "google-pinyin.typing-terminal.comma",
    "google-pinyin.typing-terminal.period",
    "google-pinyin.typing-terminal.enumperiod",
    "google-pinyin.typing-terminal.exclamation",
    "google-pinyin.typing-terminal.question",
    "google-pinyin.typing-terminal.colon",
    "google-pinyin.typing-terminal.semicolon",
    "google-pinyin.typing-terminal.lparen",
    "google-pinyin.typing-terminal.rparen",
    "google-pinyin.typing-terminal.lbracket",
    "google-pinyin.typing-terminal.rbracket",
    "google-pinyin.typing-terminal.lbrace",
    "google-pinyin.typing-terminal.rbrace",
    "google-pinyin.typing-terminal.langle",
    "google-pinyin.typing-terminal.rangle"
]
```