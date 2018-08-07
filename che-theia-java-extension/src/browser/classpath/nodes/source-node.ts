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
import { CompositeTreeNode, TreeWidget } from '@theia/core/lib/browser';
import { SourceView } from '../pages/source/source-view';
import { IClasspathNode } from './classpath-node';

export const SourceNodeID = 'Source node';

@injectable()
export class SourceNode implements IClasspathNode {
    
    selected: boolean;
    widget: TreeWidget;
    id: string;
    name: string;
    parent: CompositeTreeNode | undefined;

    constructor(@inject(SourceView) protected readonly sourceView: SourceView) {
        this.selected = false;
        this.id = SourceNodeID;
        this.name = this.id;
        this.widget = sourceView;
    }

}