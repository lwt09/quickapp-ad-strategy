# quickapp-ad-strategy

用于分析快应用广告系统全链路的 Codex skill。

分析主线：`配置 -> 请求编排 -> 广告池 -> 渲染消费 -> 曝光上报`

## 目录说明

- `SKILL.md`：skill 入口与使用约束
- `references/workflow.md`：分阶段工作流
- `references/prompts.md`：分析提示词模板
- `references/output_spec.md`：最终报告规范
- `scripts/reverse_project.js`：快应用逆向辅助脚本

## 使用方式

1. 克隆或复制本仓库到本地工作目录。
2. 如需让 Codex 自动发现，可将仓库软链接或复制到 `.codex/skills/quickapp-ad-strategy/`。
3. 打开 `SKILL.md`，按 `references/workflow.md` 执行分析流程。
4. 在目标快应用项目根目录运行：

```bash
node scripts/reverse_project.js .
```

5. 按 `references/output_spec.md` 产出 `ads_flow_analysis.md`。

