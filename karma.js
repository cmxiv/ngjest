import shell from "shelljs";
import fs from 'fs'

export default function removeKarma(project) {
    
    // Remove Karma dependencies
    const packageJson = JSON.parse(fs.readFileSync(`./${project}/package.json`, 'utf-8'))
    const deps = [...Object.keys(packageJson.devDependencies), ...Object.keys(packageJson.dependencies)]
    const removableDeps = deps.filter(dep => dep.includes('karma') || dep.includes('jasmine'));
    shell.exec(`cd ${project} && npm uninstall ${removableDeps.join(' ')}`)
    
    // Remove Karma config file
    shell.rm(`./${project}/karma.conf.js`)

}