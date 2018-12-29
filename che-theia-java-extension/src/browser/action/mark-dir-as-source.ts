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
import { ClasspathContainer, ClasspathEntry, ClasspathEntryKind } from "../classpath/classpath-container";
import { CommandContribution, MenuContribution, SelectionService, CommandRegistry, MenuModelRegistry, Command } from "@theia/core";
import { UriAwareCommandHandler, UriCommandHandler } from "@theia/core/lib/common/uri-command-handler";
import URI from "@theia/core/lib/common/uri";
import { NAVIGATOR_CONTEXT_MENU } from "@theia/navigator/lib/browser/navigator-contribution";
import { CompositeTreeNode, WidgetManager } from "@theia/core/lib/browser";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { FileNavigatorWidget, FILE_NAVIGATOR_ID } from "@theia/navigator/lib/browser/navigator-widget";
import { JavaUtils } from "../java-utils";
import { SourceView } from "../classpath/pages/source/source-view";


export const MARKSOURCEDIR = [...NAVIGATOR_CONTEXT_MENU, '7_sourcedir'];


export namespace JavaCommands {
    export const MARKSOURCEDIR: Command = {
        id: 'java:mark-source-dir',
        label: 'Mark Dir as Source'
    };
}

@injectable()
export class MarkDirAsSourceAction implements CommandContribution, MenuContribution {

    constructor(@inject(ClasspathContainer) protected readonly classpathContainer: ClasspathContainer,
                @inject(SelectionService) protected readonly selectionService: SelectionService,
                @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
                @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
                @inject(SourceView) protected readonly sourceView: SourceView) {
    }

    async performAction(projectURI: string, treeNodeID: string) {
        const classpathItems = await this.classpathContainer.getClassPathEntries(projectURI);    
        const newClasspathItem = {
            children: [],
            entryKind: ClasspathEntryKind.SOURCE,
            path: JavaUtils.getIDFromMultiRootID(treeNodeID)
        } as ClasspathEntry
        classpathItems.push(newClasspathItem);
        this.classpathContainer.resolveClasspathEntries(classpathItems);
        this.classpathContainer.updateClasspath(projectURI);
        this.sourceView.classpathModel.addClasspathNodes(newClasspathItem);
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(JavaCommands.MARKSOURCEDIR, this.newUriAwareCommandHandler({
            execute: async fileUri => {
                const fileWidget = await this.widgetManager.tryGetWidget(FILE_NAVIGATOR_ID) as FileNavigatorWidget;
                if (fileWidget) {
                    
                    const roots = await this.workspaceService.roots;
                    const root = JavaUtils.getRootProjectURI(roots, fileUri.toString());
                    if (roots && root) {
                        const multiRootURI = JavaUtils.getMultiRootReadyURI(root, fileUri.toString());
                        const treeNode = fileWidget.model.getNode(multiRootURI);
                        if (treeNode && CompositeTreeNode.is(treeNode)) {
                            this.performAction(root, treeNode.id);   
                        }
                    }
                }
                
            }
        }));
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(MARKSOURCEDIR, {
            commandId: JavaCommands.MARKSOURCEDIR.id
        });
    }

    protected newUriAwareCommandHandler(handler: UriCommandHandler<URI>): UriAwareCommandHandler<URI> {
        return new UriAwareCommandHandler(this.selectionService, handler);
    }
}