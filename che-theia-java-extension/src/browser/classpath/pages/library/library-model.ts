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

import { ClasspathEntry, ClasspathEntryKind } from "../../classpath-container";
import { LabelProvider } from "@theia/core/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { injectable, inject } from "inversify";
import { AbstractClasspathModel } from "../classpath-model";
import { ClasspathViewNode } from "../../nodes/classpath-node";

@injectable()
export class LibraryModel extends AbstractClasspathModel {

    constructor(@inject(LabelProvider) protected readonly labelProvider: LabelProvider) {
        super();
    }

    addClasspathNodes(classpathEntry: ClasspathEntry[] | ClasspathEntry) {
        if (Array.isArray(classpathEntry)) { 
            for (const result of classpathEntry) {
                if (result.entryKind !== ClasspathEntryKind.CONTAINER && result.entryKind !== ClasspathEntryKind.LIBRARY) {
                    continue;
                }
    
                const classpathNode = this.createClasspathNodes(result);
                this.currentClasspathItems.set(result.path, classpathNode); 
            }
        } else {
            this.isDirty = true;
            if (classpathEntry.entryKind === ClasspathEntryKind.CONTAINER || classpathEntry.entryKind === ClasspathEntryKind.LIBRARY) {
                const classpathNode = this.createClasspathNodes(classpathEntry);
                this.currentClasspathItems.set(classpathEntry.path, classpathNode);
            }
        }
        this.updateTree();
    }

    private createClasspathNodes(result: ClasspathEntry) {
        let childNodes = [];
        if (result.children) {
            for (const child of result.children) {
                const childNode = {
                    id: child.path,
                    name: this.labelProvider.getName(new URI(child.path)) + " - " + this.labelProvider.getLongName(new URI(child.path)),
                    icon: "java-jar-icon",
                    classpathEntry: child
                } as ClasspathViewNode;
                childNodes.push(childNode);
            }
        }
    
        const resultNode = {
            id: result.path,
            name: this.labelProvider.getName(new URI(result.path)),
            icon: "java-externalLibraries-icon",
            parent: undefined,
            classpathEntry: result
        } as ClasspathViewNode;

        if (childNodes.length > 0) {
            resultNode.expanded = false;
            resultNode.children = childNodes;
        } 

        return resultNode;    
    }

}