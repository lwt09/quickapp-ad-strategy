# Workflow

## Phase 0：输入确认（不可跳过）

必须确认，缺任何一项则询问后暂停：

| # | 确认项 | 说明 |
|---|--------|------|
| 1 | 厂商 | `vivo` / `oppo` / `huawei` / `honor` |
| 2 | 目标页面 | 至少 1 个（route 路径或文件路径） |
| 3 | 分析范围 | 仅做流程说明，不做治理/优化建议 |

记录：`{vendor}`, `{manual_targets}`。

## Phase 1：逆向准备

1. 逆向目录：`{project}-reverse`
2. 若不存在，先检查 `webcrack` 是否可用：

```bash
webcrack --version
```

如果命令不存在，提示用户安装：

```bash
npm install -g webcrack
```

安装确认后再执行逆向：

```bash
node scripts/reverse_project.js .
```

3. 输出逆向摘要（总文件/JS文件/失败数）
4. 记录 `{project_reverse_dir}`

## Phase 2：快应用结构校验

逐项校验，任一失败输出缺失项并停止：

1. `manifest.json` 存在且可解析
2. `manifest.router.pages` 非空
3. 入口路由有效
4. `features` 包含 `{"name": "service.ad"}`
5. 手动指定页面可映射到脚本文件

## Phase 3：分析对象锚定

固定纳入：
1. **app.js**
2. **用户指定页面脚本**

自动追踪（从上述文件的 import/require 关系发现）：
3. **广告相关公共模块**（ad-helper、ad-manager、utils 中广告相关函数等）

输出分析对象清单，确认后继续。

## Phase 4：加载 Master Prompt 执行分析

1. 从 `references/prompts.md` 获取 **Template B**
2. 替换 `{vendor}`、`{project_reverse_dir}`、`{manual_targets}`
3. 驱动 Agent 按以下顺序分析：

```
Step 1:  前置校验
Step 2:  提取广告配置全貌（集中配置 或 散落配置重建）
Step 3:  读 app.js → 理解全局初始化
Step 4:  逐一读目标页面 → 理解页面级流程
Step 5:  追踪广告相关模块
Step 6:  分析请求编排（触发 → 守卫 → 并行 → 参数 → 响应 → 失败）+ 输出时序图和 mermaid 图
Step 7:  分析广告池（结构 → 入池 → 出池 → 淘汰 → 联动）+ 输出池结构图和流程图
Step 8:  分析渲染消费（校验 → 创建 → 展示 → 销毁）+ 输出渲染路径图
Step 9:  分析曝光上报（上报 → 去重 → 点击 → 埋点）
Step 10: 还原状态机
Step 11: 构建融合视图
Step 12: 撰写总结
```

关键：分析全程不运行 JS 脚本，完全基于逆向代码阅读完成。

## Phase 5：报告生成与自检

输出 `ads_flow_analysis.md`，按 `output_spec.md` 规范。

自检清单：

- [ ] 第 2 章是否提取了广告配置全貌
- [ ] 第 5 章（请求编排）是否为最长章节
- [ ] 第 5 章是否包含三段式：Mock 数据结构 → Mock Walkthrough → 代码映射
- [ ] Mock 数据结构是否包含 ggSlots 广告位列表（含 ggId/source/slotType）
- [ ] Mock 数据结构是否包含并行与错峰参数速查表（含代码默认值）
- [ ] Mock Walkthrough 是否逐轮逐请求标注了广告位 ID、source、type、发起时刻
- [ ] Mock Walkthrough 是否标注了每轮的 reqLock 计算过程和库存变化
- [ ] 第 5 章是否包含独立的 ```mermaid 代码块流程图（不嵌套在其他代码块中）
- [ ] 第 5 章代码映射是否按模块分组集中列出（不穿插在 walkthrough 中）
- [ ] 第 6 章是否包含池结构图和入池/出池 mermaid 图
- [ ] 长章节的证据是否后置（先讲机制再给证据）
- [ ] 所有 mermaid 图是否作为独立代码块输出
- [ ] 每个环节的数据流向是否清晰（从哪来、去哪里）
- [ ] 总结章节是否不含 `文件:行号`
- [ ] 是否存在任何"建议"类内容（不应存在）

## Phase 6：结果确认与增量深挖

交付后确认：

1. 请求编排是否讲清了并行策略和配置驱动
2. 广告池是否讲清了入池/出池/联动
3. 是否需要对特定模块二次深挖

增量 Prompt（按需使用）：
- **Template C**：请求编排深挖
- **Template D**：广告池深挖
- **Template E**：渲染与曝光深挖
