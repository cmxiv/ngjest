import shell from 'shelljs'
import fs from "fs";
import {EOL} from 'os'

function updateTestJs(project) {
    const newTestJs = [
        "import 'jest-preset-angular/setup-jest';",
        "Object.defineProperty(window, 'CSS', {value: null});",
        "Object.defineProperty(document, 'doctype', {value: '<!DOCTYPE html>'});",
        "Object.defineProperty(document.body.style, 'transform', {value: () => {return {enumerable: true,configurable: true};}});",
        "Object.defineProperty(window, 'getComputedStyle', {value: () => {return {display: 'none', appearance: ['-webkit-appearance']};}});",
        EOL
    ].join(EOL)
    fs.writeFileSync(`./${project}/src/test.ts`, newTestJs)
}

function updateAngularJson(project) {
    const file = `./${project}/angular.json`
    const angularJson = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const ngProject = angularJson.defaultProject
    delete angularJson.projects[ngProject].architect.test
    fs.writeFileSync(file, JSON.stringify(angularJson, null, '    '))
}

function updatePackageJson(project) {
    const file = `./${project}/package.json`
    const packageJson = JSON.parse(fs.readFileSync(file, 'utf-8'))
    packageJson.scripts['test'] = 'jest'
    packageJson.scripts['test:watch'] = 'jest --watch'
    packageJson['jest'] = {
        "preset": "jest-preset-angular",
        "setupFilesAfterEnv": [
          "<rootDir>/src/setupJest.ts"
        ]
    }
    fs.writeFileSync(file, JSON.stringify(packageJson, null, '    '))
}

function addJestConfigJs(project) {
    const jestConfigJs = `
        const { pathsToModuleNameMapper } = require('ts-jest/utils');
        const { compilerOptions } = require('./tsconfig');

        module.exports = {
            preset: 'jest-preset-angular',
            roots: ['<rootDir>/src/'],
            testMatch: ['**/+(*.)+(spec).+(ts)'],
            setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
            collectCoverage: true,
            coverageReporters: ['html'],
            coverageDirectory: 'coverage/${project}',
            moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
                prefix: '<rootDir>/'
            })
        };
    `
    fs.writeFileSync(`./${project}/jest.config.js`, jestConfigJs)
}

function addBlankSetupJestTs(project) {
    fs.writeFileSync(`./${project}/src/setupJest.ts`, EOL)
}

function updateTsconfig(project) {
    const tsconfigJson = fs.readFileSync(`./${project}/tsconfig.json`, 'utf-8').split(EOL).splice(1).join(EOL)
    fs.writeFileSync(`./${project}/tsconfig.json`, tsconfigJson)

    const tsconfigSpecText = fs.readFileSync(`./${project}/tsconfig.spec.json`, 'utf-8').split(EOL).splice(1).join(EOL)
    const tsconfigSpecJson = JSON.parse(tsconfigSpecText)
    tsconfigSpecJson.compilerOptions['types'] = ['jest', 'node']
    tsconfigSpecJson.compilerOptions['esModuleInterop'] = true
    tsconfigSpecJson.compilerOptions['emitDecoratorMetadata'] = true
    fs.writeFileSync(`./${project}/tsconfig.spec.json`, JSON.stringify(tsconfigSpecJson, null, '    '))
}

export default function addJest(project) {
    shell.exec(`cd ${project} && npm i jest jest-preset-angular @types/jest --save-dev`)
    updateTestJs(project)
    updateTsconfig(project)
    addJestConfigJs(project)
    updateAngularJson(project)
    updatePackageJson(project)
    addBlankSetupJestTs(project)
}