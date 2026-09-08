# Editor adapter 宿主示例

`AdminEditorAdapter` 是一个不绑定编辑器运行时的窄 contract。宿主负责创建
CodeMirror、TipTap、Monaco 或其他编辑器实例，再把实例的 value、半开区间选区、
focus、订阅和销毁操作映射到 adapter。

```ts
import {
    connectEditorAdapter,
    readEditorState,
    writeEditorState,
    type AdminEditorAdapter,
} from "@chaos_team/blbui-business";
```

## CodeMirror 6

```ts
const adapter: AdminEditorAdapter = {
    getValue: () => view.state.doc.toString(),
    setValue: (value) => view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
    }),
    getSelection: () => {
        const { from, to } = view.state.selection.main;
        return { from, to };
    },
    setSelection: ({ from, to }) => view.dispatch({
        selection: { anchor: from, head: to },
    }),
    focus: () => view.focus(),
    subscribe: (listener) => {
        // Install an EditorView.updateListener extension when creating view.
        // The extension calls listener(readEditorState(adapter)) after changes.
        updateListeners.add(listener);
        return () => updateListeners.delete(listener);
    },
    destroy: () => view.destroy(),
};
```

Use CodeMirror's `EditorView.updateListener` extension to forward document and
selection updates. Do not call `setValue` for an unchanged controlled value;
compare with `readEditorState(adapter).value` first to avoid resetting the
selection on every framework render.

## TipTap

```ts
const adapter: AdminEditorAdapter = {
    getValue: () => editor.getText(),
    setValue: (value) => editor.commands.setContent(value),
    getSelection: () => ({
        from: editor.state.selection.from,
        to: editor.state.selection.to,
    }),
    setSelection: ({ from, to }) => editor.commands.setTextSelection({ from, to }),
    focus: () => editor.commands.focus(),
    subscribe: (listener) => {
        const onUpdate = () => listener(readEditorState(adapter));
        editor.on("update", onUpdate);
        return () => editor.off("update", onUpdate);
    },
    destroy: () => editor.destroy(),
};
```

For a JSON document, replace `getText`/`setContent` with the host's JSON
serialization policy while keeping the same half-open selection contract.

## Monaco

```ts
const model = editor.getModel();
if (!model) throw new Error("Monaco model is required");
const adapter: AdminEditorAdapter = {
    getValue: () => model.getValue(),
    setValue: (value) => model.setValue(value),
    getSelection: () => {
        const range = editor.getSelection();
        if (!range) return null;
        return {
            from: model.getOffsetAt({ lineNumber: range.startLineNumber, column: range.startColumn }),
            to: model.getOffsetAt({ lineNumber: range.endLineNumber, column: range.endColumn }),
        };
    },
    setSelection: ({ from, to }) => {
        const start = model.getPositionAt(from);
        const end = model.getPositionAt(to);
        editor.setSelection({
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column,
        });
    },
    focus: () => editor.focus(),
    subscribe: (listener) => {
        const content = editor.onDidChangeModelContent(() => listener(readEditorState(adapter)));
        const selection = editor.onDidChangeCursorSelection(() => listener(readEditorState(adapter)));
        return () => {
            content.dispose();
            selection.dispose();
        };
    },
    destroy: () => editor.dispose(),
};
```

## Framework lifecycle

The adapter is created by the host and connected once per editor instance.

```ts
const disconnect = connectEditorAdapter(adapter, (state) => {
    // update the host's controlled value/selection store
    console.log(state.value, state.selection);
});

const next = writeEditorState(adapter, {
    value: controlledValue,
    selection: controlledSelection,
});

// React: return disconnect from useEffect.
// Vue: call disconnect from onBeforeUnmount.
// Svelte: return disconnect from onMount.
// Web Components: call disconnect in disconnectedCallback.
```

When a framework render supplies a new value, use `writeEditorState`; when the
editor emits an update, use `connectEditorAdapter`. Always disconnect before
destroying the editor instance so stale callbacks cannot update an unmounted
page.
