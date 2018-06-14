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

import { Container, interfaces } from 'inversify';
import { TreeModel, TreeProps, defaultTreeProps, Tree, TreeDecoratorService } from "@theia/core/lib/browser";
import { createFileTreeContainer, FileTreeModel, FileTree } from '@theia/filesystem/lib/browser';
import { ExternalLibrariesWidget } from './external-libraries-widget';
import { NavigatorDecoratorService, NavigatorTreeDecorator } from '@theia/navigator/lib/browser';
import { bindContributionProvider } from '@theia/core';
import { FileNavigatorSearch } from '@theia/navigator/lib/browser/navigator-search';
import { FileNavigatorTree } from '@theia/navigator/lib/browser/navigator-tree';
import { ExternalLibrariesTree } from './external-libraries-tree';
import { ExternalLibraryModel } from './external-libraries-model';

export const FILE_NAVIGATOR_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: ['navigator-context-menu'],
    multiSelect: false
};

export function createExternalLibrariesContainer(parent: interfaces.Container): Container {
    const child = createFileTreeContainer(parent);

    child.unbind(FileTree);
    child.bind(FileNavigatorTree).toSelf();
    child.bind(ExternalLibrariesTree).toSelf();
    child.rebind(Tree).toDynamicValue(ctx => ctx.container.get(ExternalLibrariesTree));

    child.unbind(FileTreeModel);
    child.bind(ExternalLibraryModel).toSelf();
    child.rebind(TreeModel).toDynamicValue(ctx => ctx.container.get(ExternalLibraryModel));

    child.bind(ExternalLibrariesWidget).toSelf();

    child.rebind(TreeProps).toConstantValue(FILE_NAVIGATOR_PROPS);

    child.bind(NavigatorDecoratorService).toSelf().inSingletonScope();
    child.rebind(TreeDecoratorService).toDynamicValue(ctx => ctx.container.get(NavigatorDecoratorService)).inSingletonScope();
    bindContributionProvider(child, NavigatorTreeDecorator);

    child.bind(FileNavigatorSearch).toSelf().inSingletonScope();
    child.bind(NavigatorTreeDecorator).toService(FileNavigatorSearch);

    return child;
}

export function createExternalLibrariesWidget(parent: interfaces.Container): ExternalLibrariesWidget {
    return createExternalLibrariesContainer(parent).get(ExternalLibrariesWidget);
}
