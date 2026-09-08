import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const packages = ['core', 'react', 'vue', 'svelte', 'business', 'business-react']
const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')

for (const packageName of packages) {
  execFileSync(process.execPath, [npmCli, 'pack', '--dry-run', '--json'], {
    cwd: fileURLToPath(new URL(`../${packageName}/`, import.meta.url)),
    stdio: 'inherit',
  })
}

console.log(`Package pack check passed: ${packages.length} publishable packages inspected`)
