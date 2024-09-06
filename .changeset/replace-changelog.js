import { writeFile, readFile, readdir } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 替换规则
const typeMap = {
  feat: '✨',
  fix: '🐛',
  init: '🎉',
  docs: '✏️',
  style: '💄',
  refactor: '♻️',
  perf: '⚡',
  test: '✅',
  revert: '⏪',
  build: '📦',
  update: '🚀',
  ci: '👷',
  chore: '🧹'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义 changeset 文件的目录
const changesetDir = resolve(__dirname, '');

// 获取当前日期并格式化为 YYYY-MM-DD
const currentDate = new Date().toISOString().split('T')[0];

// 读取 changeset 目录下的所有文件
readdir(changesetDir, (err, files) => {
  if (err) {
    console.error('读取 changeset 目录出错:', err);
    return;
  }

  // 查找所有 .md 文件，排除 README.md
  const changesetFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');

  // 依次处理每个 changeset 文件
  changesetFiles.forEach(file => {
    const filePath = join(changesetDir, file);

    // 读取文件内容
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('读取文件出错:', err);
        return;
      }

      // 找到第二个分隔符位置，确保日期放在第二个 "---" 后
      const splitContent = data.split('---');
      if (splitContent.length > 2) {
        // 在第二个 "---" 之后插入日期
        splitContent[2] = `\n(${currentDate})\n` + splitContent[2].trim();
      }

      let updatedContent = splitContent.join('---');

      // 执行替换操作
      for (const [type, section] of Object.entries(typeMap)) {
        // 匹配 feat 和 fix 等提交类型
        const regex = new RegExp(type, 'g');
        updatedContent = updatedContent.replace(regex, section);
      }

      // 写入更新后的内容到文件
      writeFile(filePath, updatedContent, 'utf8', (err) => {
        if (err) {
          console.error('写入文件出错:', err);
        } else {
          console.log(`文件 ${file} 更新成功!`);
        }
      });
    });
  });
});
