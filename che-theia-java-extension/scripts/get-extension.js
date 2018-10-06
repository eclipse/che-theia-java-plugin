/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

const fs = require('fs');
const process = require('child_process');
const path = require('path');

const packagePath = path.join(__dirname, '..');
const version = '0.0.1-SNAPSHOT';
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
