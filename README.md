# Markdown Simple Rule Extension

Add some simple rules

+ tasklist  
`+ [ ] tasklist` => `<input type="checkbox" disabled> tasklist`  
`+ [x] tasklist` => `<input type="checkbox" disabled checked> tasklist`


+ classname  
`.classname.cn2.cn3[oneLineContent]`  
&nbsp; ↓  
`<span class="classname cn2 cn3">lineContent</span>`  
--\-  
`.classname.cn2.cn3[multiLineContent]`  
&nbsp; ↓  
`<div class="classname cn2 cn3">multiLineContent</div>`

## Usage

+ Just preview markdown file.

+ You can also use keyboard binding: `Ctrl+Alt+C` (`Cmd+Alt+C` on Mac),  
to convert selected classname rule into html (then it can be rendered correctly in other views).
