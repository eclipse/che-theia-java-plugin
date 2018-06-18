# Che-Theia - Java Plugin

Che-Theia - Java plugin contains additional parts for the che-ls-jdt extension of jdt.ls.

#### Developing the plugin

In order to get this plugin up and running you must first clone this repo. After that open the code in VSCode (or the editor of choice). When you've made some changes run yarn on the root of the repo. To see theia with the plugin applied cd into either browser-app or electron-app. After that run ```yarn run start``` and theia will be launched on port 3000 with the plugin installed.


#### Making a call to Che-LS-JDT

Here is some example code creating a ExecuteCommandRequest directly to che-ls-jdt:

```typescript
const client = await this.javaClientContribution.languageClient;
const result = await client.sendRequest(ExecuteCommandRequest.type, {
    command: JAVA_ORGANIZE_IMPORTS.id,
    arguments: [
        uri
    ]
});
```

#### Creating a keybinding

Any new keybinding should have context set as JavaKeybindingContexts.javaEditorTextFocus so the keybindings will only be relevant in the java editor context.

```typescript
keybindings.registerKeybinding({
    command: JAVA_ORGANIZE_IMPORTS.id,
    context: JavaKeybindingContexts.javaEditorTextFocus,
    keybinding: 'ctrlcmd+shift+o'
});
```

## License
[Apache-2.0](https://github.com/theia-ide/theia/blob/master/LICENSE)
