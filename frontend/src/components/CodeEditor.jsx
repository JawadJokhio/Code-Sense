import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
    const getLanguageExtension = (lang) => {
        switch (lang.toLowerCase()) {
            case 'javascript':
                return [javascript({ jsx: true })];
            case 'python':
                return [python()];
            case 'java':
                return [java()];
            case 'c++':
            case 'cpp':
                return [cpp()];
            default:
                return [javascript()];
        }
    };

    return (
        <div className="h-full rounded-2xl overflow-hidden border border-white/5 bg-slate-900/50 backdrop-blur-sm">
            <CodeMirror
                value={code}
                height="100%"
                theme={vscodeDark}
                extensions={getLanguageExtension(language)}
                onChange={onChange}
                readOnly={readOnly}
                className="h-full text-sm"
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
