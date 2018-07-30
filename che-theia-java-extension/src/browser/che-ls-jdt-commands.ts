/*
 * Copyright (c) 2018 Red Hat, Inc.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

export const HELLO_WORLD_COMMAND = "org.eclipse.che.jdt.ls.extension.samplecommand";
export const FILE_STRUCTURE_COMMAND =
    "org.eclipse.che.jdt.ls.extension.filestructure";
export const TEST_DETECT_COMMAND = "che.jdt.ls.extension.detectTest";
export const FIND_TEST_BY_CURSOR_COMMAND = "che.jdt.ls.extension.findTestByCursor";
export const FIND_TESTS_FROM_PROJECT_COMMAND =
    "che.jdt.ls.extension.findTestFromProject";
export const FIND_TESTS_FROM_FOLDER_COMMAND =
    "che.jdt.ls.extension.findTestFromFolder";
export const FIND_TESTS_FROM_ENTRY_COMMAND =
    "che.jdt.ls.extension.findTestFromEntry";
export const FIND_TESTS_IN_FILE_COMMAND = "che.jdt.ls.extension.findTestInFile";
export const RESOLVE_CLASSPATH_COMMAND = "che.jdt.ls.extension.resolveClasspath";
export const GET_OUTPUT_DIR_COMMAND = "che.jdt.ls.extension.outputDir";
export const GET_EFFECTIVE_POM_COMMAND = "che.jdt.ls.extension.effectivePom";
export const GET_MAVEN_PROJECTS_COMMAND = "che.jdt.ls.extension.mavenProjects";
export const RECOMPUTE_POM_DIAGNOSTICS = "che.jdt.ls.extension.pom.diagnostics";
export const REIMPORT_MAVEN_PROJECTS_COMMAND =
    "che.jdt.ls.extension.reImportMavenProject";
export const GET_CLASS_PATH_TREE_COMMAND = "che.jdt.ls.extension.classpathTree";

/**
 * External Libraries
 */

export const GET_EXTERNAL_LIBRARIES_COMMAND =
    "che.jdt.ls.extension.externalLibraries";
export const GET_EXTERNAL_LIBRARIES_CHILDREN_COMMAND =
    "che.jdt.ls.extension.externalLibrariesChildren";
export const GET_LIBRARY_CHILDREN_COMMAND = "che.jdt.ls.extension.libraryChildren";
export const GET_LIBRARY_ENTRY_COMMAND = "che.jdt.ls.extension.libraryEntry";

/**
 * Debug
 */

export const FIND_RESOURCES_BY_FQN =
    "che.jdt.ls.extension.debug.findResourcesByFqn";
export const IDENTIFY_FQN_IN_RESOURCE =
    "che.jdt.ls.extension.debug.identifyFqnInResource";
export const USAGES_COMMAND = "che.jdt.ls.extension.usages";

export const UPDATE_WORKSPACE = "che.jdt.ls.extension.updateWorkspace";

/**
 * Simple java project
 */

export const CREATE_SIMPLE_PROJECT = "che.jdt.ls.extension.plain.createProject";
export const UPDATE_PROJECT_CLASSPATH =
    "che.jdt.ls.extension.plain.updateClasspath";
export const GET_SOURCE_FOLDERS = "che.jdt.ls.extension.plain.sourceFolders";

/**
 * Navigation
 */

export const FIND_IMPLEMENTERS_COMMAND = "che.jdt.ls.extension.findImplementers";

/**
 * Configuration
 */

export const GET_JAVA_CORE_OPTIONS_СOMMAND =
    "che.jdt.ls.extension.configuration.getJavaCoreOptions";
export const UPDATE_JAVA_CORE_OPTIONS_СOMMAND =
    "che.jdt.ls.extension.configuration.updateJavaCoreOptions";
export const GET_PREFERENCES_СOMMAND =
    "che.jdt.ls.extension.configuration.getPreferences";
export const UPDATE_PREFERENCES_СOMMAND =
    "che.jdt.ls.extension.configuration.updatePreferences";

/**
 * Imports
 */

export const ORGANIZE_IMPORTS = "che.jdt.ls.extension.import.organizeImports";

/**
 * Refactoring
 */

export const RENAME_COMMAND = "che.jdt.ls.extension.refactoring.rename";
export const GET_RENAME_TYPE_COMMAND =
    "che.jdt.ls.extension.refactoring.rename.get.type";
export const VALIDATE_RENAMED_NAME_COMMAND =
    "che.jdt.ls.extension.refactoring.rename.validate.new.name";
export const GET_LINKED_ELEMENTS_COMMAND =
    "che.jdt.ls.extension.refactoring.rename.get.linked.elements";
export const VALIDATE_MOVE_COMMAND =
    "che.jdt.ls.extension.refactoring.move.validate";
export const GET_DESTINATIONS_COMMAND =
    "che.jdt.ls.extension.refactoring.move.get.destinations.command";
export const MOVE_COMMAND = "che.jdt.ls.extension.refactoring.move.command";
export const VERIFY_MOVE_DESTINATION_COMMAND =
    "che.jdt.ls.extension.refactoring.move.verify.destination";

/**
 * Classpath updater
 */

export const CLIENT_UPDATE_PROJECTS_CLASSPATH =
    "che.jdt.ls.extension.workspace.clientUpdateProjectsClasspath";

/**
 * Project updater
 */

export const CLIENT_UPDATE_PROJECT =
    "che.jdt.ls.extension.workspace.clientUpdateProject";
