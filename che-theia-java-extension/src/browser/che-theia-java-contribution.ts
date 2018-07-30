/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from "@theia/core/lib/common";
import { KeybindingContribution, KeybindingRegistry } from "@theia/core/lib/browser";

@injectable()
export class JavaExtensionContribution implements CommandContribution, MenuContribution, KeybindingContribution {

    registerCommands(registry: CommandRegistry): void {
    }

    registerMenus(menus: MenuModelRegistry): void {
    }

    registerKeybindings(keybindings: KeybindingRegistry): void {
    }
}
