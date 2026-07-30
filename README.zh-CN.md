<p align="center"><img src="docs/assets/logo.png" width="88" alt="CallioText logo"></p>
<h1 align="center">CallioText</h1>
<p align="center">像 LaTeX 一样结构化，像 Word 一样易编辑，像网页一样自由输出。</p>
<p align="center"><a href="README.md">English README</a></p>
<p align="center">
    <a href="https://www.npmjs.com/package/@project-callio/calliotext"><img src="https://img.shields.io/npm/v/%40project-callio%2Fcalliotext" alt="npm 版本"></a>
    <a href="https://projectcallio.github.io/CallioText/zh/"><img src="https://img.shields.io/badge/%E6%96%87%E6%A1%A3-%E5%9C%A8%E7%BA%BF-brightgreen" alt="文档"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="许可"></a>
</p>

CallioText 是一个用来构建结构化文档编辑器的 React 库，基于 Slate 与 MUI。
在它这里，文档是一棵带语义的树：写作者操作语义，样式与编号由渲染规则统一维护。

## 为什么需要它

- 用 Word 类编辑器写严肃文档，样式和编号靠手工维护：在中间插入一个定理，后面的编号就全要挨个改。
- 用 LaTeX 可以把结构交给系统，但输入是代码，文章一大就难读难改；产出面向打印，享受不到网页的交互能力。
- 通用的网页富文本编辑器有格式而无语义：加粗只是加粗，它不知道「这是一个定理」，自动编号和交叉引用无从谈起。

CallioText 的做法是把语义用「概念」显式建模：编辑在图形界面里进行，外观由渲染规则统一决定，编号和引用由库自动维护。

## 特性

- **结构与样式分离**：文档是一棵带语义的树，外观由渲染规则统一决定，改样式不用动文章。
- **编辑与输出双外观**：同一篇文档，编辑时是带按钮和辅助信息的工作界面，输出时是干净的排版成品，两边独立定制。
- **两层概念系统**：一级概念用代码定义参数和渲染逻辑，二级概念可以在运行时创建；写作者不写代码就能派生新的文档组件。
- **自动编号与交叉引用**：定理编号、图表编号、「见定理 3」式的引用都由库维护，增删内容后自动重排。
- **全键盘操作**：内置空间导航和按键提示，写作时双手不离开键盘。
- **逐层可替换**：从开箱即用的默认界面，到每种节点的渲染方式，每一层都可以换成自己的实现。

## 文档

- [入门教程](https://projectcallio.github.io/CallioText/zh/tutorial/01-model.html)：七章，从核心思想到自动编号，从零搭出一个完整的结构化编辑器。
- [API 文档](https://projectcallio.github.io/CallioText/zh/api/overview.html)：按模块整理的公开 API，供开发时查阅。
- [TypeDoc 完整参考](https://projectcallio.github.io/CallioText/reference/)：从源码注释自动生成，覆盖每一个导出项。

文档站入口在 [projectcallio.github.io/CallioText/zh](https://projectcallio.github.io/CallioText/zh/)，
也可以用任意静态服务器打开仓库的 `docs/` 目录本地阅读（如 `npx serve docs`）。

## 安装

```bash
npm install @project-callio/calliotext
```

## 仓库结构与开发

| 目录 | 内容 |
| ---- | ---- |
| `lib/` | 库的源码 |
| `test/unit/` | 单元测试（vitest） |
| `test/demo/` | 使用本库的完整示例应用（不入版本控制） |
| `docs/` | 文档站点（GitHub Pages 从此目录部署） |

```bash
npm test            # 运行单元测试
npm run dev         # 启动示例应用（使用 lib/ 源码）
npm run build       # 构建库（dist/）
npm run docs:api    # 重新生成 TypeDoc 参考（docs/reference/）
```

发现问题或者有想法，欢迎提 issue。

## 许可

GPL-3.0，见 [LICENSE](LICENSE)。
