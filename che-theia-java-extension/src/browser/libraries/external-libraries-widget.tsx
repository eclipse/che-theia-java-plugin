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

import { injectable, inject } from 'inversify';
import { SelectionService, CommandService } from '@theia/core/lib/common';
import { ContextMenuRenderer, TreeProps, LabelProvider, WidgetManager, TreeNode, NodeProps } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { FileSystem } from '@theia/filesystem/lib/common/filesystem';
import { EditorManager } from '@theia/editor/lib/browser';
import { FileNavigatorWidget } from '@theia/navigator/lib/browser';
import { ExternalLibraryModel } from './external-libraries-model';
import * as React from "react";

export const EXTERNAL_LIBRARIES_ID = 'files';
export const LABEL = 'Files';
export const CLASS = 'theia-Files';

@injectable()
export class ExternalLibrariesWidget extends FileNavigatorWidget {

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
        @inject(CommandService) protected readonly commandService: CommandService,
        @inject(SelectionService) protected readonly selectionService: SelectionService,
        @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(ApplicationShell) protected readonly shell: ApplicationShell,
        @inject(FileSystem) protected readonly fileSystem: FileSystem,
        @inject(ExternalLibraryModel) readonly model: ExternalLibraryModel,
        @inject(WidgetManager) protected readonly widget: WidgetManager,
        @inject(EditorManager) protected readonly editorManager: EditorManager
    ) {
        super(props, model, contextMenuRenderer, commandService, selectionService, workspaceService, shell, fileSystem);
        this.id = EXTERNAL_LIBRARIES_ID;
        this.title.label = LABEL;
        this.addClass(CLASS);
    }

    protected renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        return <div className={node.icon + " file-icon java-libraries-icon" }> </div>;
    }

}
