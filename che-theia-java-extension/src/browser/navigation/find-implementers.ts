/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { inject, injectable } from 'inversify';
import { QuickOpenModel, QuickOpenItem, KeybindingRegistry, QuickOpenService, QuickOpenMode, KeybindingContribution } from '@theia/core/lib/browser';
import { CommandRegistry, CommandContribution, CommandHandler, Command, MenuModelRegistry, MenuContribution } from '@theia/core';
import { ILanguageClient, TextDocumentPositionParams, ExecuteCommandRequest, TextDocumentIdentifier, SymbolKind } from '@theia/languages/lib/browser';
import { LanguageClientProvider } from '@theia/languages/lib/browser/language-client-provider';
import { EditorManager, EDITOR_CONTEXT_MENU } from '@theia/editor/lib/browser';
import { FIND_IMPLEMENTERS_COMMAND } from '../che-ls-jdt-commands';
import URI from '@theia/core/lib/common/uri';
import { Range } from 'vscode-languageserver-types';
import { JavaKeybindingContexts } from '../java-keybinding-contexts';

export interface Implementers {
    searchedElement: string,
    implementers: ImplementationItem[]
}

export interface ImplementationItem {
    name: string,
    kind: number,
    location: ImplementationItemLocation
}

export interface ImplementationItemLocation {
    uri: string,
    range: Range
}

@injectable()
export class FindImplementers implements QuickOpenModel, CommandContribution, KeybindingContribution, MenuContribution, CommandHandler {

    private items!: QuickOpenItem[];
    private command: Command = {
        id: 'java.command.implementation',
        label: 'Java: Open Implementation(s)'
    };
    
    constructor(
        @inject(CommandRegistry) protected readonly commands: CommandRegistry,
        @inject(KeybindingRegistry) protected readonly keybindings: KeybindingRegistry,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(LanguageClientProvider) protected readonly languageClientProvider: LanguageClientProvider,
        @inject(EditorManager) protected readonly editorManager: EditorManager
    ) { 
    }

    async execute() {
        const client = await this.languageClientProvider.getLanguageClient('java');
        if (client) {
            const implementersResponse = await this.doRequestToimplementers(client);

            if (implementersResponse.implementers.length === 1) {
                const firstItem = implementersResponse.implementers[0];
                this.editorManager.open(new URI(firstItem.location.uri), {
                    mode: 'activate',
                    selection: Range.create(firstItem.location.range.start, firstItem.location.range.end)
                });
            }

            this.items = [];
            implementersResponse.implementers.map((item: ImplementationItem) => this.items.push(new ImplementerQuickOpenItem(item.name, item.kind, item.location, this.editorManager)));

            const itemNotFoundMessage = 'Found 0 implementations'; 
            const itemFoundMessage = `Found ${implementersResponse.implementers.length} implementation(s) for ${implementersResponse.searchedElement}`; 
            this.quickOpenService.open(this, {
                placeholder: this.items.length > 0 ? itemFoundMessage : itemNotFoundMessage
            });
        }
        
    }
    
    isEnabled(): boolean {
        return !!this.editorManager.currentEditor;
    }

    isVisible(): boolean {
        return this.isEnabled();
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: this.command.id,
            keybinding: 'ctrlcmd+alt+b',
            context: JavaKeybindingContexts.javaEditorTextFocus
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(this.command, this);
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction([...EDITOR_CONTEXT_MENU, 'navigation'], {
            commandId: this.command.id,
            label: 'Open Implementation(s)'
        });
    }

    public onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        acceptor(this.items);
    }

    private async doRequestToimplementers(javaClient: ILanguageClient): Promise<Implementers> {

        const currEditor = this.editorManager.currentEditor;

        if (currEditor) {
            const cursorPosition = currEditor.editor.cursor;
            const textDocumentIdentifier = {
                uri: currEditor.editor.document.uri
            } as TextDocumentIdentifier;

            const result = await javaClient.sendRequest(ExecuteCommandRequest.type, {
                command: FIND_IMPLEMENTERS_COMMAND,
                arguments: [
                    {
                        position: cursorPosition,
                        textDocument: textDocumentIdentifier
                    } as TextDocumentPositionParams
                ]
            });

            return result;
        }

        return {
            'searchedElement': '',
            'implementers': []
        };
    }

}

export class ImplementerQuickOpenItem extends QuickOpenItem {

    private activeElement: HTMLElement;
    private name: string;
    private kind: number;
    private location: ImplementationItemLocation;
    private editorManager: EditorManager;

    constructor(
        name: string,
        kind: number,
        location: ImplementationItemLocation,
        editorManager: EditorManager
    ) {
        super();
        this.activeElement = window.document.activeElement as HTMLElement;
        this.name = name;
        this.kind = kind;
        this.location = location;
        this.editorManager = editorManager;
    }

    getLabel(): string {
        return this.name;
    }

    getDescription(): string {
        return this.location.uri;
    }

    getIconClass() {
        switch (this.kind) {
            case SymbolKind.Interface: {
                return 'java-interface-icon file-icon';
            }
            case SymbolKind.Enum: {
                return 'java-enum-icon file-icon';
            }
            default:
                return 'java-class-icon file-icon';
        }
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        // allow the quick open widget to close itself
        setTimeout(() => {
            // reset focus on the previously active element.
            this.activeElement.focus();
            this.editorManager.open(new URI(this.location.uri), {
                mode: 'activate',
                selection: Range.create(this.location.range.start, this.location.range.end)
            });
        }, 50);
        return true;
    }
}
