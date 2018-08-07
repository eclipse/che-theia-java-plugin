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

import { injectable, inject, multiInject } from 'inversify';
import { ContextMenuRenderer, TreeProps, TreeModel, TreeWidget, CompositeTreeNode, LabelProvider, Widget, WidgetManager } from '@theia/core/lib/browser';
import { LanguageClientProvider } from '@theia/languages/lib/browser/language-client-provider';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { ClasspathContainer } from './classpath-container';
import { IClasspathModel } from './pages/classpath-model';
import { IClasspathNode } from './nodes/classpath-node';
import { LibraryView } from './pages/library/library-view';
import { FILE_NAVIGATOR_ID, FileNavigatorWidget } from '@theia/navigator/lib/browser/navigator-widget';
import { AbstractClasspathTreeWidget } from './pages/classpath-tree-widget';
import { JavaUtils } from '../java-utils';
import { FileStat } from '@theia/filesystem/lib/common';
import { ClasspathDialogRightPanelID } from './classpath-dialog';

export const BuildPathTreeWidgetID = 'Build path tree widget';

/**
 * Left side of configure classpath that holds the libraries and the source node
 */
@injectable()
export class BuildPathTreeWidget extends TreeWidget {

    activeWidget: Widget | undefined;
    activeClasspathURI: string | undefined;

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(TreeModel) readonly model: TreeModel,
        @inject(ContextMenuRenderer) readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(LanguageClientProvider) protected readonly languageClientProvider: LanguageClientProvider,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(ClasspathContainer) protected readonly classpathContainer: ClasspathContainer,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @multiInject(IClasspathNode) readonly classpathNodes: IClasspathNode[],
        @inject(LibraryView) protected readonly libraryView: LibraryView,
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager
    ) {
        super(props, model, contextMenuRenderer);
        this.addClass('classpath-widget');
        this.id = BuildPathTreeWidgetID;
        this.model.onSelectionChanged(async e => {
            const clickedNode = e[0] as IClasspathNode;
            const rightPanel = document.getElementById(ClasspathDialogRightPanelID);
            if (rightPanel) {
                if (this.activeWidget) {
                    Widget.detach(this.activeWidget);
                }
               
                Widget.attach(clickedNode.widget, rightPanel);
                clickedNode.widget.update();
                this.activeWidget = clickedNode.widget;
                this.update();
            }
        });
    }

    async createBuildPathTree() {
        const rootNode = {
            id: 'build-path-root',
            name: 'Java build path',
            visible: true,
            parent: undefined
        } as CompositeTreeNode;
        rootNode.children = await this.createBuildPathTreeChildren(rootNode);
        this.model.root = rootNode;
    }

    async createBuildPathTreeChildren(parent: Readonly<CompositeTreeNode>): Promise<IClasspathNode[]> {
        let activeFileStat = await this.getActiveClasspathFileStat();
        if (activeFileStat) {
            this.activeClasspathURI = activeFileStat.uri;  

            const classpathNodes = await this.classpathContainer.getClassPathEntries(activeFileStat.uri); 
            this.classpathContainer.resolveClasspathEntries(classpathNodes);
            for (const classpathNode of this.classpathNodes) {
                const classpathWidget = classpathNode.widget as AbstractClasspathTreeWidget;
                classpathWidget.activeFileStat = activeFileStat;
                const c = classpathWidget.model as IClasspathModel;
                c.addClasspathNodes(classpathNodes);
            }

            this.classpathContainer.onClasspathModelChangeEmitter.fire({
                classpathItems: classpathNodes,
                uri: activeFileStat.uri
            });
            return this.classpathNodes;
        }
        return [];
    }

    /**
     * Get the classpath file stat for the active configure classpath session
     */
    async getActiveClasspathFileStat(): Promise<FileStat | undefined> {
        const roots = await this.workspaceService.roots;
        const fileModel = await this.widgetManager.getWidget(FILE_NAVIGATOR_ID) as FileNavigatorWidget;
        if (roots && fileModel) {
            const selectedNodes = fileModel.model.selectedFileStatNodes;
            const classpathURI = selectedNodes.length > 0 ? selectedNodes[0].fileStat : roots[0];
            const classpathURI2 = JavaUtils.getRootProjectURI(roots, classpathURI.uri.toString()) as string;
            classpathURI.uri = classpathURI2;
            return classpathURI; 
        }
        return undefined;
    }

    isDirty(): boolean {
        for (const c of this.classpathNodes) {
            const model = c.widget.model as IClasspathModel;
            if (model.isDirty) {
                return true;
            }
        }
        return false;
    }

    async save() {
        if (this.activeClasspathURI) {
            this.classpathContainer.updateClasspath(this.activeClasspathURI);
        }
        this.resetState();
    }

    /**
     * Called when the dialog is closed and we reset the model and items
     */
    resetState(): void {
        for (const c of this.classpathNodes) {
            const model = c.widget.model as IClasspathModel;
            model.isDirty = false;
            model.currentClasspathItems.clear();
        }
        this.classpathContainer.clearClasspathEntries();
    }

}
