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

import { SelectableTreeNode, TreeNode, TreeWidget } from "@theia/core/lib/browser";
import { ClasspathEntry } from "../classpath-container";

export const IClasspathNode = Symbol('IClasspathNode');

export interface IClasspathNode extends SelectableTreeNode {
    widget: TreeWidget;
}

export interface ClasspathViewNode extends TreeNode {
    classpathEntry: ClasspathEntry;
    children?: ClasspathViewNode[],
    expanded?: boolean
}
