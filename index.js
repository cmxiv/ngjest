import minimist from 'minimist'
import shell from 'shelljs'
import addJest from './jest.js'
import removeKarma from './karma.js'

const args = minimist(process.argv.slice(2))
const project = args._[0]
delete args._

// Set some defaults
if(!args['style']) {
    args['style'] = 'scss'
}

// Create new Angular project without installing
let ngArgs = Object.keys(args).map(arg => `--${arg} ${args[arg]}`).join(' ')
ngArgs = !!ngArgs.length ? ` ${ngArgs}` : ''
shell.exec(`ng new ${project}${ngArgs}`)

// Remove Karma
removeKarma(project)

// Add Jest
addJest(project)

