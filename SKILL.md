---
name: quickapp-ad-strategy
description: 快应用广告系统全链路分析 skill。逆向还原源码后，沿"配置 → 请求编排 → 广告池 → 渲染消费 → 曝光上报"主线，产出带可视化流程图的广告系统说明文档。
---

# QuickApp Ad Strategy Skill

## 使用目标

分析快应用项目的广告系统，产出一份包含可视化流程图的完整广告系统说明文档。

**分析主线**：

```
配置 → 请求编排 → 广告池 → 渲染消费 → 曝光上报
```

| 环节 | 核心问题 |
|------|----------|
| **配置** | 广告该不该请求？请求什么？有哪些开关和参数？ |
| **请求编排** | 什么时候发请求？一次发几个？怎么并行？失败怎么办？ |
| **广告池** | 请求回来的数据存在哪？怎么管理？怎么跟请求和渲染联动？ |
| **渲染消费** | 从池里取数据到用户看到广告的完整路径？ |
| **曝光上报** | 展示后怎么告诉平台？去重怎么做？ |

## 分析理念

1. **配置驱动**：先理解配置结构，再理解配置怎么驱动后续行为
2. **参考模型映射**：prompt 中提供典型广告系统的参考模型（带 mock 数据和时序 walkthrough），Agent 将实际代码映射到模型上
3. **数据流向清晰**：每一步说清"数据从哪来、经过什么处理、去了哪里"
4. **可视化优先**：关键环节（请求编排、广告池、渲染、状态机）用 mermaid 流程图 + 时序图呈现

## 文件结构

```
quickapp-ad-strategy/
├── SKILL.md                          # 本文件
├── scripts/
│   └── reverse_project.js            # 逆向脚本
└── references/
    ├── workflow.md                    # 执行工作流（Phase 0-6）
    ├── prompts.md                     # Master Prompt（含心智模型 + API 速查）
    └── output_spec.md                 # 输出规范
```

## 使用方式

1. 按 `references/workflow.md` 执行 Phase 0 ~ Phase 6
2. 分析阶段使用 `references/prompts.md` 中的 Master Prompt
3. 输出遵循 `references/output_spec.md`

## 命令

```bash
node scripts/reverse_project.js .
```

## 作为独立仓库管理

该目录就是 skill 源仓库；需要在 Codex 中使用时，可将整个仓库链接或复制到 `.codex/skills/quickapp-ad-strategy/`。

## 关键约束

1. **厂商必须确认**：vivo / oppo / huawei / honor，不同厂商 API 有差异
2. **页面手动指定**：分析对象 = 用户指定页面 + app.js
3. **只做流程说明**：禁止建议/评分/评级
4. **配置融入流程**：在讲流程时自然带出配置字段，不单独列配置表
5. **可视化**：请求编排必须包含时序图 + mermaid 流程图
6. **证据规范**：详细章节附 `文件:行号`，总结不带

## 官方文档

- 快应用联盟：https://doc.quickapp.cn/features/service/ad/ad.html
- 华为：https://developer.huawei.com/consumer/cn/doc/quickApp-References/quickapp-api-ad-0000001074754667
- vivo：https://dev.vivo.com.cn/documentCenter/doc/633
- OPPO：https://open.oppomobile.com/documentation/page/info?id=11351
- 荣耀：https://developer.honor.com/cn/doc/guides/101328
