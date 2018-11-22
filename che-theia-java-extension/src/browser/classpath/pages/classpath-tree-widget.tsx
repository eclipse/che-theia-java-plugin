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

import { injectable, inject } from 'inversify';
import { ContextMenuRenderer, TreeProps, LabelProvider, TreeWidget, TreeNode, NodeProps, TreeModel } from '@theia/core/lib/browser';
import { LanguageClientProvider } from '@theia/languages/lib/browser/language-client-provider';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import * as React from 'react';
import { DirNode, OpenFileDialogFactory, OpenFileDialogProps } from '@theia/filesystem/lib/browser';
import { IClasspathModel, ClasspathRootID } from './classpath-model';
import { ClasspathContainer, ClasspathEntry, ClasspathEntryKind } from '../classpath-container';
import { FileStat } from '@theia/filesystem/lib/common';
import { ClasspathViewNode } from '../nodes/classpath-node';

export interface extendedDialogProps {
    entryKindOnAdded: ClasspathEntryKind
}

/**
 * This is the left side of the panel that holds the libraries and the source node
 */
@injectable()
export abstract class AbstractClasspathTreeWidget extends TreeWidget {

    classpathModel: IClasspathModel;
    activeFileStat: FileStat | undefined;
    fileDialogProps!: OpenFileDialogProps & extendedDialogProps;

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(IClasspathModel) classpathModel: IClasspathModel,
        @inject(ContextMenuRenderer) readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(LanguageClientProvider) protected readonly languageClientProvider: LanguageClientProvider,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(ClasspathContainer) protected readonly classpathContainer: ClasspathContainer,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(OpenFileDialogFactory) protected readonly openFileDialogFactory: OpenFileDialogFactory
    ) {
        super(props, classpathModel, contextMenuRenderer);
        this.addClass('classpath-widget');
        this.classpathModel = classpathModel;
        this.classpathModel.updateTree();
    }

    protected renderTree(model: TreeModel): React.ReactNode {
        if (model.root) {
            return <TreeWidget.View
                ref={view => this.view = (view || undefined)}
                width={this.node.offsetWidth * 0.8}
                height={this.node.offsetHeight * 0.8}
                rows={Array.from(this.rows.values())}
                renderNodeRow={this.renderNodeRow}
                scrollToRow={this.scrollToRow}
                handleScroll={this.handleScroll}
            />;
        }
        return null;
    }

    protected renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        return <div className={node.icon + " " + ClasspathTreeWidget.Styles.CLASSPATHTREEWIDGET_STYLE_ICONS}></div>;
    }

    protected renderTailDecorations(node: TreeNode, props: NodeProps): React.ReactNode {
        const c = node as ClasspathViewNode;
        if ((c.parent && c.parent.id === ClasspathRootID && c.classpathEntry.entryKind === ClasspathEntryKind.LIBRARY) || c.classpathEntry.entryKind === ClasspathEntryKind.SOURCE) {
            return <div className={ClasspathTreeWidget.Styles.CLASSPATHTREEWIDGET_REMOVE_ICON} onClick={() => this.removeNode(node)}></div>;
        }
        return super.renderTailDecorations(node, props);
    }

    protected removeNode(node: TreeNode) {
        const classpathViewNode = node as ClasspathViewNode;
        this.classpathModel.removeClasspathNode(classpathViewNode.classpathEntry.path);
        this.classpathContainer.removeClasspathEntry(classpathViewNode.classpathEntry);
    }
    
    async openDialog() {
        if (this.activeFileStat) {
            const rootNode = DirNode.createRoot(this.activeFileStat, this.labelProvider.getName(this.activeFileStat), this.activeFileStat.uri);
            const title = this.fileDialogProps.title;
            const dialog = this.openFileDialogFactory(Object.assign(this.fileDialogProps, { title }));
            dialog.model.navigateTo(rootNode);
            const result =  await dialog.open();

            if (result && !Array.isArray(result) && this.isValidOpenedNode(result)) {
                const newClasspathItem = {
                    entryKind: this.fileDialogProps.entryKindOnAdded,
                    path: result.fileStat.uri
                } as ClasspathEntry;
                this.classpathModel.addClasspathNodes(newClasspathItem);
                this.classpathContainer.resolveClasspathEntries([newClasspathItem]);
                this.update();
            }
        }
    }

    protected isValidOpenedNode(node: TreeNode): boolean {
        return false;
    }
              
}

export namespace ClasspathTreeWidget {
    export namespace Styles {
        export const CLASSPATHTREEWIDGET_STYLE_ICONS = 'file-icon java-libraries-icon';
        export const CLASSPATHTREEWIDGET_REMOVE_ICON = 'java-remove-node-icon file-icon java-libraries-icon';
    }
}