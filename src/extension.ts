'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {


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
        let tag = (groups[3]||'').split('\n').length==1?'span':'div';
        if (groups==null){
            return;
        }
        let classname=groups[2].split('.').slice(1).join(' ');
        let content=groups[1]+'<' + tag + ' class="' + classname + '">' + groups[3] +'</' + tag + '>'+ groups[4];

        editor.edit(edit => {
            edit.replace(selection, content);
        });
    });

    context.subscriptions.push(disposable);

    return {
        extendMarkdownIt(md: any) {

            const render = md.render;
            md.render = (src: any,env: any) => {
                // console.log(src);
                src=src.replace(/\\\[/g,'tempTokenForChar91')
                src=src.replace(/\n---\n/g,'\n<hr style="clear:both">\n')
                let result = render.call(md,src,env);
                // tasklist
                result=result.replace(/<li([^>]*)class="([^>]*)(>\s*<p data-line="\d+" class="code-line")?>\[(x|\ )\]\ /g,function(str: string){
                    return str.replace('>[ ] ','><input type="checkbox" style="margin-left:-1.22em;margin-right:0.42em;" disabled>')
                              .replace('>[x] ','><input type="checkbox" style="margin-left:-1.22em;margin-right:0.42em;" disabled checked>')
                              .replace('class="','style="list-style-type:none;" class="');
                })

                //classname
                result=result.replace(/((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[/g,function(str: string){
                    return str.slice(0,-1)+'temp_token_for_char_91_2';
                })
                result=result.replace(/\[/g,'temp_token_for_char_91_1');
                result=result.replace(/temp_token_for_char_91_2/g,'[');

                let _span_replace=(str :string)=>{
                    let groups=str.split('[');
                    let classname=groups[0].split('.').slice(1).join(' ');
                    let tag='span';
                    let content='<' + tag + ' class="' + classname + '">' + groups[1].slice(0,-1) +'</' + tag + '>';
                    return content;
                }
                let re_span=/((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[([^\[\]\n]*)\]/g;
                let _result=result.replace(re_span,_span_replace);
                while(_result!=result){
                    result=_result;
                    _result=result.replace(re_span,_span_replace);
                }

                let re_div_g=/\n(<p data-line="\d+" class="code-line">)((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[((?:[^\[\]]|\](?!<\/p>))*)\]<\/p>\n/g;
                let re_div=/\n(<p data-line="\d+" class="code-line">)((?:\.[a-zA-Z_\-][a-zA-Z\-_0-9]*)+)\[((?:[^\[\]]|\](?!<\/p>))*)\]<\/p>\n/;
                //            1                                      2                                    3
                let _div_replace=(str :string)=>{
                    let groups=str.match(re_div);
                    let tag='div';
                    let classname=groups[2].split('.').slice(1).join(' ');
                    let content='\n<' + tag + ' class="' + classname + '">\n'+ groups[1] + groups[3] +'</p>\n</' + tag + '>\n';
                    return content;
                };
                _result=result.replace(re_div_g,_div_replace);
                while(_result!=result){
                    result=_result;
                    _result=result.replace(re_div_g,_div_replace);
                }

                result=result.replace(/temp_token_for_char_91_1/g,'[')
                result=result.replace(/tempTokenForChar91/g,'[')
                // console.log(result)
                return result
            }
            return md;
        }
    }
}

// %USERPROFILE%\.vscode\extensions
// $HOME/.vscode/extensions