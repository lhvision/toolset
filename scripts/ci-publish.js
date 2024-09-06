import { platform } from 'node:os'
import { exit } from 'node:process'
import { $, usePowerShell } from 'zx'

if (platform() === 'win32') {
  usePowerShell()
}

// 获取受影响的包
const affectedPackages = await $`pnpm changeset status`.then((output) => {
  // 移除所有 ANSI 转义序列（如 [39m 等）以及非可见字符
  const cleanOutput = output.stdout
    // eslint-disable-next-line no-control-regex
    .replace(/\x1B\[[\d;]*[mK]/g, '') // 正确的正则表达式移除 ANSI 转义序列
    .replace(/[^\x20-\x7E]/g, '') // 移除非 ASCII 字符（如 🦋）
    .trim() // 去除可能的首尾空白字符

  // 使用正则表达式提取包名
  const regex = /@lhvision\/[^ ]*/g
  const matches = cleanOutput.match(regex)

  return matches || []
})

// 检查是否有受影响的包
if (!affectedPackages.length) {
  console.log('No affected packages. Exiting.')
  exit(0)
}

// 为受影响的包构建
for (const item of affectedPackages) {
  try {
    await $`pnpm --filter ${item}... build`
    console.log(`Build successful for package: ${item}`)
  }
  catch (error) {
    console.error(`Build failed for package: ${item}，Error: ${error}`)
    exit(1)
  }
}

// 创建临时分支并推送版本变更
try {
  await $`pnpm postchangeset`
  await $`pnpm changeset version`
  await $`git checkout -b temp-release-branch`
  await $`git add .`
  await $`git commit -m "ci(all): version packages"`
  await $`git push origin temp-release-branch`
  console.log('Committed and pushed to temp branch successfully')
}
catch (error) {
  console.error(`Failed to changeset version or create or push temp branch，Error: ${error}`)
  exit(1)
}

// 发布受影响的包
try {
  for (const item of affectedPackages) {
    await $`pnpm publish --filter ${item} --access public`
    console.log(`Published package: ${item}`)
  }
}
catch (error) {
  console.error(`Failed to publish packages，Error: ${error}`)
  exit(1)
}
