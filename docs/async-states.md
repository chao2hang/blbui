# 异步状态契约

BLBUI 的数据与业务组件使用同一组异步状态语义：`loading`、`empty`、`error` 和 `permission-denied`。状态优先级为 loading → permission denied/error → empty；宿主只需要维护请求状态，不需要复制一套状态样式。

## Custom Elements

```html
<aui-data-grid id="routes" permission-denied retryable></aui-data-grid>
<script>
  routes.addEventListener('aui-retry', (event) => {
    // event.detail: { source, reason: 'error' | 'permission-denied' }
    loadRoutes()
  })
</script>
```

`retry` 和 `permission` 是统一的具名插槽，可以替换默认重试按钮或放置登录/申请权限操作。

```html
<aui-list-view permission-denied>
  <aui-button slot="permission" variant="secondary">申请权限</aui-button>
  <aui-button slot="retry" variant="secondary">重新加载</aui-button>
</aui-list-view>
```

适用组件包括 Core 的 `Table`、`DataGrid`、`ListView`，以及 Business 的 `AdvancedTable`、`AuditLog`。已有的 `loading`、`empty`、`error` 属性保持兼容。

对于请求本身的竞态、取消、分页和错误归一化，可使用 Business 的
[`AdminDataResource`](./data-sources.md)，组件仍只消费它输出的状态和 rows。

## 框架绑定

React 使用 `permissionDenied`、`retryable`、`retryLabel` 和 `onRetry`；Vue 使用同名 props 与 `@retry`；Svelte wrapper 使用同名 props 和 `onRetry`，直接注册的 Custom Element 使用 `aui-retry`。

```tsx
<AdminDataGrid
  permissionDenied={forbidden}
  retryable
  onRetry={({ reason }) => reload(reason)}
/>
```

错误和权限拒绝的默认文案可以通过 `errorLabel`、`permissionDeniedLabel` 覆盖。所有默认状态、按钮、焦点环和降级背景均使用 AUI token，并随 9 套主题的 light/dark 模式切换。
