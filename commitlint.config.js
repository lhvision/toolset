import { dirname, join, resolve } from 'node:path'
import { readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// 定义提交类型
const typeEnums = ['feat', 'fix', 'init', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'update', 'ci', 'chore', 'revert']

function getScopeEnum() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const packagesDir = resolve(__dirname, 'packages')

  // 动态获取项目中 packages 目录的子包
  const scopes = readdirSync(packagesDir).filter(file =>
    statSync(join(packagesDir, file)).isDirectory(),
  )

  // 返回合法的 scope 列表
  return [...scopes, 'all']
}

const scopeEnums = getScopeEnum()

// 正确提交格式

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提交类型的枚举
    'type-enum': [2, 'always', typeEnums],

    // 提交 scope 的枚举，使用动态获取的 scope 列表
    'scope-enum': [2, 'always', scopeEnums],

    // 不允许 scope 为空，并提供提示信息
    'scope-empty': [2, 'never'],

    // 确保提交信息有一个有效的 subject
    'subject-empty': [2, 'never'],

    // 提交类型不能为空，并确保类型为小写
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],

    // 确保 subject 是句子式大小写
    'subject-case': [2, 'always', ['sentence-case', 'lower-case']],

    // 限制提交信息的最大长度为 72 个字符
    'header-max-length': [2, 'always', 72],
  },
}

// 'scope-enum': () => {
//   const workspaceFile = path.resolve(__dirname, 'pnpm-workspace.yaml');
//   const fileContents = fs.readFileSync(workspaceFile, 'utf8');
//   const workspaceConfig = yaml.load(fileContents);

//   // 假设 packages 都在 `packages/` 目录中
//   const scopes = workspaceConfig.packages.map(pkgPath => {
//     return pkgPath.replace('packages/', '').replace('/*', ''); // 处理路径，提取子包名称
//   });

//   return [2, 'always', scopes];
// },
