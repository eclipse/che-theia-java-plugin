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

import { JavaExtensionContribution } from './che-theia-java-contribution';
import {
    CommandContribution,
    MenuContribution,
    ResourceResolver
} from "@theia/core/lib/common";

import { ContainerModule, Container, interfaces } from "inversify";
import { KeybindingContribution, KeybindingContext, WidgetFactory, TreeProps, createTreeContainer,
    defaultTreeProps, TreeWidget, TreeModelImpl, TreeModel } from '@theia/core/lib/browser';

import "../../src/browser/styles/icons.css";
import "../../src/browser/styles/classpath.css";
import { FileStructure } from './navigation/file-structure';
import { JavaEditorTextFocusContext } from './java-keybinding-contexts';
import { BuildPathTreeWidget, BuildPathTreeWidgetID } from './classpath/build-path-widget';
import { ClassPathDialog, DialogProps } from './classpath/classpath-dialog';
import { ClasspathContainer } from './classpath/classpath-container';
import { SourceModel } from './classpath/pages/source/source-model';
import { LibraryModel } from './classpath/pages/library/library-model';
import { ClasspathDecorator } from './classpath/classpath-tree-decorator';
import { MarkDirAsSourceAction } from './action/mark-dir-as-source';
import { UnmarkDirAsSourceAction } from './action/unmark-dir-as-source';
import { NavigatorTreeDecorator } from '@theia/navigator/lib/browser/navigator-decorator-service';
import { LibraryView, LibraryViewID } from './classpath/pages/library/library-view';
import { SourceView, SourceViewID } from './classpath/pages/source/source-view';
import { IClasspathNode } from './classpath/nodes/classpath-node';
import { LibraryNode } from './classpath/nodes/library-node';
import { SourceNode } from './classpath/nodes/source-node';

import { ExternalLibrariesWidget, EXTERNAL_LIBRARIES_ID } from './libraries/external-libraries-widget';
import { createExternalLibrariesWidget } from './libraries/external-libraries-container';
import { CheLibResourceResolver } from './libraries/chelib-resource-provider';
import { FileNavigatorWidget } from '@theia/navigator/lib/browser';

import '../../src/browser/styles/icons.css';
import { FindImplementers } from './navigation/find-implementers';

export default new ContainerModule((bind, unbind, isBound) => {
    bind(CommandContribution).to(JavaExtensionContribution);
    bind(MenuContribution).to(JavaExtensionContribution);
    bind(KeybindingContribution).to(JavaExtensionContribution);

    bind(FileStructure).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(ctx => ctx.container.get(FileStructure));
    bind(KeybindingContribution).toDynamicValue(ctx => ctx.container.get(FileStructure));
    bind(MenuContribution).toDynamicValue(ctx => ctx.container.get(FileStructure));

    bind(FindImplementers).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(ctx => ctx.container.get(FindImplementers));
    bind(KeybindingContribution).toDynamicValue(ctx => ctx.container.get(FindImplementers));
    bind(MenuContribution).toDynamicValue(ctx => ctx.container.get(FindImplementers));

    bind(KeybindingContext).to(JavaEditorTextFocusContext).inSingletonScope();

    bind(CheLibResourceResolver).toSelf().inSingletonScope();
    bind(ResourceResolver).toDynamicValue(ctx => ctx.container.get(CheLibResourceResolver));

    if (isBound(FileNavigatorWidget)) {
        unbind(FileNavigatorWidget);
    }

    bind(ExternalLibrariesWidget).toDynamicValue(ctx => {
        return createExternalLibrariesWidget(ctx.container);
    });

    bind(WidgetFactory).toDynamicValue(context => ({
        id: EXTERNAL_LIBRARIES_ID,
        createWidget: () => context.container.get<ExternalLibrariesWidget>(ExternalLibrariesWidget)
    }));

    /**
     * Classpath configuration
     */
    bind(MarkDirAsSourceAction).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(ctx => ctx.container.get(MarkDirAsSourceAction));
    bind(MenuContribution).toDynamicValue(ctx => ctx.container.get(MarkDirAsSourceAction));

    bind(UnmarkDirAsSourceAction).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(ctx => ctx.container.get(UnmarkDirAsSourceAction));
    bind(MenuContribution).toDynamicValue(ctx => ctx.container.get(UnmarkDirAsSourceAction));

    bind(ClassPathDialog).toSelf().inSingletonScope();
    bind(DialogProps).toConstantValue({ title: 'Configure Classpath' });

    bind(ClasspathContainer).toSelf().inSingletonScope();

    bind(IClasspathNode).to(LibraryNode).inSingletonScope();
    bind(IClasspathNode).to(SourceNode).inSingletonScope();

    /**
     * Build path tree widget
     */
    bind(BuildPathTreeWidget).toDynamicValue(ctx =>
        createBuildPathTreeWidget(ctx.container)
    ).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(context => ({
        id: BuildPathTreeWidgetID,
        createWidget: () => context.container.get<BuildPathTreeWidget>(BuildPathTreeWidget)
    }));

    /**
     * Library View widget
     */
    bind(LibraryView).toDynamicValue(ctx =>
        createLibraryViewTreeWidget(ctx.container)
    ).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(context => ({
        id: LibraryViewID,
        createWidget: () => context.container.get<LibraryView>(LibraryView)
    }));

    /**
     * Source View widget
     */
    bind(SourceView).toDynamicValue(ctx =>
        createSourceViewTreeWidget(ctx.container)
    ).inSingletonScope();

    bind(WidgetFactory).toDynamicValue(context => ({
        id: SourceViewID,
        createWidget: () => context.container.get<SourceView>(SourceView)
    }));

    bind(ClasspathDecorator).toSelf().inSingletonScope();
    bind(NavigatorTreeDecorator).toService(ClasspathDecorator);

});

export const PROPS_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: ["NAVIGATOR_CONTEXT_MENU"],
    multiSelect: false
};

export function createBuildPathTreeWidgetContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent);

    child.rebind(TreeProps).toConstantValue(PROPS_PROPS);

    child.unbind(TreeWidget);
    child.bind(BuildPathTreeWidget).toSelf();

    return child;
}

export function createBuildPathTreeWidget(parent: interfaces.Container): BuildPathTreeWidget {
    return createBuildPathTreeWidgetContainer(parent).get(BuildPathTreeWidget);
}

/**
 * Library view
 */
export function createLibraryViewTreeWidgetContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent);

    child.rebind(TreeProps).toConstantValue(PROPS_PROPS);

    child.unbind(TreeModelImpl);
    child.bind(LibraryModel).toSelf();
    child.rebind(TreeModel).toDynamicValue(ctx => ctx.container.get(LibraryModel));

    child.unbind(TreeWidget);
    child.bind(LibraryView).toSelf();

    return child;
}

export function createLibraryViewTreeWidget(parent: interfaces.Container): LibraryView {
    return createLibraryViewTreeWidgetContainer(parent).get(LibraryView);
}

/**
 * Source view
 */
export function createSourceViewTreeWidgetContainer(parent: interfaces.Container): Container {
    const child = createTreeContainer(parent);

    child.rebind(TreeProps).toConstantValue(PROPS_PROPS);

    child.unbind(TreeModelImpl);
    child.bind(SourceModel).toSelf();
    child.rebind(TreeModel).toDynamicValue(ctx => ctx.container.get(SourceModel));

    child.unbind(TreeWidget);
    child.bind(SourceView).toSelf();

    return child;
}

export function createSourceViewTreeWidget(parent: interfaces.Container): SourceView {
    return createSourceViewTreeWidgetContainer(parent).get(SourceView);
}
