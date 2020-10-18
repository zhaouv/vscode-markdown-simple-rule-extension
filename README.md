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

+ You can also press `F1` `>Convert ClassName Rule`  
to convert selected classname rule into html (then it can be rendered correctly in other views).

+ Press `F1` `>Replace Picture By Base64` to convert a img by base64.

+ Press `F1` `>Tick : Insert Formatted Time` to insert the formatted time.

+ Press `F1` `>Weeks : Insert Formatted Time` to insert the formatted time - weeks.