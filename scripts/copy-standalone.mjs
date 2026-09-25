import { cpSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const root = process.cwd()

// Copia .next/static → .next/standalone/.next/static
const staticSrc = join(root, '.next', 'static')
const staticDst = join(root, '.next', 'standalone', '.next', 'static')
if (existsSync(staticSrc)) {
  mkdirSync(staticDst, { recursive: true })
  cpSync(staticSrc, staticDst, { recursive: true })
  console.log('✓ Copiado .next/static → standalone')
}

// Copia public/ → .next/standalone/public/
const publicSrc = join(root, 'public')
const publicDst = join(root, '.next', 'standalone', 'public')
if (existsSync(publicSrc)) {
  mkdirSync(publicDst, { recursive: true })
  cpSync(publicSrc, publicDst, { recursive: true })
  console.log('✓ Copiado public/ → standalone')
}
