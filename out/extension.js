'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.convertClassNameRule', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }
        let text = editor.document.getText(selection);
        let groups = text.match(/^(\s*)(?:\\)?((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[([^]*)\](\s*)$/);
        //                        1           2                                    3       4
        let tag = (groups[3] || '').split('\n').length == 1 ? 'span' : 'div';
        if (groups == null) {
            return;
        }
        let classname = groups[2].split('.').slice(1).join(' ');
        let content = groups[1] + '<' + tag + ' class="' + classname + '">' + groups[3] + '</' + tag + '>' + groups[4];
        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });
    let disposable2 = vscode.commands.registerCommand('extension.replacePictureByBase64', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        if (selection.isEmpty) {
            return;
        }
        let projectPath = vscode.workspace.rootPath;
        let imagePath = projectPath + '/' + editor.document.getText(selection);
        if (!fs.existsSync(imagePath)) {
            return;
        }
        let data = fs.readFileSync(imagePath);
        let content = '\r\n    data:image/' + imagePath.split('.').slice(-1) + ';base64,' + new Buffer(data).toString('base64') + '\r\n';
        editor.edit(edit => {
            edit.replace(selection, content);
            fs.unlinkSync(imagePath);
        });
    });
    let disposable3 = vscode.commands.registerCommand('extension.insertFormattedTime', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let selection = editor.selection;
        let formatstr = vscode.workspace.getConfiguration('tick')['format'] || 'yyyyMMdd_HHmmss';
        let formatedstr = (function (fmt, dateobj) {
            let o = {
                "M+": dateobj.getMonth() + 1,
                "d+": dateobj.getDate(),
                "H+": dateobj.getHours(),
                "m+": dateobj.getMinutes(),
                "s+": dateobj.getSeconds(),
                "q+": Math.floor((dateobj.getMonth() + 3) / 3),
                "S": dateobj.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (dateobj.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (let k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        })(formatstr, new Date());
        let content = '<--' + formatedstr + '-->';
        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
    return {
        extendMarkdownIt(md) {
            let processSource = (src) => {
                // console.log(src);
                src = src.replace(/\\\[/g, 'tempTokenForChar91');
                src = src.replace(/\n---\s*?\n/g, '\n<hr style="clear:both">\n');
                return src;
            };
            let processResult = (result) => {
                // tasklist
                result = result.replace(/<li([^>]*)class="([^>]*)(>\s*<p data-line="\d+" class="code-line")?>\[(x|\ )\]\ /g, function (str) {
                    return str.replace('>[ ] ', '><input type="checkbox" style="margin-left:-1.22em;margin-right:0.42em;" disabled>')
                        .replace('>[x] ', '><input type="checkbox" style="margin-left:-1.22em;margin-right:0.42em;" disabled checked>')
                        .replace('class="', 'style="list-style-type:none;" class="');
                });
                //classname
                result = result.replace(/((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[/g, function (str) {
                    return str.slice(0, -1) + 'temp_token_for_char_91_2';
                });
                result = result.replace(/\[/g, 'temp_token_for_char_91_1');
                result = result.replace(/temp_token_for_char_91_2/g, '[');
                let _span_replace = (str) => {
                    let groups = str.split('[');
                    let classname = groups[0].split('.').slice(1).join(' ');
                    let tag = 'span';
                    let content = '<' + tag + ' class="' + classname + '">' + groups[1].slice(0, -1) + '</' + tag + '>';
                    return content;
                };
                let re_span = /((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[([^\[\]\n]*)\]/g;
                let _result = result.replace(re_span, _span_replace);
                while (_result != result) {
                    result = _result;
                    _result = result.replace(re_span, _span_replace);
                }
                let re_div_g = /\n(<p data-line="\d+" class="code-line">)((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[((?:[^\[\]]|\](?!<\/p>))*)\]<\/p>\n/g;
                let re_div = /\n(<p data-line="\d+" class="code-line">)((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[((?:[^\[\]]|\](?!<\/p>))*)\]<\/p>\n/;
                //              1                                      2                                    3
                let _div_replace = (str) => {
                    let groups = str.match(re_div);
                    let tag = 'div';
                    let classname = groups[2].split('.').slice(1).join(' ');
                    let content = '\n<' + tag + ' class="' + classname + '">\n' + groups[1] + groups[3] + '</p>\n</' + tag + '>\n';
                    return content;
                };
                _result = result.replace(re_div_g, _div_replace);
                while (_result != result) {
                    result = _result;
                    _result = result.replace(re_div_g, _div_replace);
                }
                result = result.replace(/temp_token_for_char_91_1/g, '[');
                result = result.replace(/tempTokenForChar91/g, '[');
                // console.log(result)
                return result;
            };
            if (vscode.version > '1.21.99') {
                const parse = md.parse;
                md.parse = (src, env) => {
                    return parse.call(md, processSource(src), env);
                };
                const rendererRender = md.renderer.render;
                md.renderer.render = (tokens, options, env) => {
                    return processResult(rendererRender.call(md.renderer, tokens, options, env));
                };
            }
            else {
                const render = md.render;
                md.render = (src, env) => {
                    src = processSource(src);
                    let result = render.call(md, src, env);
                    return processResult(result);
                };
            }
            return md;
        }
    };
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map