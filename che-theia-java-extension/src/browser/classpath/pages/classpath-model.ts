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

import { ClasspathEntry } from "../classpath-container";
import { TreeModelImpl, CompositeTreeNode } from "@theia/core/lib/browser";
import { ClasspathViewNode } from "../nodes/classpath-node";

export const IClasspathModel = Symbol('IClasspathModel');

export interface IClasspathModel extends TreeModelImpl {
    currentClasspathItems: Map<string, ClasspathViewNode>;
    addClasspathNodes(classpathItems: ClasspathEntry[] | ClasspathEntry): void;
    removeClasspathNode(path: string): void;
    isDirty: boolean;
    updateTree(): void;
}

export const ClasspathRootID = 'class-path-root';
export const ClasspathRootName = 'java-class-path-root';

export abstract class AbstractClasspathModel extends TreeModelImpl implements IClasspathModel {
    
    currentClasspathItems: Map<string, ClasspathViewNode>;
    isDirty = false;
    
    constructor() {
        super();
        this.currentClasspathItems = new Map();    
    }

    addClasspathNodes(classpathItems: ClasspathEntry | ClasspathEntry[]): void {
        throw new Error('Method not implemented.');
    }

    removeClasspathNode(path: string): void {
        this.isDirty = true;
        this.currentClasspathItems.delete(path);
        this.updateTree();
    }

    get classpathItems(): ClasspathViewNode[] {
        return Array.from(this.currentClasspathItems.values());
    }

    updateTree() {
        const rootNode = {
            id: ClasspathRootID,
            name: ClasspathRootName,
            visible: false,
            parent: undefined,
            children: this.classpathItems
        } as CompositeTreeNode;
        this.root = rootNode;
    }

}