# CallioText 文档站点 / Documentation Site

纯静态站点，无构建步骤。目录结构：

```
docs/
  index.html        入口，直接跳转到英文版文档（en/index.html）
  assets/           共享样式与导航脚本（导航在 assets/docs.js 中集中定义）
  en/               英文文档（默认入口，首页开头有中文版链接）
  zh/               中文文档（教程 + API）
  reference/        TypeDoc 自动生成的完整 API 参考（勿手改）
```

## 本地预览

任意静态服务器均可，例如：

```bash
npx serve docs
# 或
python -m http.server -d docs 8000
```

## 部署到 GitHub Pages

1. 提交 `docs/` 目录到 `main` 分支并推送；
2. GitHub 仓库 → **Settings → Pages**；
3. Source 选 **Deploy from a branch**，Branch 选 `main`，目录选 `/docs`，保存；
4. 稍等片刻，站点会发布在 `https://<用户名>.github.io/<仓库名>/`。

## 更新 API 参考

`docs/reference/` 由 TypeDoc 从 `lib/` 的源码注释生成。修改注释或公开 API 后重新生成：

```bash
npm run docs:api
```

## 增删页面

新增页面后，在 `docs/assets/docs.js` 的 `NAV` 中登记（zh 和 en 各一处），
侧边栏与上一篇/下一篇导航会自动更新。每个页面底部的 script 标签需要正确设置
`data-lang`（zh/en）、`data-root`（到 docs/ 根的相对路径）与 `data-page`（语言目录内的相对路径）。
