# MasterGo 分析器

分析 MasterGo 设计原型，提取设计令牌和布局信息。

## 子命令

- `/mastergo` - 整页分析
- `/mastergo-element` - 元素分析
- `/mastergo-auth` - 认证分析
- `/mastergo-cookie` - Cookie 提取

## 使用示例

```bash
/mastergo https://mastergo.com/xxx/yyy
/mastergo-element https://mastergo.com/xxx/yyy ".submit-btn"
/mastergo-auth --profile ~/.mastergo/profile https://mastergo.com/xxx
```
