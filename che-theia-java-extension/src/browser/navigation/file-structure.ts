/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { inject, injectable } from "inversify";
import { QuickOpenModel, QuickOpenItem, KeybindingRegistry, Keybinding, QuickOpenService, QuickOpenMode, KeybindingContribution } from "@theia/core/lib/browser";
import { CommandRegistry, CommandContribution, Command, MenuModelRegistry, MenuContribution } from "@theia/core";
import { ILanguageClient, ExecuteCommandRequest, SymbolKind } from "@theia/languages/lib/browser";
import { LanguageClientProvider } from "@theia/languages/lib/browser/language-client-provider";
import { EditorManager, EDITOR_CONTEXT_MENU } from "@theia/editor/lib/browser";
import { FILE_STRUCTURE_COMMAND } from "../che-ls-jdt-commands";
import URI from '@theia/core/lib/common/uri';
import { Range } from 'vscode-languageserver-types';

/**
 * An element describes file structure.
 */
export interface Members {
    info: MemberItem,
    children: Members[]
}

/**
 * Provides an information about one member.
 */
export interface MemberItem {
    name: string,
    kind: number,
    location: MemberLocation
}

/**
 * Contains uri and range of the member.
 */
export interface MemberLocation {
    uri: string,
    range: Range
}

/**
 * Object with parameters to execute custom command for getting file structure.
 */
export interface FileStructureCommandParameters {
    uri: string,
    showInherited: boolean
}

@injectable()
export class FileStructure implements QuickOpenModel, CommandContribution, KeybindingContribution, MenuContribution {
    /**
     * Whether to hide members from super classes.
     */
    protected showInheritedMembers: boolean = false;
    /**
     * Whether the dialog is currently open.
     */
    protected isOpen: boolean = false;
    /**
     * The current lookFor string input by the user.
     */
    protected currentLookFor: string = "";

    private items!: QuickOpenItem[];
    private command: Command = {
        id: 'java.command.file.structure',
        label: 'Java: Navigate File Structure'
    };

    constructor(
        @inject(CommandRegistry) protected readonly commands: CommandRegistry,
        @inject(KeybindingRegistry) protected readonly keybindingRegistry: KeybindingRegistry,
        @inject(KeybindingRegistry) protected readonly keybindings: KeybindingRegistry,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService,
        @inject(LanguageClientProvider) protected readonly languageClientProvider: LanguageClientProvider,
        @inject(EditorManager) protected readonly editorManager: EditorManager
    ) {
    }

    async open() {
        // Triggering the keyboard shortcut while the dialog is open toggles
        // showing the inherited members.
        if (this.isOpen) {
            this.showInheritedMembers = !this.showInheritedMembers;
        } else {
            this.showInheritedMembers = false;
            this.isOpen = true;
        }

        let placeholderText = "File Structure.";
        const keybinding = this.getKeyCommand();
        const showOrHide = this.showInheritedMembers ? 'hide' : 'show';
        if (keybinding) {
            placeholderText += ` (Press ${keybinding} to ${showOrHide} inherited members)`;
        }

        const client = await this.languageClientProvider.getLanguageClient("java");
        if (client) {
            const fileStructureResponse = await this.doRequestToStructure(client);

            this.items = [];
            this.combineItems(fileStructureResponse);
            this.quickOpenService.open(this, {
                prefix: this.currentLookFor,
                fuzzyMatchLabel: true,
                fuzzyMatchDescription: true,
                fuzzySort: true,
                placeholder: placeholderText,
                onClose: () => {
                    this.isOpen = false;
                    this.currentLookFor = "";
                },
            });
        }
    }

    private combineItems(members: Members[]) {
        for (const symbolInformation of members) {
            const info = symbolInformation.info as MemberItem;
            if (!info) {
                continue;
            }
            this.items.push(new MemberQuickOpenItem(info.name, info.kind, info.location, this.editorManager));

            if (symbolInformation.children.length !== 0) {
                this.combineItems(symbolInformation.children);
            }
        }
    }

    /**
    * Get a string (suitable to show to the user) representing the keyboard
    * shortcut used to open the quick file open menu.
    */
    private getKeyCommand(): string | undefined {
        const keyCommand = this.keybindingRegistry.getKeybindingsForCommand(this.command.id);
        if (keyCommand) {
            // We only consider the first keybinding.
            const accel = Keybinding.acceleratorFor(keyCommand[0], '+');
            return accel.join(' ');
        }

        return undefined;
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
            keybinding: "ctrlcmd+alt+o"
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(this.command, {
            execute: () => this.open(),
            isEnabled: () => this.isEnabled()
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction([...EDITOR_CONTEXT_MENU, 'navigation'], {
            commandId: this.command.id,
            label: "Navigate File Structure"
        });
    }

    public onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        this.currentLookFor = lookFor;
        acceptor(this.items.filter((item) => item.getLabel()!.toLocaleLowerCase().indexOf(lookFor.toLocaleLowerCase()) !== -1));
    }

    private async doRequestToStructure(javaClient: ILanguageClient): Promise<Members[]> {

        const currEditor = this.editorManager.currentEditor;

        if (currEditor) {
            return await javaClient.sendRequest(ExecuteCommandRequest.type, {
                command: FILE_STRUCTURE_COMMAND,
                arguments: [
                    {
                        uri: currEditor.editor.document.uri,
                        showInherited: this.showInheritedMembers
                    } as FileStructureCommandParameters
                ]
            });
        }
        return [];
    }
}

export class MemberQuickOpenItem extends QuickOpenItem {
    private activeElement: HTMLElement;
    private location: MemberLocation;
    private editorManager: EditorManager;
    private name: string;
    private kind: number;

    constructor(
        name: string,
        kind: number,
        location: MemberLocation,
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
        return "";
    }

    getIconClass() {
        switch (this.kind) {
            case SymbolKind.Interface: {
                return "java-interface-icon file-icon";
            }
            case SymbolKind.Enum: {
                return "java-enum-icon file-icon";
            }
            case SymbolKind.Field: {
                return "java-field-icon file-icon";
            }
            case SymbolKind.Method: {
                return "java-method-icon file-icon";
            }
            default:
                return "java-class-icon file-icon";
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
