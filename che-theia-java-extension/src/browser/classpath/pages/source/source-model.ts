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
import {  AbstractClasspathModel } from "../classpath-model";
import { ClasspathViewNode } from "../../nodes/classpath-node";

 @injectable()
 export class SourceModel extends AbstractClasspathModel {

    constructor(@inject(LabelProvider) protected readonly labelProvider: LabelProvider) {
        super();
    }
    
    addClasspathNodes(classpathEntry: ClasspathEntry[] | ClasspathEntry) {
        if (Array.isArray(classpathEntry)) {
            for (const result of classpathEntry) {
                
                if (result.entryKind !== ClasspathEntryKind.SOURCE) {
                    continue;
                }
    
                const classpathViewNode = this.createClasspathNode(result);
                this.currentClasspathItems.set(result.path, classpathViewNode);
            }
        } else {
            this.isDirty = true;
            if (classpathEntry.entryKind === ClasspathEntryKind.SOURCE) {
                const classpathViewNode = this.createClasspathNode(classpathEntry);
                this.currentClasspathItems.set(classpathEntry.path, classpathViewNode);
            }    
        }
        this.updateTree();
    }

    createClasspathNode(result: ClasspathEntry) {
        const resultNode = {
            id: result.path,
            name: this.labelProvider.getLongName(new URI(result.path)),
            icon: "java-source-folder-icon",
            parent: undefined,
            classpathEntry: result,
            isRemoveable: true
        } as ClasspathViewNode;
        
        return resultNode;
    }

 }
