# 测试目录结构

- `demo/` — 使用本库的完整示例项目（不进入版本控制），可切换 dev / build / published 三种库来源运行，详见 `demo/README.md`。
- `unit/` — 单元测试（vitest），从仓库根目录运行：

```bash
npm test          # 运行全部单元测试
npm run test:watch  # watch 模式
```

demo 相关命令（从仓库根目录）：

```bash
npm run demo:dev        # 用 lib/ 源码运行 demo
npm run demo:build      # 用 dist/ 构建产物运行 demo
npm run demo:published  # 用 npm 已发布版本运行 demo
```
