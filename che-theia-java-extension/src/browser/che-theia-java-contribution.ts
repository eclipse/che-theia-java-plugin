/*
 * Copyright (c) 2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MAIN_MENU_BAR, Command } from "@theia/core/lib/common";
import { KeybindingContribution, KeybindingRegistry, WidgetManager } from "@theia/core/lib/browser";
import { ClassPathDialog } from "./classpath/classpath-dialog";
import { WorkspaceService } from "@theia/workspace/lib/browser";

export const HELP = [...MAIN_MENU_BAR, '5_classpath'];

export const CONFIGURE_CLASSPATH_COMMAND: Command = {
    id: 'java.configure.classpath',
    label: 'Configure Classpath'
};

@injectable()
export class JavaExtensionContribution implements CommandContribution, MenuContribution, KeybindingContribution {

    constructor(
        @inject(ClassPathDialog) protected readonly aboutDialog: ClassPathDialog,
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService) {
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(CONFIGURE_CLASSPATH_COMMAND, {
            execute: e => {
                this.aboutDialog.open();
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(HELP, {
            commandId: CONFIGURE_CLASSPATH_COMMAND.id,
            label: CONFIGURE_CLASSPATH_COMMAND.label,
            order: '10'
        });
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
    }
}
