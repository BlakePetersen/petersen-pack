// ABOUTME: Checks bundle size and performance budgets
// ABOUTME: Analyzes Next.js build output and reports on metrics

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

interface BundleFile {
  path: string
  size: number
  sizeKB: number
}

interface PerformanceBudgets {
  maxBundleSize: number // in KB
  maxPageSize: number // in KB
  maxFirstLoadJS: number // in KB
}

// Define performance budgets
const BUDGETS: PerformanceBudgets = {
  maxBundleSize: 500, // 500KB max for any single bundle
  maxPageSize: 300, // 300KB max for page-specific JS
  maxFirstLoadJS: 200, // 200KB max for first load JS
}

async function checkPerformance() {
  console.log('🔍 Checking Performance Budgets...\n')
  console.log('='.repeat(60))

  // Check if build exists
  const buildDir = path.join(process.cwd(), '.next')
  if (!fs.existsSync(buildDir)) {
    console.log('\n⚠️  No build found. Running production build...\n')
    try {
      execSync('pnpm build', { stdio: 'inherit' })
    } catch (error) {
      console.error('\n❌ Build failed. Cannot check performance.')
      process.exit(1)
    }
  }

  // Parse Next.js build output for bundle sizes
  const buildManifestPath = path.join(buildDir, 'build-manifest.json')
  if (!fs.existsSync(buildManifestPath)) {
    console.error('\n❌ Build manifest not found')
    process.exit(1)
  }

  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf-8'))

  console.log('\n📦 Bundle Analysis\n')

  let totalBundleSize = 0
  const violations: string[] = []
  const warnings: string[] = []

  // Analyze static bundles
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    const analyzeDir = (dir: string, prefix = ''): BundleFile[] => {
      const files: BundleFile[] = []

      fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          files.push(...analyzeDir(fullPath, `${prefix}${file}/`))
        } else if (file.endsWith('.js')) {
          const size = stat.size
          const sizeKB = Math.round(size / 1024)
          totalBundleSize += size

          files.push({
            path: `${prefix}${file}`,
            size,
            sizeKB,
          })

          // Check against budgets
          if (sizeKB > BUDGETS.maxBundleSize) {
            violations.push(
              `❌ ${prefix}${file}: ${sizeKB}KB exceeds max bundle size (${BUDGETS.maxBundleSize}KB)`
            )
          } else if (sizeKB > BUDGETS.maxBundleSize * 0.8) {
            warnings.push(
              `⚠️  ${prefix}${file}: ${sizeKB}KB approaching max bundle size (${BUDGETS.maxBundleSize}KB)`
            )
          }
        }
      })

      return files
    }

    const bundles = analyzeDir(staticDir)

    // Show top 10 largest bundles
    const sortedBundles = bundles.sort((a, b) => b.size - a.size)
    console.log('Top 10 Largest Bundles:')
    sortedBundles.slice(0, 10).forEach((bundle, i) => {
      const status =
        bundle.sizeKB > BUDGETS.maxBundleSize
          ? '❌'
          : bundle.sizeKB > BUDGETS.maxBundleSize * 0.8
            ? '⚠️ '
            : '✓'
      console.log(`  ${status} ${i + 1}. ${bundle.path}: ${bundle.sizeKB}KB`)
    })
  }

  const totalBundleSizeKB = Math.round(totalBundleSize / 1024)
  const totalBundleSizeMB = (totalBundleSize / 1024 / 1024).toFixed(2)

  console.log(
    `\n📊 Total Bundle Size: ${totalBundleSizeKB}KB (${totalBundleSizeMB}MB)`
  )

  // Check pages
  console.log('\n📄 Page Analysis\n')
  const pagesManifestPath = path.join(buildDir, 'server', 'pages-manifest.json')
  if (fs.existsSync(pagesManifestPath)) {
    const pagesManifest = JSON.parse(
      fs.readFileSync(pagesManifestPath, 'utf-8')
    )
    const pageCount = Object.keys(pagesManifest).length
    console.log(`Total Pages: ${pageCount}`)
  }

  // Report violations and warnings
  console.log('\n' + '='.repeat(60))
  console.log('🎯 Performance Budget Results')
  console.log('='.repeat(60))

  console.log(`\n📏 Budget Limits:`)
  console.log(`  Max Bundle Size: ${BUDGETS.maxBundleSize}KB`)
  console.log(`  Max Page Size: ${BUDGETS.maxPageSize}KB`)
  console.log(`  Max First Load JS: ${BUDGETS.maxFirstLoadJS}KB`)

  if (violations.length > 0) {
    console.log(`\n❌ Budget Violations (${violations.length}):`)
    violations.forEach((v) => console.log(`  ${v}`))
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`)
    warnings.forEach((w) => console.log(`  ${w}`))
  }

  if (violations.length === 0 && warnings.length === 0) {
    console.log('\n✅ All bundles are within performance budgets!')
  }

  console.log('\n💡 Recommendations:')
  console.log('  - Use dynamic imports for large components')
  console.log('  - Enable code splitting for routes')
  console.log('  - Review and remove unused dependencies')
  console.log('  - Consider lazy loading images and heavy components')
  console.log('  - Run `pnpm build` to see detailed Next.js size report')

  console.log('')

  // Exit with error if there are violations
  if (violations.length > 0) {
    process.exit(1)
  }
}

checkPerformance().catch((error) => {
  console.error('\n❌ Error checking performance:', error)
  process.exit(1)
})
