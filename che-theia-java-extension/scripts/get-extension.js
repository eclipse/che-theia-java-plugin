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

const fs = require('fs');
const process = require('child_process');
const path = require('path');
const package = require('../package.json');

const packagePath = path.join(__dirname, '..');
const version = package.bundle.version;
const archiveExtensionCoreName = `jdt.ls.extension.core-${version}.jar`;
const archiveExtensionAPIName = `jdt.ls.extension.api-${version}.jar`;
const downloadDir = 'download';
const downloadPath = path.join(packagePath, downloadDir);
const archiveExtensionCorePath = path.join(downloadPath, archiveExtensionCoreName);
const archiveExtensionAPIPath = path.join(downloadPath, archiveExtensionAPIName);

function getExtension() {
    return new Promise((resolve, reject) => {
        const command = 'mvn dependency:copy ';
        console.log('executing ' + command);
        process.exec(command, { cwd: __dirname }, () => {
            if (fs.existsSync(archiveExtensionCorePath) && fs.existsSync(archiveExtensionAPIPath)) {
                resolve(archiveExtensionCorePath);
                resolve(archiveExtensionAPIPath);
            } else {
                reject(new Error('Archive file not found.'));
            }
        });
    });
}

getExtension();
