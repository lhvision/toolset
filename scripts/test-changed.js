import { platform } from 'node:os'
import { exit } from 'node:process'
import { $, usePowerShell } from 'zx'
import { colorLog } from '@lhvision/helpers'

if (platform() === 'win32') {
  usePowerShell()
}

// 获取已暂存的文件
const stagedFiles = await $`git diff --cached --name-only`
// 获取未提交的文件
const unstagedFiles = await $`git diff --name-only`

// 合并已暂存和未提交的文件
const changedFiles = `${stagedFiles}\n${unstagedFiles}`

// 筛选出 packages 目录下的文件，并提取包名
const changedPackages = [...new Set(
  changedFiles
    .toString()
    .split('\n')
    .filter(file => file.startsWith('packages/'))
    .map(file => file.split('/')[1]),
)]

// 对每个有改动的包运行测试
for (const pkg of changedPackages) {
  try {
    colorLog(`Running tests for ${pkg}...`)
    await $`pnpm --filter ${pkg} run test`
  }
  catch (err) {
    colorLog(`Tests failed for ${pkg}, Error: ${err}`, 'error')
    exit(1)
  }
}
