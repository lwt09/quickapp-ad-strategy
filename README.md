# quickapp-ad-strategy

用于分析快应用广告系统全链路的 Codex skill。

它会在快应用代码逆向之后，沿着下面这条主线组织分析结果：

`配置 -> 请求编排 -> 广告池 -> 渲染消费 -> 曝光上报`

## 适用场景

当你需要回答这些问题时，这个 skill 会比较有用：

- 广告到底在什么条件下发起请求
- 一次请求几个广告位、如何并行、失败后怎么收敛
- 广告返回后如何进入广告池、如何被页面消费
- 展示完成后如何做曝光、点击和去重上报
- 某个快应用项目的广告系统完整链路到底长什么样

## 能力范围

- 逆向并整理快应用项目中的广告相关代码
- 以页面脚本 + `app.js` 为锚点追踪广告相关公共模块
- 输出带 `mermaid` 图的全链路说明文档
- 强制按固定章节结构产出 `ads_flow_analysis.md`

不做的事情：

- 不给治理、优化、重构建议
- 不做评分、评级或主观好坏判断
- 不脱离代码事实做推测

## 仓库结构

```text
quickapp-ad-strategy/
├── SKILL.md
├── references/
│   ├── output_spec.md
│   ├── prompts.md
│   └── workflow.md
└── scripts/
    └── reverse_project.js
```

- `SKILL.md`：skill 入口、触发说明、核心约束
- `references/workflow.md`：Phase 0 ~ Phase 6 执行流程
- `references/prompts.md`：分析用 Prompt 模板
- `references/output_spec.md`：最终文档结构与写作约束
- `scripts/reverse_project.js`：逆向辅助脚本

## 前置要求

- 已安装支持 skills 的 Codex 环境
- 本地可用 `node`
- 需要逆向混淆代码时，已安装 `webcrack`

安装 `webcrack`：

```bash
npm install -g webcrack
```

## 安装 Skill

### 方式一：直接安装到 Codex skills 目录

```bash
git clone https://github.com/lwt09/quickapp-ad-strategy.git "${CODEX_HOME:-$HOME/.codex}/skills/quickapp-ad-strategy"
```

### 方式二：本地开发 + 软链接安装

适合一边维护仓库、一边在 Codex 里直接使用：

```bash
git clone https://github.com/lwt09/quickapp-ad-strategy.git
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$(pwd)/quickapp-ad-strategy" "${CODEX_HOME:-$HOME/.codex}/skills/quickapp-ad-strategy"
```

安装完成后，skill 目录应位于：

```text
$CODEX_HOME/skills/quickapp-ad-strategy
```

如果你的环境没有设置 `CODEX_HOME`，通常默认是：

```text
~/.codex/skills/quickapp-ad-strategy
```

## 快速开始

1. 确认分析厂商：`vivo` / `oppo` / `huawei` / `honor`
2. 指定至少一个目标页面，并固定纳入 `app.js`
3. 在目标快应用项目根目录运行逆向脚本：

```bash
node /path/to/quickapp-ad-strategy/scripts/reverse_project.js .
```

如果你已经把 skill 安装到了 Codex skills 目录，也可以直接这样运行：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/quickapp-ad-strategy/scripts/reverse_project.js" .
```

4. 打开 `SKILL.md`，按 `references/workflow.md` 的阶段顺序执行分析
5. 最终按 `references/output_spec.md` 输出 `ads_flow_analysis.md`

## 推荐使用流程

### Phase 0：输入确认

必须先确认：

- 厂商
- 目标页面
- 分析范围仅限流程说明

### Phase 1：逆向准备

- 运行 `scripts/reverse_project.js`
- 生成 `{project}-reverse`
- 记录逆向摘要：总文件数、JS 文件数、逆向失败数

### Phase 2 ~ 4：结构校验与分析锚定

- 校验 `manifest.json`、路由、`service.ad` 能力
- 固定分析对象为 `app.js` + 用户指定页面脚本
- 按依赖关系追踪广告相关公共模块
- 套用 `references/prompts.md` 中的模板推进阅读

### Phase 5 ~ 6：报告生成与确认

- 生成 `ads_flow_analysis.md`
- 逐项对照 `references/output_spec.md` 自检
- 如有必要，再对请求编排 / 广告池 / 渲染与曝光做增量深挖

## 输出内容

最终交付物为 `ads_flow_analysis.md`，固定包含 12 章：

1. 分析范围与输入确认
2. 广告配置全貌
3. 全局初始化流程
4. 页面级流程
5. 请求编排
6. 广告池
7. 渲染消费
8. 曝光上报
9. 状态机
10. 生命周期 × 广告类型融合视图
11. 证据索引
12. 总结

其中第 5 章“请求编排”必须是最长章节，并且必须包含：

- Mock 数据结构
- Mock Walkthrough
- 代码映射
- 独立的时序图与 `mermaid` 流程图

## 使用约束

- 必须确认厂商，不能混用不同平台 API 假设
- 页面分析对象必须由用户手动指定
- 配置字段需要融入流程说明，不能只给配置表
- 长流程章节先讲机制，再集中给代码证据
- 总结章节禁止出现 `文件:行号`

## 适配厂商

- 快应用联盟
- 华为快应用
- vivo 快应用
- OPPO 快应用
- 荣耀快应用

对应文档入口见 `SKILL.md` 末尾的官方文档列表。

## 开发与维护

如果你要维护这个 skill 仓库，推荐流程如下：

```bash
git clone https://github.com/lwt09/quickapp-ad-strategy.git
cd quickapp-ad-strategy
```

修改以下内容时，建议同步检查：

- `SKILL.md`：skill 触发描述、核心约束是否仍准确
- `references/workflow.md`：工作流步骤是否与当前方法一致
- `references/prompts.md`：Prompt 模板是否还能覆盖实际项目
- `references/output_spec.md`：输出结构是否仍满足分析目标
- `scripts/reverse_project.js`：逆向脚本是否仍兼容当前使用方式

## License

当前仓库暂未附带许可证；如果你准备公开分发或接受外部贡献，建议补充 `LICENSE` 文件。
