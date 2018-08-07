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
import { ContextMenuRenderer, TreeProps, LabelProvider, TreeNode } from '@theia/core/lib/browser';
import { LanguageClientProvider } from '@theia/languages/lib/browser/language-client-provider';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import * as React from 'react';
import { OpenFileDialogFactory } from '@theia/filesystem/lib/browser';
import { ClasspathContainer, ClasspathEntryKind } from '../../classpath-container';
import { LibraryModel } from './library-model';
import { AbstractClasspathTreeWidget } from '../classpath-tree-widget';

export const LibraryViewID = 'Library View';

@injectable()
export class LibraryView extends AbstractClasspathTreeWidget {

    classpathModel: LibraryModel;

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(LibraryModel) classpathModel: LibraryModel,
        @inject(ContextMenuRenderer) readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(LanguageClientProvider) protected readonly languageClientProvider: LanguageClientProvider,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(ClasspathContainer) protected readonly classpathContainer: ClasspathContainer,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(OpenFileDialogFactory) protected readonly openFileDialogFactory: OpenFileDialogFactory
    ) {
        super(props, classpathModel, contextMenuRenderer, languageClientProvider, workspaceService, classpathContainer, labelProvider, openFileDialogFactory);
        this.classpathModel = classpathModel;
        this.id = LibraryViewID;
        this.addClass('library-widget');
        this.fileDialogProps = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            title: "Add a jar",
            entryKindOnAdded: ClasspathEntryKind.LIBRARY
        }
    }
    
    protected render(): React.ReactNode {
        const tree = this.renderTree(this.classpathModel);
        return (
            <div>
                <div id="right-view-left" className={'classpath-tree-left'}>
                    <h4 className={'classpath-view-title'}>JARs and class folders on the build path</h4>
                    { tree }
                </div>
                <div className={'classpath-button-right'}>
                    <button onClick={this.openDialog.bind(this)}>Add Jar</button>
                </div>
            </div>
        );
    }

    protected isValidOpenedNode(node: TreeNode): boolean {
        return node.id.endsWith('.jar');
    }
    
}
