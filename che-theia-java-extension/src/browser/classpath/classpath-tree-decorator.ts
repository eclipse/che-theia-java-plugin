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

import { TreeDecorator, TreeDecoration } from '@theia/core/lib/browser/tree/tree-decorator';
import { Tree, WidgetManager, TreeNode, LabelProvider } from '@theia/core/lib/browser';
import { Event, Emitter } from '@theia/core/lib/common/event';
import { injectable, inject } from 'inversify';
import { ClasspathContainer, ClasspathEntry, ClasspathEntryKind } from './classpath-container';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { JavaUtils } from '../java-utils';

@injectable()
export class ClasspathDecorator implements TreeDecorator {
    
    id: string = "classpath-decorator";
    
    protected readonly emitter: Emitter<(tree: Tree) => Map<string, TreeDecoration.Data>>;
    currentlyDecorated: Set<TreeNode> = new Set();

    constructor(@inject(ClasspathContainer) protected readonly classpathContainer: ClasspathContainer,
                @inject(WorkspaceService) protected readonly workspaceService: WorkspaceService,
                @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
                @inject(LabelProvider) protected readonly labelProvider: LabelProvider) {
        this.emitter = new Emitter();
        this.classpathContainer.onClasspathModelChange(c => {
            this.fireDidChangeDecorations((tree: Tree) => this.collectDecorators(tree, c.classpathItems, c.uri));
        });
    }

    async decorations(tree: Tree): Promise<Map<string, TreeDecoration.Data>> {
        const roots = await this.workspaceService.roots;
        if (roots) {
            const toDecorate = new Map<string, TreeDecoration.Data>();
            for (const root of roots) {
                const classpathItems = await this.classpathContainer.getClassPathEntries(root.uri);
                const rootDecorations = this.collectDecorators(tree, classpathItems, root.uri);
                rootDecorations.forEach((decorator, path) => {
                    toDecorate.set(path, decorator); 
                });
            }
            return toDecorate;
        }
        return new Map();
    }

    protected toDecorator(): TreeDecoration.Data {
        const position = TreeDecoration.IconOverlayPosition.BOTTOM_LEFT;
        const icon = 'fa fa-times-circle';
        const color = 'var(--theia-brand-color1)';
        return {
            iconOverlay: {
                position,
                icon,
                color
            }
        };
    }
    
    protected collectDecorators(tree: Tree, classpathItems: ClasspathEntry[], uri: string): Map<string, TreeDecoration.Data> {
        let toDecorate = new Map<string, TreeDecoration.Data>();
        for (const classpathItem of classpathItems) {
            if (classpathItem.entryKind !== ClasspathEntryKind.SOURCE) {
                continue;
            }

            const multiRootURI = JavaUtils.getMultiRootReadyURI(uri, classpathItem.path);
            let navigatorTreeNode = tree.getNode(multiRootURI);
            if (navigatorTreeNode) {
                toDecorate.set(navigatorTreeNode.id, this.toDecorator());
            }
        }
        return toDecorate;
    }
    
    get onDidChangeDecorations(): Event<(tree: Tree) => Map<string, TreeDecoration.Data>> {
        return this.emitter.event;
    }

    protected fireDidChangeDecorations(event: (tree: Tree) => Map<string, TreeDecoration.Data>): void {
        this.emitter.fire(event);
    }

}