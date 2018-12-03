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
import { OpenerService, open, TreeNode } from '@theia/core/lib/browser';
import { ExternalLibrariesTree, JarFileNode } from './external-libraries-tree';
import URI from '@theia/core/lib/common/uri';
import { FileNavigatorModel } from '@theia/navigator/lib/browser';

@injectable()
export class ExternalLibraryModel extends FileNavigatorModel {

    @inject(OpenerService) protected readonly openerService!: OpenerService;
    @inject(ExternalLibrariesTree) readonly tree!: ExternalLibrariesTree;

    protected doOpenNode(node: TreeNode): void {
        if (JarFileNode.is(node)) {
            open(this.openerService, new URI(node.jarEntry.uri));
        } else {
            super.doOpenNode(node);
        }
    }

}
