import{a as Bn,g as Kt,r as S,b as x,j as ae}from"./iframe-CGUFCU7f.js";import{c as Z,b as y,d as H,e as ye,f as he,_ as de}from"./apply-display-name-BLkmUqWr.js";import{c as qn,A as Nn,R as Fn,d as En}from"./chunk-EPOLDU6W-DP44Pv5b.js";import{I as Mn,i as Bt}from"./htmlEntityDecoder-wSt2bSSJ.js";import"./index-C_HPrsPu.js";function zn(t,e){for(var r=0;r<e.length;r++){const i=e[r];if(typeof i!="string"&&!Array.isArray(i)){for(const a in i)if(a!=="default"&&!(a in t)){const s=Object.getOwnPropertyDescriptor(i,a);s&&Object.defineProperty(t,a,s.get?s:{enumerable:!0,get:()=>i[a]})}}}return Object.freeze(Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}))}var mr="Invariant Violation",Li=Object.setPrototypeOf,xn=Li===void 0?function(t,e){return t.__proto__=e,t}:Li,es=(function(t){Z(e,t);function e(r){r===void 0&&(r=mr);var i=t.call(this,typeof r=="number"?mr+": "+r+" (see https://github.com/apollographql/invariant-packages)":r)||this;return i.framesToPop=1,i.name=mr,xn(i,e.prototype),i}return e})(Error);function ke(t,e){if(!t)throw new es(e)}var ts=["debug","log","warn","error","silent"],Ln=ts.indexOf("log");function Pt(t){return function(){if(ts.indexOf(t)>=Ln){var e=console[t]||console.log;return e.apply(console,arguments)}}}(function(t){t.debug=Pt("debug"),t.log=Pt("log"),t.warn=Pt("warn"),t.error=Pt("error")})(ke||(ke={}));var mi="3.13.9";function ee(t){try{return t()}catch{}}const Er=ee(function(){return globalThis})||ee(function(){return window})||ee(function(){return self})||ee(function(){return global})||ee(function(){return ee.constructor("return this")()});var Gi=new Map;function ht(t){var e=Gi.get(t)||1;return Gi.set(t,e+1),"".concat(t,":").concat(e,":").concat(Math.random().toString(36).slice(2))}function rs(t,e){e===void 0&&(e=0);var r=ht("stringifyForDisplay");return JSON.stringify(t,function(i,a){return a===void 0?r:a},e).split(JSON.stringify(r)).join("<undefined>")}function wt(t){return function(e){for(var r=[],i=1;i<arguments.length;i++)r[i-1]=arguments[i];if(typeof e=="number"){var a=e;e=_i(a),e||(e=fi(a,r),r=[])}t.apply(void 0,[e].concat(r))}}var w=Object.assign(function(e,r){for(var i=[],a=2;a<arguments.length;a++)i[a-2]=arguments[a];e||ke(e,_i(r,i)||fi(r,i))},{debug:wt(ke.debug),log:wt(ke.log),warn:wt(ke.warn),error:wt(ke.error)});function Y(t){for(var e=[],r=1;r<arguments.length;r++)e[r-1]=arguments[r];return new es(_i(t,e)||fi(t,e))}var ji=Symbol.for("ApolloErrorMessageHandler_"+mi);function is(t){if(typeof t=="string")return t;try{return rs(t,2).slice(0,1e3)}catch{return"<non-serializable>"}}function _i(t,e){if(e===void 0&&(e=[]),!!t)return Er[ji]&&Er[ji](t,e.map(is))}function fi(t,e){if(e===void 0&&(e=[]),!!t)return"An error occurred! For more details, see the full error text at https://go.apollo.dev/c/err#".concat(encodeURIComponent(JSON.stringify({version:mi,message:t,args:e.map(is)})))}function qt(t,e){if(!!!t)throw new Error(e)}function Gn(t){return typeof t=="object"&&t!==null}function jn(t,e){if(!!!t)throw new Error("Unexpected invariant triggered.")}const Vn=/\r\n|[\n\r]/g;function Mr(t,e){let r=0,i=1;for(const a of t.body.matchAll(Vn)){if(typeof a.index=="number"||jn(!1),a.index>=e)break;r=a.index+a[0].length,i+=1}return{line:i,column:e+1-r}}function Wn(t){return as(t.source,Mr(t.source,t.start))}function as(t,e){const r=t.locationOffset.column-1,i="".padStart(r)+t.body,a=e.line-1,s=t.locationOffset.line-1,n=e.line+s,l=e.line===1?r:0,d=e.column+l,u=`${t.name}:${n}:${d}
`,c=i.split(/\r\n|[\n\r]/g),m=c[a];if(m.length>120){const p=Math.floor(d/80),_=d%80,f=[];for(let g=0;g<m.length;g+=80)f.push(m.slice(g,g+80));return u+Vi([[`${n} |`,f[0]],...f.slice(1,p+1).map(g=>["|",g]),["|","^".padStart(_)],["|",f[p+1]]])}return u+Vi([[`${n-1} |`,c[a-1]],[`${n} |`,m],["|","^".padStart(d)],[`${n+1} |`,c[a+1]]])}function Vi(t){const e=t.filter(([i,a])=>a!==void 0),r=Math.max(...e.map(([i])=>i.length));return e.map(([i,a])=>i.padStart(r)+(a?" "+a:"")).join(`
`)}function Qn(t){const e=t[0];return e==null||"kind"in e||"length"in e?{nodes:e,source:t[1],positions:t[2],path:t[3],originalError:t[4],extensions:t[5]}:e}class yi extends Error{constructor(e,...r){var i,a,s;const{nodes:n,source:l,positions:d,path:u,originalError:c,extensions:m}=Qn(r);super(e),this.name="GraphQLError",this.path=u??void 0,this.originalError=c??void 0,this.nodes=Wi(Array.isArray(n)?n:n?[n]:void 0);const p=Wi((i=this.nodes)===null||i===void 0?void 0:i.map(f=>f.loc).filter(f=>f!=null));this.source=l??(p==null||(a=p[0])===null||a===void 0?void 0:a.source),this.positions=d??p?.map(f=>f.start),this.locations=d&&l?d.map(f=>Mr(l,f)):p?.map(f=>Mr(f.source,f.start));const _=Gn(c?.extensions)?c?.extensions:void 0;this.extensions=(s=m??_)!==null&&s!==void 0?s:Object.create(null),Object.defineProperties(this,{message:{writable:!0,enumerable:!0},name:{enumerable:!1},nodes:{enumerable:!1},source:{enumerable:!1},positions:{enumerable:!1},originalError:{enumerable:!1}}),c!=null&&c.stack?Object.defineProperty(this,"stack",{value:c.stack,writable:!0,configurable:!0}):Error.captureStackTrace?Error.captureStackTrace(this,yi):Object.defineProperty(this,"stack",{value:Error().stack,writable:!0,configurable:!0})}get[Symbol.toStringTag](){return"GraphQLError"}toString(){let e=this.message;if(this.nodes)for(const r of this.nodes)r.loc&&(e+=`

`+Wn(r.loc));else if(this.source&&this.locations)for(const r of this.locations)e+=`

`+as(this.source,r);return e}toJSON(){const e={message:this.message};return this.locations!=null&&(e.locations=this.locations),this.path!=null&&(e.path=this.path),this.extensions!=null&&Object.keys(this.extensions).length>0&&(e.extensions=this.extensions),e}}function Wi(t){return t===void 0||t.length===0?void 0:t}function G(t,e,r){return new yi(`Syntax Error: ${r}`,{source:t,positions:[e]})}class Hn{constructor(e,r,i){this.start=e.start,this.end=r.end,this.startToken=e,this.endToken=r,this.source=i}get[Symbol.toStringTag](){return"Location"}toJSON(){return{start:this.start,end:this.end}}}class ss{constructor(e,r,i,a,s,n){this.kind=e,this.start=r,this.end=i,this.line=a,this.column=s,this.value=n,this.prev=null,this.next=null}get[Symbol.toStringTag](){return"Token"}toJSON(){return{kind:this.kind,value:this.value,line:this.line,column:this.column}}}const ns={Name:[],Document:["definitions"],OperationDefinition:["description","name","variableDefinitions","directives","selectionSet"],VariableDefinition:["description","variable","type","defaultValue","directives"],Variable:["name"],SelectionSet:["selections"],Field:["alias","name","arguments","directives","selectionSet"],Argument:["name","value"],FragmentSpread:["name","directives"],InlineFragment:["typeCondition","directives","selectionSet"],FragmentDefinition:["description","name","variableDefinitions","typeCondition","directives","selectionSet"],IntValue:[],FloatValue:[],StringValue:[],BooleanValue:[],NullValue:[],EnumValue:[],ListValue:["values"],ObjectValue:["fields"],ObjectField:["name","value"],Directive:["name","arguments"],NamedType:["name"],ListType:["type"],NonNullType:["type"],SchemaDefinition:["description","directives","operationTypes"],OperationTypeDefinition:["type"],ScalarTypeDefinition:["description","name","directives"],ObjectTypeDefinition:["description","name","interfaces","directives","fields"],FieldDefinition:["description","name","arguments","type","directives"],InputValueDefinition:["description","name","type","defaultValue","directives"],InterfaceTypeDefinition:["description","name","interfaces","directives","fields"],UnionTypeDefinition:["description","name","directives","types"],EnumTypeDefinition:["description","name","directives","values"],EnumValueDefinition:["description","name","directives"],InputObjectTypeDefinition:["description","name","directives","fields"],DirectiveDefinition:["description","name","arguments","locations"],SchemaExtension:["directives","operationTypes"],ScalarTypeExtension:["name","directives"],ObjectTypeExtension:["name","interfaces","directives","fields"],InterfaceTypeExtension:["name","interfaces","directives","fields"],UnionTypeExtension:["name","directives","types"],EnumTypeExtension:["name","directives","values"],InputObjectTypeExtension:["name","directives","fields"],TypeCoordinate:["name"],MemberCoordinate:["name","memberName"],ArgumentCoordinate:["name","fieldName","argumentName"],DirectiveCoordinate:["name"],DirectiveArgumentCoordinate:["name","argumentName"]},Yn=new Set(Object.keys(ns));function Qi(t){const e=t?.kind;return typeof e=="string"&&Yn.has(e)}var ze;(function(t){t.QUERY="query",t.MUTATION="mutation",t.SUBSCRIPTION="subscription"})(ze||(ze={}));var zr;(function(t){t.QUERY="QUERY",t.MUTATION="MUTATION",t.SUBSCRIPTION="SUBSCRIPTION",t.FIELD="FIELD",t.FRAGMENT_DEFINITION="FRAGMENT_DEFINITION",t.FRAGMENT_SPREAD="FRAGMENT_SPREAD",t.INLINE_FRAGMENT="INLINE_FRAGMENT",t.VARIABLE_DEFINITION="VARIABLE_DEFINITION",t.SCHEMA="SCHEMA",t.SCALAR="SCALAR",t.OBJECT="OBJECT",t.FIELD_DEFINITION="FIELD_DEFINITION",t.ARGUMENT_DEFINITION="ARGUMENT_DEFINITION",t.INTERFACE="INTERFACE",t.UNION="UNION",t.ENUM="ENUM",t.ENUM_VALUE="ENUM_VALUE",t.INPUT_OBJECT="INPUT_OBJECT",t.INPUT_FIELD_DEFINITION="INPUT_FIELD_DEFINITION"})(zr||(zr={}));var $;(function(t){t.NAME="Name",t.DOCUMENT="Document",t.OPERATION_DEFINITION="OperationDefinition",t.VARIABLE_DEFINITION="VariableDefinition",t.SELECTION_SET="SelectionSet",t.FIELD="Field",t.ARGUMENT="Argument",t.FRAGMENT_SPREAD="FragmentSpread",t.INLINE_FRAGMENT="InlineFragment",t.FRAGMENT_DEFINITION="FragmentDefinition",t.VARIABLE="Variable",t.INT="IntValue",t.FLOAT="FloatValue",t.STRING="StringValue",t.BOOLEAN="BooleanValue",t.NULL="NullValue",t.ENUM="EnumValue",t.LIST="ListValue",t.OBJECT="ObjectValue",t.OBJECT_FIELD="ObjectField",t.DIRECTIVE="Directive",t.NAMED_TYPE="NamedType",t.LIST_TYPE="ListType",t.NON_NULL_TYPE="NonNullType",t.SCHEMA_DEFINITION="SchemaDefinition",t.OPERATION_TYPE_DEFINITION="OperationTypeDefinition",t.SCALAR_TYPE_DEFINITION="ScalarTypeDefinition",t.OBJECT_TYPE_DEFINITION="ObjectTypeDefinition",t.FIELD_DEFINITION="FieldDefinition",t.INPUT_VALUE_DEFINITION="InputValueDefinition",t.INTERFACE_TYPE_DEFINITION="InterfaceTypeDefinition",t.UNION_TYPE_DEFINITION="UnionTypeDefinition",t.ENUM_TYPE_DEFINITION="EnumTypeDefinition",t.ENUM_VALUE_DEFINITION="EnumValueDefinition",t.INPUT_OBJECT_TYPE_DEFINITION="InputObjectTypeDefinition",t.DIRECTIVE_DEFINITION="DirectiveDefinition",t.SCHEMA_EXTENSION="SchemaExtension",t.SCALAR_TYPE_EXTENSION="ScalarTypeExtension",t.OBJECT_TYPE_EXTENSION="ObjectTypeExtension",t.INTERFACE_TYPE_EXTENSION="InterfaceTypeExtension",t.UNION_TYPE_EXTENSION="UnionTypeExtension",t.ENUM_TYPE_EXTENSION="EnumTypeExtension",t.INPUT_OBJECT_TYPE_EXTENSION="InputObjectTypeExtension",t.TYPE_COORDINATE="TypeCoordinate",t.MEMBER_COORDINATE="MemberCoordinate",t.ARGUMENT_COORDINATE="ArgumentCoordinate",t.DIRECTIVE_COORDINATE="DirectiveCoordinate",t.DIRECTIVE_ARGUMENT_COORDINATE="DirectiveArgumentCoordinate"})($||($={}));function xr(t){return t===9||t===32}function gt(t){return t>=48&&t<=57}function os(t){return t>=97&&t<=122||t>=65&&t<=90}function ls(t){return os(t)||t===95}function Kn(t){return os(t)||gt(t)||t===95}function Jn(t){var e;let r=Number.MAX_SAFE_INTEGER,i=null,a=-1;for(let n=0;n<t.length;++n){var s;const l=t[n],d=Zn(l);d!==l.length&&(i=(s=i)!==null&&s!==void 0?s:n,a=n,n!==0&&d<r&&(r=d))}return t.map((n,l)=>l===0?n:n.slice(r)).slice((e=i)!==null&&e!==void 0?e:0,a+1)}function Zn(t){let e=0;for(;e<t.length&&xr(t.charCodeAt(e));)++e;return e}function Xn(t,e){const r=t.replace(/"""/g,'\\"""'),i=r.split(/\r\n|[\n\r]/g),a=i.length===1,s=i.length>1&&i.slice(1).every(_=>_.length===0||xr(_.charCodeAt(0))),n=r.endsWith('\\"""'),l=t.endsWith('"')&&!n,d=t.endsWith("\\"),u=l||d,c=!a||t.length>70||u||s||n;let m="";const p=a&&xr(t.charCodeAt(0));return(c&&!p||s)&&(m+=`
`),m+=r,(c||u)&&(m+=`
`),'"""'+m+'"""'}var T;(function(t){t.SOF="<SOF>",t.EOF="<EOF>",t.BANG="!",t.DOLLAR="$",t.AMP="&",t.PAREN_L="(",t.PAREN_R=")",t.DOT=".",t.SPREAD="...",t.COLON=":",t.EQUALS="=",t.AT="@",t.BRACKET_L="[",t.BRACKET_R="]",t.BRACE_L="{",t.PIPE="|",t.BRACE_R="}",t.NAME="Name",t.INT="Int",t.FLOAT="Float",t.STRING="String",t.BLOCK_STRING="BlockString",t.COMMENT="Comment"})(T||(T={}));class eo{constructor(e){const r=new ss(T.SOF,0,0,0,0);this.source=e,this.lastToken=r,this.token=r,this.line=1,this.lineStart=0}get[Symbol.toStringTag](){return"Lexer"}advance(){return this.lastToken=this.token,this.token=this.lookahead()}lookahead(){let e=this.token;if(e.kind!==T.EOF)do if(e.next)e=e.next;else{const r=ro(this,e.end);e.next=r,r.prev=e,e=r}while(e.kind===T.COMMENT);return e}}function to(t){return t===T.BANG||t===T.DOLLAR||t===T.AMP||t===T.PAREN_L||t===T.PAREN_R||t===T.DOT||t===T.SPREAD||t===T.COLON||t===T.EQUALS||t===T.AT||t===T.BRACKET_L||t===T.BRACKET_R||t===T.BRACE_L||t===T.PIPE||t===T.BRACE_R}function et(t){return t>=0&&t<=55295||t>=57344&&t<=1114111}function Jt(t,e){return ds(t.charCodeAt(e))&&us(t.charCodeAt(e+1))}function ds(t){return t>=55296&&t<=56319}function us(t){return t>=56320&&t<=57343}function Ue(t,e){const r=t.source.body.codePointAt(e);if(r===void 0)return T.EOF;if(r>=32&&r<=126){const i=String.fromCodePoint(r);return i==='"'?`'"'`:`"${i}"`}return"U+"+r.toString(16).toUpperCase().padStart(4,"0")}function L(t,e,r,i,a){const s=t.line,n=1+r-t.lineStart;return new ss(e,r,i,s,n,a)}function ro(t,e){const r=t.source.body,i=r.length;let a=e;for(;a<i;){const s=r.charCodeAt(a);switch(s){case 65279:case 9:case 32:case 44:++a;continue;case 10:++a,++t.line,t.lineStart=a;continue;case 13:r.charCodeAt(a+1)===10?a+=2:++a,++t.line,t.lineStart=a;continue;case 35:return io(t,a);case 33:return L(t,T.BANG,a,a+1);case 36:return L(t,T.DOLLAR,a,a+1);case 38:return L(t,T.AMP,a,a+1);case 40:return L(t,T.PAREN_L,a,a+1);case 41:return L(t,T.PAREN_R,a,a+1);case 46:if(r.charCodeAt(a+1)===46&&r.charCodeAt(a+2)===46)return L(t,T.SPREAD,a,a+3);break;case 58:return L(t,T.COLON,a,a+1);case 61:return L(t,T.EQUALS,a,a+1);case 64:return L(t,T.AT,a,a+1);case 91:return L(t,T.BRACKET_L,a,a+1);case 93:return L(t,T.BRACKET_R,a,a+1);case 123:return L(t,T.BRACE_L,a,a+1);case 124:return L(t,T.PIPE,a,a+1);case 125:return L(t,T.BRACE_R,a,a+1);case 34:return r.charCodeAt(a+1)===34&&r.charCodeAt(a+2)===34?uo(t,a):so(t,a)}if(gt(s)||s===45)return ao(t,a,s);if(ls(s))return co(t,a);throw G(t.source,a,s===39?`Unexpected single quote character ('), did you mean to use a double quote (")?`:et(s)||Jt(r,a)?`Unexpected character: ${Ue(t,a)}.`:`Invalid character: ${Ue(t,a)}.`)}return L(t,T.EOF,i,i)}function io(t,e){const r=t.source.body,i=r.length;let a=e+1;for(;a<i;){const s=r.charCodeAt(a);if(s===10||s===13)break;if(et(s))++a;else if(Jt(r,a))a+=2;else break}return L(t,T.COMMENT,e,a,r.slice(e+1,a))}function ao(t,e,r){const i=t.source.body;let a=e,s=r,n=!1;if(s===45&&(s=i.charCodeAt(++a)),s===48){if(s=i.charCodeAt(++a),gt(s))throw G(t.source,a,`Invalid number, unexpected digit after 0: ${Ue(t,a)}.`)}else a=_r(t,a,s),s=i.charCodeAt(a);if(s===46&&(n=!0,s=i.charCodeAt(++a),a=_r(t,a,s),s=i.charCodeAt(a)),(s===69||s===101)&&(n=!0,s=i.charCodeAt(++a),(s===43||s===45)&&(s=i.charCodeAt(++a)),a=_r(t,a,s),s=i.charCodeAt(a)),s===46||ls(s))throw G(t.source,a,`Invalid number, expected digit but got: ${Ue(t,a)}.`);return L(t,n?T.FLOAT:T.INT,e,a,i.slice(e,a))}function _r(t,e,r){if(!gt(r))throw G(t.source,e,`Invalid number, expected digit but got: ${Ue(t,e)}.`);const i=t.source.body;let a=e+1;for(;gt(i.charCodeAt(a));)++a;return a}function so(t,e){const r=t.source.body,i=r.length;let a=e+1,s=a,n="";for(;a<i;){const l=r.charCodeAt(a);if(l===34)return n+=r.slice(s,a),L(t,T.STRING,e,a+1,n);if(l===92){n+=r.slice(s,a);const d=r.charCodeAt(a+1)===117?r.charCodeAt(a+2)===123?no(t,a):oo(t,a):lo(t,a);n+=d.value,a+=d.size,s=a;continue}if(l===10||l===13)break;if(et(l))++a;else if(Jt(r,a))a+=2;else throw G(t.source,a,`Invalid character within String: ${Ue(t,a)}.`)}throw G(t.source,a,"Unterminated string.")}function no(t,e){const r=t.source.body;let i=0,a=3;for(;a<12;){const s=r.charCodeAt(e+a++);if(s===125){if(a<5||!et(i))break;return{value:String.fromCodePoint(i),size:a}}if(i=i<<4|ut(s),i<0)break}throw G(t.source,e,`Invalid Unicode escape sequence: "${r.slice(e,e+a)}".`)}function oo(t,e){const r=t.source.body,i=Hi(r,e+2);if(et(i))return{value:String.fromCodePoint(i),size:6};if(ds(i)&&r.charCodeAt(e+6)===92&&r.charCodeAt(e+7)===117){const a=Hi(r,e+8);if(us(a))return{value:String.fromCodePoint(i,a),size:12}}throw G(t.source,e,`Invalid Unicode escape sequence: "${r.slice(e,e+6)}".`)}function Hi(t,e){return ut(t.charCodeAt(e))<<12|ut(t.charCodeAt(e+1))<<8|ut(t.charCodeAt(e+2))<<4|ut(t.charCodeAt(e+3))}function ut(t){return t>=48&&t<=57?t-48:t>=65&&t<=70?t-55:t>=97&&t<=102?t-87:-1}function lo(t,e){const r=t.source.body;switch(r.charCodeAt(e+1)){case 34:return{value:'"',size:2};case 92:return{value:"\\",size:2};case 47:return{value:"/",size:2};case 98:return{value:"\b",size:2};case 102:return{value:"\f",size:2};case 110:return{value:`
`,size:2};case 114:return{value:"\r",size:2};case 116:return{value:"	",size:2}}throw G(t.source,e,`Invalid character escape sequence: "${r.slice(e,e+2)}".`)}function uo(t,e){const r=t.source.body,i=r.length;let a=t.lineStart,s=e+3,n=s,l="";const d=[];for(;s<i;){const u=r.charCodeAt(s);if(u===34&&r.charCodeAt(s+1)===34&&r.charCodeAt(s+2)===34){l+=r.slice(n,s),d.push(l);const c=L(t,T.BLOCK_STRING,e,s+3,Jn(d).join(`
`));return t.line+=d.length-1,t.lineStart=a,c}if(u===92&&r.charCodeAt(s+1)===34&&r.charCodeAt(s+2)===34&&r.charCodeAt(s+3)===34){l+=r.slice(n,s),n=s+1,s+=4;continue}if(u===10||u===13){l+=r.slice(n,s),d.push(l),u===13&&r.charCodeAt(s+1)===10?s+=2:++s,l="",n=s,a=s;continue}if(et(u))++s;else if(Jt(r,s))s+=2;else throw G(t.source,s,`Invalid character within String: ${Ue(t,s)}.`)}throw G(t.source,s,"Unterminated string.")}function co(t,e){const r=t.source.body,i=r.length;let a=e+1;for(;a<i;){const s=r.charCodeAt(a);if(Kn(s))++a;else break}return L(t,T.NAME,e,a,r.slice(e,a))}const po=10,cs=2;function hi(t){return Zt(t,[])}function Zt(t,e){switch(typeof t){case"string":return JSON.stringify(t);case"function":return t.name?`[function ${t.name}]`:"[function]";case"object":return mo(t,e);default:return String(t)}}function mo(t,e){if(t===null)return"null";if(e.includes(t))return"[Circular]";const r=[...e,t];if(_o(t)){const i=t.toJSON();if(i!==t)return typeof i=="string"?i:Zt(i,r)}else if(Array.isArray(t))return yo(t,r);return fo(t,r)}function _o(t){return typeof t.toJSON=="function"}function fo(t,e){const r=Object.entries(t);return r.length===0?"{}":e.length>cs?"["+ho(t)+"]":"{ "+r.map(([a,s])=>a+": "+Zt(s,e)).join(", ")+" }"}function yo(t,e){if(t.length===0)return"[]";if(e.length>cs)return"[Array]";const r=Math.min(po,t.length),i=t.length-r,a=[];for(let s=0;s<r;++s)a.push(Zt(t[s],e));return i===1?a.push("... 1 more item"):i>1&&a.push(`... ${i} more items`),"["+a.join(", ")+"]"}function ho(t){const e=Object.prototype.toString.call(t).replace(/^\[object /,"").replace(/]$/,"");if(e==="Object"&&typeof t.constructor=="function"){const r=t.constructor.name;if(typeof r=="string"&&r!=="")return r}return e}const go=(function(e,r){if(e instanceof r)return!0;if(typeof e=="object"&&e!==null){var i;const a=r.prototype[Symbol.toStringTag],s=Symbol.toStringTag in e?e[Symbol.toStringTag]:(i=e.constructor)===null||i===void 0?void 0:i.name;if(a===s){const n=hi(e);throw new Error(`Cannot use ${a} "${n}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`)}}return!1});class ps{constructor(e,r="GraphQL request",i={line:1,column:1}){typeof e=="string"||qt(!1,`Body must be a string. Received: ${hi(e)}.`),this.body=e,this.name=r,this.locationOffset=i,this.locationOffset.line>0||qt(!1,"line in locationOffset is 1-indexed and must be positive."),this.locationOffset.column>0||qt(!1,"column in locationOffset is 1-indexed and must be positive.")}get[Symbol.toStringTag](){return"Source"}}function Io(t){return go(t,ps)}function o(t,e){const r=new bo(t,e),i=r.parseDocument();return Object.defineProperty(i,"tokenCount",{enumerable:!1,value:r.tokenCount}),i}class bo{constructor(e,r={}){const{lexer:i,...a}=r;if(i)this._lexer=i;else{const s=Io(e)?e:new ps(e);this._lexer=new eo(s)}this._options=a,this._tokenCounter=0}get tokenCount(){return this._tokenCounter}parseName(){const e=this.expectToken(T.NAME);return this.node(e,{kind:$.NAME,value:e.value})}parseDocument(){return this.node(this._lexer.token,{kind:$.DOCUMENT,definitions:this.many(T.SOF,this.parseDefinition,T.EOF)})}parseDefinition(){if(this.peek(T.BRACE_L))return this.parseOperationDefinition();const e=this.peekDescription(),r=e?this._lexer.lookahead():this._lexer.token;if(e&&r.kind===T.BRACE_L)throw G(this._lexer.source,this._lexer.token.start,"Unexpected description, descriptions are not supported on shorthand queries.");if(r.kind===T.NAME){switch(r.value){case"schema":return this.parseSchemaDefinition();case"scalar":return this.parseScalarTypeDefinition();case"type":return this.parseObjectTypeDefinition();case"interface":return this.parseInterfaceTypeDefinition();case"union":return this.parseUnionTypeDefinition();case"enum":return this.parseEnumTypeDefinition();case"input":return this.parseInputObjectTypeDefinition();case"directive":return this.parseDirectiveDefinition()}switch(r.value){case"query":case"mutation":case"subscription":return this.parseOperationDefinition();case"fragment":return this.parseFragmentDefinition()}if(e)throw G(this._lexer.source,this._lexer.token.start,"Unexpected description, only GraphQL definitions support descriptions.");if(r.value==="extend")return this.parseTypeSystemExtension()}throw this.unexpected(r)}parseOperationDefinition(){const e=this._lexer.token;if(this.peek(T.BRACE_L))return this.node(e,{kind:$.OPERATION_DEFINITION,operation:ze.QUERY,description:void 0,name:void 0,variableDefinitions:[],directives:[],selectionSet:this.parseSelectionSet()});const r=this.parseDescription(),i=this.parseOperationType();let a;return this.peek(T.NAME)&&(a=this.parseName()),this.node(e,{kind:$.OPERATION_DEFINITION,operation:i,description:r,name:a,variableDefinitions:this.parseVariableDefinitions(),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet()})}parseOperationType(){const e=this.expectToken(T.NAME);switch(e.value){case"query":return ze.QUERY;case"mutation":return ze.MUTATION;case"subscription":return ze.SUBSCRIPTION}throw this.unexpected(e)}parseVariableDefinitions(){return this.optionalMany(T.PAREN_L,this.parseVariableDefinition,T.PAREN_R)}parseVariableDefinition(){return this.node(this._lexer.token,{kind:$.VARIABLE_DEFINITION,description:this.parseDescription(),variable:this.parseVariable(),type:(this.expectToken(T.COLON),this.parseTypeReference()),defaultValue:this.expectOptionalToken(T.EQUALS)?this.parseConstValueLiteral():void 0,directives:this.parseConstDirectives()})}parseVariable(){const e=this._lexer.token;return this.expectToken(T.DOLLAR),this.node(e,{kind:$.VARIABLE,name:this.parseName()})}parseSelectionSet(){return this.node(this._lexer.token,{kind:$.SELECTION_SET,selections:this.many(T.BRACE_L,this.parseSelection,T.BRACE_R)})}parseSelection(){return this.peek(T.SPREAD)?this.parseFragment():this.parseField()}parseField(){const e=this._lexer.token,r=this.parseName();let i,a;return this.expectOptionalToken(T.COLON)?(i=r,a=this.parseName()):a=r,this.node(e,{kind:$.FIELD,alias:i,name:a,arguments:this.parseArguments(!1),directives:this.parseDirectives(!1),selectionSet:this.peek(T.BRACE_L)?this.parseSelectionSet():void 0})}parseArguments(e){const r=e?this.parseConstArgument:this.parseArgument;return this.optionalMany(T.PAREN_L,r,T.PAREN_R)}parseArgument(e=!1){const r=this._lexer.token,i=this.parseName();return this.expectToken(T.COLON),this.node(r,{kind:$.ARGUMENT,name:i,value:this.parseValueLiteral(e)})}parseConstArgument(){return this.parseArgument(!0)}parseFragment(){const e=this._lexer.token;this.expectToken(T.SPREAD);const r=this.expectOptionalKeyword("on");return!r&&this.peek(T.NAME)?this.node(e,{kind:$.FRAGMENT_SPREAD,name:this.parseFragmentName(),directives:this.parseDirectives(!1)}):this.node(e,{kind:$.INLINE_FRAGMENT,typeCondition:r?this.parseNamedType():void 0,directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet()})}parseFragmentDefinition(){const e=this._lexer.token,r=this.parseDescription();return this.expectKeyword("fragment"),this._options.allowLegacyFragmentVariables===!0?this.node(e,{kind:$.FRAGMENT_DEFINITION,description:r,name:this.parseFragmentName(),variableDefinitions:this.parseVariableDefinitions(),typeCondition:(this.expectKeyword("on"),this.parseNamedType()),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet()}):this.node(e,{kind:$.FRAGMENT_DEFINITION,description:r,name:this.parseFragmentName(),typeCondition:(this.expectKeyword("on"),this.parseNamedType()),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet()})}parseFragmentName(){if(this._lexer.token.value==="on")throw this.unexpected();return this.parseName()}parseValueLiteral(e){const r=this._lexer.token;switch(r.kind){case T.BRACKET_L:return this.parseList(e);case T.BRACE_L:return this.parseObject(e);case T.INT:return this.advanceLexer(),this.node(r,{kind:$.INT,value:r.value});case T.FLOAT:return this.advanceLexer(),this.node(r,{kind:$.FLOAT,value:r.value});case T.STRING:case T.BLOCK_STRING:return this.parseStringLiteral();case T.NAME:switch(this.advanceLexer(),r.value){case"true":return this.node(r,{kind:$.BOOLEAN,value:!0});case"false":return this.node(r,{kind:$.BOOLEAN,value:!1});case"null":return this.node(r,{kind:$.NULL});default:return this.node(r,{kind:$.ENUM,value:r.value})}case T.DOLLAR:if(e)if(this.expectToken(T.DOLLAR),this._lexer.token.kind===T.NAME){const i=this._lexer.token.value;throw G(this._lexer.source,r.start,`Unexpected variable "$${i}" in constant value.`)}else throw this.unexpected(r);return this.parseVariable();default:throw this.unexpected()}}parseConstValueLiteral(){return this.parseValueLiteral(!0)}parseStringLiteral(){const e=this._lexer.token;return this.advanceLexer(),this.node(e,{kind:$.STRING,value:e.value,block:e.kind===T.BLOCK_STRING})}parseList(e){const r=()=>this.parseValueLiteral(e);return this.node(this._lexer.token,{kind:$.LIST,values:this.any(T.BRACKET_L,r,T.BRACKET_R)})}parseObject(e){const r=()=>this.parseObjectField(e);return this.node(this._lexer.token,{kind:$.OBJECT,fields:this.any(T.BRACE_L,r,T.BRACE_R)})}parseObjectField(e){const r=this._lexer.token,i=this.parseName();return this.expectToken(T.COLON),this.node(r,{kind:$.OBJECT_FIELD,name:i,value:this.parseValueLiteral(e)})}parseDirectives(e){const r=[];for(;this.peek(T.AT);)r.push(this.parseDirective(e));return r}parseConstDirectives(){return this.parseDirectives(!0)}parseDirective(e){const r=this._lexer.token;return this.expectToken(T.AT),this.node(r,{kind:$.DIRECTIVE,name:this.parseName(),arguments:this.parseArguments(e)})}parseTypeReference(){const e=this._lexer.token;let r;if(this.expectOptionalToken(T.BRACKET_L)){const i=this.parseTypeReference();this.expectToken(T.BRACKET_R),r=this.node(e,{kind:$.LIST_TYPE,type:i})}else r=this.parseNamedType();return this.expectOptionalToken(T.BANG)?this.node(e,{kind:$.NON_NULL_TYPE,type:r}):r}parseNamedType(){return this.node(this._lexer.token,{kind:$.NAMED_TYPE,name:this.parseName()})}peekDescription(){return this.peek(T.STRING)||this.peek(T.BLOCK_STRING)}parseDescription(){if(this.peekDescription())return this.parseStringLiteral()}parseSchemaDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("schema");const i=this.parseConstDirectives(),a=this.many(T.BRACE_L,this.parseOperationTypeDefinition,T.BRACE_R);return this.node(e,{kind:$.SCHEMA_DEFINITION,description:r,directives:i,operationTypes:a})}parseOperationTypeDefinition(){const e=this._lexer.token,r=this.parseOperationType();this.expectToken(T.COLON);const i=this.parseNamedType();return this.node(e,{kind:$.OPERATION_TYPE_DEFINITION,operation:r,type:i})}parseScalarTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("scalar");const i=this.parseName(),a=this.parseConstDirectives();return this.node(e,{kind:$.SCALAR_TYPE_DEFINITION,description:r,name:i,directives:a})}parseObjectTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("type");const i=this.parseName(),a=this.parseImplementsInterfaces(),s=this.parseConstDirectives(),n=this.parseFieldsDefinition();return this.node(e,{kind:$.OBJECT_TYPE_DEFINITION,description:r,name:i,interfaces:a,directives:s,fields:n})}parseImplementsInterfaces(){return this.expectOptionalKeyword("implements")?this.delimitedMany(T.AMP,this.parseNamedType):[]}parseFieldsDefinition(){return this.optionalMany(T.BRACE_L,this.parseFieldDefinition,T.BRACE_R)}parseFieldDefinition(){const e=this._lexer.token,r=this.parseDescription(),i=this.parseName(),a=this.parseArgumentDefs();this.expectToken(T.COLON);const s=this.parseTypeReference(),n=this.parseConstDirectives();return this.node(e,{kind:$.FIELD_DEFINITION,description:r,name:i,arguments:a,type:s,directives:n})}parseArgumentDefs(){return this.optionalMany(T.PAREN_L,this.parseInputValueDef,T.PAREN_R)}parseInputValueDef(){const e=this._lexer.token,r=this.parseDescription(),i=this.parseName();this.expectToken(T.COLON);const a=this.parseTypeReference();let s;this.expectOptionalToken(T.EQUALS)&&(s=this.parseConstValueLiteral());const n=this.parseConstDirectives();return this.node(e,{kind:$.INPUT_VALUE_DEFINITION,description:r,name:i,type:a,defaultValue:s,directives:n})}parseInterfaceTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("interface");const i=this.parseName(),a=this.parseImplementsInterfaces(),s=this.parseConstDirectives(),n=this.parseFieldsDefinition();return this.node(e,{kind:$.INTERFACE_TYPE_DEFINITION,description:r,name:i,interfaces:a,directives:s,fields:n})}parseUnionTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("union");const i=this.parseName(),a=this.parseConstDirectives(),s=this.parseUnionMemberTypes();return this.node(e,{kind:$.UNION_TYPE_DEFINITION,description:r,name:i,directives:a,types:s})}parseUnionMemberTypes(){return this.expectOptionalToken(T.EQUALS)?this.delimitedMany(T.PIPE,this.parseNamedType):[]}parseEnumTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("enum");const i=this.parseName(),a=this.parseConstDirectives(),s=this.parseEnumValuesDefinition();return this.node(e,{kind:$.ENUM_TYPE_DEFINITION,description:r,name:i,directives:a,values:s})}parseEnumValuesDefinition(){return this.optionalMany(T.BRACE_L,this.parseEnumValueDefinition,T.BRACE_R)}parseEnumValueDefinition(){const e=this._lexer.token,r=this.parseDescription(),i=this.parseEnumValueName(),a=this.parseConstDirectives();return this.node(e,{kind:$.ENUM_VALUE_DEFINITION,description:r,name:i,directives:a})}parseEnumValueName(){if(this._lexer.token.value==="true"||this._lexer.token.value==="false"||this._lexer.token.value==="null")throw G(this._lexer.source,this._lexer.token.start,`${Rt(this._lexer.token)} is reserved and cannot be used for an enum value.`);return this.parseName()}parseInputObjectTypeDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("input");const i=this.parseName(),a=this.parseConstDirectives(),s=this.parseInputFieldsDefinition();return this.node(e,{kind:$.INPUT_OBJECT_TYPE_DEFINITION,description:r,name:i,directives:a,fields:s})}parseInputFieldsDefinition(){return this.optionalMany(T.BRACE_L,this.parseInputValueDef,T.BRACE_R)}parseTypeSystemExtension(){const e=this._lexer.lookahead();if(e.kind===T.NAME)switch(e.value){case"schema":return this.parseSchemaExtension();case"scalar":return this.parseScalarTypeExtension();case"type":return this.parseObjectTypeExtension();case"interface":return this.parseInterfaceTypeExtension();case"union":return this.parseUnionTypeExtension();case"enum":return this.parseEnumTypeExtension();case"input":return this.parseInputObjectTypeExtension()}throw this.unexpected(e)}parseSchemaExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("schema");const r=this.parseConstDirectives(),i=this.optionalMany(T.BRACE_L,this.parseOperationTypeDefinition,T.BRACE_R);if(r.length===0&&i.length===0)throw this.unexpected();return this.node(e,{kind:$.SCHEMA_EXTENSION,directives:r,operationTypes:i})}parseScalarTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("scalar");const r=this.parseName(),i=this.parseConstDirectives();if(i.length===0)throw this.unexpected();return this.node(e,{kind:$.SCALAR_TYPE_EXTENSION,name:r,directives:i})}parseObjectTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("type");const r=this.parseName(),i=this.parseImplementsInterfaces(),a=this.parseConstDirectives(),s=this.parseFieldsDefinition();if(i.length===0&&a.length===0&&s.length===0)throw this.unexpected();return this.node(e,{kind:$.OBJECT_TYPE_EXTENSION,name:r,interfaces:i,directives:a,fields:s})}parseInterfaceTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("interface");const r=this.parseName(),i=this.parseImplementsInterfaces(),a=this.parseConstDirectives(),s=this.parseFieldsDefinition();if(i.length===0&&a.length===0&&s.length===0)throw this.unexpected();return this.node(e,{kind:$.INTERFACE_TYPE_EXTENSION,name:r,interfaces:i,directives:a,fields:s})}parseUnionTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("union");const r=this.parseName(),i=this.parseConstDirectives(),a=this.parseUnionMemberTypes();if(i.length===0&&a.length===0)throw this.unexpected();return this.node(e,{kind:$.UNION_TYPE_EXTENSION,name:r,directives:i,types:a})}parseEnumTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("enum");const r=this.parseName(),i=this.parseConstDirectives(),a=this.parseEnumValuesDefinition();if(i.length===0&&a.length===0)throw this.unexpected();return this.node(e,{kind:$.ENUM_TYPE_EXTENSION,name:r,directives:i,values:a})}parseInputObjectTypeExtension(){const e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("input");const r=this.parseName(),i=this.parseConstDirectives(),a=this.parseInputFieldsDefinition();if(i.length===0&&a.length===0)throw this.unexpected();return this.node(e,{kind:$.INPUT_OBJECT_TYPE_EXTENSION,name:r,directives:i,fields:a})}parseDirectiveDefinition(){const e=this._lexer.token,r=this.parseDescription();this.expectKeyword("directive"),this.expectToken(T.AT);const i=this.parseName(),a=this.parseArgumentDefs(),s=this.expectOptionalKeyword("repeatable");this.expectKeyword("on");const n=this.parseDirectiveLocations();return this.node(e,{kind:$.DIRECTIVE_DEFINITION,description:r,name:i,arguments:a,repeatable:s,locations:n})}parseDirectiveLocations(){return this.delimitedMany(T.PIPE,this.parseDirectiveLocation)}parseDirectiveLocation(){const e=this._lexer.token,r=this.parseName();if(Object.prototype.hasOwnProperty.call(zr,r.value))return r;throw this.unexpected(e)}parseSchemaCoordinate(){const e=this._lexer.token,r=this.expectOptionalToken(T.AT),i=this.parseName();let a;!r&&this.expectOptionalToken(T.DOT)&&(a=this.parseName());let s;return(r||a)&&this.expectOptionalToken(T.PAREN_L)&&(s=this.parseName(),this.expectToken(T.COLON),this.expectToken(T.PAREN_R)),r?s?this.node(e,{kind:$.DIRECTIVE_ARGUMENT_COORDINATE,name:i,argumentName:s}):this.node(e,{kind:$.DIRECTIVE_COORDINATE,name:i}):a?s?this.node(e,{kind:$.ARGUMENT_COORDINATE,name:i,fieldName:a,argumentName:s}):this.node(e,{kind:$.MEMBER_COORDINATE,name:i,memberName:a}):this.node(e,{kind:$.TYPE_COORDINATE,name:i})}node(e,r){return this._options.noLocation!==!0&&(r.loc=new Hn(e,this._lexer.lastToken,this._lexer.source)),r}peek(e){return this._lexer.token.kind===e}expectToken(e){const r=this._lexer.token;if(r.kind===e)return this.advanceLexer(),r;throw G(this._lexer.source,r.start,`Expected ${ms(e)}, found ${Rt(r)}.`)}expectOptionalToken(e){return this._lexer.token.kind===e?(this.advanceLexer(),!0):!1}expectKeyword(e){const r=this._lexer.token;if(r.kind===T.NAME&&r.value===e)this.advanceLexer();else throw G(this._lexer.source,r.start,`Expected "${e}", found ${Rt(r)}.`)}expectOptionalKeyword(e){const r=this._lexer.token;return r.kind===T.NAME&&r.value===e?(this.advanceLexer(),!0):!1}unexpected(e){const r=e??this._lexer.token;return G(this._lexer.source,r.start,`Unexpected ${Rt(r)}.`)}any(e,r,i){this.expectToken(e);const a=[];for(;!this.expectOptionalToken(i);)a.push(r.call(this));return a}optionalMany(e,r,i){if(this.expectOptionalToken(e)){const a=[];do a.push(r.call(this));while(!this.expectOptionalToken(i));return a}return[]}many(e,r,i){this.expectToken(e);const a=[];do a.push(r.call(this));while(!this.expectOptionalToken(i));return a}delimitedMany(e,r){this.expectOptionalToken(e);const i=[];do i.push(r.call(this));while(this.expectOptionalToken(e));return i}advanceLexer(){const{maxTokens:e}=this._options,r=this._lexer.advance();if(r.kind!==T.EOF&&(++this._tokenCounter,e!==void 0&&this._tokenCounter>e))throw G(this._lexer.source,r.start,`Document contains more that ${e} tokens. Parsing aborted.`)}}function Rt(t){const e=t.value;return ms(t.kind)+(e!=null?` "${e}"`:"")}function ms(t){return to(t)?`"${t}"`:t}function To(t){return`"${t.replace(Ao,Co)}"`}const Ao=/[\x00-\x1f\x22\x5c\x7f-\x9f]/g;function Co(t){return vo[t.charCodeAt(0)]}const vo=["\\u0000","\\u0001","\\u0002","\\u0003","\\u0004","\\u0005","\\u0006","\\u0007","\\b","\\t","\\n","\\u000B","\\f","\\r","\\u000E","\\u000F","\\u0010","\\u0011","\\u0012","\\u0013","\\u0014","\\u0015","\\u0016","\\u0017","\\u0018","\\u0019","\\u001A","\\u001B","\\u001C","\\u001D","\\u001E","\\u001F","","",'\\"',"","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\\\\","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\\u007F","\\u0080","\\u0081","\\u0082","\\u0083","\\u0084","\\u0085","\\u0086","\\u0087","\\u0088","\\u0089","\\u008A","\\u008B","\\u008C","\\u008D","\\u008E","\\u008F","\\u0090","\\u0091","\\u0092","\\u0093","\\u0094","\\u0095","\\u0096","\\u0097","\\u0098","\\u0099","\\u009A","\\u009B","\\u009C","\\u009D","\\u009E","\\u009F"],Xt=Object.freeze({});function re(t,e,r=ns){const i=new Map;for(const h of Object.values($))i.set(h,$o(e,h));let a,s=Array.isArray(t),n=[t],l=-1,d=[],u=t,c,m;const p=[],_=[];do{l++;const h=l===n.length,A=h&&d.length!==0;if(h){if(c=_.length===0?void 0:p[p.length-1],u=m,m=_.pop(),A)if(s){u=u.slice();let C=0;for(const[v,P]of d){const k=v-C;P===null?(u.splice(k,1),C++):u[k]=P}}else{u={...u};for(const[C,v]of d)u[C]=v}l=a.index,n=a.keys,d=a.edits,s=a.inArray,a=a.prev}else if(m){if(c=s?l:n[l],u=m[c],u==null)continue;p.push(c)}let b;if(!Array.isArray(u)){var f,g;Qi(u)||qt(!1,`Invalid AST Node: ${hi(u)}.`);const C=h?(f=i.get(u.kind))===null||f===void 0?void 0:f.leave:(g=i.get(u.kind))===null||g===void 0?void 0:g.enter;if(b=C?.call(e,u,c,m,p,_),b===Xt)break;if(b===!1){if(!h){p.pop();continue}}else if(b!==void 0&&(d.push([c,b]),!h))if(Qi(b))u=b;else{p.pop();continue}}if(b===void 0&&A&&d.push([c,u]),h)p.pop();else{var I;a={inArray:s,index:l,keys:n,edits:d,prev:a},s=Array.isArray(u),n=s?u:(I=r[u.kind])!==null&&I!==void 0?I:[],l=-1,d=[],m&&_.push(m),m=u}}while(a!==void 0);return d.length!==0?d[d.length-1][1]:t}function $o(t,e){const r=t[e];return typeof r=="object"?r:typeof r=="function"?{enter:r,leave:void 0}:{enter:t.enter,leave:t.leave}}function Do(t){return re(t,wo)}const Po=80,wo={Name:{leave:t=>t.value},Variable:{leave:t=>"$"+t.name},Document:{leave:t=>D(t.definitions,`

`)},OperationDefinition:{leave(t){const e=fr(t.variableDefinitions)?R(`(
`,D(t.variableDefinitions,`
`),`
)`):R("(",D(t.variableDefinitions,", "),")"),r=R("",t.description,`
`)+D([t.operation,D([t.name,e]),D(t.directives," ")]," ");return(r==="query"?"":r+" ")+t.selectionSet}},VariableDefinition:{leave:({variable:t,type:e,defaultValue:r,directives:i,description:a})=>R("",a,`
`)+t+": "+e+R(" = ",r)+R(" ",D(i," "))},SelectionSet:{leave:({selections:t})=>X(t)},Field:{leave({alias:t,name:e,arguments:r,directives:i,selectionSet:a}){const s=R("",t,": ")+e;let n=s+R("(",D(r,", "),")");return n.length>Po&&(n=s+R(`(
`,Nt(D(r,`
`)),`
)`)),D([n,D(i," "),a]," ")}},Argument:{leave:({name:t,value:e})=>t+": "+e},FragmentSpread:{leave:({name:t,directives:e})=>"..."+t+R(" ",D(e," "))},InlineFragment:{leave:({typeCondition:t,directives:e,selectionSet:r})=>D(["...",R("on ",t),D(e," "),r]," ")},FragmentDefinition:{leave:({name:t,typeCondition:e,variableDefinitions:r,directives:i,selectionSet:a,description:s})=>R("",s,`
`)+`fragment ${t}${R("(",D(r,", "),")")} on ${e} ${R("",D(i," ")," ")}`+a},IntValue:{leave:({value:t})=>t},FloatValue:{leave:({value:t})=>t},StringValue:{leave:({value:t,block:e})=>e?Xn(t):To(t)},BooleanValue:{leave:({value:t})=>t?"true":"false"},NullValue:{leave:()=>"null"},EnumValue:{leave:({value:t})=>t},ListValue:{leave:({values:t})=>"["+D(t,", ")+"]"},ObjectValue:{leave:({fields:t})=>"{"+D(t,", ")+"}"},ObjectField:{leave:({name:t,value:e})=>t+": "+e},Directive:{leave:({name:t,arguments:e})=>"@"+t+R("(",D(e,", "),")")},NamedType:{leave:({name:t})=>t},ListType:{leave:({type:t})=>"["+t+"]"},NonNullType:{leave:({type:t})=>t+"!"},SchemaDefinition:{leave:({description:t,directives:e,operationTypes:r})=>R("",t,`
`)+D(["schema",D(e," "),X(r)]," ")},OperationTypeDefinition:{leave:({operation:t,type:e})=>t+": "+e},ScalarTypeDefinition:{leave:({description:t,name:e,directives:r})=>R("",t,`
`)+D(["scalar",e,D(r," ")]," ")},ObjectTypeDefinition:{leave:({description:t,name:e,interfaces:r,directives:i,fields:a})=>R("",t,`
`)+D(["type",e,R("implements ",D(r," & ")),D(i," "),X(a)]," ")},FieldDefinition:{leave:({description:t,name:e,arguments:r,type:i,directives:a})=>R("",t,`
`)+e+(fr(r)?R(`(
`,Nt(D(r,`
`)),`
)`):R("(",D(r,", "),")"))+": "+i+R(" ",D(a," "))},InputValueDefinition:{leave:({description:t,name:e,type:r,defaultValue:i,directives:a})=>R("",t,`
`)+D([e+": "+r,R("= ",i),D(a," ")]," ")},InterfaceTypeDefinition:{leave:({description:t,name:e,interfaces:r,directives:i,fields:a})=>R("",t,`
`)+D(["interface",e,R("implements ",D(r," & ")),D(i," "),X(a)]," ")},UnionTypeDefinition:{leave:({description:t,name:e,directives:r,types:i})=>R("",t,`
`)+D(["union",e,D(r," "),R("= ",D(i," | "))]," ")},EnumTypeDefinition:{leave:({description:t,name:e,directives:r,values:i})=>R("",t,`
`)+D(["enum",e,D(r," "),X(i)]," ")},EnumValueDefinition:{leave:({description:t,name:e,directives:r})=>R("",t,`
`)+D([e,D(r," ")]," ")},InputObjectTypeDefinition:{leave:({description:t,name:e,directives:r,fields:i})=>R("",t,`
`)+D(["input",e,D(r," "),X(i)]," ")},DirectiveDefinition:{leave:({description:t,name:e,arguments:r,repeatable:i,locations:a})=>R("",t,`
`)+"directive @"+e+(fr(r)?R(`(
`,Nt(D(r,`
`)),`
)`):R("(",D(r,", "),")"))+(i?" repeatable":"")+" on "+D(a," | ")},SchemaExtension:{leave:({directives:t,operationTypes:e})=>D(["extend schema",D(t," "),X(e)]," ")},ScalarTypeExtension:{leave:({name:t,directives:e})=>D(["extend scalar",t,D(e," ")]," ")},ObjectTypeExtension:{leave:({name:t,interfaces:e,directives:r,fields:i})=>D(["extend type",t,R("implements ",D(e," & ")),D(r," "),X(i)]," ")},InterfaceTypeExtension:{leave:({name:t,interfaces:e,directives:r,fields:i})=>D(["extend interface",t,R("implements ",D(e," & ")),D(r," "),X(i)]," ")},UnionTypeExtension:{leave:({name:t,directives:e,types:r})=>D(["extend union",t,D(e," "),R("= ",D(r," | "))]," ")},EnumTypeExtension:{leave:({name:t,directives:e,values:r})=>D(["extend enum",t,D(e," "),X(r)]," ")},InputObjectTypeExtension:{leave:({name:t,directives:e,fields:r})=>D(["extend input",t,D(e," "),X(r)]," ")},TypeCoordinate:{leave:({name:t})=>t},MemberCoordinate:{leave:({name:t,memberName:e})=>D([t,R(".",e)])},ArgumentCoordinate:{leave:({name:t,fieldName:e,argumentName:r})=>D([t,R(".",e),R("(",r,":)")])},DirectiveCoordinate:{leave:({name:t})=>D(["@",t])},DirectiveArgumentCoordinate:{leave:({name:t,argumentName:e})=>D(["@",t,R("(",e,":)")])}};function D(t,e=""){var r;return(r=t?.filter(i=>i).join(e))!==null&&r!==void 0?r:""}function X(t){return R(`{
`,Nt(D(t,`
`)),`
}`)}function R(t,e,r=""){return e!=null&&e!==""?t+e+r:""}function Nt(t){return R("  ",t.replace(/\n/g,`
  `))}function fr(t){var e;return(e=t?.some(r=>r.includes(`
`)))!==null&&e!==void 0?e:!1}function Yi(t){return t.kind===$.FIELD||t.kind===$.FRAGMENT_SPREAD||t.kind===$.INLINE_FRAGMENT}function Ct(t,e){var r=t.directives;return!r||!r.length?!0:ko(r).every(function(i){var a=i.directive,s=i.ifArgument,n=!1;return s.value.kind==="Variable"?(n=e&&e[s.value.name.value],w(n!==void 0,78,a.name.value)):n=s.value.value,a.name.value==="skip"?!n:n})}function It(t,e,r){var i=new Set(t),a=i.size;return re(e,{Directive:function(s){if(i.delete(s.name.value)&&(!r||!i.size))return Xt}}),r?!i.size:i.size<a}function Ro(t){return t&&It(["client","export"],t,!0)}function So(t){var e=t.name.value;return e==="skip"||e==="include"}function ko(t){var e=[];return t&&t.length&&t.forEach(function(r){if(So(r)){var i=r.arguments,a=r.name.value;w(i&&i.length===1,79,a);var s=i[0];w(s.name&&s.name.value==="if",80,a);var n=s.value;w(n&&(n.kind==="Variable"||n.kind==="BooleanValue"),81,a),e.push({directive:r,ifArgument:s})}}),e}function Uo(t){var e,r,i=(e=t.directives)===null||e===void 0?void 0:e.find(function(s){var n=s.name;return n.value==="unmask"});if(!i)return"mask";var a=(r=i.arguments)===null||r===void 0?void 0:r.find(function(s){var n=s.name;return n.value==="mode"});return globalThis.__DEV__!==!1&&a&&(a.value.kind===$.VARIABLE?globalThis.__DEV__!==!1&&w.warn(82):a.value.kind!==$.STRING?globalThis.__DEV__!==!1&&w.warn(83):a.value.value!=="migrate"&&globalThis.__DEV__!==!1&&w.warn(84,a.value.value)),a&&"value"in a.value&&a.value.value==="migrate"?"migrate":"unmask"}const Oo=()=>Object.create(null),{forEach:Bo,slice:Ki}=Array.prototype,{hasOwnProperty:qo}=Object.prototype;class me{constructor(e=!0,r=Oo){this.weakness=e,this.makeData=r}lookup(){return this.lookupArray(arguments)}lookupArray(e){let r=this;return Bo.call(e,i=>r=r.getChildTrie(i)),qo.call(r,"data")?r.data:r.data=this.makeData(Ki.call(e))}peek(){return this.peekArray(arguments)}peekArray(e){let r=this;for(let i=0,a=e.length;r&&i<a;++i){const s=r.mapFor(e[i],!1);r=s&&s.get(e[i])}return r&&r.data}remove(){return this.removeArray(arguments)}removeArray(e){let r;if(e.length){const i=e[0],a=this.mapFor(i,!1),s=a&&a.get(i);s&&(r=s.removeArray(Ki.call(e,1)),!s.data&&!s.weak&&!(s.strong&&s.strong.size)&&a.delete(i))}else r=this.data,delete this.data;return r}getChildTrie(e){const r=this.mapFor(e,!0);let i=r.get(e);return i||r.set(e,i=new me(this.weakness,this.makeData)),i}mapFor(e,r){return this.weakness&&No(e)?this.weak||(r?this.weak=new WeakMap:void 0):this.strong||(r?this.strong=new Map:void 0)}}function No(t){switch(typeof t){case"object":if(t===null)break;case"function":return!0}return!1}var _s=ee(function(){return navigator.product})=="ReactNative",Oe=typeof WeakMap=="function"&&!(_s&&!global.HermesInternal),gi=typeof WeakSet=="function",Ii=typeof Symbol=="function"&&typeof Symbol.for=="function",er=Ii&&Symbol.asyncIterator,Fo=typeof ee(function(){return window.document.createElement})=="function",Eo=ee(function(){return navigator.userAgent.indexOf("jsdom")>=0})||!1,dy=(Fo||_s)&&!Eo;function E(t){return t!==null&&typeof t=="object"}function Mo(t,e){var r=e,i=[];t.definitions.forEach(function(s){if(s.kind==="OperationDefinition")throw Y(85,s.operation,s.name?" named '".concat(s.name.value,"'"):"");s.kind==="FragmentDefinition"&&i.push(s)}),typeof r>"u"&&(w(i.length===1,86,i.length),r=i[0].name.value);var a=y(y({},t),{definitions:H([{kind:"OperationDefinition",operation:"query",selectionSet:{kind:"SelectionSet",selections:[{kind:"FragmentSpread",name:{kind:"Name",value:r}}]}}],t.definitions,!0)});return a}function tt(t){t===void 0&&(t=[]);var e={};return t.forEach(function(r){e[r.name.value]=r}),e}function tr(t,e){switch(t.kind){case"InlineFragment":return t;case"FragmentSpread":{var r=t.name.value;if(typeof e=="function")return e(r);var i=e&&e[r];return w(i,87,r),i||null}default:return null}}function zo(t){var e=!0;return re(t,{FragmentSpread:function(r){if(e=!!r.directives&&r.directives.some(function(i){return i.name.value==="unmask"}),!e)return Xt}}),e}function xo(){}class Lr{constructor(e=1/0,r=xo){this.max=e,this.dispose=r,this.map=new Map,this.newest=null,this.oldest=null}has(e){return this.map.has(e)}get(e){const r=this.getNode(e);return r&&r.value}get size(){return this.map.size}getNode(e){const r=this.map.get(e);if(r&&r!==this.newest){const{older:i,newer:a}=r;a&&(a.older=i),i&&(i.newer=a),r.older=this.newest,r.older.newer=r,r.newer=null,this.newest=r,r===this.oldest&&(this.oldest=a)}return r}set(e,r){let i=this.getNode(e);return i?i.value=r:(i={key:e,value:r,newer:null,older:this.newest},this.newest&&(this.newest.newer=i),this.newest=i,this.oldest=this.oldest||i,this.map.set(e,i),i.value)}clean(){for(;this.oldest&&this.map.size>this.max;)this.delete(this.oldest.key)}delete(e){const r=this.map.get(e);return r?(r===this.newest&&(this.newest=r.older),r===this.oldest&&(this.oldest=r.newer),r.newer&&(r.newer.older=r.older),r.older&&(r.older.newer=r.newer),this.map.delete(e),this.dispose(r.value,e),!0):!1}}function Gr(){}const Lo=Gr,Go=typeof WeakRef<"u"?WeakRef:function(t){return{deref:()=>t}},jo=typeof WeakMap<"u"?WeakMap:Map,Vo=typeof FinalizationRegistry<"u"?FinalizationRegistry:function(){return{register:Gr,unregister:Gr}},Wo=10024;class Vt{constructor(e=1/0,r=Lo){this.max=e,this.dispose=r,this.map=new jo,this.newest=null,this.oldest=null,this.unfinalizedNodes=new Set,this.finalizationScheduled=!1,this.size=0,this.finalize=()=>{const i=this.unfinalizedNodes.values();for(let a=0;a<Wo;a++){const s=i.next().value;if(!s)break;this.unfinalizedNodes.delete(s);const n=s.key;delete s.key,s.keyRef=new Go(n),this.registry.register(n,s,s)}this.unfinalizedNodes.size>0?queueMicrotask(this.finalize):this.finalizationScheduled=!1},this.registry=new Vo(this.deleteNode.bind(this))}has(e){return this.map.has(e)}get(e){const r=this.getNode(e);return r&&r.value}getNode(e){const r=this.map.get(e);if(r&&r!==this.newest){const{older:i,newer:a}=r;a&&(a.older=i),i&&(i.newer=a),r.older=this.newest,r.older.newer=r,r.newer=null,this.newest=r,r===this.oldest&&(this.oldest=a)}return r}set(e,r){let i=this.getNode(e);return i?i.value=r:(i={key:e,value:r,newer:null,older:this.newest},this.newest&&(this.newest.newer=i),this.newest=i,this.oldest=this.oldest||i,this.scheduleFinalization(i),this.map.set(e,i),this.size++,i.value)}clean(){for(;this.oldest&&this.size>this.max;)this.deleteNode(this.oldest)}deleteNode(e){e===this.newest&&(this.newest=e.older),e===this.oldest&&(this.oldest=e.newer),e.newer&&(e.newer.older=e.older),e.older&&(e.older.newer=e.newer),this.size--;const r=e.key||e.keyRef&&e.keyRef.deref();this.dispose(e.value,r),e.keyRef?this.registry.unregister(e):this.unfinalizedNodes.delete(e),r&&this.map.delete(r)}delete(e){const r=this.map.get(e);return r?(this.deleteNode(r),!0):!1}scheduleFinalization(e){this.unfinalizedNodes.add(e),this.finalizationScheduled||(this.finalizationScheduled=!0,queueMicrotask(this.finalize))}}var yr=new WeakSet;function fs(t){t.size<=(t.max||-1)||yr.has(t)||(yr.add(t),setTimeout(function(){t.clean(),yr.delete(t)},100))}var ys=function(t,e){var r=new Vt(t,e);return r.set=function(i,a){var s=Vt.prototype.set.call(this,i,a);return fs(this),s},r},Qo=function(t,e){var r=new Lr(t,e);return r.set=function(i,a){var s=Lr.prototype.set.call(this,i,a);return fs(this),s},r},Ho=Symbol.for("apollo.cacheSize"),ue=y({},Er[Ho]),Re={};function hs(t,e){Re[t]=e}var Yo=globalThis.__DEV__!==!1?Xo:void 0,Ko=globalThis.__DEV__!==!1?el:void 0,Jo=globalThis.__DEV__!==!1?gs:void 0;function Zo(){var t={parser:1e3,canonicalStringify:1e3,print:2e3,"documentTransform.cache":2e3,"queryManager.getDocumentInfo":2e3,"PersistedQueryLink.persistedQueryHashes":2e3,"fragmentRegistry.transform":2e3,"fragmentRegistry.lookup":1e3,"fragmentRegistry.findFragmentSpreads":4e3,"cache.fragmentQueryDocuments":1e3,"removeTypenameFromVariables.getVariableDefinitions":2e3,"inMemoryCache.maybeBroadcastWatch":5e3,"inMemoryCache.executeSelectionSet":5e4,"inMemoryCache.executeSubSelectedArray":1e4};return Object.fromEntries(Object.entries(t).map(function(e){var r=e[0],i=e[1];return[r,ue[r]||i]}))}function Xo(){var t,e,r,i,a;if(globalThis.__DEV__===!1)throw new Error("only supported in development mode");return{limits:Zo(),sizes:y({print:(t=Re.print)===null||t===void 0?void 0:t.call(Re),parser:(e=Re.parser)===null||e===void 0?void 0:e.call(Re),canonicalStringify:(r=Re.canonicalStringify)===null||r===void 0?void 0:r.call(Re),links:Vr(this.link),queryManager:{getDocumentInfo:this.queryManager.transformCache.size,documentTransforms:bs(this.queryManager.documentTransform)}},(a=(i=this.cache).getMemoryInternals)===null||a===void 0?void 0:a.call(i))}}function gs(){return{cache:{fragmentQueryDocuments:ge(this.getFragmentDoc)}}}function el(){var t=this.config.fragments;return y(y({},gs.apply(this)),{addTypenameDocumentTransform:bs(this.addTypenameTransform),inMemoryCache:{executeSelectionSet:ge(this.storeReader.executeSelectionSet),executeSubSelectedArray:ge(this.storeReader.executeSubSelectedArray),maybeBroadcastWatch:ge(this.maybeBroadcastWatch)},fragmentRegistry:{findFragmentSpreads:ge(t?.findFragmentSpreads),lookup:ge(t?.lookup),transform:ge(t?.transform)}})}function tl(t){return!!t&&"dirtyKey"in t}function ge(t){return tl(t)?t.size:void 0}function Is(t){return t!=null}function bs(t){return jr(t).map(function(e){return{cache:e}})}function jr(t){return t?H(H([ge(t?.performWork)],jr(t?.left),!0),jr(t?.right),!0).filter(Is):[]}function Vr(t){var e;return t?H(H([(e=t?.getMemoryInternals)===null||e===void 0?void 0:e.call(t)],Vr(t?.left),!0),Vr(t?.right),!0).filter(Is):[]}var be=Object.assign(function(e){return JSON.stringify(e,rl)},{reset:function(){xe=new Qo(ue.canonicalStringify||1e3)}});globalThis.__DEV__!==!1&&hs("canonicalStringify",function(){return xe.size});var xe;be.reset();function rl(t,e){if(e&&typeof e=="object"){var r=Object.getPrototypeOf(e);if(r===Object.prototype||r===null){var i=Object.keys(e);if(i.every(il))return e;var a=JSON.stringify(i),s=xe.get(a);if(!s){i.sort();var n=JSON.stringify(i);s=xe.get(n)||i,xe.set(a,s),xe.set(n,s)}var l=Object.create(r);return s.forEach(function(d){l[d]=e[d]}),l}}return e}function il(t,e,r){return e===0||r[e-1]<=t}function Ve(t){return{__ref:String(t)}}function B(t){return!!(t&&typeof t=="object"&&typeof t.__ref=="string")}function al(t){return E(t)&&t.kind==="Document"&&Array.isArray(t.definitions)}function sl(t){return t.kind==="StringValue"}function nl(t){return t.kind==="BooleanValue"}function ol(t){return t.kind==="IntValue"}function ll(t){return t.kind==="FloatValue"}function dl(t){return t.kind==="Variable"}function ul(t){return t.kind==="ObjectValue"}function cl(t){return t.kind==="ListValue"}function pl(t){return t.kind==="EnumValue"}function ml(t){return t.kind==="NullValue"}function Ke(t,e,r,i){if(ol(r)||ll(r))t[e.value]=Number(r.value);else if(nl(r)||sl(r))t[e.value]=r.value;else if(ul(r)){var a={};r.fields.map(function(n){return Ke(a,n.name,n.value,i)}),t[e.value]=a}else if(dl(r)){var s=(i||{})[r.name.value];t[e.value]=s}else if(cl(r))t[e.value]=r.values.map(function(n){var l={};return Ke(l,e,n,i),l[e.value]});else if(pl(r))t[e.value]=r.value;else if(ml(r))t[e.value]=null;else throw Y(96,e.value,r.kind)}function _l(t,e){var r=null;t.directives&&(r={},t.directives.forEach(function(a){r[a.name.value]={},a.arguments&&a.arguments.forEach(function(s){var n=s.name,l=s.value;return Ke(r[a.name.value],n,l,e)})}));var i=null;return t.arguments&&t.arguments.length&&(i={},t.arguments.forEach(function(a){var s=a.name,n=a.value;return Ke(i,s,n,e)})),Ts(t.name.value,i,r)}var fl=["connection","include","skip","client","rest","export","nonreactive"],at=be,Ts=Object.assign(function(t,e,r){if(e&&r&&r.connection&&r.connection.key)if(r.connection.filter&&r.connection.filter.length>0){var i=r.connection.filter?r.connection.filter:[];i.sort();var a={};return i.forEach(function(l){a[l]=e[l]}),"".concat(r.connection.key,"(").concat(at(a),")")}else return r.connection.key;var s=t;if(e){var n=at(e);s+="(".concat(n,")")}return r&&Object.keys(r).forEach(function(l){fl.indexOf(l)===-1&&(r[l]&&Object.keys(r[l]).length?s+="@".concat(l,"(").concat(at(r[l]),")"):s+="@".concat(l))}),s},{setStringify:function(t){var e=at;return at=t,e}});function rr(t,e){if(t.arguments&&t.arguments.length){var r={};return t.arguments.forEach(function(i){var a=i.name,s=i.value;return Ke(r,a,s,e)}),r}return null}function ce(t){return t.alias?t.alias.value:t.name.value}function Wr(t,e,r){for(var i,a=0,s=e.selections;a<s.length;a++){var n=s[a];if(Ae(n)){if(n.name.value==="__typename")return t[ce(n)]}else i?i.push(n):i=[n]}if(typeof t.__typename=="string")return t.__typename;if(i)for(var l=0,d=i;l<d.length;l++){var n=d[l],u=Wr(t,tr(n,r).selectionSet,r);if(typeof u=="string")return u}}function Ae(t){return t.kind==="Field"}function yl(t){return t.kind==="InlineFragment"}function Be(t){w(t&&t.kind==="Document",88);var e=t.definitions.filter(function(r){return r.kind!=="FragmentDefinition"}).map(function(r){if(r.kind!=="OperationDefinition")throw Y(89,r.kind);return r});return w(e.length<=1,90,e.length),t}function Ce(t){return Be(t),t.definitions.filter(function(e){return e.kind==="OperationDefinition"})[0]}function ct(t){return t.definitions.filter(function(e){return e.kind==="OperationDefinition"&&!!e.name}).map(function(e){return e.name.value})[0]||null}function rt(t){return t.definitions.filter(function(e){return e.kind==="FragmentDefinition"})}function As(t){var e=Ce(t);return w(e&&e.operation==="query",91),e}function Cs(t){w(t.kind==="Document",92),w(t.definitions.length<=1,93);var e=t.definitions[0];return w(e.kind==="FragmentDefinition",94),e}function vt(t){Be(t);for(var e,r=0,i=t.definitions;r<i.length;r++){var a=i[r];if(a.kind==="OperationDefinition"){var s=a.operation;if(s==="query"||s==="mutation"||s==="subscription")return a}a.kind==="FragmentDefinition"&&!e&&(e=a)}if(e)return e;throw Y(95)}function ir(t){var e=Object.create(null),r=t&&t.variableDefinitions;return r&&r.length&&r.forEach(function(i){i.defaultValue&&Ke(e,i.variable.name,i.defaultValue)}),e}let Q=null;const Ji={};let hl=1;const gl=()=>class{constructor(){this.id=["slot",hl++,Date.now(),Math.random().toString(36).slice(2)].join(":")}hasValue(){for(let e=Q;e;e=e.parent)if(this.id in e.slots){const r=e.slots[this.id];if(r===Ji)break;return e!==Q&&(Q.slots[this.id]=r),!0}return Q&&(Q.slots[this.id]=Ji),!1}getValue(){if(this.hasValue())return Q.slots[this.id]}withValue(e,r,i,a){const s={__proto__:null,[this.id]:e},n=Q;Q={parent:n,slots:s};try{return r.apply(a,i)}finally{Q=n}}static bind(e){const r=Q;return function(){const i=Q;try{return Q=r,e.apply(this,arguments)}finally{Q=i}}}static noContext(e,r,i){if(Q){const a=Q;try{return Q=null,e.apply(i,r)}finally{Q=a}}else return e.apply(i,r)}};function Zi(t){try{return t()}catch{}}const hr="@wry/context:Slot",Il=Zi(()=>globalThis)||Zi(()=>global)||Object.create(null),Xi=Il,$t=Xi[hr]||Array[hr]||(function(t){try{Object.defineProperty(Xi,hr,{value:t,enumerable:!1,writable:!1,configurable:!0})}finally{return t}})(gl()),{bind:cy,noContext:py}=$t,ar=new $t,{hasOwnProperty:bl}=Object.prototype,bi=Array.from||function(t){const e=[];return t.forEach(r=>e.push(r)),e};function Ti(t){const{unsubscribe:e}=t;typeof e=="function"&&(t.unsubscribe=void 0,e())}const bt=[],Tl=100;function Je(t,e){if(!t)throw new Error(e||"assertion failure")}function vs(t,e){const r=t.length;return r>0&&r===e.length&&t[r-1]===e[r-1]}function $s(t){switch(t.length){case 0:throw new Error("unknown value");case 1:return t[0];case 2:throw t[1]}}function Ds(t){return t.slice(0)}class sr{constructor(e){this.fn=e,this.parents=new Set,this.childValues=new Map,this.dirtyChildren=null,this.dirty=!0,this.recomputing=!1,this.value=[],this.deps=null,++sr.count}peek(){if(this.value.length===1&&!ve(this))return ea(this),this.value[0]}recompute(e){return Je(!this.recomputing,"already recomputing"),ea(this),ve(this)?Al(this,e):$s(this.value)}setDirty(){this.dirty||(this.dirty=!0,Ps(this),Ti(this))}dispose(){this.setDirty(),Us(this),Ai(this,(e,r)=>{e.setDirty(),Os(e,this)})}forget(){this.dispose()}dependOn(e){e.add(this),this.deps||(this.deps=bt.pop()||new Set),this.deps.add(e)}forgetDeps(){this.deps&&(bi(this.deps).forEach(e=>e.delete(this)),this.deps.clear(),bt.push(this.deps),this.deps=null)}}sr.count=0;function ea(t){const e=ar.getValue();if(e)return t.parents.add(e),e.childValues.has(t)||e.childValues.set(t,[]),ve(t)?Rs(e,t):Ss(e,t),e}function Al(t,e){return Us(t),ar.withValue(t,Cl,[t,e]),$l(t,e)&&vl(t),$s(t.value)}function Cl(t,e){t.recomputing=!0;const{normalizeResult:r}=t;let i;r&&t.value.length===1&&(i=Ds(t.value)),t.value.length=0;try{if(t.value[0]=t.fn.apply(null,e),r&&i&&!vs(i,t.value))try{t.value[0]=r(t.value[0],i[0])}catch{}}catch(a){t.value[1]=a}t.recomputing=!1}function ve(t){return t.dirty||!!(t.dirtyChildren&&t.dirtyChildren.size)}function vl(t){t.dirty=!1,!ve(t)&&ws(t)}function Ps(t){Ai(t,Rs)}function ws(t){Ai(t,Ss)}function Ai(t,e){const r=t.parents.size;if(r){const i=bi(t.parents);for(let a=0;a<r;++a)e(i[a],t)}}function Rs(t,e){Je(t.childValues.has(e)),Je(ve(e));const r=!ve(t);if(!t.dirtyChildren)t.dirtyChildren=bt.pop()||new Set;else if(t.dirtyChildren.has(e))return;t.dirtyChildren.add(e),r&&Ps(t)}function Ss(t,e){Je(t.childValues.has(e)),Je(!ve(e));const r=t.childValues.get(e);r.length===0?t.childValues.set(e,Ds(e.value)):vs(r,e.value)||t.setDirty(),ks(t,e),!ve(t)&&ws(t)}function ks(t,e){const r=t.dirtyChildren;r&&(r.delete(e),r.size===0&&(bt.length<Tl&&bt.push(r),t.dirtyChildren=null))}function Us(t){t.childValues.size>0&&t.childValues.forEach((e,r)=>{Os(t,r)}),t.forgetDeps(),Je(t.dirtyChildren===null)}function Os(t,e){e.parents.delete(t),t.childValues.delete(e),ks(t,e)}function $l(t,e){if(typeof t.subscribe=="function")try{Ti(t),t.unsubscribe=t.subscribe.apply(null,e)}catch{return t.setDirty(),!1}return!0}const Dl={setDirty:!0,dispose:!0,forget:!0};function Bs(t){const e=new Map;function r(i){const a=ar.getValue();if(a){let s=e.get(i);s||e.set(i,s=new Set),a.dependOn(s)}}return r.dirty=function(a,s){const n=e.get(a);if(n){const l=s&&bl.call(Dl,s)?s:"setDirty";bi(n).forEach(d=>d[l]()),e.delete(a),Ti(n)}},r}let ta;function Pl(...t){return(ta||(ta=new me(typeof WeakMap=="function"))).lookupArray(t)}const gr=new Set;function Tt(t,{max:e=Math.pow(2,16),keyArgs:r,makeCacheKey:i=Pl,normalizeResult:a,subscribe:s,cache:n=Lr}=Object.create(null)){const l=typeof n=="function"?new n(e,p=>p.dispose()):n,d=function(){const p=i.apply(null,r?r.apply(null,arguments):arguments);if(p===void 0)return t.apply(null,arguments);let _=l.get(p);_||(l.set(p,_=new sr(t)),_.normalizeResult=a,_.subscribe=s,_.forget=()=>l.delete(p));const f=_.recompute(Array.prototype.slice.call(arguments));return l.set(p,_),gr.add(l),ar.hasValue()||(gr.forEach(g=>g.clean()),gr.clear()),f};Object.defineProperty(d,"size",{get:()=>l.size,configurable:!1,enumerable:!1}),Object.freeze(d.options={max:e,keyArgs:r,makeCacheKey:i,normalizeResult:a,subscribe:s,cache:l});function u(p){const _=p&&l.get(p);_&&_.setDirty()}d.dirtyKey=u,d.dirty=function(){u(i.apply(null,arguments))};function c(p){const _=p&&l.get(p);if(_)return _.peek()}d.peekKey=c,d.peek=function(){return c(i.apply(null,arguments))};function m(p){return p?l.delete(p):!1}return d.forgetKey=m,d.forget=function(){return m(i.apply(null,arguments))},d.makeCacheKey=i,d.getKey=r?function(){return i.apply(null,r.apply(null,arguments))}:i,Object.freeze(d)}function wl(t){return t}var qs=(function(){function t(e,r){r===void 0&&(r=Object.create(null)),this.resultCache=gi?new WeakSet:new Set,this.transform=e,r.getCacheKey&&(this.getCacheKey=r.getCacheKey),this.cached=r.cache!==!1,this.resetCache()}return t.prototype.getCacheKey=function(e){return[e]},t.identity=function(){return new t(wl,{cache:!1})},t.split=function(e,r,i){return i===void 0&&(i=t.identity()),Object.assign(new t(function(a){var s=e(a)?r:i;return s.transformDocument(a)},{cache:!1}),{left:r,right:i})},t.prototype.resetCache=function(){var e=this;if(this.cached){var r=new me(Oe);this.performWork=Tt(t.prototype.performWork.bind(this),{makeCacheKey:function(i){var a=e.getCacheKey(i);if(a)return w(Array.isArray(a),77),r.lookupArray(a)},max:ue["documentTransform.cache"],cache:Vt})}},t.prototype.performWork=function(e){return Be(e),this.transform(e)},t.prototype.transformDocument=function(e){if(this.resultCache.has(e))return e;var r=this.performWork(e);return this.resultCache.add(r),r},t.prototype.concat=function(e){var r=this;return Object.assign(new t(function(i){return e.transformDocument(r.transformDocument(i))},{cache:!1}),{left:this,right:e})},t})(),mt,le=Object.assign(function(t){var e=mt.get(t);return e||(e=Do(t),mt.set(t,e)),e},{reset:function(){mt=new ys(ue.print||2e3)}});le.reset();globalThis.__DEV__!==!1&&hs("print",function(){return mt?mt.size:0});var M=Array.isArray;function ne(t){return Array.isArray(t)&&t.length>0}var ra={kind:$.FIELD,name:{kind:$.NAME,value:"__typename"}};function Ns(t,e){return!t||t.selectionSet.selections.every(function(r){return r.kind===$.FRAGMENT_SPREAD&&Ns(e[r.name.value],e)})}function Rl(t){return Ns(Ce(t)||Cs(t),tt(rt(t)))?null:t}function Sl(t){var e=new Map,r=new Map;return t.forEach(function(i){i&&(i.name?e.set(i.name,i):i.test&&r.set(i.test,i))}),function(i){var a=e.get(i.name.value);return!a&&r.size&&r.forEach(function(s,n){n(i)&&(a=s)}),a}}function ia(t){var e=new Map;return function(i){i===void 0&&(i=t);var a=e.get(i);return a||e.set(i,a={variables:new Set,fragmentSpreads:new Set}),a}}function Ci(t,e){Be(e);for(var r=ia(""),i=ia(""),a=function(h){for(var A=0,b=void 0;A<h.length&&(b=h[A]);++A)if(!M(b)){if(b.kind===$.OPERATION_DEFINITION)return r(b.name&&b.name.value);if(b.kind===$.FRAGMENT_DEFINITION)return i(b.name.value)}return globalThis.__DEV__!==!1&&w.error(97),null},s=0,n=e.definitions.length-1;n>=0;--n)e.definitions[n].kind===$.OPERATION_DEFINITION&&++s;var l=Sl(t),d=function(h){return ne(h)&&h.map(l).some(function(A){return A&&A.remove})},u=new Map,c=!1,m={enter:function(h){if(d(h.directives))return c=!0,null}},p=re(e,{Field:m,InlineFragment:m,VariableDefinition:{enter:function(){return!1}},Variable:{enter:function(h,A,b,C,v){var P=a(v);P&&P.variables.add(h.name.value)}},FragmentSpread:{enter:function(h,A,b,C,v){if(d(h.directives))return c=!0,null;var P=a(v);P&&P.fragmentSpreads.add(h.name.value)}},FragmentDefinition:{enter:function(h,A,b,C){u.set(JSON.stringify(C),h)},leave:function(h,A,b,C){var v=u.get(JSON.stringify(C));if(h===v)return h;if(s>0&&h.selectionSet.selections.every(function(P){return P.kind===$.FIELD&&P.name.value==="__typename"}))return i(h.name.value).removed=!0,c=!0,null}},Directive:{leave:function(h){if(l(h))return c=!0,null}}});if(!c)return e;var _=function(h){return h.transitiveVars||(h.transitiveVars=new Set(h.variables),h.removed||h.fragmentSpreads.forEach(function(A){_(i(A)).transitiveVars.forEach(function(b){h.transitiveVars.add(b)})})),h},f=new Set;p.definitions.forEach(function(h){h.kind===$.OPERATION_DEFINITION?_(r(h.name&&h.name.value)).fragmentSpreads.forEach(function(A){f.add(A)}):h.kind===$.FRAGMENT_DEFINITION&&s===0&&!i(h.name.value).removed&&f.add(h.name.value)}),f.forEach(function(h){_(i(h)).fragmentSpreads.forEach(function(A){f.add(A)})});var g=function(h){return!!(!f.has(h)||i(h).removed)},I={enter:function(h){if(g(h.name.value))return null}};return Rl(re(p,{FragmentSpread:I,FragmentDefinition:I,OperationDefinition:{leave:function(h){if(h.variableDefinitions){var A=_(r(h.name&&h.name.value)).transitiveVars;if(A.size<h.variableDefinitions.length)return y(y({},h),{variableDefinitions:h.variableDefinitions.filter(function(b){return A.has(b.variable.name.value)})})}}}}))}var nr=Object.assign(function(t){return re(t,{SelectionSet:{enter:function(e,r,i){if(!(i&&i.kind===$.OPERATION_DEFINITION)){var a=e.selections;if(a){var s=a.some(function(l){return Ae(l)&&(l.name.value==="__typename"||l.name.value.lastIndexOf("__",0)===0)});if(!s){var n=i;if(!(Ae(n)&&n.directives&&n.directives.some(function(l){return l.name.value==="export"})))return y(y({},e),{selections:H(H([],a,!0),[ra],!1)})}}}}}})},{added:function(t){return t===ra}});function kl(t){var e=vt(t),r=e.operation;if(r==="query")return t;var i=re(t,{OperationDefinition:{enter:function(a){return y(y({},a),{operation:"query"})}}});return i}function vi(t){Be(t);var e=Ci([{test:function(r){return r.name.value==="client"},remove:!0}],t);return e}function Ul(t){return Be(t),re(t,{FragmentSpread:function(e){var r;if(!(!((r=e.directives)===null||r===void 0)&&r.some(function(i){return i.name.value==="unmask"})))return y(y({},e),{directives:H(H([],e.directives||[],!0),[{kind:$.DIRECTIVE,name:{kind:$.NAME,value:"nonreactive"}}],!1)})}})}var Ol=Object.prototype.hasOwnProperty;function aa(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];return or(t)}function or(t){var e=t[0]||{},r=t.length;if(r>1)for(var i=new $e,a=1;a<r;++a)e=i.merge(e,t[a]);return e}var Bl=function(t,e,r){return this.merge(t[r],e[r])},$e=(function(){function t(e){e===void 0&&(e=Bl),this.reconciler=e,this.isObject=E,this.pastCopies=new Set}return t.prototype.merge=function(e,r){for(var i=this,a=[],s=2;s<arguments.length;s++)a[s-2]=arguments[s];return E(r)&&E(e)?(Object.keys(r).forEach(function(n){if(Ol.call(e,n)){var l=e[n];if(r[n]!==l){var d=i.reconciler.apply(i,H([e,r,n],a,!1));d!==l&&(e=i.shallowCopyForMerge(e),e[n]=d)}}else e=i.shallowCopyForMerge(e),e[n]=r[n]}),e):r},t.prototype.shallowCopyForMerge=function(e){return E(e)&&(this.pastCopies.has(e)||(Array.isArray(e)?e=e.slice(0):e=y({__proto__:Object.getPrototypeOf(e)},e),this.pastCopies.add(e))),e},t})();function ql(t,e){var r=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(r)return(r=r.call(t)).next.bind(r);if(Array.isArray(t)||(r=Nl(t))||e){r&&(t=r);var i=0;return function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Nl(t,e){if(t){if(typeof t=="string")return sa(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);if(r==="Object"&&t.constructor&&(r=t.constructor.name),r==="Map"||r==="Set")return Array.from(t);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return sa(t,e)}}function sa(t,e){(e==null||e>t.length)&&(e=t.length);for(var r=0,i=new Array(e);r<e;r++)i[r]=t[r];return i}function na(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function $i(t,e,r){return e&&na(t.prototype,e),r&&na(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}var Di=function(){return typeof Symbol=="function"},Pi=function(t){return Di()&&!!Symbol[t]},wi=function(t){return Pi(t)?Symbol[t]:"@@"+t};Di()&&!Pi("observable")&&(Symbol.observable=Symbol("observable"));var Fl=wi("iterator"),Qr=wi("observable"),Fs=wi("species");function Wt(t,e){var r=t[e];if(r!=null){if(typeof r!="function")throw new TypeError(r+" is not a function");return r}}function st(t){var e=t.constructor;return e!==void 0&&(e=e[Fs],e===null&&(e=void 0)),e!==void 0?e:N}function El(t){return t instanceof N}function Ze(t){Ze.log?Ze.log(t):setTimeout(function(){throw t})}function Ft(t){Promise.resolve().then(function(){try{t()}catch(e){Ze(e)}})}function Es(t){var e=t._cleanup;if(e!==void 0&&(t._cleanup=void 0,!!e))try{if(typeof e=="function")e();else{var r=Wt(e,"unsubscribe");r&&r.call(e)}}catch(i){Ze(i)}}function Hr(t){t._observer=void 0,t._queue=void 0,t._state="closed"}function Ml(t){var e=t._queue;if(e){t._queue=void 0,t._state="ready";for(var r=0;r<e.length&&(Ms(t,e[r].type,e[r].value),t._state!=="closed");++r);}}function Ms(t,e,r){t._state="running";var i=t._observer;try{var a=Wt(i,e);switch(e){case"next":a&&a.call(i,r);break;case"error":if(Hr(t),a)a.call(i,r);else throw r;break;case"complete":Hr(t),a&&a.call(i);break}}catch(s){Ze(s)}t._state==="closed"?Es(t):t._state==="running"&&(t._state="ready")}function Ir(t,e,r){if(t._state!=="closed"){if(t._state==="buffering"){t._queue.push({type:e,value:r});return}if(t._state!=="ready"){t._state="buffering",t._queue=[{type:e,value:r}],Ft(function(){return Ml(t)});return}Ms(t,e,r)}}var zl=(function(){function t(r,i){this._cleanup=void 0,this._observer=r,this._queue=void 0,this._state="initializing";var a=new xl(this);try{this._cleanup=i.call(void 0,a)}catch(s){a.error(s)}this._state==="initializing"&&(this._state="ready")}var e=t.prototype;return e.unsubscribe=function(){this._state!=="closed"&&(Hr(this),Es(this))},$i(t,[{key:"closed",get:function(){return this._state==="closed"}}]),t})(),xl=(function(){function t(r){this._subscription=r}var e=t.prototype;return e.next=function(i){Ir(this._subscription,"next",i)},e.error=function(i){Ir(this._subscription,"error",i)},e.complete=function(){Ir(this._subscription,"complete")},$i(t,[{key:"closed",get:function(){return this._subscription._state==="closed"}}]),t})(),N=(function(){function t(r){if(!(this instanceof t))throw new TypeError("Observable cannot be called as a function");if(typeof r!="function")throw new TypeError("Observable initializer must be a function");this._subscriber=r}var e=t.prototype;return e.subscribe=function(i){return(typeof i!="object"||i===null)&&(i={next:i,error:arguments[1],complete:arguments[2]}),new zl(i,this._subscriber)},e.forEach=function(i){var a=this;return new Promise(function(s,n){if(typeof i!="function"){n(new TypeError(i+" is not a function"));return}function l(){d.unsubscribe(),s()}var d=a.subscribe({next:function(u){try{i(u,l)}catch(c){n(c),d.unsubscribe()}},error:n,complete:s})})},e.map=function(i){var a=this;if(typeof i!="function")throw new TypeError(i+" is not a function");var s=st(this);return new s(function(n){return a.subscribe({next:function(l){try{l=i(l)}catch(d){return n.error(d)}n.next(l)},error:function(l){n.error(l)},complete:function(){n.complete()}})})},e.filter=function(i){var a=this;if(typeof i!="function")throw new TypeError(i+" is not a function");var s=st(this);return new s(function(n){return a.subscribe({next:function(l){try{if(!i(l))return}catch(d){return n.error(d)}n.next(l)},error:function(l){n.error(l)},complete:function(){n.complete()}})})},e.reduce=function(i){var a=this;if(typeof i!="function")throw new TypeError(i+" is not a function");var s=st(this),n=arguments.length>1,l=!1,d=arguments[1],u=d;return new s(function(c){return a.subscribe({next:function(m){var p=!l;if(l=!0,!p||n)try{u=i(u,m)}catch(_){return c.error(_)}else u=m},error:function(m){c.error(m)},complete:function(){if(!l&&!n)return c.error(new TypeError("Cannot reduce an empty sequence"));c.next(u),c.complete()}})})},e.concat=function(){for(var i=this,a=arguments.length,s=new Array(a),n=0;n<a;n++)s[n]=arguments[n];var l=st(this);return new l(function(d){var u,c=0;function m(p){u=p.subscribe({next:function(_){d.next(_)},error:function(_){d.error(_)},complete:function(){c===s.length?(u=void 0,d.complete()):m(l.from(s[c++]))}})}return m(i),function(){u&&(u.unsubscribe(),u=void 0)}})},e.flatMap=function(i){var a=this;if(typeof i!="function")throw new TypeError(i+" is not a function");var s=st(this);return new s(function(n){var l=[],d=a.subscribe({next:function(c){if(i)try{c=i(c)}catch(p){return n.error(p)}var m=s.from(c).subscribe({next:function(p){n.next(p)},error:function(p){n.error(p)},complete:function(){var p=l.indexOf(m);p>=0&&l.splice(p,1),u()}});l.push(m)},error:function(c){n.error(c)},complete:function(){u()}});function u(){d.closed&&l.length===0&&n.complete()}return function(){l.forEach(function(c){return c.unsubscribe()}),d.unsubscribe()}})},e[Qr]=function(){return this},t.from=function(i){var a=typeof this=="function"?this:t;if(i==null)throw new TypeError(i+" is not an object");var s=Wt(i,Qr);if(s){var n=s.call(i);if(Object(n)!==n)throw new TypeError(n+" is not an object");return El(n)&&n.constructor===a?n:new a(function(l){return n.subscribe(l)})}if(Pi("iterator")&&(s=Wt(i,Fl),s))return new a(function(l){Ft(function(){if(!l.closed){for(var d=ql(s.call(i)),u;!(u=d()).done;){var c=u.value;if(l.next(c),l.closed)return}l.complete()}})});if(Array.isArray(i))return new a(function(l){Ft(function(){if(!l.closed){for(var d=0;d<i.length;++d)if(l.next(i[d]),l.closed)return;l.complete()}})});throw new TypeError(i+" is not observable")},t.of=function(){for(var i=arguments.length,a=new Array(i),s=0;s<i;s++)a[s]=arguments[s];var n=typeof this=="function"?this:t;return new n(function(l){Ft(function(){if(!l.closed){for(var d=0;d<a.length;++d)if(l.next(a[d]),l.closed)return;l.complete()}})})},$i(t,null,[{key:Fs,get:function(){return this}}]),t})();Di()&&Object.defineProperty(N,Symbol("extensions"),{value:{symbol:Qr,hostReportError:Ze},configurable:!0});function Ll(t){var e,r=t.Symbol;if(typeof r=="function")if(r.observable)e=r.observable;else{typeof r.for=="function"?e=r.for("https://github.com/benlesh/symbol-observable"):e=r("https://github.com/benlesh/symbol-observable");try{r.observable=e}catch{}}else e="@@observable";return e}var Ee;typeof self<"u"?Ee=self:typeof window<"u"?Ee=window:typeof global<"u"?Ee=global:typeof module<"u"?Ee=module:Ee=Function("return this")();Ll(Ee);var oa=N.prototype,la="@@observable";oa[la]||(oa[la]=function(){return this});function Gl(t){return t.catch(function(){}),t}var jl=Object.prototype.toString;function Ri(t){return Yr(t)}function Yr(t,e){switch(jl.call(t)){case"[object Array]":{if(e=e||new Map,e.has(t))return e.get(t);var r=t.slice(0);return e.set(t,r),r.forEach(function(a,s){r[s]=Yr(a,e)}),r}case"[object Object]":{if(e=e||new Map,e.has(t))return e.get(t);var i=Object.create(Object.getPrototypeOf(t));return e.set(t,i),Object.keys(t).forEach(function(a){i[a]=Yr(t[a],e)}),i}default:return t}}function Vl(t){var e=new Set([t]);return e.forEach(function(r){E(r)&&Wl(r)===r&&Object.getOwnPropertyNames(r).forEach(function(i){E(r[i])&&e.add(r[i])})}),t}function Wl(t){if(globalThis.__DEV__!==!1&&!Object.isFrozen(t))try{Object.freeze(t)}catch(e){if(e instanceof TypeError)return null;throw e}return t}function Qt(t){return globalThis.__DEV__!==!1&&Vl(t),t}function _t(t,e,r){var i=[];t.forEach(function(a){return a[e]&&i.push(a)}),i.forEach(function(a){return a[e](r)})}function br(t,e,r){return new N(function(i){var a={then:function(d){return new Promise(function(u){return u(d())})}};function s(d,u){return function(c){if(d){var m=function(){return i.closed?0:d(c)};a=a.then(m,m).then(function(p){return i.next(p)},function(p){return i.error(p)})}else i[u](c)}}var n={next:s(e,"next"),error:s(r,"error"),complete:function(){a.then(function(){return i.complete()})}},l=t.subscribe(n);return function(){return l.unsubscribe()}})}function zs(t){function e(r){Object.defineProperty(t,r,{value:N})}return Ii&&Symbol.species&&e(Symbol.species),e("@@species"),t}function da(t){return t&&typeof t.then=="function"}var Me=(function(t){Z(e,t);function e(r){var i=t.call(this,function(a){return i.addObserver(a),function(){return i.removeObserver(a)}})||this;return i.observers=new Set,i.promise=new Promise(function(a,s){i.resolve=a,i.reject=s}),i.handlers={next:function(a){i.sub!==null&&(i.latest=["next",a],i.notify("next",a),_t(i.observers,"next",a))},error:function(a){var s=i.sub;s!==null&&(s&&setTimeout(function(){return s.unsubscribe()}),i.sub=null,i.latest=["error",a],i.reject(a),i.notify("error",a),_t(i.observers,"error",a))},complete:function(){var a=i,s=a.sub,n=a.sources,l=n===void 0?[]:n;if(s!==null){var d=l.shift();d?da(d)?d.then(function(u){return i.sub=u.subscribe(i.handlers)},i.handlers.error):i.sub=d.subscribe(i.handlers):(s&&setTimeout(function(){return s.unsubscribe()}),i.sub=null,i.latest&&i.latest[0]==="next"?i.resolve(i.latest[1]):i.resolve(),i.notify("complete"),_t(i.observers,"complete"))}}},i.nextResultListeners=new Set,i.cancel=function(a){i.reject(a),i.sources=[],i.handlers.error(a)},i.promise.catch(function(a){}),typeof r=="function"&&(r=[new N(r)]),da(r)?r.then(function(a){return i.start(a)},i.handlers.error):i.start(r),i}return e.prototype.start=function(r){this.sub===void 0&&(this.sources=Array.from(r),this.handlers.complete())},e.prototype.deliverLastMessage=function(r){if(this.latest){var i=this.latest[0],a=r[i];a&&a.call(r,this.latest[1]),this.sub===null&&i==="next"&&r.complete&&r.complete()}},e.prototype.addObserver=function(r){this.observers.has(r)||(this.deliverLastMessage(r),this.observers.add(r))},e.prototype.removeObserver=function(r){this.observers.delete(r)&&this.observers.size<1&&this.handlers.complete()},e.prototype.notify=function(r,i){var a=this.nextResultListeners;a.size&&(this.nextResultListeners=new Set,a.forEach(function(s){return s(r,i)}))},e.prototype.beforeNext=function(r){var i=!1;this.nextResultListeners.add(function(a,s){i||(i=!0,r(a,s))})},e})(N);zs(Me);function We(t){return"incremental"in t}function Ql(t){return"hasNext"in t&&"data"in t}function Hl(t){return We(t)||Ql(t)}function Yl(t){return E(t)&&"payload"in t}function xs(t,e){var r=t,i=new $e;return We(e)&&ne(e.incremental)&&e.incremental.forEach(function(a){for(var s=a.data,n=a.path,l=n.length-1;l>=0;--l){var d=n[l],u=!isNaN(+d),c=u?[]:{};c[d]=s,s=c}r=i.merge(r,s)}),r}function Et(t){var e=Kr(t);return ne(e)}function Kr(t){var e=ne(t.errors)?t.errors.slice(0):[];return We(t)&&ne(t.incremental)&&t.incremental.forEach(function(r){r.errors&&e.push.apply(e,r.errors)}),e}function Xe(){for(var t=[],e=0;e<arguments.length;e++)t[e]=arguments[e];var r=Object.create(null);return t.forEach(function(i){i&&Object.keys(i).forEach(function(a){var s=i[a];s!==void 0&&(r[a]=s)})}),r}function Tr(t,e){return Xe(t,e,e.variables&&{variables:Xe(y(y({},t&&t.variables),e.variables))})}function Ar(t){return new N(function(e){e.error(t)})}var Ls=function(t,e,r){var i=new Error(r);throw i.name="ServerError",i.response=t,i.statusCode=t.status,i.result=e,i};function Kl(t){for(var e=["query","operationName","variables","extensions","context"],r=0,i=Object.keys(t);r<i.length;r++){var a=i[r];if(e.indexOf(a)<0)throw Y(46,a)}return t}function Jl(t,e){var r=y({},t),i=function(s){typeof s=="function"?r=y(y({},r),s(r)):r=y(y({},r),s)},a=function(){return y({},r)};return Object.defineProperty(e,"setContext",{enumerable:!1,value:i}),Object.defineProperty(e,"getContext",{enumerable:!1,value:a}),e}function Zl(t){var e={variables:t.variables||{},extensions:t.extensions||{},operationName:t.operationName,query:t.query};return e.operationName||(e.operationName=typeof e.query!="string"?ct(e.query)||void 0:""),e}function Xl(t,e){var r=y({},t),i=new Set(Object.keys(t));return re(e,{Variable:function(a,s,n){n&&n.kind!=="VariableDefinition"&&i.delete(a.name.value)}}),i.forEach(function(a){delete r[a]}),r}function ua(t,e){return e?e(t):N.of()}function nt(t){return typeof t=="function"?new it(t):t}function St(t){return t.request.length<=1}var it=(function(){function t(e){e&&(this.request=e)}return t.empty=function(){return new t(function(){return N.of()})},t.from=function(e){return e.length===0?t.empty():e.map(nt).reduce(function(r,i){return r.concat(i)})},t.split=function(e,r,i){var a=nt(r),s=nt(i||new t(ua)),n;return St(a)&&St(s)?n=new t(function(l){return e(l)?a.request(l)||N.of():s.request(l)||N.of()}):n=new t(function(l,d){return e(l)?a.request(l,d)||N.of():s.request(l,d)||N.of()}),Object.assign(n,{left:a,right:s})},t.execute=function(e,r){return e.request(Jl(r.context,Zl(Kl(r))))||N.of()},t.concat=function(e,r){var i=nt(e);if(St(i))return globalThis.__DEV__!==!1&&w.warn(38,i),i;var a=nt(r),s;return St(a)?s=new t(function(n){return i.request(n,function(l){return a.request(l)||N.of()})||N.of()}):s=new t(function(n,l){return i.request(n,function(d){return a.request(d,l)||N.of()})||N.of()}),Object.assign(s,{left:i,right:a})},t.prototype.split=function(e,r,i){return this.concat(t.split(e,r,i||new t(ua)))},t.prototype.concat=function(e){return t.concat(this,e)},t.prototype.request=function(e,r){throw Y(39)},t.prototype.onError=function(e,r){if(r&&r.error)return r.error(e),!1;throw e},t.prototype.setOnError=function(e){return this.onError=e,this},t})(),Jr=it.execute;function ed(t){var e,r=t[Symbol.asyncIterator]();return e={next:function(){return r.next()}},e[Symbol.asyncIterator]=function(){return this},e}function td(t){var e=null,r=null,i=!1,a=[],s=[];function n(m){if(!r){if(s.length){var p=s.shift();if(Array.isArray(p)&&p[0])return p[0]({value:m,done:!1})}a.push(m)}}function l(m){r=m;var p=s.slice();p.forEach(function(_){_[1](m)}),!e||e()}function d(){i=!0;var m=s.slice();m.forEach(function(p){p[0]({value:void 0,done:!0})}),!e||e()}e=function(){e=null,t.removeListener("data",n),t.removeListener("error",l),t.removeListener("end",d),t.removeListener("finish",d),t.removeListener("close",d)},t.on("data",n),t.on("error",l),t.on("end",d),t.on("finish",d),t.on("close",d);function u(){return new Promise(function(m,p){if(r)return p(r);if(a.length)return m({value:a.shift(),done:!1});if(i)return m({value:void 0,done:!0});s.push([m,p])})}var c={next:function(){return u()}};return er&&(c[Symbol.asyncIterator]=function(){return this}),c}function rd(t){var e=!1,r={next:function(){return e?Promise.resolve({value:void 0,done:!0}):(e=!0,new Promise(function(i,a){t.then(function(s){i({value:s,done:!1})}).catch(a)}))}};return er&&(r[Symbol.asyncIterator]=function(){return this}),r}function ca(t){var e={next:function(){return t.read()}};return er&&(e[Symbol.asyncIterator]=function(){return this}),e}function id(t){return!!t.body}function ad(t){return!!t.getReader}function sd(t){return!!(er&&t[Symbol.asyncIterator])}function nd(t){return!!t.stream}function od(t){return!!t.arrayBuffer}function ld(t){return!!t.pipe}function dd(t){var e=t;if(id(t)&&(e=t.body),sd(e))return ed(e);if(ad(e))return ca(e.getReader());if(nd(e))return ca(e.stream().getReader());if(od(e))return rd(e.arrayBuffer());if(ld(e))return td(e);throw new Error("Unknown body type for responseIterator. Please pass a streamable response.")}var Si=Symbol();function ud(t){return t.extensions?Array.isArray(t.extensions[Si]):!1}function Gs(t){return t.hasOwnProperty("graphQLErrors")}var cd=function(t){var e=H(H(H([],t.graphQLErrors,!0),t.clientErrors,!0),t.protocolErrors,!0);return t.networkError&&e.push(t.networkError),e.map(function(r){return E(r)&&r.message||"Error message not found."}).join(`
`)},Se=(function(t){Z(e,t);function e(r){var i=r.graphQLErrors,a=r.protocolErrors,s=r.clientErrors,n=r.networkError,l=r.errorMessage,d=r.extraInfo,u=t.call(this,l)||this;return u.name="ApolloError",u.graphQLErrors=i||[],u.protocolErrors=a||[],u.clientErrors=s||[],u.networkError=n||null,u.message=l||cd(u),u.extraInfo=d,u.cause=H(H(H([n],i||[],!0),a||[],!0),s||[],!0).find(function(c){return!!c})||null,u.__proto__=e.prototype,u}return e})(Error),pa=Object.prototype.hasOwnProperty;function pd(t,e){return ye(this,void 0,void 0,function(){var r,i,a,s,n,l,d,u,c,m,p,_,f,g,I,h,A,b,C,v,P,k,U,F;return he(this,function(z){switch(z.label){case 0:if(TextDecoder===void 0)throw new Error("TextDecoder must be defined in the environment: please import a polyfill.");r=new TextDecoder("utf-8"),i=(F=t.headers)===null||F===void 0?void 0:F.get("content-type"),a="boundary=",s=i?.includes(a)?i?.substring(i?.indexOf(a)+a.length).replace(/['"]/g,"").replace(/\;(.*)/gm,"").trim():"-",n=`\r
--`.concat(s),l="",d=dd(t),u=!0,z.label=1;case 1:return u?[4,d.next()]:[3,3];case 2:for(c=z.sent(),m=c.value,p=c.done,_=typeof m=="string"?m:r.decode(m),f=l.length-n.length+1,u=!p,l+=_,g=l.indexOf(n,f);g>-1;){if(I=void 0,k=[l.slice(0,g),l.slice(g+n.length)],I=k[0],l=k[1],h=I.indexOf(`\r
\r
`),A=md(I.slice(0,h)),b=A["content-type"],b&&b.toLowerCase().indexOf("application/json")===-1)throw new Error("Unsupported patch content type: application/json is required.");if(C=I.slice(h),C){if(v=js(t,C),Object.keys(v).length>1||"data"in v||"incremental"in v||"errors"in v||"payload"in v)if(Yl(v)){if(P={},"payload"in v){if(Object.keys(v).length===1&&v.payload===null)return[2];P=y({},v.payload)}"errors"in v&&(P=y(y({},P),{extensions:y(y({},"extensions"in P?P.extensions:null),(U={},U[Si]=v.errors,U))})),e(P)}else e(v);else if(Object.keys(v).length===1&&"hasNext"in v&&!v.hasNext)return[2]}g=l.indexOf(n)}return[3,1];case 3:return[2]}})})}function md(t){var e={};return t.split(`
`).forEach(function(r){var i=r.indexOf(":");if(i>-1){var a=r.slice(0,i).trim().toLowerCase(),s=r.slice(i+1).trim();e[a]=s}}),e}function js(t,e){if(t.status>=300){var r=function(){try{return JSON.parse(e)}catch{return e}};Ls(t,r(),"Response not successful: Received status code ".concat(t.status))}try{return JSON.parse(e)}catch(a){var i=a;throw i.name="ServerParseError",i.response=t,i.statusCode=t.status,i.bodyText=e,i}}function _d(t,e){t.result&&t.result.errors&&t.result.data&&e.next(t.result),e.error(t)}function fd(t){return function(e){return e.text().then(function(r){return js(e,r)}).then(function(r){return!Array.isArray(r)&&!pa.call(r,"data")&&!pa.call(r,"errors")&&Ls(e,r,"Server response was missing for query '".concat(Array.isArray(t)?t.map(function(i){return i.operationName}):t.operationName,"'.")),r})}}var Zr=function(t,e){var r;try{r=JSON.stringify(t)}catch(a){var i=Y(42,e,a.message);throw i.parseError=a,i}return r},yd={includeQuery:!0,includeExtensions:!1,preserveHeaderCase:!1},hd={accept:"*/*","content-type":"application/json"},gd={method:"POST"},Id={http:yd,headers:hd,options:gd},bd=function(t,e){return e(t)};function Td(t,e){for(var r=[],i=2;i<arguments.length;i++)r[i-2]=arguments[i];var a={},s={};r.forEach(function(m){a=y(y(y({},a),m.options),{headers:y(y({},a.headers),m.headers)}),m.credentials&&(a.credentials=m.credentials),s=y(y({},s),m.http)}),a.headers&&(a.headers=Ad(a.headers,s.preserveHeaderCase));var n=t.operationName,l=t.extensions,d=t.variables,u=t.query,c={operationName:n,variables:d};return s.includeExtensions&&(c.extensions=l),s.includeQuery&&(c.query=e(u,le)),{options:a,body:c}}function Ad(t,e){if(!e){var r={};return Object.keys(Object(t)).forEach(function(s){r[s.toLowerCase()]=t[s]}),r}var i={};Object.keys(Object(t)).forEach(function(s){i[s.toLowerCase()]={originalName:s,value:t[s]}});var a={};return Object.keys(i).forEach(function(s){a[i[s].originalName]=i[s].value}),a}var Cd=function(t){if(!t&&typeof fetch>"u")throw Y(40)},vd=function(t,e){var r=t.getContext(),i=r.uri;return i||(typeof e=="function"?e(t):e||"/graphql")};function $d(t,e){var r=[],i=function(m,p){r.push("".concat(m,"=").concat(encodeURIComponent(p)))};if("query"in e&&i("query",e.query),e.operationName&&i("operationName",e.operationName),e.variables){var a=void 0;try{a=Zr(e.variables,"Variables map")}catch(m){return{parseError:m}}i("variables",a)}if(e.extensions){var s=void 0;try{s=Zr(e.extensions,"Extensions map")}catch(m){return{parseError:m}}i("extensions",s)}var n="",l=t,d=t.indexOf("#");d!==-1&&(n=t.substr(d),l=t.substr(0,d));var u=l.indexOf("?")===-1?"?":"&",c=l+u+r.join("&")+n;return{newURI:c}}var ma=ee(function(){return fetch}),Dd=function(t){t===void 0&&(t={});var e=t.uri,r=e===void 0?"/graphql":e,i=t.fetch,a=t.print,s=a===void 0?bd:a,n=t.includeExtensions,l=t.preserveHeaderCase,d=t.useGETForQueries,u=t.includeUnusedVariables,c=u===void 0?!1:u,m=de(t,["uri","fetch","print","includeExtensions","preserveHeaderCase","useGETForQueries","includeUnusedVariables"]);globalThis.__DEV__!==!1&&Cd(i||ma);var p={http:{includeExtensions:n,preserveHeaderCase:l},options:m.fetchOptions,credentials:m.credentials,headers:m.headers};return new it(function(_){var f=vd(_,r),g=_.getContext(),I={};if(g.clientAwareness){var h=g.clientAwareness,A=h.name,b=h.version;A&&(I["apollographql-client-name"]=A),b&&(I["apollographql-client-version"]=b)}var C=y(y({},I),g.headers),v={http:g.http,options:g.fetchOptions,credentials:g.credentials,headers:C};if(It(["client"],_.query)){var P=vi(_.query);if(!P)return Ar(new Error("HttpLink: Trying to send a client-only query to the server. To send to the server, ensure a non-client field is added to the query or set the `transformOptions.removeClientFields` option to `true`."));_.query=P}var k=Td(_,s,Id,p,v),U=k.options,F=k.body;F.variables&&!c&&(F.variables=Xl(F.variables,_.query));var z;!U.signal&&typeof AbortController<"u"&&(z=new AbortController,U.signal=z.signal);var ie=function(K){return K.kind==="OperationDefinition"&&K.operation==="mutation"},qe=function(K){return K.kind==="OperationDefinition"&&K.operation==="subscription"},W=qe(vt(_.query)),_e=It(["defer"],_.query);if(d&&!_.query.definitions.some(ie)&&(U.method="GET"),_e||W){U.headers=U.headers||{};var cr="multipart/mixed;";W&&_e&&globalThis.__DEV__!==!1&&w.warn(41),W?cr+="boundary=graphql;subscriptionSpec=1.0,application/json":_e&&(cr+="deferSpec=20220824,application/json"),U.headers.accept=cr}if(U.method==="GET"){var Ei=$d(f,F),Un=Ei.newURI,Mi=Ei.parseError;if(Mi)return Ar(Mi);f=Un}else try{U.body=Zr(F,"Payload")}catch(K){return Ar(K)}return new N(function(K){var On=i||ee(function(){return fetch})||ma,zi=K.next.bind(K);return On(f,U).then(function(Ne){var pr;_.setContext({response:Ne});var xi=(pr=Ne.headers)===null||pr===void 0?void 0:pr.get("content-type");return xi!==null&&/^multipart\/mixed/i.test(xi)?pd(Ne,zi):fd(_)(Ne).then(zi)}).then(function(){z=void 0,K.complete()}).catch(function(Ne){z=void 0,_d(Ne,K)}),function(){z&&z.abort()}})})},Pd=(function(t){Z(e,t);function e(r){r===void 0&&(r={});var i=t.call(this,Dd(r).request)||this;return i.options=r,i}return e})(it);const{toString:_a,hasOwnProperty:wd}=Object.prototype,fa=Function.prototype.toString,Xr=new Map;function q(t,e){try{return ei(t,e)}finally{Xr.clear()}}function ei(t,e){if(t===e)return!0;const r=_a.call(t),i=_a.call(e);if(r!==i)return!1;switch(r){case"[object Array]":if(t.length!==e.length)return!1;case"[object Object]":{if(ha(t,e))return!0;const a=ya(t),s=ya(e),n=a.length;if(n!==s.length)return!1;for(let l=0;l<n;++l)if(!wd.call(e,a[l]))return!1;for(let l=0;l<n;++l){const d=a[l];if(!ei(t[d],e[d]))return!1}return!0}case"[object Error]":return t.name===e.name&&t.message===e.message;case"[object Number]":if(t!==t)return e!==e;case"[object Boolean]":case"[object Date]":return+t==+e;case"[object RegExp]":case"[object String]":return t==`${e}`;case"[object Map]":case"[object Set]":{if(t.size!==e.size)return!1;if(ha(t,e))return!0;const a=t.entries(),s=r==="[object Map]";for(;;){const n=a.next();if(n.done)break;const[l,d]=n.value;if(!e.has(l)||s&&!ei(d,e.get(l)))return!1}return!0}case"[object Uint16Array]":case"[object Uint8Array]":case"[object Uint32Array]":case"[object Int32Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object ArrayBuffer]":t=new Uint8Array(t),e=new Uint8Array(e);case"[object DataView]":{let a=t.byteLength;if(a===e.byteLength)for(;a--&&t[a]===e[a];);return a===-1}case"[object AsyncFunction]":case"[object GeneratorFunction]":case"[object AsyncGeneratorFunction]":case"[object Function]":{const a=fa.call(t);return a!==fa.call(e)?!1:!kd(a,Sd)}}return!1}function ya(t){return Object.keys(t).filter(Rd,t)}function Rd(t){return this[t]!==void 0}const Sd="{ [native code] }";function kd(t,e){const r=t.length-e.length;return r>=0&&t.indexOf(e,r)===r}function ha(t,e){let r=Xr.get(t);if(r){if(r.has(e))return!0}else Xr.set(t,r=new Set);return r.add(e),!1}function Vs(t,e,r,i){var a=e.data,s=de(e,["data"]),n=r.data,l=de(r,["data"]);return q(s,l)&&Mt(vt(t).selectionSet,a,n,{fragmentMap:tt(rt(t)),variables:i})}function Mt(t,e,r,i){if(e===r)return!0;var a=new Set;return t.selections.every(function(s){if(a.has(s)||(a.add(s),!Ct(s,i.variables))||ga(s))return!0;if(Ae(s)){var n=ce(s),l=e&&e[n],d=r&&r[n],u=s.selectionSet;if(!u)return q(l,d);var c=Array.isArray(l),m=Array.isArray(d);if(c!==m)return!1;if(c&&m){var p=l.length;if(d.length!==p)return!1;for(var _=0;_<p;++_)if(!Mt(u,l[_],d[_],i))return!1;return!0}return Mt(u,l,d,i)}else{var f=tr(s,i.fragmentMap);if(f)return ga(f)?!0:Mt(f.selectionSet,e,r,i)}})}function ga(t){return!!t.directives&&t.directives.some(Ud)}function Ud(t){return t.name.value==="nonreactive"}var Ws=Oe?WeakMap:Map,Qs=gi?WeakSet:Set,ki=new $t,Ia=!1;function Hs(){Ia||(Ia=!0,globalThis.__DEV__!==!1&&w.warn(52))}function Ys(t,e,r){return ki.withValue(!0,function(){var i=pt(t,e,r,!1);return Object.isFrozen(t)&&Qt(i),i})}function Od(t,e){if(e.has(t))return e.get(t);var r=Array.isArray(t)?[]:Object.create(null);return e.set(t,r),r}function pt(t,e,r,i,a){var s,n=r.knownChanged,l=Od(t,r.mutableTargets);if(Array.isArray(t)){for(var d=0,u=Array.from(t.entries());d<u.length;d++){var c=u[d],m=c[0],p=c[1];if(p===null){l[m]=null;continue}var _=pt(p,e,r,i,globalThis.__DEV__!==!1?"".concat(a||"","[").concat(m,"]"):void 0);n.has(_)&&n.add(l),l[m]=_}return n.has(l)?l:t}for(var f=0,g=e.selections;f<g.length;f++){var I=g[f],h=void 0;if(i&&n.add(l),I.kind===$.FIELD){var A=ce(I),b=I.selectionSet;if(h=l[A]||t[A],h===void 0)continue;if(b&&h!==null){var _=pt(t[A],b,r,i,globalThis.__DEV__!==!1?"".concat(a||"",".").concat(A):void 0);n.has(_)&&(h=_)}globalThis.__DEV__===!1&&(l[A]=h),globalThis.__DEV__!==!1&&(i&&A!=="__typename"&&!(!((s=Object.getOwnPropertyDescriptor(l,A))===null||s===void 0)&&s.value)?Object.defineProperty(l,A,Bd(A,h,a||"",r.operationName,r.operationType)):(delete l[A],l[A]=h))}if(I.kind===$.INLINE_FRAGMENT&&(!I.typeCondition||r.cache.fragmentMatches(I,t.__typename))&&(h=pt(t,I.selectionSet,r,i,a)),I.kind===$.FRAGMENT_SPREAD){var C=I.name.value,v=r.fragmentMap[C]||(r.fragmentMap[C]=r.cache.lookupFragment(C));w(v,47,C);var P=Uo(I);P!=="mask"&&(h=pt(t,v.selectionSet,r,P==="migrate",a))}n.has(h)&&n.add(l)}return"__typename"in t&&!("__typename"in l)&&(l.__typename=t.__typename),Object.keys(l).length!==Object.keys(t).length&&n.add(l),n.has(l)?l:t}function Bd(t,e,r,i,a){var s=function(){return ki.getValue()||(globalThis.__DEV__!==!1&&w.warn(48,i?"".concat(a," '").concat(i,"'"):"anonymous ".concat(a),"".concat(r,".").concat(t).replace(/^\./,"")),s=function(){return e}),e};return{get:function(){return s()},set:function(n){s=function(){return n}},enumerable:!0,configurable:!0}}function Ks(t,e,r,i){if(!r.fragmentMatches)return globalThis.__DEV__!==!1&&Hs(),t;var a=e.definitions.filter(function(n){return n.kind===$.FRAGMENT_DEFINITION});typeof i>"u"&&(w(a.length===1,49,a.length),i=a[0].name.value);var s=a.find(function(n){return n.name.value===i});return w(!!s,50,i),t==null||q(t,{})?t:Ys(t,s.selectionSet,{operationType:"fragment",operationName:s.name.value,fragmentMap:tt(rt(e)),cache:r,mutableTargets:new Ws,knownChanged:new Qs})}function qd(t,e,r){var i;if(!r.fragmentMatches)return globalThis.__DEV__!==!1&&Hs(),t;var a=Ce(e);return w(a,51),t==null?t:Ys(t,a.selectionSet,{operationType:a.operation,operationName:(i=a.name)===null||i===void 0?void 0:i.value,fragmentMap:tt(rt(e)),cache:r,mutableTargets:new Ws,knownChanged:new Qs})}var Js=(function(){function t(){this.assumeImmutableResults=!1,this.getFragmentDoc=Tt(Mo,{max:ue["cache.fragmentQueryDocuments"]||1e3,cache:Vt})}return t.prototype.lookupFragment=function(e){return null},t.prototype.batch=function(e){var r=this,i=typeof e.optimistic=="string"?e.optimistic:e.optimistic===!1?null:void 0,a;return this.performTransaction(function(){return a=e.update(r)},i),a},t.prototype.recordOptimisticTransaction=function(e,r){this.performTransaction(e,r)},t.prototype.transformDocument=function(e){return e},t.prototype.transformForLink=function(e){return e},t.prototype.identify=function(e){},t.prototype.gc=function(){return[]},t.prototype.modify=function(e){return!1},t.prototype.readQuery=function(e,r){return r===void 0&&(r=!!e.optimistic),this.read(y(y({},e),{rootId:e.id||"ROOT_QUERY",optimistic:r}))},t.prototype.watchFragment=function(e){var r=this,i=e.fragment,a=e.fragmentName,s=e.from,n=e.optimistic,l=n===void 0?!0:n,d=de(e,["fragment","fragmentName","from","optimistic"]),u=this.getFragmentDoc(i,a),c=typeof s>"u"||typeof s=="string"?s:this.identify(s),m=!!e[Symbol.for("apollo.dataMasking")];if(globalThis.__DEV__!==!1){var p=a||Cs(i).name.value;c||globalThis.__DEV__!==!1&&w.warn(1,p)}var _=y(y({},d),{returnPartialData:!0,id:c,query:u,optimistic:l}),f;return new N(function(g){return r.watch(y(y({},_),{immediate:!0,callback:function(I){var h=m?Ks(I.result,i,r,a):I.result;if(!(f&&Vs(u,{data:f.result},{data:h},e.variables))){var A={data:h,complete:!!I.complete};I.missing&&(A.missing=or(I.missing.map(function(b){return b.missing}))),f=y(y({},I),{result:h}),g.next(A)}}}))})},t.prototype.readFragment=function(e,r){return r===void 0&&(r=!!e.optimistic),this.read(y(y({},e),{query:this.getFragmentDoc(e.fragment,e.fragmentName),rootId:e.id,optimistic:r}))},t.prototype.writeQuery=function(e){var r=e.id,i=e.data,a=de(e,["id","data"]);return this.write(Object.assign(a,{dataId:r||"ROOT_QUERY",result:i}))},t.prototype.writeFragment=function(e){var r=e.id,i=e.data,a=e.fragment,s=e.fragmentName,n=de(e,["id","data","fragment","fragmentName"]);return this.write(Object.assign(n,{query:this.getFragmentDoc(a,s),dataId:r,result:i}))},t.prototype.updateQuery=function(e,r){return this.batch({update:function(i){var a=i.readQuery(e),s=r(a);return s==null?a:(i.writeQuery(y(y({},e),{data:s})),s)}})},t.prototype.updateFragment=function(e,r){return this.batch({update:function(i){var a=i.readFragment(e),s=r(a);return s==null?a:(i.writeFragment(y(y({},e),{data:s})),s)}})},t})();globalThis.__DEV__!==!1&&(Js.prototype.getMemoryInternals=Jo);var Zs=(function(t){Z(e,t);function e(r,i,a,s){var n,l=t.call(this,r)||this;if(l.message=r,l.path=i,l.query=a,l.variables=s,Array.isArray(l.path)){l.missing=l.message;for(var d=l.path.length-1;d>=0;--d)l.missing=(n={},n[l.path[d]]=l.missing,n)}else l.missing=l.path;return l.__proto__=e.prototype,l}return e})(Error),V=Object.prototype.hasOwnProperty;function ot(t){return t==null}function Xs(t,e){var r=t.__typename,i=t.id,a=t._id;if(typeof r=="string"&&(e&&(e.keyObject=ot(i)?ot(a)?void 0:{_id:a}:{id:i}),ot(i)&&!ot(a)&&(i=a),!ot(i)))return"".concat(r,":").concat(typeof i=="number"||typeof i=="string"?i:JSON.stringify(i))}var en={dataIdFromObject:Xs,addTypename:!0,resultCaching:!0,canonizeResults:!1};function Nd(t){return Xe(en,t)}function tn(t){var e=t.canonizeResults;return e===void 0?en.canonizeResults:e}function Fd(t,e){return B(e)?t.get(e.__ref,"__typename"):e&&e.__typename}var rn=/^[_a-z][_0-9a-z]*/i;function De(t){var e=t.match(rn);return e?e[0]:t}function ti(t,e,r){return E(e)?M(e)?e.every(function(i){return ti(t,i,r)}):t.selections.every(function(i){if(Ae(i)&&Ct(i,r)){var a=ce(i);return V.call(e,a)&&(!i.selectionSet||ti(i.selectionSet,e[a],r))}return!0}):!1}function Le(t){return E(t)&&!B(t)&&!M(t)}function Ed(){return new $e}function an(t,e){var r=tt(rt(t));return{fragmentMap:r,lookupFragment:function(i){var a=r[i];return!a&&e&&(a=e.lookup(i)),a||null}}}var zt=Object.create(null),Cr=function(){return zt},ba=Object.create(null),At=(function(){function t(e,r){var i=this;this.policies=e,this.group=r,this.data=Object.create(null),this.rootIds=Object.create(null),this.refs=Object.create(null),this.getFieldValue=function(a,s){return Qt(B(a)?i.get(a.__ref,s):a&&a[s])},this.canRead=function(a){return B(a)?i.has(a.__ref):typeof a=="object"},this.toReference=function(a,s){if(typeof a=="string")return Ve(a);if(B(a))return a;var n=i.policies.identify(a)[0];if(n){var l=Ve(n);return s&&i.merge(n,a),l}}}return t.prototype.toObject=function(){return y({},this.data)},t.prototype.has=function(e){return this.lookup(e,!0)!==void 0},t.prototype.get=function(e,r){if(this.group.depend(e,r),V.call(this.data,e)){var i=this.data[e];if(i&&V.call(i,r))return i[r]}if(r==="__typename"&&V.call(this.policies.rootTypenamesById,e))return this.policies.rootTypenamesById[e];if(this instanceof fe)return this.parent.get(e,r)},t.prototype.lookup=function(e,r){if(r&&this.group.depend(e,"__exists"),V.call(this.data,e))return this.data[e];if(this instanceof fe)return this.parent.lookup(e,r);if(this.policies.rootTypenamesById[e])return Object.create(null)},t.prototype.merge=function(e,r){var i=this,a;B(e)&&(e=e.__ref),B(r)&&(r=r.__ref);var s=typeof e=="string"?this.lookup(a=e):e,n=typeof r=="string"?this.lookup(a=r):r;if(n){w(typeof a=="string",2);var l=new $e(zd).merge(s,n);if(this.data[a]=l,l!==s&&(delete this.refs[a],this.group.caching)){var d=Object.create(null);s||(d.__exists=1),Object.keys(n).forEach(function(u){if(!s||s[u]!==l[u]){d[u]=1;var c=De(u);c!==u&&!i.policies.hasKeyArgs(l.__typename,c)&&(d[c]=1),l[u]===void 0&&!(i instanceof fe)&&delete l[u]}}),d.__typename&&!(s&&s.__typename)&&this.policies.rootTypenamesById[a]===l.__typename&&delete d.__typename,Object.keys(d).forEach(function(u){return i.group.dirty(a,u)})}}},t.prototype.modify=function(e,r){var i=this,a=this.lookup(e);if(a){var s=Object.create(null),n=!1,l=!0,d={DELETE:zt,INVALIDATE:ba,isReference:B,toReference:this.toReference,canRead:this.canRead,readField:function(u,c){return i.policies.readField(typeof u=="string"?{fieldName:u,from:c||Ve(e)}:u,{store:i})}};if(Object.keys(a).forEach(function(u){var c=De(u),m=a[u];if(m!==void 0){var p=typeof r=="function"?r:r[u]||r[c];if(p){var _=p===Cr?zt:p(Qt(m),y(y({},d),{fieldName:c,storeFieldName:u,storage:i.getStorage(e,u)}));if(_===ba)i.group.dirty(e,u);else if(_===zt&&(_=void 0),_!==m&&(s[u]=_,n=!0,m=_,globalThis.__DEV__!==!1)){var f=function(v){if(i.lookup(v.__ref)===void 0)return globalThis.__DEV__!==!1&&w.warn(3,v),!0};if(B(_))f(_);else if(Array.isArray(_))for(var g=!1,I=void 0,h=0,A=_;h<A.length;h++){var b=A[h];if(B(b)){if(g=!0,f(b))break}else if(typeof b=="object"&&b){var C=i.policies.identify(b)[0];C&&(I=b)}if(g&&I!==void 0){globalThis.__DEV__!==!1&&w.warn(4,I);break}}}}m!==void 0&&(l=!1)}}),n)return this.merge(e,s),l&&(this instanceof fe?this.data[e]=void 0:delete this.data[e],this.group.dirty(e,"__exists")),!0}return!1},t.prototype.delete=function(e,r,i){var a,s=this.lookup(e);if(s){var n=this.getFieldValue(s,"__typename"),l=r&&i?this.policies.getStoreFieldName({typename:n,fieldName:r,args:i}):r;return this.modify(e,l?(a={},a[l]=Cr,a):Cr)}return!1},t.prototype.evict=function(e,r){var i=!1;return e.id&&(V.call(this.data,e.id)&&(i=this.delete(e.id,e.fieldName,e.args)),this instanceof fe&&this!==r&&(i=this.parent.evict(e,r)||i),(e.fieldName||i)&&this.group.dirty(e.id,e.fieldName||"__exists")),i},t.prototype.clear=function(){this.replace(null)},t.prototype.extract=function(){var e=this,r=this.toObject(),i=[];return this.getRootIdSet().forEach(function(a){V.call(e.policies.rootTypenamesById,a)||i.push(a)}),i.length&&(r.__META={extraRootIds:i.sort()}),r},t.prototype.replace=function(e){var r=this;if(Object.keys(this.data).forEach(function(s){e&&V.call(e,s)||r.delete(s)}),e){var i=e.__META,a=de(e,["__META"]);Object.keys(a).forEach(function(s){r.merge(s,a[s])}),i&&i.extraRootIds.forEach(this.retain,this)}},t.prototype.retain=function(e){return this.rootIds[e]=(this.rootIds[e]||0)+1},t.prototype.release=function(e){if(this.rootIds[e]>0){var r=--this.rootIds[e];return r||delete this.rootIds[e],r}return 0},t.prototype.getRootIdSet=function(e){return e===void 0&&(e=new Set),Object.keys(this.rootIds).forEach(e.add,e),this instanceof fe?this.parent.getRootIdSet(e):Object.keys(this.policies.rootTypenamesById).forEach(e.add,e),e},t.prototype.gc=function(){var e=this,r=this.getRootIdSet(),i=this.toObject();r.forEach(function(n){V.call(i,n)&&(Object.keys(e.findChildRefIds(n)).forEach(r.add,r),delete i[n])});var a=Object.keys(i);if(a.length){for(var s=this;s instanceof fe;)s=s.parent;a.forEach(function(n){return s.delete(n)})}return a},t.prototype.findChildRefIds=function(e){if(!V.call(this.refs,e)){var r=this.refs[e]=Object.create(null),i=this.data[e];if(!i)return r;var a=new Set([i]);a.forEach(function(s){B(s)&&(r[s.__ref]=!0),E(s)&&Object.keys(s).forEach(function(n){var l=s[n];E(l)&&a.add(l)})})}return this.refs[e]},t.prototype.makeCacheKey=function(){return this.group.keyMaker.lookupArray(arguments)},t})(),sn=(function(){function t(e,r){r===void 0&&(r=null),this.caching=e,this.parent=r,this.d=null,this.resetCaching()}return t.prototype.resetCaching=function(){this.d=this.caching?Bs():null,this.keyMaker=new me(Oe)},t.prototype.depend=function(e,r){if(this.d){this.d(vr(e,r));var i=De(r);i!==r&&this.d(vr(e,i)),this.parent&&this.parent.depend(e,r)}},t.prototype.dirty=function(e,r){this.d&&this.d.dirty(vr(e,r),r==="__exists"?"forget":"setDirty")},t})();function vr(t,e){return e+"#"+t}function Ta(t,e){ft(t)&&t.group.depend(e,"__exists")}(function(t){var e=(function(r){Z(i,r);function i(a){var s=a.policies,n=a.resultCaching,l=n===void 0?!0:n,d=a.seed,u=r.call(this,s,new sn(l))||this;return u.stump=new Md(u),u.storageTrie=new me(Oe),d&&u.replace(d),u}return i.prototype.addLayer=function(a,s){return this.stump.addLayer(a,s)},i.prototype.removeLayer=function(){return this},i.prototype.getStorage=function(){return this.storageTrie.lookupArray(arguments)},i})(t);t.Root=e})(At||(At={}));var fe=(function(t){Z(e,t);function e(r,i,a,s){var n=t.call(this,i.policies,s)||this;return n.id=r,n.parent=i,n.replay=a,n.group=s,a(n),n}return e.prototype.addLayer=function(r,i){return new e(r,this,i,this.group)},e.prototype.removeLayer=function(r){var i=this,a=this.parent.removeLayer(r);return r===this.id?(this.group.caching&&Object.keys(this.data).forEach(function(s){var n=i.data[s],l=a.lookup(s);l?n?n!==l&&Object.keys(n).forEach(function(d){q(n[d],l[d])||i.group.dirty(s,d)}):(i.group.dirty(s,"__exists"),Object.keys(l).forEach(function(d){i.group.dirty(s,d)})):i.delete(s)}),a):a===this.parent?this:a.addLayer(this.id,this.replay)},e.prototype.toObject=function(){return y(y({},this.parent.toObject()),this.data)},e.prototype.findChildRefIds=function(r){var i=this.parent.findChildRefIds(r);return V.call(this.data,r)?y(y({},i),t.prototype.findChildRefIds.call(this,r)):i},e.prototype.getStorage=function(){for(var r=this.parent;r.parent;)r=r.parent;return r.getStorage.apply(r,arguments)},e})(At),Md=(function(t){Z(e,t);function e(r){return t.call(this,"EntityStore.Stump",r,function(){},new sn(r.group.caching,r.group))||this}return e.prototype.removeLayer=function(){return this},e.prototype.merge=function(r,i){return this.parent.merge(r,i)},e})(fe);function zd(t,e,r){var i=t[r],a=e[r];return q(i,a)?i:a}function ft(t){return!!(t instanceof At&&t.group.caching)}function xd(t){return E(t)?M(t)?t.slice(0):y({__proto__:Object.getPrototypeOf(t)},t):t}var Aa=(function(){function t(){this.known=new(gi?WeakSet:Set),this.pool=new me(Oe),this.passes=new WeakMap,this.keysByJSON=new Map,this.empty=this.admit({})}return t.prototype.isKnown=function(e){return E(e)&&this.known.has(e)},t.prototype.pass=function(e){if(E(e)){var r=xd(e);return this.passes.set(r,e),r}return e},t.prototype.admit=function(e){var r=this;if(E(e)){var i=this.passes.get(e);if(i)return i;var a=Object.getPrototypeOf(e);switch(a){case Array.prototype:{if(this.known.has(e))return e;var s=e.map(this.admit,this),n=this.pool.lookupArray(s);return n.array||(this.known.add(n.array=s),globalThis.__DEV__!==!1&&Object.freeze(s)),n.array}case null:case Object.prototype:{if(this.known.has(e))return e;var l=Object.getPrototypeOf(e),d=[l],u=this.sortedKeys(e);d.push(u.json);var c=d.length;u.sorted.forEach(function(_){d.push(r.admit(e[_]))});var n=this.pool.lookupArray(d);if(!n.object){var m=n.object=Object.create(l);this.known.add(m),u.sorted.forEach(function(_,f){m[_]=d[c+f]}),globalThis.__DEV__!==!1&&Object.freeze(m)}return n.object}}}return e},t.prototype.sortedKeys=function(e){var r=Object.keys(e),i=this.pool.lookupArray(r);if(!i.keys){r.sort();var a=JSON.stringify(r);(i.keys=this.keysByJSON.get(a))||this.keysByJSON.set(a,i.keys={sorted:r,json:a})}return i.keys},t})();function Ca(t){return[t.selectionSet,t.objectOrReference,t.context,t.context.canonizeResults]}var Ld=(function(){function t(e){var r=this;this.knownResults=new(Oe?WeakMap:Map),this.config=Xe(e,{addTypename:e.addTypename!==!1,canonizeResults:tn(e)}),this.canon=e.canon||new Aa,this.executeSelectionSet=Tt(function(i){var a,s=i.context.canonizeResults,n=Ca(i);n[3]=!s;var l=(a=r.executeSelectionSet).peek.apply(a,n);return l?s?y(y({},l),{result:r.canon.admit(l.result)}):l:(Ta(i.context.store,i.enclosingRef.__ref),r.execSelectionSetImpl(i))},{max:this.config.resultCacheMaxSize||ue["inMemoryCache.executeSelectionSet"]||5e4,keyArgs:Ca,makeCacheKey:function(i,a,s,n){if(ft(s.store))return s.store.makeCacheKey(i,B(a)?a.__ref:a,s.varString,n)}}),this.executeSubSelectedArray=Tt(function(i){return Ta(i.context.store,i.enclosingRef.__ref),r.execSubSelectedArrayImpl(i)},{max:this.config.resultCacheMaxSize||ue["inMemoryCache.executeSubSelectedArray"]||1e4,makeCacheKey:function(i){var a=i.field,s=i.array,n=i.context;if(ft(n.store))return n.store.makeCacheKey(a,s,n.varString)}})}return t.prototype.resetCanon=function(){this.canon=new Aa},t.prototype.diffQueryAgainstStore=function(e){var r=e.store,i=e.query,a=e.rootId,s=a===void 0?"ROOT_QUERY":a,n=e.variables,l=e.returnPartialData,d=l===void 0?!0:l,u=e.canonizeResults,c=u===void 0?this.config.canonizeResults:u,m=this.config.cache.policies;n=y(y({},ir(As(i))),n);var p=Ve(s),_=this.executeSelectionSet({selectionSet:vt(i).selectionSet,objectOrReference:p,enclosingRef:p,context:y({store:r,query:i,policies:m,variables:n,varString:be(n),canonizeResults:c},an(i,this.config.fragments))}),f;if(_.missing&&(f=[new Zs(Gd(_.missing),_.missing,i,n)],!d))throw f[0];return{result:_.result,complete:!f,missing:f}},t.prototype.isFresh=function(e,r,i,a){if(ft(a.store)&&this.knownResults.get(e)===i){var s=this.executeSelectionSet.peek(i,r,a,this.canon.isKnown(e));if(s&&e===s.result)return!0}return!1},t.prototype.execSelectionSetImpl=function(e){var r=this,i=e.selectionSet,a=e.objectOrReference,s=e.enclosingRef,n=e.context;if(B(a)&&!n.policies.rootTypenamesById[a.__ref]&&!n.store.has(a.__ref))return{result:this.canon.empty,missing:"Dangling reference to missing ".concat(a.__ref," object")};var l=n.variables,d=n.policies,u=n.store,c=u.getFieldValue(a,"__typename"),m=[],p,_=new $e;this.config.addTypename&&typeof c=="string"&&!d.rootIdsByTypename[c]&&m.push({__typename:c});function f(b,C){var v;return b.missing&&(p=_.merge(p,(v={},v[C]=b.missing,v))),b.result}var g=new Set(i.selections);g.forEach(function(b){var C,v;if(Ct(b,l))if(Ae(b)){var P=d.readField({fieldName:b.name.value,field:b,variables:n.variables,from:a},n),k=ce(b);P===void 0?nr.added(b)||(p=_.merge(p,(C={},C[k]="Can't find field '".concat(b.name.value,"' on ").concat(B(a)?a.__ref+" object":"object "+JSON.stringify(a,null,2)),C))):M(P)?P.length>0&&(P=f(r.executeSubSelectedArray({field:b,array:P,enclosingRef:s,context:n}),k)):b.selectionSet?P!=null&&(P=f(r.executeSelectionSet({selectionSet:b.selectionSet,objectOrReference:P,enclosingRef:B(P)?P:s,context:n}),k)):n.canonizeResults&&(P=r.canon.pass(P)),P!==void 0&&m.push((v={},v[k]=P,v))}else{var U=tr(b,n.lookupFragment);if(!U&&b.kind===$.FRAGMENT_SPREAD)throw Y(10,b.name.value);U&&d.fragmentMatches(U,c)&&U.selectionSet.selections.forEach(g.add,g)}});var I=or(m),h={result:I,missing:p},A=n.canonizeResults?this.canon.admit(h):Qt(h);return A.result&&this.knownResults.set(A.result,i),A},t.prototype.execSubSelectedArrayImpl=function(e){var r=this,i=e.field,a=e.array,s=e.enclosingRef,n=e.context,l,d=new $e;function u(c,m){var p;return c.missing&&(l=d.merge(l,(p={},p[m]=c.missing,p))),c.result}return i.selectionSet&&(a=a.filter(n.store.canRead)),a=a.map(function(c,m){return c===null?null:M(c)?u(r.executeSubSelectedArray({field:i,array:c,enclosingRef:s,context:n}),m):i.selectionSet?u(r.executeSelectionSet({selectionSet:i.selectionSet,objectOrReference:c,enclosingRef:B(c)?c:s,context:n}),m):(globalThis.__DEV__!==!1&&jd(n.store,i,c),c)}),{result:n.canonizeResults?this.canon.admit(a):a,missing:l}},t})();function Gd(t){try{JSON.stringify(t,function(e,r){if(typeof r=="string")throw r;return r})}catch(e){return e}}function jd(t,e,r){if(!e.selectionSet){var i=new Set([r]);i.forEach(function(a){E(a)&&(w(!B(a),11,Fd(t,a),e.name.value),Object.values(a).forEach(i.add,i))})}}var Ui=new $t,va=new WeakMap;function yt(t){var e=va.get(t);return e||va.set(t,e={vars:new Set,dep:Bs()}),e}function $a(t){yt(t).vars.forEach(function(e){return e.forgetCache(t)})}function Vd(t){yt(t).vars.forEach(function(e){return e.attachCache(t)})}function Wd(t){var e=new Set,r=new Set,i=function(s){if(arguments.length>0){if(t!==s){t=s,e.forEach(function(d){yt(d).dep.dirty(i),Qd(d)});var n=Array.from(r);r.clear(),n.forEach(function(d){return d(t)})}}else{var l=Ui.getValue();l&&(a(l),yt(l).dep(i))}return t};i.onNextChange=function(s){return r.add(s),function(){r.delete(s)}};var a=i.attachCache=function(s){return e.add(s),yt(s).vars.add(i),i};return i.forgetCache=function(s){return e.delete(s)},i}function Qd(t){t.broadcastWatches&&t.broadcastWatches()}var Da=Object.create(null);function Oi(t){var e=JSON.stringify(t);return Da[e]||(Da[e]=Object.create(null))}function Pa(t){var e=Oi(t);return e.keyFieldsFn||(e.keyFieldsFn=function(r,i){var a=function(n,l){return i.readField(l,n)},s=i.keyObject=Bi(t,function(n){var l=Qe(i.storeObject,n,a);return l===void 0&&r!==i.storeObject&&V.call(r,n[0])&&(l=Qe(r,n,on)),w(l!==void 0,5,n.join("."),r),l});return"".concat(i.typename,":").concat(JSON.stringify(s))})}function wa(t){var e=Oi(t);return e.keyArgsFn||(e.keyArgsFn=function(r,i){var a=i.field,s=i.variables,n=i.fieldName,l=Bi(t,function(u){var c=u[0],m=c.charAt(0);if(m==="@"){if(a&&ne(a.directives)){var p=c.slice(1),_=a.directives.find(function(h){return h.name.value===p}),f=_&&rr(_,s);return f&&Qe(f,u.slice(1))}return}if(m==="$"){var g=c.slice(1);if(s&&V.call(s,g)){var I=u.slice(0);return I[0]=g,Qe(s,I)}return}if(r)return Qe(r,u)}),d=JSON.stringify(l);return(r||d!=="{}")&&(n+=":"+d),n})}function Bi(t,e){var r=new $e;return nn(t).reduce(function(i,a){var s,n=e(a);if(n!==void 0){for(var l=a.length-1;l>=0;--l)n=(s={},s[a[l]]=n,s);i=r.merge(i,n)}return i},Object.create(null))}function nn(t){var e=Oi(t);if(!e.paths){var r=e.paths=[],i=[];t.forEach(function(a,s){M(a)?(nn(a).forEach(function(n){return r.push(i.concat(n))}),i.length=0):(i.push(a),M(t[s+1])||(r.push(i.slice(0)),i.length=0))})}return e.paths}function on(t,e){return t[e]}function Qe(t,e,r){return r=r||on,ln(e.reduce(function i(a,s){return M(a)?a.map(function(n){return i(n,s)}):a&&r(a,s)},t))}function ln(t){return E(t)?M(t)?t.map(ln):Bi(Object.keys(t).sort(),function(e){return Qe(t,e)}):t}function ri(t){return t.args!==void 0?t.args:t.field?rr(t.field,t.variables):null}var Hd=function(){},Ra=function(t,e){return e.fieldName},Sa=function(t,e,r){var i=r.mergeObjects;return i(t,e)},ka=function(t,e){return e},Yd=(function(){function t(e){this.config=e,this.typePolicies=Object.create(null),this.toBeAdded=Object.create(null),this.supertypeMap=new Map,this.fuzzySubtypes=new Map,this.rootIdsByTypename=Object.create(null),this.rootTypenamesById=Object.create(null),this.usingPossibleTypes=!1,this.config=y({dataIdFromObject:Xs},e),this.cache=this.config.cache,this.setRootTypename("Query"),this.setRootTypename("Mutation"),this.setRootTypename("Subscription"),e.possibleTypes&&this.addPossibleTypes(e.possibleTypes),e.typePolicies&&this.addTypePolicies(e.typePolicies)}return t.prototype.identify=function(e,r){var i,a=this,s=r&&(r.typename||((i=r.storeObject)===null||i===void 0?void 0:i.__typename))||e.__typename;if(s===this.rootTypenamesById.ROOT_QUERY)return["ROOT_QUERY"];var n=r&&r.storeObject||e,l=y(y({},r),{typename:s,storeObject:n,readField:r&&r.readField||function(){var m=qi(arguments,n);return a.readField(m,{store:a.cache.data,variables:m.variables})}}),d,u=s&&this.getTypePolicy(s),c=u&&u.keyFn||this.config.dataIdFromObject;return ki.withValue(!0,function(){for(;c;){var m=c(y(y({},e),n),l);if(M(m))c=Pa(m);else{d=m;break}}}),d=d?String(d):void 0,l.keyObject?[d,l.keyObject]:[d]},t.prototype.addTypePolicies=function(e){var r=this;Object.keys(e).forEach(function(i){var a=e[i],s=a.queryType,n=a.mutationType,l=a.subscriptionType,d=de(a,["queryType","mutationType","subscriptionType"]);s&&r.setRootTypename("Query",i),n&&r.setRootTypename("Mutation",i),l&&r.setRootTypename("Subscription",i),V.call(r.toBeAdded,i)?r.toBeAdded[i].push(d):r.toBeAdded[i]=[d]})},t.prototype.updateTypePolicy=function(e,r){var i=this,a=this.getTypePolicy(e),s=r.keyFields,n=r.fields;function l(d,u){d.merge=typeof u=="function"?u:u===!0?Sa:u===!1?ka:d.merge}l(a,r.merge),a.keyFn=s===!1?Hd:M(s)?Pa(s):typeof s=="function"?s:a.keyFn,n&&Object.keys(n).forEach(function(d){var u=i.getFieldPolicy(e,d,!0),c=n[d];if(typeof c=="function")u.read=c;else{var m=c.keyArgs,p=c.read,_=c.merge;u.keyFn=m===!1?Ra:M(m)?wa(m):typeof m=="function"?m:u.keyFn,typeof p=="function"&&(u.read=p),l(u,_)}u.read&&u.merge&&(u.keyFn=u.keyFn||Ra)})},t.prototype.setRootTypename=function(e,r){r===void 0&&(r=e);var i="ROOT_"+e.toUpperCase(),a=this.rootTypenamesById[i];r!==a&&(w(!a||a===e,6,e),a&&delete this.rootIdsByTypename[a],this.rootIdsByTypename[r]=i,this.rootTypenamesById[i]=r)},t.prototype.addPossibleTypes=function(e){var r=this;this.usingPossibleTypes=!0,Object.keys(e).forEach(function(i){r.getSupertypeSet(i,!0),e[i].forEach(function(a){r.getSupertypeSet(a,!0).add(i);var s=a.match(rn);(!s||s[0]!==a)&&r.fuzzySubtypes.set(a,new RegExp(a))})})},t.prototype.getTypePolicy=function(e){var r=this;if(!V.call(this.typePolicies,e)){var i=this.typePolicies[e]=Object.create(null);i.fields=Object.create(null);var a=this.supertypeMap.get(e);!a&&this.fuzzySubtypes.size&&(a=this.getSupertypeSet(e,!0),this.fuzzySubtypes.forEach(function(n,l){if(n.test(e)){var d=r.supertypeMap.get(l);d&&d.forEach(function(u){return a.add(u)})}})),a&&a.size&&a.forEach(function(n){var l=r.getTypePolicy(n),d=l.fields,u=de(l,["fields"]);Object.assign(i,u),Object.assign(i.fields,d)})}var s=this.toBeAdded[e];return s&&s.length&&s.splice(0).forEach(function(n){r.updateTypePolicy(e,n)}),this.typePolicies[e]},t.prototype.getFieldPolicy=function(e,r,i){if(e){var a=this.getTypePolicy(e).fields;return a[r]||i&&(a[r]=Object.create(null))}},t.prototype.getSupertypeSet=function(e,r){var i=this.supertypeMap.get(e);return!i&&r&&this.supertypeMap.set(e,i=new Set),i},t.prototype.fragmentMatches=function(e,r,i,a){var s=this;if(!e.typeCondition)return!0;if(!r)return!1;var n=e.typeCondition.name.value;if(r===n)return!0;if(this.usingPossibleTypes&&this.supertypeMap.has(n))for(var l=this.getSupertypeSet(r,!0),d=[l],u=function(f){var g=s.getSupertypeSet(f,!1);g&&g.size&&d.indexOf(g)<0&&d.push(g)},c=!!(i&&this.fuzzySubtypes.size),m=!1,p=0;p<d.length;++p){var _=d[p];if(_.has(n))return l.has(n)||(m&&globalThis.__DEV__!==!1&&w.warn(7,r,n),l.add(n)),!0;_.forEach(u),c&&p===d.length-1&&ti(e.selectionSet,i,a)&&(c=!1,m=!0,this.fuzzySubtypes.forEach(function(f,g){var I=r.match(f);I&&I[0]===r&&u(g)}))}return!1},t.prototype.hasKeyArgs=function(e,r){var i=this.getFieldPolicy(e,r,!1);return!!(i&&i.keyFn)},t.prototype.getStoreFieldName=function(e){var r=e.typename,i=e.fieldName,a=this.getFieldPolicy(r,i,!1),s,n=a&&a.keyFn;if(n&&r)for(var l={typename:r,fieldName:i,field:e.field||null,variables:e.variables},d=ri(e);n;){var u=n(d,l);if(M(u))n=wa(u);else{s=u||i;break}}return s===void 0&&(s=e.field?_l(e.field,e.variables):Ts(i,ri(e))),s===!1?i:i===De(s)?s:i+":"+s},t.prototype.readField=function(e,r){var i=e.from;if(i){var a=e.field||e.fieldName;if(a){if(e.typename===void 0){var s=r.store.getFieldValue(i,"__typename");s&&(e.typename=s)}var n=this.getStoreFieldName(e),l=De(n),d=r.store.getFieldValue(i,n),u=this.getFieldPolicy(e.typename,l,!1),c=u&&u.read;if(c){var m=Ua(this,i,e,r,r.store.getStorage(B(i)?i.__ref:i,n));return Ui.withValue(this.cache,c,[d,m])}return d}}},t.prototype.getReadFunction=function(e,r){var i=this.getFieldPolicy(e,r,!1);return i&&i.read},t.prototype.getMergeFunction=function(e,r,i){var a=this.getFieldPolicy(e,r,!1),s=a&&a.merge;return!s&&i&&(a=this.getTypePolicy(i),s=a&&a.merge),s},t.prototype.runMergeFunction=function(e,r,i,a,s){var n=i.field,l=i.typename,d=i.merge;return d===Sa?dn(a.store)(e,r):d===ka?r:(a.overwrite&&(e=void 0),d(e,r,Ua(this,void 0,{typename:l,fieldName:n.name.value,field:n,variables:a.variables},a,s||Object.create(null))))},t})();function Ua(t,e,r,i,a){var s=t.getStoreFieldName(r),n=De(s),l=r.variables||i.variables,d=i.store,u=d.toReference,c=d.canRead;return{args:ri(r),field:r.field||null,fieldName:n,storeFieldName:s,variables:l,isReference:B,toReference:u,storage:a,cache:t.cache,canRead:c,readField:function(){return t.readField(qi(arguments,e,l),i)},mergeObjects:dn(i.store)}}function qi(t,e,r){var i=t[0],a=t[1],s=t.length,n;return typeof i=="string"?n={fieldName:i,from:s>1?a:e}:(n=y({},i),V.call(n,"from")||(n.from=e)),globalThis.__DEV__!==!1&&n.from===void 0&&globalThis.__DEV__!==!1&&w.warn(8,rs(Array.from(t))),n.variables===void 0&&(n.variables=r),n}function dn(t){return function(r,i){if(M(r)||M(i))throw Y(9);if(E(r)&&E(i)){var a=t.getFieldValue(r,"__typename"),s=t.getFieldValue(i,"__typename"),n=a&&s&&a!==s;if(n)return i;if(B(r)&&Le(i))return t.merge(r.__ref,i),r;if(Le(r)&&B(i))return t.merge(r,i.__ref),i;if(Le(r)&&Le(i))return y(y({},r),i)}return i}}function $r(t,e,r){var i="".concat(e).concat(r),a=t.flavors.get(i);return a||t.flavors.set(i,a=t.clientOnly===e&&t.deferred===r?t:y(y({},t),{clientOnly:e,deferred:r})),a}var Kd=(function(){function t(e,r,i){this.cache=e,this.reader=r,this.fragments=i}return t.prototype.writeToStore=function(e,r){var i=this,a=r.query,s=r.result,n=r.dataId,l=r.variables,d=r.overwrite,u=Ce(a),c=Ed();l=y(y({},ir(u)),l);var m=y(y({store:e,written:Object.create(null),merge:function(_,f){return c.merge(_,f)},variables:l,varString:be(l)},an(a,this.fragments)),{overwrite:!!d,incomingById:new Map,clientOnly:!1,deferred:!1,flavors:new Map}),p=this.processSelectionSet({result:s||Object.create(null),dataId:n,selectionSet:u.selectionSet,mergeTree:{map:new Map},context:m});if(!B(p))throw Y(12,s);return m.incomingById.forEach(function(_,f){var g=_.storeObject,I=_.mergeTree,h=_.fieldNodeSet,A=Ve(f);if(I&&I.map.size){var b=i.applyMerges(I,A,g,m);if(B(b))return;g=b}if(globalThis.__DEV__!==!1&&!m.overwrite){var C=Object.create(null);h.forEach(function(k){k.selectionSet&&(C[k.name.value]=!0)});var v=function(k){return C[De(k)]===!0},P=function(k){var U=I&&I.map.get(k);return!!(U&&U.info&&U.info.merge)};Object.keys(g).forEach(function(k){v(k)&&!P(k)&&Jd(A,g,k,m.store)})}e.merge(f,g)}),e.retain(p.__ref),p},t.prototype.processSelectionSet=function(e){var r=this,i=e.dataId,a=e.result,s=e.selectionSet,n=e.context,l=e.mergeTree,d=this.cache.policies,u=Object.create(null),c=i&&d.rootTypenamesById[i]||Wr(a,s,n.fragmentMap)||i&&n.store.get(i,"__typename");typeof c=="string"&&(u.__typename=c);var m=function(){var b=qi(arguments,u,n.variables);if(B(b.from)){var C=n.incomingById.get(b.from.__ref);if(C){var v=d.readField(y(y({},b),{from:C.storeObject}),n);if(v!==void 0)return v}}return d.readField(b,n)},p=new Set;this.flattenFields(s,a,n,c).forEach(function(b,C){var v,P=ce(C),k=a[P];if(p.add(C),k!==void 0){var U=d.getStoreFieldName({typename:c,fieldName:C.name.value,field:C,variables:b.variables}),F=Oa(l,U),z=r.processFieldValue(k,C,C.selectionSet?$r(b,!1,!1):b,F),ie=void 0;C.selectionSet&&(B(z)||Le(z))&&(ie=m("__typename",z));var qe=d.getMergeFunction(c,C.name.value,ie);qe?F.info={field:C,typename:c,merge:qe}:Ba(l,U),u=b.merge(u,(v={},v[U]=z,v))}else globalThis.__DEV__!==!1&&!b.clientOnly&&!b.deferred&&!nr.added(C)&&!d.getReadFunction(c,C.name.value)&&globalThis.__DEV__!==!1&&w.error(13,ce(C),a)});try{var _=d.identify(a,{typename:c,selectionSet:s,fragmentMap:n.fragmentMap,storeObject:u,readField:m}),f=_[0],g=_[1];i=i||f,g&&(u=n.merge(u,g))}catch(b){if(!i)throw b}if(typeof i=="string"){var I=Ve(i),h=n.written[i]||(n.written[i]=[]);if(h.indexOf(s)>=0||(h.push(s),this.reader&&this.reader.isFresh(a,I,s,n)))return I;var A=n.incomingById.get(i);return A?(A.storeObject=n.merge(A.storeObject,u),A.mergeTree=ii(A.mergeTree,l),p.forEach(function(b){return A.fieldNodeSet.add(b)})):n.incomingById.set(i,{storeObject:u,mergeTree:Ht(l)?void 0:l,fieldNodeSet:p}),I}return u},t.prototype.processFieldValue=function(e,r,i,a){var s=this;return!r.selectionSet||e===null?globalThis.__DEV__!==!1?Ri(e):e:M(e)?e.map(function(n,l){var d=s.processFieldValue(n,r,i,Oa(a,l));return Ba(a,l),d}):this.processSelectionSet({result:e,selectionSet:r.selectionSet,context:i,mergeTree:a})},t.prototype.flattenFields=function(e,r,i,a){a===void 0&&(a=Wr(r,e,i.fragmentMap));var s=new Map,n=this.cache.policies,l=new me(!1);return(function d(u,c){var m=l.lookup(u,c.clientOnly,c.deferred);m.visited||(m.visited=!0,u.selections.forEach(function(p){if(Ct(p,i.variables)){var _=c.clientOnly,f=c.deferred;if(!(_&&f)&&ne(p.directives)&&p.directives.forEach(function(h){var A=h.name.value;if(A==="client"&&(_=!0),A==="defer"){var b=rr(h,i.variables);(!b||b.if!==!1)&&(f=!0)}}),Ae(p)){var g=s.get(p);g&&(_=_&&g.clientOnly,f=f&&g.deferred),s.set(p,$r(i,_,f))}else{var I=tr(p,i.lookupFragment);if(!I&&p.kind===$.FRAGMENT_SPREAD)throw Y(14,p.name.value);I&&n.fragmentMatches(I,a,r,i.variables)&&d(I.selectionSet,$r(i,_,f))}}}))})(e,i),s},t.prototype.applyMerges=function(e,r,i,a,s){var n,l=this;if(e.map.size&&!B(i)){var d=!M(i)&&(B(r)||Le(r))?r:void 0,u=i;d&&!s&&(s=[B(d)?d.__ref:d]);var c,m=function(p,_){return M(p)?typeof _=="number"?p[_]:void 0:a.store.getFieldValue(p,String(_))};e.map.forEach(function(p,_){var f=m(d,_),g=m(u,_);if(g!==void 0){s&&s.push(_);var I=l.applyMerges(p,f,g,a,s);I!==g&&(c=c||new Map,c.set(_,I)),s&&w(s.pop()===_)}}),c&&(i=M(u)?u.slice(0):y({},u),c.forEach(function(p,_){i[_]=p}))}return e.info?this.cache.policies.runMergeFunction(r,i,e.info,a,s&&(n=a.store).getStorage.apply(n,s)):i},t})(),un=[];function Oa(t,e){var r=t.map;return r.has(e)||r.set(e,un.pop()||{map:new Map}),r.get(e)}function ii(t,e){if(t===e||!e||Ht(e))return t;if(!t||Ht(t))return e;var r=t.info&&e.info?y(y({},t.info),e.info):t.info||e.info,i=t.map.size&&e.map.size,a=i?new Map:t.map.size?t.map:e.map,s={info:r,map:a};if(i){var n=new Set(e.map.keys());t.map.forEach(function(l,d){s.map.set(d,ii(l,e.map.get(d))),n.delete(d)}),n.forEach(function(l){s.map.set(l,ii(e.map.get(l),t.map.get(l)))})}return s}function Ht(t){return!t||!(t.info||t.map.size)}function Ba(t,e){var r=t.map,i=r.get(e);i&&Ht(i)&&(un.push(i),r.delete(e))}var qa=new Set;function Jd(t,e,r,i){var a=function(m){var p=i.getFieldValue(m,r);return typeof p=="object"&&p},s=a(t);if(s){var n=a(e);if(n&&!B(s)&&!q(s,n)&&!Object.keys(s).every(function(m){return i.getFieldValue(n,m)!==void 0})){var l=i.getFieldValue(t,"__typename")||i.getFieldValue(e,"__typename"),d=De(r),u="".concat(l,".").concat(d);if(!qa.has(u)){qa.add(u);var c=[];!M(s)&&!M(n)&&[s,n].forEach(function(m){var p=i.getFieldValue(m,"__typename");typeof p=="string"&&!c.includes(p)&&c.push(p)}),globalThis.__DEV__!==!1&&w.warn(15,d,l,c.length?"either ensure all objects of type "+c.join(" and ")+" have an ID or a custom merge function, or ":"",u,y({},s),y({},n))}}}}var cn=(function(t){Z(e,t);function e(r){r===void 0&&(r={});var i=t.call(this)||this;return i.watches=new Set,i.addTypenameTransform=new qs(nr),i.assumeImmutableResults=!0,i.makeVar=Wd,i.txCount=0,i.config=Nd(r),i.addTypename=!!i.config.addTypename,i.policies=new Yd({cache:i,dataIdFromObject:i.config.dataIdFromObject,possibleTypes:i.config.possibleTypes,typePolicies:i.config.typePolicies}),i.init(),i}return e.prototype.init=function(){var r=this.data=new At.Root({policies:this.policies,resultCaching:this.config.resultCaching});this.optimisticData=r.stump,this.resetResultCache()},e.prototype.resetResultCache=function(r){var i=this,a=this.storeReader,s=this.config.fragments;this.storeWriter=new Kd(this,this.storeReader=new Ld({cache:this,addTypename:this.addTypename,resultCacheMaxSize:this.config.resultCacheMaxSize,canonizeResults:tn(this.config),canon:r?void 0:a&&a.canon,fragments:s}),s),this.maybeBroadcastWatch=Tt(function(n,l){return i.broadcastWatch(n,l)},{max:this.config.resultCacheMaxSize||ue["inMemoryCache.maybeBroadcastWatch"]||5e3,makeCacheKey:function(n){var l=n.optimistic?i.optimisticData:i.data;if(ft(l)){var d=n.optimistic,u=n.id,c=n.variables;return l.makeCacheKey(n.query,n.callback,be({optimistic:d,id:u,variables:c}))}}}),new Set([this.data.group,this.optimisticData.group]).forEach(function(n){return n.resetCaching()})},e.prototype.restore=function(r){return this.init(),r&&this.data.replace(r),this},e.prototype.extract=function(r){return r===void 0&&(r=!1),(r?this.optimisticData:this.data).extract()},e.prototype.read=function(r){var i=r.returnPartialData,a=i===void 0?!1:i;try{return this.storeReader.diffQueryAgainstStore(y(y({},r),{store:r.optimistic?this.optimisticData:this.data,config:this.config,returnPartialData:a})).result||null}catch(s){if(s instanceof Zs)return null;throw s}},e.prototype.write=function(r){try{return++this.txCount,this.storeWriter.writeToStore(this.data,r)}finally{!--this.txCount&&r.broadcast!==!1&&this.broadcastWatches()}},e.prototype.modify=function(r){if(V.call(r,"id")&&!r.id)return!1;var i=r.optimistic?this.optimisticData:this.data;try{return++this.txCount,i.modify(r.id||"ROOT_QUERY",r.fields)}finally{!--this.txCount&&r.broadcast!==!1&&this.broadcastWatches()}},e.prototype.diff=function(r){return this.storeReader.diffQueryAgainstStore(y(y({},r),{store:r.optimistic?this.optimisticData:this.data,rootId:r.id||"ROOT_QUERY",config:this.config}))},e.prototype.watch=function(r){var i=this;return this.watches.size||Vd(this),this.watches.add(r),r.immediate&&this.maybeBroadcastWatch(r),function(){i.watches.delete(r)&&!i.watches.size&&$a(i),i.maybeBroadcastWatch.forget(r)}},e.prototype.gc=function(r){var i;be.reset(),le.reset(),this.addTypenameTransform.resetCache(),(i=this.config.fragments)===null||i===void 0||i.resetCaches();var a=this.optimisticData.gc();return r&&!this.txCount&&(r.resetResultCache?this.resetResultCache(r.resetResultIdentities):r.resetResultIdentities&&this.storeReader.resetCanon()),a},e.prototype.retain=function(r,i){return(i?this.optimisticData:this.data).retain(r)},e.prototype.release=function(r,i){return(i?this.optimisticData:this.data).release(r)},e.prototype.identify=function(r){if(B(r))return r.__ref;try{return this.policies.identify(r)[0]}catch(i){globalThis.__DEV__!==!1&&w.warn(i)}},e.prototype.evict=function(r){if(!r.id){if(V.call(r,"id"))return!1;r=y(y({},r),{id:"ROOT_QUERY"})}try{return++this.txCount,this.optimisticData.evict(r,this.data)}finally{!--this.txCount&&r.broadcast!==!1&&this.broadcastWatches()}},e.prototype.reset=function(r){var i=this;return this.init(),be.reset(),r&&r.discardWatches?(this.watches.forEach(function(a){return i.maybeBroadcastWatch.forget(a)}),this.watches.clear(),$a(this)):this.broadcastWatches(),Promise.resolve()},e.prototype.removeOptimistic=function(r){var i=this.optimisticData.removeLayer(r);i!==this.optimisticData&&(this.optimisticData=i,this.broadcastWatches())},e.prototype.batch=function(r){var i=this,a=r.update,s=r.optimistic,n=s===void 0?!0:s,l=r.removeOptimistic,d=r.onWatchUpdated,u,c=function(p){var _=i,f=_.data,g=_.optimisticData;++i.txCount,p&&(i.data=i.optimisticData=p);try{return u=a(i)}finally{--i.txCount,i.data=f,i.optimisticData=g}},m=new Set;return d&&!this.txCount&&this.broadcastWatches(y(y({},r),{onWatchUpdated:function(p){return m.add(p),!1}})),typeof n=="string"?this.optimisticData=this.optimisticData.addLayer(n,c):n===!1?c(this.data):c(),typeof l=="string"&&(this.optimisticData=this.optimisticData.removeLayer(l)),d&&m.size?(this.broadcastWatches(y(y({},r),{onWatchUpdated:function(p,_){var f=d.call(this,p,_);return f!==!1&&m.delete(p),f}})),m.size&&m.forEach(function(p){return i.maybeBroadcastWatch.dirty(p)})):this.broadcastWatches(r),u},e.prototype.performTransaction=function(r,i){return this.batch({update:r,optimistic:i||i!==null})},e.prototype.transformDocument=function(r){return this.addTypenameToDocument(this.addFragmentsToDocument(r))},e.prototype.fragmentMatches=function(r,i){return this.policies.fragmentMatches(r,i)},e.prototype.lookupFragment=function(r){var i;return((i=this.config.fragments)===null||i===void 0?void 0:i.lookup(r))||null},e.prototype.broadcastWatches=function(r){var i=this;this.txCount||this.watches.forEach(function(a){return i.maybeBroadcastWatch(a,r)})},e.prototype.addFragmentsToDocument=function(r){var i=this.config.fragments;return i?i.transform(r):r},e.prototype.addTypenameToDocument=function(r){return this.addTypename?this.addTypenameTransform.transformDocument(r):r},e.prototype.broadcastWatch=function(r,i){var a=r.lastDiff,s=this.diff(r);i&&(r.optimistic&&typeof i.optimistic=="string"&&(s.fromOptimisticTransaction=!0),i.onWatchUpdated&&i.onWatchUpdated.call(this,r,s,a)===!1)||(!a||!q(a.result,s.result))&&r.callback(r.lastDiff=s,a)},e})(Js);globalThis.__DEV__!==!1&&(cn.prototype.getMemoryInternals=Ko);var O;(function(t){t[t.loading=1]="loading",t[t.setVariables=2]="setVariables",t[t.fetchMore=3]="fetchMore",t[t.refetch=4]="refetch",t[t.poll=6]="poll",t[t.ready=7]="ready",t[t.error=8]="error"})(O||(O={}));function Ge(t){return t?t<7:!1}var Na=Object.assign,Zd=Object.hasOwnProperty,xt=(function(t){Z(e,t);function e(r){var i=r.queryManager,a=r.queryInfo,s=r.options,n=this,l=e.inactiveOnCreation.getValue();n=t.call(this,function(h){n._getOrCreateQuery();try{var A=h._subscription._observer;A&&!A.error&&(A.error=Xd)}catch{}var b=!n.observers.size;n.observers.add(h);var C=n.last;return C&&C.error?h.error&&h.error(C.error):C&&C.result&&h.next&&h.next(n.maskResult(C.result)),b&&n.reobserve().catch(function(){}),function(){n.observers.delete(h)&&!n.observers.size&&n.tearDownQuery()}})||this,n.observers=new Set,n.subscriptions=new Set,n.dirty=!1,n._getOrCreateQuery=function(){return l&&(i.queries.set(n.queryId,a),l=!1),n.queryManager.getOrCreateQuery(n.queryId)},n.queryInfo=a,n.queryManager=i,n.waitForOwnResult=Dr(s.fetchPolicy),n.isTornDown=!1,n.subscribeToMore=n.subscribeToMore.bind(n),n.maskResult=n.maskResult.bind(n);var d=i.defaultOptions.watchQuery,u=d===void 0?{}:d,c=u.fetchPolicy,m=c===void 0?"cache-first":c,p=s.fetchPolicy,_=p===void 0?m:p,f=s.initialFetchPolicy,g=f===void 0?_==="standby"?m:_:f;n.options=y(y({},s),{initialFetchPolicy:g,fetchPolicy:_}),n.queryId=a.queryId||i.generateQueryId();var I=Ce(n.query);return n.queryName=I&&I.name&&I.name.value,n}return Object.defineProperty(e.prototype,"query",{get:function(){return this.lastQuery||this.options.query},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"variables",{get:function(){return this.options.variables},enumerable:!1,configurable:!0}),e.prototype.result=function(){var r=this;return new Promise(function(i,a){var s={next:function(l){i(l),r.observers.delete(s),r.observers.size||r.queryManager.removeQuery(r.queryId),setTimeout(function(){n.unsubscribe()},0)},error:a},n=r.subscribe(s)})},e.prototype.resetDiff=function(){this.queryInfo.resetDiff()},e.prototype.getCurrentFullResult=function(r){r===void 0&&(r=!0);var i=this.getLastResult(!0),a=this.queryInfo.networkStatus||i&&i.networkStatus||O.ready,s=y(y({},i),{loading:Ge(a),networkStatus:a}),n=this.options.fetchPolicy,l=n===void 0?"cache-first":n;if(!(Dr(l)||this.queryManager.getDocumentInfo(this.query).hasForcedResolvers))if(this.waitForOwnResult)this.queryInfo.updateWatch();else{var d=this.queryInfo.getDiff();(d.complete||this.options.returnPartialData)&&(s.data=d.result),q(s.data,{})&&(s.data=void 0),d.complete?(delete s.partial,d.complete&&s.networkStatus===O.loading&&(l==="cache-first"||l==="cache-only")&&(s.networkStatus=O.ready,s.loading=!1)):s.partial=!0,s.networkStatus===O.ready&&(s.error||s.errors)&&(s.networkStatus=O.error),globalThis.__DEV__!==!1&&!d.complete&&!this.options.partialRefetch&&!s.loading&&!s.data&&!s.error&&pn(d.missing)}return r&&this.updateLastResult(s),s},e.prototype.getCurrentResult=function(r){return r===void 0&&(r=!0),this.maskResult(this.getCurrentFullResult(r))},e.prototype.isDifferentFromLastResult=function(r,i){if(!this.last)return!0;var a=this.queryManager.getDocumentInfo(this.query),s=this.queryManager.dataMasking,n=s?a.nonReactiveQuery:this.query,l=s||a.hasNonreactiveDirective?!Vs(n,this.last.result,r,this.variables):!q(this.last.result,r);return l||i&&!q(this.last.variables,i)},e.prototype.getLast=function(r,i){var a=this.last;if(a&&a[r]&&(!i||q(a.variables,this.variables)))return a[r]},e.prototype.getLastResult=function(r){return this.getLast("result",r)},e.prototype.getLastError=function(r){return this.getLast("error",r)},e.prototype.resetLastResults=function(){delete this.last,this.isTornDown=!1},e.prototype.resetQueryStoreErrors=function(){this.queryManager.resetErrors(this.queryId)},e.prototype.refetch=function(r){var i,a={pollInterval:0},s=this.options.fetchPolicy;if(s==="no-cache"?a.fetchPolicy="no-cache":a.fetchPolicy="network-only",globalThis.__DEV__!==!1&&r&&Zd.call(r,"variables")){var n=As(this.query),l=n.variableDefinitions;(!l||!l.some(function(d){return d.variable.name.value==="variables"}))&&globalThis.__DEV__!==!1&&w.warn(21,r,((i=n.name)===null||i===void 0?void 0:i.value)||n)}return r&&!q(this.options.variables,r)&&(a.variables=this.options.variables=y(y({},this.options.variables),r)),this.queryInfo.resetLastWrite(),this.reobserve(a,O.refetch)},e.prototype.fetchMore=function(r){var i=this,a=y(y({},r.query?r:y(y(y(y({},this.options),{query:this.options.query}),r),{variables:y(y({},this.options.variables),r.variables)})),{fetchPolicy:"no-cache"});a.query=this.transformDocument(a.query);var s=this.queryManager.generateQueryId();this.lastQuery=r.query?this.transformDocument(this.options.query):a.query;var n=this.queryInfo,l=n.networkStatus;n.networkStatus=O.fetchMore,a.notifyOnNetworkStatusChange&&this.observe();var d=new Set,u=r?.updateQuery,c=this.options.fetchPolicy!=="no-cache";return c||w(u,22),this.queryManager.fetchQuery(s,a,O.fetchMore).then(function(m){if(i.queryManager.removeQuery(s),n.networkStatus===O.fetchMore&&(n.networkStatus=l),c)i.queryManager.cache.batch({update:function(f){var g=r.updateQuery;g?f.updateQuery({query:i.query,variables:i.variables,returnPartialData:!0,optimistic:!1},function(I){return g(I,{fetchMoreResult:m.data,variables:a.variables})}):f.writeQuery({query:a.query,variables:a.variables,data:m.data})},onWatchUpdated:function(f){d.add(f.query)}});else{var p=i.getLast("result"),_=u(p.data,{fetchMoreResult:m.data,variables:a.variables});i.reportResult(y(y({},p),{networkStatus:l,loading:Ge(l),data:_}),i.variables)}return i.maskResult(m)}).finally(function(){c&&!d.has(i.query)&&i.reobserveCacheFirst()})},e.prototype.subscribeToMore=function(r){var i=this,a=this.queryManager.startGraphQLSubscription({query:r.document,variables:r.variables,context:r.context}).subscribe({next:function(s){var n=r.updateQuery;n&&i.updateQuery(function(l,d){return n(l,y({subscriptionData:s},d))})},error:function(s){if(r.onError){r.onError(s);return}globalThis.__DEV__!==!1&&w.error(23,s)}});return this.subscriptions.add(a),function(){i.subscriptions.delete(a)&&a.unsubscribe()}},e.prototype.setOptions=function(r){return this.reobserve(r)},e.prototype.silentSetOptions=function(r){var i=Xe(this.options,r||{});Na(this.options,i)},e.prototype.setVariables=function(r){return q(this.variables,r)?this.observers.size?this.result():Promise.resolve():(this.options.variables=r,this.observers.size?this.reobserve({fetchPolicy:this.options.initialFetchPolicy,variables:r},O.setVariables):Promise.resolve())},e.prototype.updateQuery=function(r){var i=this.queryManager,a=i.cache.diff({query:this.options.query,variables:this.variables,returnPartialData:!0,optimistic:!1}),s=a.result,n=a.complete,l=r(s,{variables:this.variables,complete:!!n,previousData:s});l&&(i.cache.writeQuery({query:this.options.query,data:l,variables:this.variables}),i.broadcastQueries())},e.prototype.startPolling=function(r){this.options.pollInterval=r,this.updatePolling()},e.prototype.stopPolling=function(){this.options.pollInterval=0,this.updatePolling()},e.prototype.applyNextFetchPolicy=function(r,i){if(i.nextFetchPolicy){var a=i.fetchPolicy,s=a===void 0?"cache-first":a,n=i.initialFetchPolicy,l=n===void 0?s:n;s==="standby"||(typeof i.nextFetchPolicy=="function"?i.fetchPolicy=i.nextFetchPolicy(s,{reason:r,options:i,observable:this,initialFetchPolicy:l}):r==="variables-changed"?i.fetchPolicy=l:i.fetchPolicy=i.nextFetchPolicy)}return i.fetchPolicy},e.prototype.fetch=function(r,i,a){var s=this._getOrCreateQuery();return s.setObservableQuery(this),this.queryManager.fetchConcastWithInfo(s,r,i,a)},e.prototype.updatePolling=function(){var r=this;if(!this.queryManager.ssrMode){var i=this,a=i.pollingInfo,s=i.options.pollInterval;if(!s||!this.hasObservers()){a&&(clearTimeout(a.timeout),delete this.pollingInfo);return}if(!(a&&a.interval===s)){w(s,24);var n=a||(this.pollingInfo={});n.interval=s;var l=function(){var u,c;r.pollingInfo&&(!Ge(r.queryInfo.networkStatus)&&!(!((c=(u=r.options).skipPollAttempt)===null||c===void 0)&&c.call(u))?r.reobserve({fetchPolicy:r.options.initialFetchPolicy==="no-cache"?"no-cache":"network-only"},O.poll).then(d,d):d())},d=function(){var u=r.pollingInfo;u&&(clearTimeout(u.timeout),u.timeout=setTimeout(l,u.interval))};d()}}},e.prototype.updateLastResult=function(r,i){i===void 0&&(i=this.variables);var a=this.getLastError();return a&&this.last&&!q(i,this.last.variables)&&(a=void 0),this.last=y({result:this.queryManager.assumeImmutableResults?r:Ri(r),variables:i},a?{error:a}:null)},e.prototype.reobserveAsConcast=function(r,i){var a=this;this.isTornDown=!1;var s=i===O.refetch||i===O.fetchMore||i===O.poll,n=this.options.variables,l=this.options.fetchPolicy,d=Xe(this.options,r||{}),u=s?d:Na(this.options,d),c=this.transformDocument(u.query);this.lastQuery=c,s||(this.updatePolling(),r&&r.variables&&!q(r.variables,n)&&u.fetchPolicy!=="standby"&&(u.fetchPolicy===l||typeof u.nextFetchPolicy=="function")&&(this.applyNextFetchPolicy("variables-changed",u),i===void 0&&(i=O.setVariables))),this.waitForOwnResult&&(this.waitForOwnResult=Dr(u.fetchPolicy));var m=function(){a.concast===f&&(a.waitForOwnResult=!1)},p=u.variables&&y({},u.variables),_=this.fetch(u,i,c),f=_.concast,g=_.fromLink,I={next:function(h){q(a.variables,p)&&(m(),a.reportResult(h,p))},error:function(h){q(a.variables,p)&&(Gs(h)||(h=new Se({networkError:h})),m(),a.reportError(h,p))}};return!s&&(g||!this.concast)&&(this.concast&&this.observer&&this.concast.removeObserver(this.observer),this.concast=f,this.observer=I),f.addObserver(I),f},e.prototype.reobserve=function(r,i){return Gl(this.reobserveAsConcast(r,i).promise.then(this.maskResult))},e.prototype.resubscribeAfterError=function(){for(var r=[],i=0;i<arguments.length;i++)r[i]=arguments[i];var a=this.last;this.resetLastResults();var s=this.subscribe.apply(this,r);return this.last=a,s},e.prototype.observe=function(){this.reportResult(this.getCurrentFullResult(!1),this.variables)},e.prototype.reportResult=function(r,i){var a=this.getLastError(),s=this.isDifferentFromLastResult(r,i);(a||!r.partial||this.options.returnPartialData)&&this.updateLastResult(r,i),(a||s)&&_t(this.observers,"next",this.maskResult(r))},e.prototype.reportError=function(r,i){var a=y(y({},this.getLastResult()),{error:r,errors:r.graphQLErrors,networkStatus:O.error,loading:!1});this.updateLastResult(a,i),_t(this.observers,"error",this.last.error=r)},e.prototype.hasObservers=function(){return this.observers.size>0},e.prototype.tearDownQuery=function(){this.isTornDown||(this.concast&&this.observer&&(this.concast.removeObserver(this.observer),delete this.concast,delete this.observer),this.stopPolling(),this.subscriptions.forEach(function(r){return r.unsubscribe()}),this.subscriptions.clear(),this.queryManager.stopQuery(this.queryId),this.observers.clear(),this.isTornDown=!0)},e.prototype.transformDocument=function(r){return this.queryManager.transform(r)},e.prototype.maskResult=function(r){return r&&"data"in r?y(y({},r),{data:this.queryManager.maskOperation({document:this.query,data:r.data,fetchPolicy:this.options.fetchPolicy,id:this.queryId})}):r},e.prototype.resetNotifications=function(){this.cancelNotifyTimeout(),this.dirty=!1},e.prototype.cancelNotifyTimeout=function(){this.notifyTimeout&&(clearTimeout(this.notifyTimeout),this.notifyTimeout=void 0)},e.prototype.scheduleNotify=function(){var r=this;this.dirty||(this.dirty=!0,this.notifyTimeout||(this.notifyTimeout=setTimeout(function(){return r.notify()},0)))},e.prototype.notify=function(){if(this.cancelNotifyTimeout(),this.dirty&&(this.options.fetchPolicy=="cache-only"||this.options.fetchPolicy=="cache-and-network"||!Ge(this.queryInfo.networkStatus))){var r=this.queryInfo.getDiff();r.fromOptimisticTransaction?this.observe():this.reobserveCacheFirst()}this.dirty=!1},e.prototype.reobserveCacheFirst=function(){var r=this.options,i=r.fetchPolicy,a=r.nextFetchPolicy;return i==="cache-and-network"||i==="network-only"?this.reobserve({fetchPolicy:"cache-first",nextFetchPolicy:function(s,n){return this.nextFetchPolicy=a,typeof this.nextFetchPolicy=="function"?this.nextFetchPolicy(s,n):i}}):this.reobserve()},e.inactiveOnCreation=new $t,e})(N);zs(xt);function Xd(t){globalThis.__DEV__!==!1&&w.error(25,t.message,t.stack)}function pn(t){globalThis.__DEV__!==!1&&t&&globalThis.__DEV__!==!1&&w.debug(26,t)}function Dr(t){return t==="network-only"||t==="no-cache"||t==="standby"}var je=new(Oe?WeakMap:Map);function Pr(t,e){var r=t[e];typeof r=="function"&&(t[e]=function(){return je.set(t,(je.get(t)+1)%1e15),r.apply(this,arguments)})}var wr=(function(){function t(e,r){r===void 0&&(r=e.generateQueryId()),this.queryId=r,this.document=null,this.lastRequestId=1,this.stopped=!1,this.observableQuery=null;var i=this.cache=e.cache;je.has(i)||(je.set(i,0),Pr(i,"evict"),Pr(i,"modify"),Pr(i,"reset"))}return t.prototype.init=function(e){var r=e.networkStatus||O.loading;return this.variables&&this.networkStatus!==O.loading&&!q(this.variables,e.variables)&&(r=O.setVariables),q(e.variables,this.variables)||(this.lastDiff=void 0,this.cancel()),Object.assign(this,{document:e.document,variables:e.variables,networkError:null,graphQLErrors:this.graphQLErrors||[],networkStatus:r}),e.observableQuery&&this.setObservableQuery(e.observableQuery),e.lastRequestId&&(this.lastRequestId=e.lastRequestId),this},t.prototype.resetDiff=function(){this.lastDiff=void 0},t.prototype.getDiff=function(){var e=this.getDiffOptions();if(this.lastDiff&&q(e,this.lastDiff.options))return this.lastDiff.diff;this.updateWatch(this.variables);var r=this.observableQuery;if(r&&r.options.fetchPolicy==="no-cache")return{complete:!1};var i=this.cache.diff(e);return this.updateLastDiff(i,e),i},t.prototype.updateLastDiff=function(e,r){this.lastDiff=e?{diff:e,options:r||this.getDiffOptions()}:void 0},t.prototype.getDiffOptions=function(e){var r;return e===void 0&&(e=this.variables),{query:this.document,variables:e,returnPartialData:!0,optimistic:!0,canonizeResults:(r=this.observableQuery)===null||r===void 0?void 0:r.options.canonizeResults}},t.prototype.setDiff=function(e){var r,i,a=this.lastDiff&&this.lastDiff.diff;e&&!e.complete&&(!((r=this.observableQuery)===null||r===void 0)&&r.getLastError())||(this.updateLastDiff(e),q(a&&a.result,e&&e.result)||(i=this.observableQuery)===null||i===void 0||i.scheduleNotify())},t.prototype.setObservableQuery=function(e){e!==this.observableQuery&&(this.observableQuery=e,e&&(e.queryInfo=this))},t.prototype.stop=function(){var e;if(!this.stopped){this.stopped=!0,(e=this.observableQuery)===null||e===void 0||e.resetNotifications(),this.cancel();var r=this.observableQuery;r&&r.stopPolling()}},t.prototype.cancel=function(){var e;(e=this.cancelWatch)===null||e===void 0||e.call(this),this.cancelWatch=void 0},t.prototype.updateWatch=function(e){var r=this;e===void 0&&(e=this.variables);var i=this.observableQuery;if(!(i&&i.options.fetchPolicy==="no-cache")){var a=y(y({},this.getDiffOptions(e)),{watcher:this,callback:function(s){return r.setDiff(s)}});(!this.lastWatch||!q(a,this.lastWatch))&&(this.cancel(),this.cancelWatch=this.cache.watch(this.lastWatch=a))}},t.prototype.resetLastWrite=function(){this.lastWrite=void 0},t.prototype.shouldWrite=function(e,r){var i=this.lastWrite;return!(i&&i.dmCount===je.get(this.cache)&&q(r,i.variables)&&q(e.data,i.result.data))},t.prototype.markResult=function(e,r,i,a){var s=this,n,l=new $e,d=ne(e.errors)?e.errors.slice(0):[];if((n=this.observableQuery)===null||n===void 0||n.resetNotifications(),"incremental"in e&&ne(e.incremental)){var u=xs(this.getDiff().result,e);e.data=u}else if("hasNext"in e&&e.hasNext){var c=this.getDiff();e.data=l.merge(c.result,e.data)}this.graphQLErrors=d,i.fetchPolicy==="no-cache"?this.updateLastDiff({result:e.data,complete:!0},this.getDiffOptions(i.variables)):a!==0&&(ai(e,i.errorPolicy)?this.cache.performTransaction(function(m){if(s.shouldWrite(e,i.variables))m.writeQuery({query:r,data:e.data,variables:i.variables,overwrite:a===1}),s.lastWrite={result:e,variables:i.variables,dmCount:je.get(s.cache)};else if(s.lastDiff&&s.lastDiff.diff.complete){e.data=s.lastDiff.diff.result;return}var p=s.getDiffOptions(i.variables),_=m.diff(p);!s.stopped&&q(s.variables,i.variables)&&s.updateWatch(i.variables),s.updateLastDiff(_,p),_.complete&&(e.data=_.result)}):this.lastWrite=void 0)},t.prototype.markReady=function(){return this.networkError=null,this.networkStatus=O.ready},t.prototype.markError=function(e){var r;return this.networkStatus=O.error,this.lastWrite=void 0,(r=this.observableQuery)===null||r===void 0||r.resetNotifications(),e.graphQLErrors&&(this.graphQLErrors=e.graphQLErrors),e.networkError&&(this.networkError=e.networkError),e},t})();function ai(t,e){e===void 0&&(e="none");var r=e==="ignore"||e==="all",i=!Et(t);return!i&&r&&t.data&&(i=!0),i}var eu=Object.prototype.hasOwnProperty,Fa=Object.create(null),tu=(function(){function t(e){var r=this;this.clientAwareness={},this.queries=new Map,this.fetchCancelFns=new Map,this.transformCache=new ys(ue["queryManager.getDocumentInfo"]||2e3),this.queryIdCounter=1,this.requestIdCounter=1,this.mutationIdCounter=1,this.inFlightLinkObservables=new me(!1),this.noCacheWarningsByQueryId=new Set;var i=new qs(function(s){return r.cache.transformDocument(s)},{cache:!1});this.cache=e.cache,this.link=e.link,this.defaultOptions=e.defaultOptions,this.queryDeduplication=e.queryDeduplication,this.clientAwareness=e.clientAwareness,this.localState=e.localState,this.ssrMode=e.ssrMode,this.assumeImmutableResults=e.assumeImmutableResults,this.dataMasking=e.dataMasking;var a=e.documentTransform;this.documentTransform=a?i.concat(a).concat(i):i,this.defaultContext=e.defaultContext||Object.create(null),(this.onBroadcast=e.onBroadcast)&&(this.mutationStore=Object.create(null))}return t.prototype.stop=function(){var e=this;this.queries.forEach(function(r,i){e.stopQueryNoBroadcast(i)}),this.cancelPendingFetches(Y(27))},t.prototype.cancelPendingFetches=function(e){this.fetchCancelFns.forEach(function(r){return r(e)}),this.fetchCancelFns.clear()},t.prototype.mutate=function(e){return ye(this,arguments,void 0,function(r){var i,a,s,n,l,d,u,c=r.mutation,m=r.variables,p=r.optimisticResponse,_=r.updateQueries,f=r.refetchQueries,g=f===void 0?[]:f,I=r.awaitRefetchQueries,h=I===void 0?!1:I,A=r.update,b=r.onQueryUpdated,C=r.fetchPolicy,v=C===void 0?((d=this.defaultOptions.mutate)===null||d===void 0?void 0:d.fetchPolicy)||"network-only":C,P=r.errorPolicy,k=P===void 0?((u=this.defaultOptions.mutate)===null||u===void 0?void 0:u.errorPolicy)||"none":P,U=r.keepRootFields,F=r.context;return he(this,function(z){switch(z.label){case 0:return w(c,28),w(v==="network-only"||v==="no-cache",29),i=this.generateMutationId(),c=this.cache.transformForLink(this.transform(c)),a=this.getDocumentInfo(c).hasClientExports,m=this.getVariables(c,m),a?[4,this.localState.addExportedVariables(c,m,F)]:[3,2];case 1:m=z.sent(),z.label=2;case 2:return s=this.mutationStore&&(this.mutationStore[i]={mutation:c,variables:m,loading:!0,error:null}),n=p&&this.markMutationOptimistic(p,{mutationId:i,document:c,variables:m,fetchPolicy:v,errorPolicy:k,context:F,updateQueries:_,update:A,keepRootFields:U}),this.broadcastQueries(),l=this,[2,new Promise(function(ie,qe){return br(l.getObservableFromLink(c,y(y({},F),{optimisticResponse:n?p:void 0}),m,{},!1),function(W){if(Et(W)&&k==="none")throw new Se({graphQLErrors:Kr(W)});s&&(s.loading=!1,s.error=null);var _e=y({},W);return typeof g=="function"&&(g=g(_e)),k==="ignore"&&Et(_e)&&delete _e.errors,l.markMutationResult({mutationId:i,result:_e,document:c,variables:m,fetchPolicy:v,errorPolicy:k,context:F,update:A,updateQueries:_,awaitRefetchQueries:h,refetchQueries:g,removeOptimistic:n?i:void 0,onQueryUpdated:b,keepRootFields:U})}).subscribe({next:function(W){l.broadcastQueries(),(!("hasNext"in W)||W.hasNext===!1)&&ie(y(y({},W),{data:l.maskOperation({document:c,data:W.data,fetchPolicy:v,id:i})}))},error:function(W){s&&(s.loading=!1,s.error=W),n&&l.cache.removeOptimistic(i),l.broadcastQueries(),qe(W instanceof Se?W:new Se({networkError:W}))}})})]}})})},t.prototype.markMutationResult=function(e,r){var i=this;r===void 0&&(r=this.cache);var a=e.result,s=[],n=e.fetchPolicy==="no-cache";if(!n&&ai(a,e.errorPolicy)){if(We(a)||s.push({result:a.data,dataId:"ROOT_MUTATION",query:e.document,variables:e.variables}),We(a)&&ne(a.incremental)){var l=r.diff({id:"ROOT_MUTATION",query:this.getDocumentInfo(e.document).asQuery,variables:e.variables,optimistic:!1,returnPartialData:!0}),d=void 0;l.result&&(d=xs(l.result,a)),typeof d<"u"&&(a.data=d,s.push({result:d,dataId:"ROOT_MUTATION",query:e.document,variables:e.variables}))}var u=e.updateQueries;u&&this.queries.forEach(function(m,p){var _=m.observableQuery,f=_&&_.queryName;if(!(!f||!eu.call(u,f))){var g=u[f],I=i.queries.get(p),h=I.document,A=I.variables,b=r.diff({query:h,variables:A,returnPartialData:!0,optimistic:!1}),C=b.result,v=b.complete;if(v&&C){var P=g(C,{mutationResult:a,queryName:h&&ct(h)||void 0,queryVariables:A});P&&s.push({result:P,dataId:"ROOT_QUERY",query:h,variables:A})}}})}if(s.length>0||(e.refetchQueries||"").length>0||e.update||e.onQueryUpdated||e.removeOptimistic){var c=[];if(this.refetchQueries({updateCache:function(m){n||s.forEach(function(g){return m.write(g)});var p=e.update,_=!Hl(a)||We(a)&&!a.hasNext;if(p){if(!n){var f=m.diff({id:"ROOT_MUTATION",query:i.getDocumentInfo(e.document).asQuery,variables:e.variables,optimistic:!1,returnPartialData:!0});f.complete&&(a=y(y({},a),{data:f.result}),"incremental"in a&&delete a.incremental,"hasNext"in a&&delete a.hasNext)}_&&p(m,a,{context:e.context,variables:e.variables})}!n&&!e.keepRootFields&&_&&m.modify({id:"ROOT_MUTATION",fields:function(g,I){var h=I.fieldName,A=I.DELETE;return h==="__typename"?g:A}})},include:e.refetchQueries,optimistic:!1,removeOptimistic:e.removeOptimistic,onQueryUpdated:e.onQueryUpdated||null}).forEach(function(m){return c.push(m)}),e.awaitRefetchQueries||e.onQueryUpdated)return Promise.all(c).then(function(){return a})}return Promise.resolve(a)},t.prototype.markMutationOptimistic=function(e,r){var i=this,a=typeof e=="function"?e(r.variables,{IGNORE:Fa}):e;return a===Fa?!1:(this.cache.recordOptimisticTransaction(function(s){try{i.markMutationResult(y(y({},r),{result:{data:a}}),s)}catch(n){globalThis.__DEV__!==!1&&w.error(n)}},r.mutationId),!0)},t.prototype.fetchQuery=function(e,r,i){return this.fetchConcastWithInfo(this.getOrCreateQuery(e),r,i).concast.promise},t.prototype.getQueryStore=function(){var e=Object.create(null);return this.queries.forEach(function(r,i){e[i]={variables:r.variables,networkStatus:r.networkStatus,networkError:r.networkError,graphQLErrors:r.graphQLErrors}}),e},t.prototype.resetErrors=function(e){var r=this.queries.get(e);r&&(r.networkError=void 0,r.graphQLErrors=[])},t.prototype.transform=function(e){return this.documentTransform.transformDocument(e)},t.prototype.getDocumentInfo=function(e){var r=this.transformCache;if(!r.has(e)){var i={hasClientExports:Ro(e),hasForcedResolvers:this.localState.shouldForceResolvers(e),hasNonreactiveDirective:It(["nonreactive"],e),nonReactiveQuery:Ul(e),clientQuery:this.localState.clientQuery(e),serverQuery:Ci([{name:"client",remove:!0},{name:"connection"},{name:"nonreactive"},{name:"unmask"}],e),defaultVars:ir(Ce(e)),asQuery:y(y({},e),{definitions:e.definitions.map(function(a){return a.kind==="OperationDefinition"&&a.operation!=="query"?y(y({},a),{operation:"query"}):a})})};r.set(e,i)}return r.get(e)},t.prototype.getVariables=function(e,r){return y(y({},this.getDocumentInfo(e).defaultVars),r)},t.prototype.watchQuery=function(e){var r=this.transform(e.query);e=y(y({},e),{variables:this.getVariables(r,e.variables)}),typeof e.notifyOnNetworkStatusChange>"u"&&(e.notifyOnNetworkStatusChange=!1);var i=new wr(this),a=new xt({queryManager:this,queryInfo:i,options:e});return a.lastQuery=r,xt.inactiveOnCreation.getValue()||this.queries.set(a.queryId,i),i.init({document:r,observableQuery:a,variables:a.variables}),a},t.prototype.query=function(e,r){var i=this;r===void 0&&(r=this.generateQueryId()),w(e.query,30),w(e.query.kind==="Document",31),w(!e.returnPartialData,32),w(!e.pollInterval,33);var a=this.transform(e.query);return this.fetchQuery(r,y(y({},e),{query:a})).then(function(s){return s&&y(y({},s),{data:i.maskOperation({document:a,data:s.data,fetchPolicy:e.fetchPolicy,id:r})})}).finally(function(){return i.stopQuery(r)})},t.prototype.generateQueryId=function(){return String(this.queryIdCounter++)},t.prototype.generateRequestId=function(){return this.requestIdCounter++},t.prototype.generateMutationId=function(){return String(this.mutationIdCounter++)},t.prototype.stopQueryInStore=function(e){this.stopQueryInStoreNoBroadcast(e),this.broadcastQueries()},t.prototype.stopQueryInStoreNoBroadcast=function(e){var r=this.queries.get(e);r&&r.stop()},t.prototype.clearStore=function(e){return e===void 0&&(e={discardWatches:!0}),this.cancelPendingFetches(Y(34)),this.queries.forEach(function(r){r.observableQuery?r.networkStatus=O.loading:r.stop()}),this.mutationStore&&(this.mutationStore=Object.create(null)),this.cache.reset(e)},t.prototype.getObservableQueries=function(e){var r=this;e===void 0&&(e="active");var i=new Map,a=new Map,s=new Map,n=new Set;return Array.isArray(e)&&e.forEach(function(l){if(typeof l=="string")a.set(l,l),s.set(l,!1);else if(al(l)){var d=le(r.transform(l));a.set(d,ct(l)),s.set(d,!1)}else E(l)&&l.query&&n.add(l)}),this.queries.forEach(function(l,d){var u=l.observableQuery,c=l.document;if(u){if(e==="all"){i.set(d,u);return}var m=u.queryName,p=u.options.fetchPolicy;if(p==="standby"||e==="active"&&!u.hasObservers())return;(e==="active"||m&&s.has(m)||c&&s.has(le(c)))&&(i.set(d,u),m&&s.set(m,!0),c&&s.set(le(c),!0))}}),n.size&&n.forEach(function(l){var d=ht("legacyOneTimeQuery"),u=r.getOrCreateQuery(d).init({document:l.query,variables:l.variables}),c=new xt({queryManager:r,queryInfo:u,options:y(y({},l),{fetchPolicy:"network-only"})});w(c.queryId===d),u.setObservableQuery(c),i.set(d,c)}),globalThis.__DEV__!==!1&&s.size&&s.forEach(function(l,d){if(!l){var u=a.get(d);u?globalThis.__DEV__!==!1&&w.warn(35,u):globalThis.__DEV__!==!1&&w.warn(36)}}),i},t.prototype.reFetchObservableQueries=function(e){var r=this;e===void 0&&(e=!1);var i=[];return this.getObservableQueries(e?"all":"active").forEach(function(a,s){var n=a.options.fetchPolicy;a.resetLastResults(),(e||n!=="standby"&&n!=="cache-only")&&i.push(a.refetch()),(r.queries.get(s)||a.queryInfo).setDiff(null)}),this.broadcastQueries(),Promise.all(i)},t.prototype.startGraphQLSubscription=function(e){var r=this,i=e.query,a=e.variables,s=e.fetchPolicy,n=e.errorPolicy,l=n===void 0?"none":n,d=e.context,u=d===void 0?{}:d,c=e.extensions,m=c===void 0?{}:c;i=this.transform(i),a=this.getVariables(i,a);var p=function(f){return r.getObservableFromLink(i,u,f,m).map(function(g){s!=="no-cache"&&(ai(g,l)&&r.cache.write({query:i,result:g.data,dataId:"ROOT_SUBSCRIPTION",variables:f}),r.broadcastQueries());var I=Et(g),h=ud(g);if(I||h){var A={};if(I&&(A.graphQLErrors=g.errors),h&&(A.protocolErrors=g.extensions[Si]),l==="none"||h)throw new Se(A)}return l==="ignore"&&delete g.errors,g})};if(this.getDocumentInfo(i).hasClientExports){var _=this.localState.addExportedVariables(i,a,u).then(p);return new N(function(f){var g=null;return _.then(function(I){return g=I.subscribe(f)},f.error),function(){return g&&g.unsubscribe()}})}return p(a)},t.prototype.stopQuery=function(e){this.stopQueryNoBroadcast(e),this.broadcastQueries()},t.prototype.stopQueryNoBroadcast=function(e){this.stopQueryInStoreNoBroadcast(e),this.removeQuery(e)},t.prototype.removeQuery=function(e){var r;this.fetchCancelFns.delete(e),this.queries.has(e)&&((r=this.queries.get(e))===null||r===void 0||r.stop(),this.queries.delete(e))},t.prototype.broadcastQueries=function(){this.onBroadcast&&this.onBroadcast(),this.queries.forEach(function(e){var r;return(r=e.observableQuery)===null||r===void 0?void 0:r.notify()})},t.prototype.getLocalState=function(){return this.localState},t.prototype.getObservableFromLink=function(e,r,i,a,s){var n=this,l;s===void 0&&(s=(l=r?.queryDeduplication)!==null&&l!==void 0?l:this.queryDeduplication);var d,u=this.getDocumentInfo(e),c=u.serverQuery,m=u.clientQuery;if(c){var p=this,_=p.inFlightLinkObservables,f=p.link,g={query:c,variables:i,operationName:ct(c)||void 0,context:this.prepareContext(y(y({},r),{forceFetch:!s})),extensions:a};if(r=g.context,s){var I=le(c),h=be(i),A=_.lookup(I,h);if(d=A.observable,!d){var b=new Me([Jr(f,g)]);d=A.observable=b,b.beforeNext(function C(v,P){v==="next"&&"hasNext"in P&&P.hasNext?b.beforeNext(C):_.remove(I,h)})}}else d=new Me([Jr(f,g)])}else d=new Me([N.of({data:{}})]),r=this.prepareContext(r);return m&&(d=br(d,function(C){return n.localState.runResolvers({document:m,remoteResult:C,context:r,variables:i})})),d},t.prototype.getResultsFromLink=function(e,r,i){var a=e.lastRequestId=this.generateRequestId(),s=this.cache.transformForLink(i.query);return br(this.getObservableFromLink(s,i.context,i.variables),function(n){var l=Kr(n),d=l.length>0,u=i.errorPolicy;if(a>=e.lastRequestId){if(d&&u==="none")throw e.markError(new Se({graphQLErrors:l}));e.markResult(n,s,i,r),e.markReady()}var c={data:n.data,loading:!1,networkStatus:O.ready};return d&&u==="none"&&(c.data=void 0),d&&u!=="ignore"&&(c.errors=l,c.networkStatus=O.error),c},function(n){var l=Gs(n)?n:new Se({networkError:n});throw a>=e.lastRequestId&&e.markError(l),l})},t.prototype.fetchConcastWithInfo=function(e,r,i,a){var s=this;i===void 0&&(i=O.loading),a===void 0&&(a=r.query);var n=this.getVariables(a,r.variables),l=this.defaultOptions.watchQuery,d=r.fetchPolicy,u=d===void 0?l&&l.fetchPolicy||"cache-first":d,c=r.errorPolicy,m=c===void 0?l&&l.errorPolicy||"none":c,p=r.returnPartialData,_=p===void 0?!1:p,f=r.notifyOnNetworkStatusChange,g=f===void 0?!1:f,I=r.context,h=I===void 0?{}:I,A=Object.assign({},r,{query:a,variables:n,fetchPolicy:u,errorPolicy:m,returnPartialData:_,notifyOnNetworkStatusChange:g,context:h}),b=function(U){A.variables=U;var F=s.fetchQueryByPolicy(e,A,i);return A.fetchPolicy!=="standby"&&F.sources.length>0&&e.observableQuery&&e.observableQuery.applyNextFetchPolicy("after-fetch",r),F},C=function(){return s.fetchCancelFns.delete(e.queryId)};this.fetchCancelFns.set(e.queryId,function(U){C(),setTimeout(function(){return v.cancel(U)})});var v,P;if(this.getDocumentInfo(A.query).hasClientExports)v=new Me(this.localState.addExportedVariables(A.query,A.variables,A.context).then(b).then(function(U){return U.sources})),P=!0;else{var k=b(A.variables);P=k.fromLink,v=new Me(k.sources)}return v.promise.then(C,C),{concast:v,fromLink:P}},t.prototype.refetchQueries=function(e){var r=this,i=e.updateCache,a=e.include,s=e.optimistic,n=s===void 0?!1:s,l=e.removeOptimistic,d=l===void 0?n?ht("refetchQueries"):void 0:l,u=e.onQueryUpdated,c=new Map;a&&this.getObservableQueries(a).forEach(function(p,_){c.set(_,{oq:p,lastDiff:(r.queries.get(_)||p.queryInfo).getDiff()})});var m=new Map;return i&&this.cache.batch({update:i,optimistic:n&&d||!1,removeOptimistic:d,onWatchUpdated:function(p,_,f){var g=p.watcher instanceof wr&&p.watcher.observableQuery;if(g){if(u){c.delete(g.queryId);var I=u(g,_,f);return I===!0&&(I=g.refetch()),I!==!1&&m.set(g,I),I}u!==null&&c.set(g.queryId,{oq:g,lastDiff:f,diff:_})}}}),c.size&&c.forEach(function(p,_){var f=p.oq,g=p.lastDiff,I=p.diff,h;u&&(I||(I=r.cache.diff(f.queryInfo.getDiffOptions())),h=u(f,I,g)),(!u||h===!0)&&(h=f.refetch()),h!==!1&&m.set(f,h),_.indexOf("legacyOneTimeQuery")>=0&&r.stopQueryNoBroadcast(_)}),d&&this.cache.removeOptimistic(d),m},t.prototype.maskOperation=function(e){var r,i,a,s=e.document,n=e.data;if(globalThis.__DEV__!==!1){var l=e.fetchPolicy,d=e.id,u=(r=Ce(s))===null||r===void 0?void 0:r.operation,c=((i=u?.[0])!==null&&i!==void 0?i:"o")+d;this.dataMasking&&l==="no-cache"&&!zo(s)&&!this.noCacheWarningsByQueryId.has(c)&&(this.noCacheWarningsByQueryId.add(c),globalThis.__DEV__!==!1&&w.warn(37,(a=ct(s))!==null&&a!==void 0?a:"Unnamed ".concat(u??"operation")))}return this.dataMasking?qd(n,s,this.cache):n},t.prototype.maskFragment=function(e){var r=e.data,i=e.fragment,a=e.fragmentName;return this.dataMasking?Ks(r,i,this.cache,a):r},t.prototype.fetchQueryByPolicy=function(e,r,i){var a=this,s=r.query,n=r.variables,l=r.fetchPolicy,d=r.refetchWritePolicy,u=r.errorPolicy,c=r.returnPartialData,m=r.context,p=r.notifyOnNetworkStatusChange,_=e.networkStatus;e.init({document:s,variables:n,networkStatus:i});var f=function(){return e.getDiff()},g=function(C,v){v===void 0&&(v=e.networkStatus||O.loading);var P=C.result;globalThis.__DEV__!==!1&&!c&&!q(P,{})&&pn(C.missing);var k=function(U){return N.of(y({data:U,loading:Ge(v),networkStatus:v},C.complete?null:{partial:!0}))};return P&&a.getDocumentInfo(s).hasForcedResolvers?a.localState.runResolvers({document:s,remoteResult:{data:P},context:m,variables:n,onlyRunForcedResolvers:!0}).then(function(U){return k(U.data||void 0)}):u==="none"&&v===O.refetch&&Array.isArray(C.missing)?k(void 0):k(P)},I=l==="no-cache"?0:i===O.refetch&&d!=="merge"?1:2,h=function(){return a.getResultsFromLink(e,I,{query:s,variables:n,context:m,fetchPolicy:l,errorPolicy:u})},A=p&&typeof _=="number"&&_!==i&&Ge(i);switch(l){default:case"cache-first":{var b=f();return b.complete?{fromLink:!1,sources:[g(b,e.markReady())]}:c||A?{fromLink:!0,sources:[g(b),h()]}:{fromLink:!0,sources:[h()]}}case"cache-and-network":{var b=f();return b.complete||c||A?{fromLink:!0,sources:[g(b),h()]}:{fromLink:!0,sources:[h()]}}case"cache-only":return{fromLink:!1,sources:[g(f(),e.markReady())]};case"network-only":return A?{fromLink:!0,sources:[g(f()),h()]}:{fromLink:!0,sources:[h()]};case"no-cache":return A?{fromLink:!0,sources:[g(e.getDiff()),h()]}:{fromLink:!0,sources:[h()]};case"standby":return{fromLink:!1,sources:[]}}},t.prototype.getOrCreateQuery=function(e){return e&&!this.queries.has(e)&&this.queries.set(e,new wr(this,e)),this.queries.get(e)},t.prototype.prepareContext=function(e){e===void 0&&(e={});var r=this.localState.prepareContext(e);return y(y(y({},this.defaultContext),r),{clientAwareness:this.clientAwareness})},t})(),ru=(function(){function t(e){var r=e.cache,i=e.client,a=e.resolvers,s=e.fragmentMatcher;this.selectionsToResolveCache=new WeakMap,this.cache=r,i&&(this.client=i),a&&this.addResolvers(a),s&&this.setFragmentMatcher(s)}return t.prototype.addResolvers=function(e){var r=this;this.resolvers=this.resolvers||{},Array.isArray(e)?e.forEach(function(i){r.resolvers=aa(r.resolvers,i)}):this.resolvers=aa(this.resolvers,e)},t.prototype.setResolvers=function(e){this.resolvers={},this.addResolvers(e)},t.prototype.getResolvers=function(){return this.resolvers||{}},t.prototype.runResolvers=function(e){return ye(this,arguments,void 0,function(r){var i=r.document,a=r.remoteResult,s=r.context,n=r.variables,l=r.onlyRunForcedResolvers,d=l===void 0?!1:l;return he(this,function(u){return i?[2,this.resolveDocument(i,a.data,s,n,this.fragmentMatcher,d).then(function(c){return y(y({},a),{data:c.result})})]:[2,a]})})},t.prototype.setFragmentMatcher=function(e){this.fragmentMatcher=e},t.prototype.getFragmentMatcher=function(){return this.fragmentMatcher},t.prototype.clientQuery=function(e){return It(["client"],e)&&this.resolvers?e:null},t.prototype.serverQuery=function(e){return vi(e)},t.prototype.prepareContext=function(e){var r=this.cache;return y(y({},e),{cache:r,getCacheKey:function(i){return r.identify(i)}})},t.prototype.addExportedVariables=function(e){return ye(this,arguments,void 0,function(r,i,a){return i===void 0&&(i={}),a===void 0&&(a={}),he(this,function(s){return r?[2,this.resolveDocument(r,this.buildRootValueFromCache(r,i)||{},this.prepareContext(a),i).then(function(n){return y(y({},i),n.exportedVariables)})]:[2,y({},i)]})})},t.prototype.shouldForceResolvers=function(e){var r=!1;return re(e,{Directive:{enter:function(i){if(i.name.value==="client"&&i.arguments&&(r=i.arguments.some(function(a){return a.name.value==="always"&&a.value.kind==="BooleanValue"&&a.value.value===!0}),r))return Xt}}}),r},t.prototype.buildRootValueFromCache=function(e,r){return this.cache.diff({query:kl(e),variables:r,returnPartialData:!0,optimistic:!1}).result},t.prototype.resolveDocument=function(e,r){return ye(this,arguments,void 0,function(i,a,s,n,l,d){var u,c,m,p,_,f,g,I,h,A,b;return s===void 0&&(s={}),n===void 0&&(n={}),l===void 0&&(l=function(){return!0}),d===void 0&&(d=!1),he(this,function(C){return u=vt(i),c=rt(i),m=tt(c),p=this.collectSelectionsToResolve(u,m),_=u.operation,f=_?_.charAt(0).toUpperCase()+_.slice(1):"Query",g=this,I=g.cache,h=g.client,A={fragmentMap:m,context:y(y({},s),{cache:I,client:h}),variables:n,fragmentMatcher:l,defaultOperationType:f,exportedVariables:{},selectionsToResolve:p,onlyRunForcedResolvers:d},b=!1,[2,this.resolveSelectionSet(u.selectionSet,b,a,A).then(function(v){return{result:v,exportedVariables:A.exportedVariables}})]})})},t.prototype.resolveSelectionSet=function(e,r,i,a){return ye(this,void 0,void 0,function(){var s,n,l,d,u,c=this;return he(this,function(m){return s=a.fragmentMap,n=a.context,l=a.variables,d=[i],u=function(p){return ye(c,void 0,void 0,function(){var _,f;return he(this,function(g){return!r&&!a.selectionsToResolve.has(p)?[2]:Ct(p,l)?Ae(p)?[2,this.resolveField(p,r,i,a).then(function(I){var h;typeof I<"u"&&d.push((h={},h[ce(p)]=I,h))})]:(yl(p)?_=p:(_=s[p.name.value],w(_,19,p.name.value)),_&&_.typeCondition&&(f=_.typeCondition.name.value,a.fragmentMatcher(i,f,n))?[2,this.resolveSelectionSet(_.selectionSet,r,i,a).then(function(I){d.push(I)})]:[2]):[2]})})},[2,Promise.all(e.selections.map(u)).then(function(){return or(d)})]})})},t.prototype.resolveField=function(e,r,i,a){return ye(this,void 0,void 0,function(){var s,n,l,d,u,c,m,p,_,f=this;return he(this,function(g){return i?(s=a.variables,n=e.name.value,l=ce(e),d=n!==l,u=i[l]||i[n],c=Promise.resolve(u),(!a.onlyRunForcedResolvers||this.shouldForceResolvers(e))&&(m=i.__typename||a.defaultOperationType,p=this.resolvers&&this.resolvers[m],p&&(_=p[d?n:l],_&&(c=Promise.resolve(Ui.withValue(this.cache,_,[i,rr(e,s),a.context,{field:e,fragmentMap:a.fragmentMap}]))))),[2,c.then(function(I){var h,A;if(I===void 0&&(I=u),e.directives&&e.directives.forEach(function(C){C.name.value==="export"&&C.arguments&&C.arguments.forEach(function(v){v.name.value==="as"&&v.value.kind==="StringValue"&&(a.exportedVariables[v.value.value]=I)})}),!e.selectionSet||I==null)return I;var b=(A=(h=e.directives)===null||h===void 0?void 0:h.some(function(C){return C.name.value==="client"}))!==null&&A!==void 0?A:!1;if(Array.isArray(I))return f.resolveSubSelectedArray(e,r||b,I,a);if(e.selectionSet)return f.resolveSelectionSet(e.selectionSet,r||b,I,a)})]):[2,null]})})},t.prototype.resolveSubSelectedArray=function(e,r,i,a){var s=this;return Promise.all(i.map(function(n){if(n===null)return null;if(Array.isArray(n))return s.resolveSubSelectedArray(e,r,n,a);if(e.selectionSet)return s.resolveSelectionSet(e.selectionSet,r,n,a)}))},t.prototype.collectSelectionsToResolve=function(e,r){var i=function(n){return!Array.isArray(n)},a=this.selectionsToResolveCache;function s(n){if(!a.has(n)){var l=new Set;a.set(n,l),re(n,{Directive:function(d,u,c,m,p){d.name.value==="client"&&p.forEach(function(_){i(_)&&Yi(_)&&l.add(_)})},FragmentSpread:function(d,u,c,m,p){var _=r[d.name.value];w(_,20,d.name.value);var f=s(_);f.size>0&&(p.forEach(function(g){i(g)&&Yi(g)&&l.add(g)}),l.add(d),f.forEach(function(g){l.add(g)}))}})}return a.get(n)}return s(e)},t})(),Ea=!1,mn=(function(){function t(e){var r=this,i;if(this.resetStoreCallbacks=[],this.clearStoreCallbacks=[],!e.cache)throw Y(16);var a=e.uri,s=e.credentials,n=e.headers,l=e.cache,d=e.documentTransform,u=e.ssrMode,c=u===void 0?!1:u,m=e.ssrForceFetchDelay,p=m===void 0?0:m,_=e.connectToDevTools,f=e.queryDeduplication,g=f===void 0?!0:f,I=e.defaultOptions,h=e.defaultContext,A=e.assumeImmutableResults,b=A===void 0?l.assumeImmutableResults:A,C=e.resolvers,v=e.typeDefs,P=e.fragmentMatcher,k=e.name,U=e.version,F=e.devtools,z=e.dataMasking,ie=e.link;ie||(ie=a?new Pd({uri:a,credentials:s,headers:n}):it.empty()),this.link=ie,this.cache=l,this.disableNetworkFetches=c||p>0,this.queryDeduplication=g,this.defaultOptions=I||Object.create(null),this.typeDefs=v,this.devtoolsConfig=y(y({},F),{enabled:(i=F?.enabled)!==null&&i!==void 0?i:_}),this.devtoolsConfig.enabled===void 0&&(this.devtoolsConfig.enabled=globalThis.__DEV__!==!1),p&&setTimeout(function(){return r.disableNetworkFetches=!1},p),this.watchQuery=this.watchQuery.bind(this),this.query=this.query.bind(this),this.mutate=this.mutate.bind(this),this.watchFragment=this.watchFragment.bind(this),this.resetStore=this.resetStore.bind(this),this.reFetchObservableQueries=this.reFetchObservableQueries.bind(this),this.version=mi,this.localState=new ru({cache:l,client:this,resolvers:C,fragmentMatcher:P}),this.queryManager=new tu({cache:this.cache,link:this.link,defaultOptions:this.defaultOptions,defaultContext:h,documentTransform:d,queryDeduplication:g,ssrMode:c,dataMasking:!!z,clientAwareness:{name:k,version:U},localState:this.localState,assumeImmutableResults:b,onBroadcast:this.devtoolsConfig.enabled?function(){r.devToolsHookCb&&r.devToolsHookCb({action:{},state:{queries:r.queryManager.getQueryStore(),mutations:r.queryManager.mutationStore||{}},dataWithOptimisticResults:r.cache.extract(!0)})}:void 0}),this.devtoolsConfig.enabled&&this.connectToDevTools()}return t.prototype.connectToDevTools=function(){if(!(typeof window>"u")){var e=window,r=Symbol.for("apollo.devtools");(e[r]=e[r]||[]).push(this),e.__APOLLO_CLIENT__=this,!Ea&&globalThis.__DEV__!==!1&&(Ea=!0,window.document&&window.top===window.self&&/^(https?|file):$/.test(window.location.protocol)&&setTimeout(function(){if(!window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__){var i=window.navigator,a=i&&i.userAgent,s=void 0;typeof a=="string"&&(a.indexOf("Chrome/")>-1?s="https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm":a.indexOf("Firefox/")>-1&&(s="https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/")),s&&globalThis.__DEV__!==!1&&w.log("Download the Apollo DevTools for a better development experience: %s",s)}},1e4))}},Object.defineProperty(t.prototype,"documentTransform",{get:function(){return this.queryManager.documentTransform},enumerable:!1,configurable:!0}),t.prototype.stop=function(){this.queryManager.stop()},t.prototype.watchQuery=function(e){return this.defaultOptions.watchQuery&&(e=Tr(this.defaultOptions.watchQuery,e)),this.disableNetworkFetches&&(e.fetchPolicy==="network-only"||e.fetchPolicy==="cache-and-network")&&(e=y(y({},e),{fetchPolicy:"cache-first"})),this.queryManager.watchQuery(e)},t.prototype.query=function(e){return this.defaultOptions.query&&(e=Tr(this.defaultOptions.query,e)),w(e.fetchPolicy!=="cache-and-network",17),this.disableNetworkFetches&&e.fetchPolicy==="network-only"&&(e=y(y({},e),{fetchPolicy:"cache-first"})),this.queryManager.query(e)},t.prototype.mutate=function(e){return this.defaultOptions.mutate&&(e=Tr(this.defaultOptions.mutate,e)),this.queryManager.mutate(e)},t.prototype.subscribe=function(e){var r=this,i=this.queryManager.generateQueryId();return this.queryManager.startGraphQLSubscription(e).map(function(a){return y(y({},a),{data:r.queryManager.maskOperation({document:e.query,data:a.data,fetchPolicy:e.fetchPolicy,id:i})})})},t.prototype.readQuery=function(e,r){return r===void 0&&(r=!1),this.cache.readQuery(e,r)},t.prototype.watchFragment=function(e){var r;return this.cache.watchFragment(y(y({},e),(r={},r[Symbol.for("apollo.dataMasking")]=this.queryManager.dataMasking,r)))},t.prototype.readFragment=function(e,r){return r===void 0&&(r=!1),this.cache.readFragment(e,r)},t.prototype.writeQuery=function(e){var r=this.cache.writeQuery(e);return e.broadcast!==!1&&this.queryManager.broadcastQueries(),r},t.prototype.writeFragment=function(e){var r=this.cache.writeFragment(e);return e.broadcast!==!1&&this.queryManager.broadcastQueries(),r},t.prototype.__actionHookForDevTools=function(e){this.devToolsHookCb=e},t.prototype.__requestRaw=function(e){return Jr(this.link,e)},t.prototype.resetStore=function(){var e=this;return Promise.resolve().then(function(){return e.queryManager.clearStore({discardWatches:!1})}).then(function(){return Promise.all(e.resetStoreCallbacks.map(function(r){return r()}))}).then(function(){return e.reFetchObservableQueries()})},t.prototype.clearStore=function(){var e=this;return Promise.resolve().then(function(){return e.queryManager.clearStore({discardWatches:!0})}).then(function(){return Promise.all(e.clearStoreCallbacks.map(function(r){return r()}))})},t.prototype.onResetStore=function(e){var r=this;return this.resetStoreCallbacks.push(e),function(){r.resetStoreCallbacks=r.resetStoreCallbacks.filter(function(i){return i!==e})}},t.prototype.onClearStore=function(e){var r=this;return this.clearStoreCallbacks.push(e),function(){r.clearStoreCallbacks=r.clearStoreCallbacks.filter(function(i){return i!==e})}},t.prototype.reFetchObservableQueries=function(e){return this.queryManager.reFetchObservableQueries(e)},t.prototype.refetchQueries=function(e){var r=this.queryManager.refetchQueries(e),i=[],a=[];r.forEach(function(n,l){i.push(l),a.push(n)});var s=Promise.all(a);return s.queries=i,s.results=a,s.catch(function(n){globalThis.__DEV__!==!1&&w.debug(18,n)}),s},t.prototype.getObservableQueries=function(e){return e===void 0&&(e="active"),this.queryManager.getObservableQueries(e)},t.prototype.extract=function(e){return this.cache.extract(e)},t.prototype.restore=function(e){return this.cache.restore(e)},t.prototype.addResolvers=function(e){this.localState.addResolvers(e)},t.prototype.setResolvers=function(e){this.localState.setResolvers(e)},t.prototype.getResolvers=function(){return this.localState.getResolvers()},t.prototype.setLocalStateFragmentMatcher=function(e){this.localState.setFragmentMatcher(e)},t.prototype.setLink=function(e){this.link=this.queryManager.link=e},Object.defineProperty(t.prototype,"defaultContext",{get:function(){return this.queryManager.defaultContext},enumerable:!1,configurable:!0}),t})();globalThis.__DEV__!==!1&&(mn.prototype.getMemoryInternals=Yo);var Rr={exports:{}},Ma;function iu(){return Ma||(Ma=1,(function(t){t.exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=void 0,t.exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=void 0,t.exports.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=void 0,Object.assign(t.exports,Bn())})(Rr)),Rr.exports}var Te=iu();const au=Kt(Te),su=zn({__proto__:null,default:au},[Te]);var za=Ii?Symbol.for("__APOLLO_CONTEXT__"):"__APOLLO_CONTEXT__";function nu(){w("createContext"in su,54);var t=Te.createContext[za];return t||(Object.defineProperty(Te.createContext,za,{value:t=Te.createContext({}),enumerable:!1,writable:!1,configurable:!0}),t.displayName="ApolloContext"),t}var ou=function(t){var e=t.client,r=t.children,i=nu(),a=Te.useContext(i),s=Te.useMemo(function(){return y(y({},a),{client:e||a.client})},[a,e]);return w(s.client,55),Te.createElement(i.Provider,{value:s},r)};const lu=/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,du={"&amp;":"&","&#38;":"&","&lt;":"<","&#60;":"<","&gt;":">","&#62;":">","&apos;":"'","&#39;":"'","&quot;":'"',"&#34;":'"',"&nbsp;":" ","&#160;":" ","&copy;":"©","&#169;":"©","&reg;":"®","&#174;":"®","&hellip;":"…","&#8230;":"…","&#x2F;":"/","&#47;":"/"},uu=t=>du[t],cu=t=>t.replace(lu,uu);let si={bindI18n:"languageChanged",bindI18nStore:"",transEmptyNodeValue:"",transSupportBasicHtmlNodes:!0,transWrapTextNodes:"",transKeepBasicHtmlNodesFor:["br","strong","i","p"],useSuspense:!0,unescape:cu,transDefaultProps:void 0};const pu=(t={})=>{si={...si,...t}},my=()=>si;let _n;const mu=t=>{_n=t},_y=()=>_n,_u={type:"3rdParty",init(t){pu(t.options.react),mu(t)}};function fu({i18n:t,defaultNS:e,children:r}){const i=S.useMemo(()=>({i18n:t,defaultNS:e}),[t,e]);return S.createElement(Mn.Provider,{value:i},r)}o(`fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}`);o(`mutation deleteAcceptances($Ids: [uuid!]!) {
  deleteAcceptancesById(Ids: $Ids) {
    affected_rows
  }
}`);o(`query getAcceptanceAuditById($Id: uuid!) {
  acceptance_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    DateAcceptedFrom
    DateAcceptedTo
    Details
    Id
    Status
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    ApprovedByUser
    ApprovedByUserGroup
    RequestedByUser
    RequestedByUserGroup
    CustomAttributeData
    SequentialId
  }
}`);o(`query getAcceptanceById($_eq: uuid!) {
  acceptance(where: { Id: { _eq: $_eq } }) {
    ...AcceptanceParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    files {
      ...RelationFileParts
    }
    parents {
      risk {
        Id
      }
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getAcceptances($where: acceptance_bool_exp! = {}) {
  acceptance(where: $where) {
    ...AcceptanceParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    requestedByUser {
      FriendlyName
    }
    requestedByUserGroup {
      Name
    }
    approvedByUser {
      FriendlyName
    }
    approvedByUserGroup {
      Name
    }
    parents {
      risk {
        Id
        Tier
        Title
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
        contributors {
          ...ContributorParts
        }
        contributorGroups {
          ...ContributorGroupParts
        }
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
      }
    }
    files {
      ...RelationFileParts
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getAcceptancesByParentRiskId($ParentId: uuid) {
  acceptance(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...AcceptanceParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    requestedByUser {
      FriendlyName
    }
    requestedByUserGroup {
      Name
    }
    approvedByUser {
      FriendlyName
    }
    approvedByUserGroup {
      Name
    }
    parents {
      risk {
        Id
        Tier
        Title
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
        contributors {
          ...ContributorParts
        }
        contributorGroups {
          ...ContributorGroupParts
        }
        ancestorContributors {
          ...AncestorContributorParts
        }
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
      }
    }
    files {
      ...RelationFileParts
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation insertAcceptance(
  $DateAcceptedFrom: timestamptz!
  $DateAcceptedTo: timestamptz!
  $Details: String
  $ParentId: uuid!
  $Status: acceptance_status_enum
  $Title: String
  $ApprovedByUser: String
  $ApprovedByUserGroup: uuid
  $RequestedByUser: String
  $RequestedByUserGroup: uuid
  $CustomAttributeData: jsonb
) {
  insertChildAcceptance(
    DateAcceptedFrom: $DateAcceptedFrom
    DateAcceptedTo: $DateAcceptedTo
    Details: $Details
    ParentId: $ParentId
    Status: $Status
    Title: $Title
    ApprovedByUser: $ApprovedByUser
    ApprovedByUserGroup: $ApprovedByUserGroup
    RequestedByUser: $RequestedByUser
    RequestedByUserGroup: $RequestedByUserGroup
    CustomAttributeData: $CustomAttributeData
  ) {
    Id
  }
}`);o(`mutation updateAcceptance(
  $DateAcceptedFrom: timestamptz!
  $DateAcceptedTo: timestamptz!
  $Details: String
  $Status: acceptance_status_enum
  $Title: String
  $Id: uuid!
  $OriginalTimestamp: timestamptz!
  $ApprovedByUser: String
  $ApprovedByUserGroup: uuid
  $RequestedByUser: String
  $RequestedByUserGroup: uuid
  $CustomAttributeData: jsonb
) {
  updateChildAcceptance(
    Id: $Id
    LatestModifiedAtTimestamp: $OriginalTimestamp
    DateAcceptedFrom: $DateAcceptedFrom
    DateAcceptedTo: $DateAcceptedTo
    Details: $Details
    Status: $Status
    Title: $Title
    ApprovedByUser: $ApprovedByUser
    ApprovedByUserGroup: $ApprovedByUserGroup
    RequestedByUser: $RequestedByUser
    RequestedByUserGroup: $RequestedByUserGroup
    CustomAttributeData: $CustomAttributeData
  ) {
    affected_rows
  }
}`);o(`fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}`);o(`mutation deleteActions($Ids: [uuid!]!) {
  deleteActionsById(Ids: $Ids) {
    affected_rows
  }
}`);o(`query getActionAuditById($id: uuid!) {
  action_audit(where: { Id: { _eq: $id } }, order_by: {ModifiedAtTimestamp: desc}) {
    DateDue
    DateRaised
    Description
    Id
    Priority
    Status
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    ClosedDate
    CustomAttributeData
    SequentialId
  }
}`);o(`query getActionById($_eq: uuid!) {
  action(where: { Id: { _eq: $_eq } }) {
    ...ActionParts
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getActions($where: action_bool_exp! = {}) {
  action(where: $where) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      risk {
        Title
      }
      control {
        Title
      }
      issue {
        Title
        Type
      }
      document {
        Title
      }
      assessment {
        Title
      }
      internalAuditEntity {
        Title
      }
      internalAuditReport {
        Title
      }
      complianceMonitoringAssessment {
        Title
      }
      thirdParty {
        Title
      }
    }
    actionUpdateSummary {
      Count
      LatestDescription
      LatestTitle
      LatestCreatedAtTimestamp
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getWidgetActionsByPriority($where: action_bool_exp) {
  action(where: $where) {
    Priority
  }
}`);o(`mutation insertChildAction(
  $DateDue: timestamptz!
  $Title: String!
  $Status: action_status_enum!
  $Priority: Int
  $Description: String
  $DateRaised: timestamptz!
  $ParentId: uuid
  $ClosedDate: timestamptz
  $CustomAttributeData: jsonb
  $OwnerUserIds: [String!]!
  $ContributorUserIds: [String!]!
  $OwnerGroupIds: [uuid!]!
  $ContributorGroupIds: [uuid!]!
  $TagTypeIds: [uuid!]!
  $DepartmentTypeIds: [uuid!]!
) {
  insertChildAction(
    ParentId: $ParentId
    DateDue: $DateDue
    Title: $Title
    Status: $Status
    Priority: $Priority
    Description: $Description
    DateRaised: $DateRaised
    ClosedDate: $ClosedDate
    CustomAttributeData: $CustomAttributeData
    TagTypeIds: $TagTypeIds
    DepartmentTypeIds: $DepartmentTypeIds
    OwnerUserIds: $OwnerUserIds
    ContributorUserIds: $ContributorUserIds
    OwnerGroupIds: $OwnerGroupIds
    ContributorGroupIds: $ContributorGroupIds
  ) {
    Id
  }
}`);o(`query GetOverdueActionCount($where: action_bool_exp) {
  action_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`mutation updateAction(
  $DateDue: timestamptz!
  $Title: String!
  $Status: action_status_enum!
  $Priority: Int
  $Id: uuid!
  $Description: String
  $DateRaised: timestamptz!
  $OriginalTimestamp: timestamptz!
  $ClosedDate: timestamptz
  $CustomAttributeData: jsonb
  $ContributorUserIds: [String!]!
  $ContributorGroupIds: [uuid!]!
  $OwnerUserIds: [String!]!
  $OwnerGroupIds: [uuid!]!
  $TagTypeIds: [uuid!]!
  $DepartmentTypeIds: [uuid!]!
) {
  updateChildAction(
    Id: $Id
    OriginalTimestamp: $OriginalTimestamp
    DateDue: $DateDue
    DateRaised: $DateRaised
    Description: $Description
    Priority: $Priority
    Status: $Status
    Title: $Title
    ClosedDate: $ClosedDate
    CustomAttributeData: $CustomAttributeData
    TagTypeIds: $TagTypeIds
    DepartmentTypeIds: $DepartmentTypeIds
    ContributorUserIds: $ContributorUserIds
    ContributorGroupIds: $ContributorGroupIds
    OwnerUserIds: $OwnerUserIds
    OwnerGroupIds: $OwnerGroupIds
  ) {
    affected_rows
    change_request_id
  }
}`);o(`fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`mutation deleteActionUpdates($Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: $Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: $Ids } }) {
    affected_rows
  }

  delete_action_update(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getActionUpdateAuditById($Id: uuid!) {
  action_update_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Description
    Id
    ParentActionId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
  }
}`);o(`query getActionUpdateById($_eq: uuid!) {
  action_update(where: { Id: { _eq: $_eq } }) {
    ...ActionUpdateParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getActionUpdatesByParentActionId($_eq: uuid!) {
  action_update(where: { ParentActionId: { _eq: $_eq } }) {
    ...ActionUpdateParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`mutation insertActionUpdate(
  $Description: String!
  $ParentActionId: uuid!
  $Title: String!
  $CustomAttributeData: jsonb
) {
  insert_action_update_one(
    object: {
      Description: $Description
      ParentActionId: $ParentActionId
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    Id
  }
}`);o(`mutation updateActionUpdate(
  $Description: String!
  $ParentActionId: uuid!
  $Title: String!
  $Id: uuid!
  $OriginalTimestamp: timestamptz!
  $CustomAttributeData: jsonb
) {
  update_action_update(
    _set: {
      Description: $Description
      ParentActionId: $ParentActionId
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
    where: {
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
      Id: { _eq: $Id }
    }
  ) {
    affected_rows
  }
}`);o(`query getAggregationSettingsForOrg {
  aggregation_org {
    RiskScoringModel
    Appetite
    Config
  }
}`);o(`subscription getRiskScores {
  risk {
    Id
    Tier

    inherent: assessmentResults(
      where: {
        riskAssessmentResult: {
          ControlType: { _eq: Uncontrolled }
          RatingType: { _in: ["assessment", "rating"] }
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
      limit: 1
    ) {
      riskAssessmentResult {
        ...RiskAssessmentResultParts
      }
    }

    residual: assessmentResults(
      where: {
        riskAssessmentResult: {
          ControlType: { _eq: Controlled }
          RatingType: { _in: ["assessment", "rating"] }
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
      limit: 1
    ) {
      riskAssessmentResult {
        ...RiskAssessmentResultParts
      }
    }

    riskScore {
      ResidualScore
      InherentScore
      ResidualRating
      InherentRating
      ResidualImpact
      ResidualLikelihood
      InherentImpact
      InherentLikelihood
      ModifiedAtTimestamp
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`);o(`mutation updateAggregationSettingsForOrg(
  $RiskScoringModel: risk_scoring_model_enum
  $AppetiteCascadingModel: appetite_model_enum
  $Config: jsonb
) {
  insert_aggregation_org(
    objects: {
      RiskScoringModel: $RiskScoringModel
      Appetite: $AppetiteCascadingModel
      Config: $Config
    }
    on_conflict: {
      constraint: aggregation_org_pkey
      update_columns: [RiskScoringModel, Appetite, Config]
    }
  ) {
    affected_rows
  }
}`);o(`fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`);o(`mutation deleteAppetites($Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: $Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: $Ids } }) {
    affected_rows
  }

  delete_appetite(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getActiveAppetitesByParentId($parentId: uuid!) {
  appetite_parent(
    where: { ParentId: { _eq: $parentId }, Status: { _eq: active } }
  ) {
    Status
    appetite {
      ...AppetiteParts
      impact {
        Id
        Name
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`);o(`query getActiveRiskAppetites($where: appetite_parent_bool_exp! = {}) {
  appetite_parent(where: $where) {
    Status
    appetite {
      ...AppetiteParts
      modifiedByUser {
        FriendlyName
      }
    }
    risk {
      Id
      Tier
      Title
      SequentialId
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessmentResults(
        where: {
          riskAssessmentResult: {
            ControlType: { _eq: Controlled }
            RatingType: { _in: ["assessment", "rating"] }
          }
        }
        order_by: [
          { riskAssessmentResult: { TestDate: desc_nulls_last } }
          { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        riskAssessmentResult {
          Rating
          Likelihood
          Impact
        }
      }
      riskScore {
        InherentScore
        ResidualScore
        InherentRating
        ResidualRating
        InherentLikelihood
        InherentImpact
        ResidualLikelihood
        ResidualImpact
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getAppetiteAuditById($Id: uuid) {
  appetite_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    LowerAppetite
    UpperAppetite
    ImpactAppetite
    LikelihoodAppetite
    Statement
    EffectiveDate
    AppetiteType
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    SequentialId
  }
}`);o(`query getAppetiteById($_eq: uuid) {
  appetite(where: { Id: { _eq: $_eq } }) {
    ...AppetiteParts
    files {
      ...RelationFileParts
    }
    impact {
      Id
    }
    parents {
      risk {
        Id
      }
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getAppetites {
  appetite {
    Id
    SequentialId
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getAppetitesByRiskId($riskId: uuid!) {
  appetite_parent(
    where: { ParentId: { _eq: $riskId } }
    order_by: [
      { appetite: { EffectiveDate: desc_nulls_last } }
      { appetite: { CreatedAtTimestamp: desc_nulls_last } }
    ]
  ) {
    Status

    appetite {
      ...AppetiteParts
      modifiedByUser {
        FriendlyName
      }
      impact {
        Id
        Name
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`);o(`query getAppetitesGroupedByImpact {
  impact {
    Id
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      parents {
        risk {
          Id
        }
      }
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`);o(`mutation insertAppetite(
  $LowerAppetite: Int
  $ParentIds: [uuid!]!
  $Statement: String
  $UpperAppetite: Int
  $ImpactAppetite: Int
  $LikelihoodAppetite: Int
  $AppetiteType: appetite_type_enum
  $EffectiveDate: timestamptz
  $CustomAttributeData: jsonb
  $ImpactId: uuid
) {
  insertChildAppetite(
    LowerAppetite: $LowerAppetite
    ParentIds: $ParentIds
    Statement: $Statement
    UpperAppetite: $UpperAppetite
    CustomAttributeData: $CustomAttributeData
    EffectiveDate: $EffectiveDate
    AppetiteType: $AppetiteType
    ImpactAppetite: $ImpactAppetite
    LikelihoodAppetite: $LikelihoodAppetite
    ImpactId: $ImpactId
  ) {
    Id
  }
}`);o(`mutation updateAppetite(
  $LowerAppetite: Int
  $Statement: String
  $UpperAppetite: Int
  $ImpactAppetite: Int
  $LikelihoodAppetite: Int
  $Id: uuid!
  $OriginalTimestamp: timestamptz
  $EffectiveDate: timestamptz
  $AppetiteType: appetite_type_enum
  $CustomAttributeData: jsonb
  $ImpactId: uuid
) {
  update_appetite(
    _set: {
      LowerAppetite: $LowerAppetite
      Statement: $Statement
      UpperAppetite: $UpperAppetite
      CustomAttributeData: $CustomAttributeData
      EffectiveDate: $EffectiveDate
      AppetiteType: $AppetiteType
      ImpactAppetite: $ImpactAppetite
      LikelihoodAppetite: $LikelihoodAppetite
      ImpactId: $ImpactId
    }
    where: {
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
      Id: { _eq: $Id }
    }
  ) {
    affected_rows
  }
}`);o(`query getChangeRequestsByApproval($approvalId: uuid!) {
  change_request(
    where: {
      responses: { approver: { level: { ApprovalId: { _eq: $approvalId } } } }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    Id
  }
}`);o(`mutation deleteApproval($Id: uuid!) {
  delete_approval(where: { Id: { _eq: $Id } }) {
    affected_rows
  }
}`);o(`query getApprovalAuditById($Id: uuid!) {
  approval_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Workflow
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedAtTimestamp
    CreatedByUser
    InFlightEditRule
  }
}`);o(`query getApprovalById($Id: uuid!) {
  approval: approval_by_pk(Id: $Id) {
    Id
    Workflow
    ModifiedAtTimestamp
    CreatedAtTimestamp
    InFlightEditRule
    levels(order_by: { SequenceOrder: asc }) {
      Id
      approvers {
        Id
        UserId
        UserGroupId
        OwnerApprover
        user {
          FriendlyName
        }
        group {
          Name
        }
      }
      ApprovalRuleType
    }
    createdBy {
      Id
      FriendlyName
    }
  }
}`);o(`query getGlobalApprovals($global: Boolean = true, $parentId: uuid) {
  approval(
    where: {
      _or: [
        {
          _and: [
            { ParentId: { _is_null: $global } }
            { _not: { Workflow: { _is_null: $global } } }
          ]
        }
        { ParentId: { _eq: $parentId } }
      ]
    }
  ) {
    Id
    Workflow
    ModifiedAtTimestamp
    CreatedAtTimestamp
    createdBy {
      Id
      FriendlyName
    }
    levels(order_by: { SequenceOrder: asc }) {
      Id
    }
  }
}`);o(`mutation insertApproval($approval: approval_insert_input!) {
  insert_approval_one(object: $approval) {
    Id
  }
}`);o(`mutation updateApproval(
  $Id: uuid!
  $approval: approval_set_input!
  $updateLevels: [approval_level_updates!]!
  $insertLevels: [approval_level_insert_input!]!
  $insertApprovers: [approver_insert_input!]!
  $deleteLevelIds: [uuid!]!
  $deleteApproverIds: [uuid!]!
) {
  update_approval_by_pk(pk_columns: { Id: $Id }, _set: $approval) {
    Id
  }
  delete_approval_level(where: { Id: { _in: $deleteLevelIds } }) {
    affected_rows
  }
  delete_approver(where: { Id: { _in: $deleteApproverIds } }) {
    affected_rows
  }
  update_approval_level_many(updates: $updateLevels) {
    affected_rows
  }
  insert_approval_level(objects: $insertLevels) {
    affected_rows
  }
  insert_approver(objects: $insertApprovers) {
    affected_rows
  }
}`);o(`fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}`);o(`mutation deleteAssessmentActivities($Ids: [uuid!]) {
  delete_assessment_activity(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAssessmentActivities {
  assessment_activity(where: { parentAssessment: {} }) {
    ...AssessmentActivityParts
    parentRisk {
      Title
      SequentialId
      scheduleState {
        DueDate
        OverdueDate
      }
    }
    assignedUser {
      Id
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getAssessmentActivitiesByParentId($AssessmentId: uuid!) {
  assessment_activity(
    where: { ParentId: { _eq: $AssessmentId }, IsRCSA: { _eq: false } }
  ) {
    ...AssessmentActivityParts
    assignedUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getAssessmentActivityAuditById($Id: uuid!) {
  assessment_activity_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Title
    Id
    ParentId
    Summary
    Status
    ActivityType
    CompletionDate
    AssignedUser
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`);o(`query getAssessmentActivityById($AssessmentActivityId: uuid!) {
  assessment_activity(where: { Id: { _eq: $AssessmentActivityId } }) {
    ...AssessmentActivityParts
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
  linked_item(where: { Source: { _eq: $AssessmentActivityId } }) {
    Id
    Source
    Target
    target_control {
      ...ControlParts
    }
    target_control_group {
      ...ControlGroupParts
    }
    target_obligation {
      ...ObligationParts
    }
    target_document {
      ...DocumentParts
    }
    target_risk {
      ...RiskParts
    }
    target_assessment_activity {
      ...AssessmentActivityParts
    }
    target_assessment {
      ...AssessmentParts
    }
    target_impact {
      ...ImpactParts
    }
    target_obligation_impact {
      Id
      Description
      ParentObligationId
    }
    target_impact_rating {
      Id
      impact {
        ...ImpactParts
      }
    }
    target_action {
      ...ActionParts
    }
    target_indicator {
      ...IndicatorParts
    }
    target_acceptance {
      ...AcceptanceParts
    }
    target_appetite {
      ...AppetiteParts
    }
    target_issue {
      ...IssueParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}`);o(`query getAssessmentRCSAActivitiesByParentId($AssessmentId: uuid!) {
  assessment_activity(
    where: { ParentId: { _eq: $AssessmentId }, IsRCSA: { _eq: true } }
  ) {
    ...AssessmentActivityParts
    parentRisk {
      Title
      SequentialId
    }
    assignedUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation insertAssessmentActivityWithLinkedItems(
  $ActivityType: assessment_activity_type_enum!
  $ParentId: uuid!
  $Status: assessment_activity_status_enum!
  $Summary: String
  $Title: String!
  $CompletionDate: timestamptz
  $AssignedUser: String
  $LinkedItemIds: [uuid!]!
  $CustomAttributeData: jsonb
  $IsRCSA: Boolean
  $RiskId: uuid
  $OwnerUserIds: [String!]!
  $OwnerGroupIds: [uuid!]!
) {
  insertAssessmentActivityWithLinkedItems(
    ActivityType: $ActivityType
    ParentId: $ParentId
    Status: $Status
    Summary: $Summary
    Title: $Title
    CompletionDate: $CompletionDate
    AssignedUser: $AssignedUser
    LinkedItemIds: $LinkedItemIds
    CustomAttributeData: $CustomAttributeData
    IsRCSA: $IsRCSA
    RiskId: $RiskId
    OwnerUserIds: $OwnerUserIds
    OwnerGroupIds: $OwnerGroupIds
  ) {
    Id
  }
}`);o(`mutation updateAssessmentActivityWithLinkedItems(
  $ActivityType: assessment_activity_type_enum!
  $Status: assessment_activity_status_enum!
  $Summary: String
  $Title: String
  $CompletionDate: timestamptz
  $AssignedUser: String
  $OriginalTimestamp: timestamptz
  $Id: uuid!
  $ParentId: uuid!
  $LinkedItemIds: [uuid!]!
  $CustomAttributeData: jsonb
  $IsWizardAction: Boolean
  $OwnerUserIds: [String!]!
  $OwnerGroupIds: [uuid!]!
) {
  updateAssessmentActivityWithLinkedItems(
    Id: $Id
    ParentId: $ParentId
    ActivityType: $ActivityType
    Status: $Status
    Summary: $Summary
    Title: $Title
    CompletionDate: $CompletionDate
    AssignedUser: $AssignedUser
    OriginalTimestamp: $OriginalTimestamp
    LinkedItemIds: $LinkedItemIds
    CustomAttributeData: $CustomAttributeData
    IsWizardAction: $IsWizardAction
    OwnerUserIds: $OwnerUserIds
    OwnerGroupIds: $OwnerGroupIds
  ) {
    Id
  }
}`);o(`fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`mutation deleteAssessmentResults($Ids: [uuid!]!) {
  delete_document_assessment_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_obligation_assessment_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_risk_assessment_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_test_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAllAssessmentResults {
  document_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...DocumentAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...ObligationAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_assessment_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { assessment: {} } }
  ) {
    ...RiskAssessmentResultParts
    assessments: parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getAssessmentResultById($Id: uuid!) {
  assessment_result_parent(where: { Id: { _eq: $Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationAssessmentResultParts
    }
    documentAssessmentResult {
      ...DocumentAssessmentResultParts
    }
    riskAssessmentResult {
      ...RiskAssessmentResultParts
    }
    testResult {
      ...TestResultParts
    }
    impactRating {
      ...ImpactRatingParts
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getAssessmentResultParentAuditById($Id: uuid!) {
  assessment_result_parent_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    ParentId
    ResultType
    ParentType
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getAssessmentResultsByParentId($ParentId: uuid!) {
  document_assessment_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentAssessmentResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_assessment_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationAssessmentResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_assessment_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  test_result(
    where: { assessmentParents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...TestResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_rating(
    where: { assessmentParents: { ParentId: { _eq: $ParentId } } }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`query getDocumentAssessmentResultAuditById(
  $Id: uuid!
) {
  document_assessment_result_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Rating
    CustomAttributeData
    Rationale
    TestDate
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getDocumentAssessmentResultById($Id: uuid!) {
  document_assessment_result(where: { Id: { _eq: $Id } }) {
    ...DocumentAssessmentResultParts
    parents {
      document {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getDocumentAssessmentResultsByParentId($ParentId: uuid!) {
  document_assessment_result(
    where: {
      parents: { ParentId: { _eq: $ParentId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...DocumentAssessmentResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestDocumentAssessmentResultByDocumentId($DocumentId: uuid!) {
  document_assessment_result(
    where: {
      parents: { ParentId: { _eq: $DocumentId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestDocumentAssessmentResults {
  document_assessment_result(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...DocumentAssessmentResultParts
    parents {
      ParentId
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment DocumentAssessmentResultParts on document_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestObligationAssessmentResultByObligationId($ObligationId: uuid!) {
  obligation_assessment_result(
    where: {
      parents: { ParentId: { _eq: $ObligationId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...ObligationAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestObligationAssessmentResults {
  obligation_assessment_result(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
  ) {
    ...ObligationAssessmentResultParts
    parents {
      ParentId
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`subscription getLatestRiskScoresByRiskId($RiskId: uuid!) {
  risk_score(where: { RiskId: { _eq: $RiskId } }) {
    ResidualScore
    InherentScore
    ResidualRating
    InherentRating
    ResidualImpact
    ResidualLikelihood
    InherentImpact
    InherentLikelihood
    ModifiedAtTimestamp
  }
}`);o(`query getObligationAssessmentResultAuditById(
  $Id: uuid!
) {
  obligation_assessment_result_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Rating
    CustomAttributeData
    Rationale
    TestDate
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`);o(`query getObligationAssessmentResultById($Id: uuid!) {
  obligation_assessment_result(where: { Id: { _eq: $Id } }) {
    ...ObligationAssessmentResultParts
    parents {
      obligation {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getObligationAssessmentResultsByObligationId($ObligationId: uuid!) {
  obligation_assessment_result(
    where: {
      parents: { ParentId: { _eq: $ObligationId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...ObligationAssessmentResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationAssessmentResultParts on obligation_assessment_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getRiskAssessmentResultAuditById(
  $Id: uuid!
) {
  risk_assessment_result_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Likelihood
    Impact
    Rating
    ControlType
    CustomAttributeData
    Rationale
    TestDate
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`);o(`query getRiskAssessmentResultById($Id: uuid!) {
  risk_assessment_result(where: { Id: { _eq: $Id } }) {
    ...RiskAssessmentResultParts
    parents {
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getRiskAssessmentResultsByControlType {
  controlled: risk_assessment_result(
    where: {
      ControlType: { _eq: Controlled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents {
      ParentId
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
  }
  uncontrolled: risk_assessment_result(
    where: {
      ControlType: { _eq: Uncontrolled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents {
      ParentId
      risk {
        Id
        Title
      }
      assessment {
        Id
        Title
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getRiskAssessmentResultsByRiskId($RiskId: uuid!) {
  risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: $RiskId } }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskAssessmentResultParts
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getRiskAssessmentResultsByRiskIdAndControlType(
  $RiskId: uuid!
  $ControlType: risk_assessment_result_control_type_enum!
) {
  risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: $RiskId } }
      ControlType: { _eq: $ControlType }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    Id
    Rating
    Likelihood
    Impact
    ControlType
    CustomAttributeData
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getRiskScoresByRiskId($RiskId: uuid!) {
  risk(where: { Id: { _eq: $RiskId } }) {
    Tier
  }

  inherent: risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: $RiskId } }
      ControlType: { _eq: Uncontrolled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
  residual: risk_assessment_result(
    where: {
      parents: { ParentId: { _eq: $RiskId } }
      ControlType: { _eq: Controlled }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskAssessmentResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
      }
    }
  }
}

fragment RiskAssessmentResultParts on risk_assessment_result {
  Id
  Likelihood
  Impact
  Rating
  ControlType
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`mutation insertDocumentAssessmentResult(
  $Rating: Int
  $AssessmentId: uuid
  $DocumentIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildDocumentAssessmentResult(
    Rating: $Rating
    AssessmentId: $AssessmentId
    DocumentIds: $DocumentIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertChildImpactRating(
  $Ratings: [InsertImpactRatingPairInput!]!
  $TestDate: timestamptz!
  $AssessmentId: uuid
  $RatedItemId: uuid!
  $CustomAttributeData: jsonb
  $CompletedBy: String!
  $Likelihood: Int
) {
  insertChildImpactRating(
    AssessmentId: $AssessmentId
    Ratings: $Ratings
    TestDate: $TestDate
    RatedItemId: $RatedItemId
    CustomAttributeData: $CustomAttributeData
    CompletedBy: $CompletedBy
    Likelihood: $Likelihood
  ) {
    Ids
  }
}`);o(`mutation insertObligationAssessmentResult(
  $Rating: Int
  $AssessmentId: uuid
  $ObligationIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildObligationAssessmentResult(
    Rating: $Rating
    AssessmentId: $AssessmentId
    ObligationIds: $ObligationIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertRiskAssessmentResults(
  $Rating: Int
  $Likelihood: Int
  $Impact: Int
  $ControlType: risk_assessment_result_control_type_enum
  $AssessmentId: uuid
  $RiskIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildRiskAssessmentResult(
    Rating: $Rating
    AssessmentId: $AssessmentId
    RiskIds: $RiskIds
    Impact: $Impact
    Likelihood: $Likelihood
    ControlType: $ControlType
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation updateDocumentAssessmentResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_document_assessment_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateObligationAssessmentResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_obligation_assessment_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateRiskAssessmentResult(
  $Id: uuid!
  $Impact: Int
  $Likelihood: Int
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
  $AssessmentId: uuid
) {
  updateChildRiskAssessmentResult(
    Id: $Id
    CustomAttributeData: $CustomAttributeData
    Impact: $Impact
    Likelihood: $Likelihood
    Rating: $Rating
    Rationale: $Rationale
    TestDate: $TestDate
    AssessmentId: $AssessmentId
  ) {
    affected_rows
  }
}`);o(`fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`mutation deleteAssessments($Ids: [uuid!]!) {
  # delete_document_assessment_result(where: { AssessmentId: { _in: $Ids } }) {
  #   affected_rows
  # }

  # delete_obligation_assessment_result(where: { AssessmentId: { _in: $Ids } }) {
  #   affected_rows
  # }

  # delete_risk_assessment_result(where: { AssessmentId: { _in: $Ids } }) {
  #   affected_rows
  # }

  delete_assessment(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAssessmentAuditById($Id: uuid!) {
  assessment_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ActualCompletionDate
    CompletedByUser
    CreatedAtTimestamp
    CreatedByUser
    CustomAttributeData
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    NextTestDate
    OriginatingItemId
    SequentialId
    StartDate
    Summary
    TargetCompletionDate
    Title
    Status
    Outcome
  }
}`);o(`query getAssessmentById($Id: uuid!) {
  assessment(where: { Id: { _eq: $Id } }) {
    ...AssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getAssessments($where: assessment_bool_exp! = {}) {
  assessment(where: $where) {
    ...AssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      riskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertAssessment($object: InsertAssessmentInput!) {
  insertAssessmentApi(object: $object) {
    Id
  }
}`);o(`mutation updateAssessment($object: UpdateAssessmentInput!) {
  updateAssessmentApi(object: $object) {
    affected_rows
  }
}`);o(`fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query GetAttestationConfig($id: uuid!) {
  attestation_config(where: { ParentId: { _eq: $id } }, limit: 1) {
    ...AttestationConfigParts
  }

  document_file(where: { ParentDocumentId: { _eq: $id } }, limit: 1) {
    Id
    Version
    Status
    PublishedDate
  }
}

fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getGlobalUsersAndGroups {
  globalUsers: user_aggregate(where: { IsCustomerSupport: { _eq: false } }) {
    aggregate {
      count
    }
    nodes {
      Id
    }
  }
  userGroups: user_group {
    Id
    Name
    users {
      UserId
    }
  }
}`);o(`mutation insertAttestationConfig($object: InsertAttestationConfigInput) {
  insertChildAttestationConfig(object: $object) {
    Id
  }
}`);o(`fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`);o(`query getAttestationCycleRegister {
  attestation_cycle {
    ...AttestationCycleParts
  }
}

fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`);o(`query getAttestationCycles(
  $where: attestation_cycle_bool_exp!
  $orderBy: [attestation_cycle_order_by!]
) {
  attestation_cycle(where: $where, order_by: $orderBy) {
    ...AttestationCycleParts
  }
}

fragment AttestationCycleParts on attestation_cycle {
  AllowCarryForward
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  ParentId
  Status
  records {
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    ExpiresAt
    UserId
  }
  parent {
    Version
    Id
    parent {
      Title
      Id
    }
  }
}`);o(`query getActiveAttestationCycle($parentDocumentId: uuid!) {
  attestation_cycle(
    where: {
      Status: { _eq: "active" }
      parent: { ParentDocumentId: { _eq: $parentDocumentId } }
    }
  ) {
    Id
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    Status
    AllowCarryForward
    parent {
      Id
      ParentDocumentId
    }
  }
}`);o(`mutation insertAttestationCycle(
  $AllowCarryForward: Boolean!
  $DocumentId: uuid!
  $attestationConfig: InsertAttestationConfigInput
) {
  insertChildAttestationCycle(
    object: { AllowCarryForward: $AllowCarryForward, DocumentId: $DocumentId }
  ) {
    Id
  }

  insertChildAttestationConfig(object: $attestationConfig) {
    Id
  }
}`);o(`mutation attest($Id: uuid!) {
  attestRecord(Id: $Id) {
    affected_rows
  }
}`);o(`query getAttestationStatus($ParentId: uuid!, $UserId: String!) {
  attestation_record(
    where: { NodeId: { _eq: $ParentId }, UserId: { _eq: $UserId } }
    limit: 1
    order_by: { CreatedAtTimestamp: desc }
  ) {
    Id
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    config {
      PromptText
    }
  }
}`);o(`query getPolicyAttestationRecords($where: attestation_record_bool_exp! = {}) {
  attestation_record(
    where: $where
    order_by: { Active: desc, NodeId: desc, ExpiresAt: asc }
  ) {
    Id
    ExpiresAt
    Active
    CreatedAtTimestamp
    ModifiedAtTimestamp
    AttestationStatus
    AttestedAt
    UserId
    NodeId
    CycleId
    carriedForwardFromRecord {
      node {
        documentFile {
          Id
          Version
        }
      }
    }
    attestationRecordStatus {
      Status
    }
    user {
      Id
      FirstName
      LastName
      FriendlyName
      Email
      Department
    }
    node {
      documentFile {
        Id
        Version
        parent {
          Id
          Title
          owners {
            ...OwnerParts
          }
          ownerGroups {
            ...OwnerGroupParts
          }
        }
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getPolicyAttestationRecordsForDocument($documentFileId: uuid) {
  attestation_record(
    where: {
      node: { ObjectType: { _eq: document_file } }
      NodeId: { _eq: $documentFileId }
    }
    order_by: { Active: desc, NodeId: desc, ExpiresAt: asc }
  ) {
    ExpiresAt
    Active
    CreatedAtTimestamp
    AttestationStatus
    AttestedAt
    UserId
    NodeId
    CycleId
    attestationRecordStatus {
      Status
    }
    carriedForwardFromRecord {
      node {
        Id
        documentFile {
          Id
          Version
        }
      }
    }
    user {
      Id
      FriendlyName
      Email
    }
    node {
      documentFile {
        Id
        Version
        parent {
          Id
          Title
        }
      }
    }
  }
}`);o(`mutation attestationNotRequired($Ids: [uuid!]!) {
  attestationNotRequired(Ids: $Ids) {
    affected_rows
  }
}`);o(`query getAuditLogs(
  $limit: Int
  $offset: Int
  $orderBy: [audit_log_view_order_by!]
  $where: audit_log_view_bool_exp
) {
  audit_log_view(
    limit: $limit
    offset: $offset
    order_by: $orderBy
    where: $where
  ) {
    Action
    ModifiedByUser
    ModifiedAtTimestamp
    PerformedByUser {
      FriendlyName
    }
    ObjectType
    Item
    Id
    OrgKey
  }
}`);o(`query getBusinessAreas {
  business_area(order_by: { Title: asc }) {
    Id
    Title
    SequentialId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
  }
}`);o(`fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}`);o(`mutation deleteCauses($Ids: [uuid!]) {
  delete_cause(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getCauseAuditById($Id: uuid!) {
  cause_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`);o(`query getCauseById($_eq: uuid!) {
  cause(where: { Id: { _eq: $_eq } }) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`);o(`query getCauses($where: cause_bool_exp! = {}) {
  cause(where: $where) {
    ...CauseParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    issue {
      Type
      SequentialId
      CreatedAtTimestamp
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessment {
        IssueType
        ActualCloseDate
        Status
        Severity
        departments {
          ...DepartmentParts
        }
      }
    }
  }
}

fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getCausesByParentIssueId($_eq: uuid!) {
  cause(where: { ParentIssueId: { _eq: $_eq } }) {
    ModifiedByUser
    CreatedByUser
    Title
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Significance
    ParentIssueId
    Id
    Description
    CustomAttributeData
  }
}`);o(`mutation insertCause(
  $Title: String
  $Description: String
  $Significance: Int
  $ParentIssueId: uuid
  $CustomAttributeData: jsonb
) {
  insert_cause(
    objects: {
      Description: $Description
      ParentIssueId: $ParentIssueId
      Significance: $Significance
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    returning {
      Id
    }
  }
}`);o(`mutation updateCause(
  $Id: uuid
  $Title: String
  $Description: String
  $Significance: Int
  $ParentIssueId: uuid
  $OriginalTimestamp: timestamptz
  $CustomAttributeData: jsonb
) {
  update_cause(
    _set: {
      Description: $Description
      ParentIssueId: $ParentIssueId
      Significance: $Significance
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
    where: {
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
      Id: { _eq: $Id }
    }
  ) {
    affected_rows
  }
}`);o(`subscription getChangeRequestById($Id: uuid!) {
  change_request_by_pk(Id: $Id) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`subscription getChangeRequestByParentId($Id: uuid!) {
  change_request(where: { ParentId: { _eq: $Id } }) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getApprovalLevels($Workflow: String!, $ParentId: uuid) {
  levels: approval_level(
    where: {
      # Get all the the approval levels for the parent object,
      # and global approval levels for the parent type.
      approval: {
        _or: [
          { Workflow: { _eq: $Workflow }, ParentId: { _is_null: true } }
          { Workflow: { _eq: $Workflow }, ParentId: { _eq: $ParentId } }
        ]
      }
    }
    order_by: {
      # Order by specific levels first, then global levels
      approval: { ParentId: asc }
      SequenceOrder: asc
    }
  ) {
    Id
    ApprovalRuleType
    approvers {
      Id
      UserId
      UserGroupId
      OwnerApprover

      group {
        Id
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}`);o(`query getChangeRequestAuditById($Id: uuid!) {
  change_request_audit(where: {
    Id:{
      _eq: $Id
    }
  }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    SequentialId
    ParentId
    Type
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    RequestedChanges
    ChangeRequestStatus
    Comment
    OverriddenByUser
    OverriddenAtTimestamp
  }
}`);o(`query getChangeRequests(
  $where: change_request_bool_exp! = {}
  $currentUserId: String!
) {
  change_request(where: $where) {
    Id
    SequentialId
    ChangeRequestStatus
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Workflow
    parent {
      Id
      ObjectType
      SequentialId

      documentFile {
        Version
        parent {
          SequentialId
          Id
          Title
          owners {
            user {
              Id
              FriendlyName
              Email
            }
          }
        }
      }
      acceptance {
        Title
        parents {
          risk {
            owners {
              user {
                Id
                FriendlyName
                Email
              }
            }
          }
        }
      }
      risk {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      control {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      action {
        Title
        owners {
          user {
            Id
            FriendlyName
            Email
          }
        }
      }
      issue_assessment {
        parent {
          Id
          Title
          SequentialId
          owners {
            user {
              Id
              FriendlyName
              Email
            }
          }
        }
      }
    }
    ParentId
    createdBy {
      Id
      FriendlyName
    }
    contributors {
      user {
        Id
        FriendlyName
        Email
      }
    }
    responses {
      Id
      Approved
      CreatedAtTimestamp
      ModifiedAtTimestamp
      ApprovedByUser
      ApprovedAtTimestamp
      approver {
        Id
        OwnerApprover
        level {
          Id
          ApprovalRuleType
          SequenceOrder

          approval {
            InFlightEditRule
            Id
            Workflow
          }
        }
        group {
          Name
          Id
          users {
            UserId
          }
        }
        user {
          FriendlyName
          Email
          Id
        }
      }
    }
    currentUserOwnerList: parentOwnerAndContributors(
      where: {
        ContributorType: { _eq: "owner" }
        UserId: { _eq: $currentUserId }
      }
      distinct_on: [UserId]
    ) {
      UserId
    }
  }
}`);o(`query getPendingChangeRequests($ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: $ParentId }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getMostRecentNonPendingChangeRequest($ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: $ParentId }
      ChangeRequestStatus: { _neq: pending }
    }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`subscription getLivePendingChangeRequests($ParentId: uuid!) {
  change_request(
    where: {
      ParentId: { _eq: $ParentId }
      ChangeRequestStatus: { _eq: pending }
    }
  ) {
    ...ChangeRequestParts
  }
}

fragment ChangeRequestParts on change_request {
  createdBy {
    FriendlyName
    Id
    Email
  }
  Id
  SequentialId
  ParentId
  Type
  parent {
    Id
    SequentialId
    ObjectType
    owners: ancestorContributors(where: { ContributorType: { _eq: "owner" } }) {
      UserId
      user {
        FriendlyName
      }
      user_group {
        users {
          UserId
        }
      }
      ContributorType
    }

    risk {
      Title
    }
    documentFile {
      Version
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
    acceptance {
      Title
      parents {
        risk {
          Id
          owners: ancestorContributors(
            where: { ContributorType: { _eq: "owner" } }
          ) {
            UserId
            user {
              FriendlyName
            }
            user_group {
              users {
                UserId
              }
            }
            ContributorType
          }
        }
      }
    }
    control {
      Title
    }
    action {
      Title
    }
    issue_assessment {
      parent {
        Id
        SequentialId
        Title
        owners: ancestorContributors(
          where: { ContributorType: { _eq: "owner" } }
        ) {
          UserId
          user {
            FriendlyName
          }
          user_group {
            users {
              UserId
            }
          }
          ContributorType
        }
      }
    }
  }
  CreatedAtTimestamp
  ModifiedAtTimestamp
  RequestedChanges
  requestedFileChanges {
    ...RelationFileParts
  }
  ChangeRequestStatus
  contributors {
    user {
      Id
      FriendlyName
      Email
    }
  }
  Comment
  RequesterComment
  OverriddenByUser
  OverriddenAtTimestamp
  responses {
    Id
    Approved
    ModifiedAtTimestamp
    CreatedAtTimestamp
    ApprovedByUser
    ApprovedAtTimestamp
    Comment
    approver {
      Id
      OwnerApprover
      level {
        Id
        ApprovalRuleType
        SequenceOrder
        approval {
          Id
          ParentId
          Workflow
          InFlightEditRule
        }
      }
      user {
        FriendlyName
        Email
        Id
      }
      group {
        Id
        Name
        users {
          UserId
          user {
            FriendlyName
          }
        }
      }
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation overrideChangeRequestById(
  $Id: uuid!
  $Approved: Boolean!
  $Rationale: String!
) {
  overrideChangeRequest(Id: $Id, Approved: $Approved, Rationale: $Rationale) {
    Id
  }
}`);o(`mutation updateApproverResponses(
  $input: UpdateApproverResponsesInput!
) {
  updateApproverResponses(
    input: $input
  ) {
    Id
  }
}`);o(`query getColourPalettes {
  colour_palette {
    Id
    Name
    Settings
  }
}`);o(`mutation InsertColourPalette($Name: String!, $Settings: jsonb!) {
  insert_colour_palette_one(object: { Name: $Name, Settings: $Settings }) {
    Id
  }
}`);o(`mutation UpdateColourPalette($Id: uuid!, $Name: String!, $Settings: jsonb!) {
  update_colour_palette_by_pk(
    pk_columns: { Id: $Id }
    _set: { Name: $Name, Settings: $Settings }
  ) {
    Id
  }
}`);o(`mutation deleteComment($Id: uuid!) {
  delete_comment_by_pk(Id: $Id) {
    Id
  }
}`);o(`mutation deleteConversation($Id: uuid!) {
  delete_comment(where: { ConversationId: { _eq: $Id } }) {
    affected_rows
  }

  delete_conversation_by_pk(Id: $Id) {
    Id
  }
}`);o(`mutation deleteConversations($Ids: [uuid!]) {
  delete_comment(where: { ConversationId: { _in: $Ids } }) {
    affected_rows
  }

  delete_conversation(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getCommentAuditById($Id: uuid!) {
  comment_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Content
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`);o(`query getCommentsByConversationId($ConversationId: uuid!) {
  comment(where: { ConversationId: { _eq: $ConversationId } }) {
    Id
    Content
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`);o(`query getConversationAuditById($Id: uuid!) {
  conversation_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    IsResolved
    ParentId
    ModifiedAtTimestamp
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`);o(`mutation insertComment($Content: String!, $ConversationId: uuid!) {
  insert_comment_one(
    object: { Content: $Content, ConversationId: $ConversationId }
  ) {
    Id
  }
}`);o(`mutation insertConversation($Content: String!, $ParentId: uuid!) {
  insert_conversation_one(
    object: { ParentId: $ParentId, comments: { data: { Content: $Content } } }
  ) {
    Id
  }
}`);o(`mutation resolveConversation($Id: uuid!) {
  update_conversation_by_pk(
    pk_columns: { Id: $Id }
    _set: { IsResolved: true }
  ) {
    Id
  }
}`);o(`mutation updateComment($Id: uuid!, $Content: String!) {
  update_comment_by_pk(pk_columns: { Id: $Id }, _set: { Content: $Content }) {
    Id
  }
}`);o(`fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`mutation deleteComplianceMonitoringAssessments($Ids: [uuid!]!) {
  delete_compliance_monitoring_assessment(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAllComplianceMonitoringAssessments {
  compliance_monitoring_assessment(order_by: { ModifiedByUser: asc }) {
    Title
    Summary
    TargetCompletionDate
    ActualCompletionDate
    StartDate
    NextTestDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    Outcome
  }
}`);o(`query getComplianceMonitoringAssessmentById($Id: uuid!) {
  compliance_monitoring_assessment(where: { Id: { _eq: $Id } }) {
    ...ComplianceMonitoringAssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getComplianceMonitoringAssessments {
  compliance_monitoring_assessment {
    ...ComplianceMonitoringAssessmentParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      riskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertComplianceMonitoringAssessment($object: InsertAssessmentInput!) {
  insertComplianceMonitoringAssessmentApi(object: $object) {
    Id
  }
}`);o(`mutation updateComplianceMonitoringAssessment($object: UpdateAssessmentInput!) {
  updateComplianceMonitoringAssessmentApi(object: $object) {
    affected_rows
  }
}`);o(`fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`);o(`mutation deleteConsequences($Ids: [uuid!]) {
  delete_consequence(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getConsequenceAuditById($Id: uuid!) {
  consequence_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CostType
    CostValue
    Criticality
    Description
    Id
    ParentIssueId
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    Type
  }
}`);o(`query getConsequenceById($_eq: uuid!) {
  consequence(where: { Id: { _eq: $_eq } }) {
    ...ConsequenceParts
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`);o(`query getConsequences($where: consequence_bool_exp! = {}) {
  consequence(where: $where) {
    ...ConsequenceParts
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    issue {
      Type
      SequentialId
      CreatedAtTimestamp
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      assessment {
        IssueType
        ActualCloseDate
        Status
        Severity
        departments {
          ...DepartmentParts
        }
      }
      departments {
        ...DepartmentParts
      }
      tags {
        ...TagParts
      }
    }
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`);o(`query getConsequencesByParentIssueId($_eq: uuid!) {
  consequence(where: { ParentIssueId: { _eq: $_eq } }) {
    ...ConsequenceParts
  }
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}`);o(`mutation insertConsequence(
  $Title: String
  $Description: String
  $Criticality: Int
  $ParentIssueId: uuid
  $CostValue: numeric
  $CostType: cost_type_enum
  $CustomAttributeData: jsonb
  $Type: consequence_type_enum
) {
  insert_consequence_one(
    object: {
      Title: $Title
      Description: $Description
      Criticality: $Criticality
      ParentIssueId: $ParentIssueId
      CostValue: $CostValue
      CostType: $CostType
      CustomAttributeData: $CustomAttributeData
      Type: $Type
    }
  ) {
    Id
  }
}`);o(`mutation updateConsequence(
  $Id: uuid
  $Title: String
  $Description: String
  $Criticality: Int
  $CostType: cost_type_enum
  $CostValue: numeric
  $ParentIssueId: uuid
  $OriginalTimestamp: timestamptz
  $CustomAttributeData: jsonb
  $Type: consequence_type_enum
) {
  update_consequence(
    where: {
      Id: { _eq: $Id }
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
    }
    _set: {
      Title: $Title
      Description: $Description
      Criticality: $Criticality
      CostType: $CostType
      CostValue: $CostValue
      ParentIssueId: $ParentIssueId
      CustomAttributeData: $CustomAttributeData
      Type: $Type
    }
  ) {
    affected_rows
  }
}`);o(`mutation addControlParents($objects: [control_parent_insert_input!]!) {
  insert_control_parent(objects: $objects) {
    affected_rows
  }
}`);o(`fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation deleteControls($Ids: [uuid!]!) {
  deleteControlsById(Ids: $Ids) {
    affected_rows
  }
}`);o(`query getControlAuditById($Id: uuid) {
  control_audit(
    where: { Id: { _eq: $Id } }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    CreatedByUser
    ModifiedByUser
    Description
    Id
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    Type
    CustomAttributeData
    SequentialId
  }
}`);o(`query getControlById($_eq: uuid) {
  control(where: { Id: { _eq: $_eq } }) {
    ...ControlParts
    scheduleState {
      LatestDate
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getControls($where: control_bool_exp! = {}) {
  control(where: $where) {
    ...ControlParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    open_issue_aggregate: issues_aggregate(
      where: { issue: { assessment: { Status: { _eq: open } } } }
    ) {
      aggregate {
        count
      }
    }
    issues_aggregate {
      aggregate {
        count
      }
    }
    indicators_aggregate {
      aggregate {
        count
      }
    }
    testResults(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      order_by: { TestDate: desc, ModifiedAtTimestamp: desc }
    ) {
      OverallEffectiveness
      DesignEffectiveness
      PerformanceEffectiveness
      TestDate
      Id
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      risk {
        Title
      }
      thirdParty {
        Title
      }
      group {
        Id
        Title
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getControlsBasic {
  # Note: Query is must faster for standard users when controls are queried separately to nodes
  control {
    Id
    Title
    SequentialId
  }
  # Get control nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: control } }) {
    Id
    SequentialId
  }
}`);o(`query getControlsByUser($_eq: String = "") {
  control(where: { CreatedByUser: { _eq: $_eq } }) {
    ...ControlParts
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation insertChildControl($object: InsertChildControlInput) {
  insertChildControl(object: $object) {
    Id
  }
}`);o(`mutation removeParentControls($ParentId: uuid!, $ControlIds: [uuid!]!) {
  delete_control_parent(
    where: { ParentId: { _eq: $ParentId }, ControlId: { _in: $ControlIds } }
  ) {
    affected_rows
  }
}`);o(`mutation updateControl($object: UpdateChildControlInput) {
  updateChildControl(object: $object) {
    affected_rows
  }
}`);o(`fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`);o(`mutation deleteControlGroup($id: uuid!, $original_timestamp: timestamptz) {
  delete_control_group(
    where: {
      Id: { _eq: $id }
      ModifiedAtTimestamp: { _eq: $original_timestamp }
    }
  ) {
    affected_rows
  }
}`);o(`query getControlGroupAuditById($_eq: uuid!) {
  control_group_audit(where: { Id: { _eq: $_eq } }, order_by: {ModifiedAtTimestamp: desc}) {
    Description
    Id
    Owner
    ModifiedAtTimestamp
    CreatedAtTimestamp
    Title
    ModifiedByUser
    CreatedByUser
    CustomAttributeData
  }
}`);o(`query getControlGroupById($_eq: uuid!) {
  control_group(where: { Id: { _eq: $_eq } }) {
    ...ControlGroupParts
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getControlGroups {
  control_group(order_by: { Title: asc }) {
    ...ControlGroupParts
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`);o(`query getControlGroupsByTitle($title: String!) {
  control_group(where: { Title: { _eq: $title } }) {
    ...ControlGroupParts
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`);o(`query getControlGroupsFlat {
  control_group {
    ...ControlGroupParts
    controls_aggregate {
      aggregate {
        count
      }
    }
    owner {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}`);o(`mutation insertControlGroup(
  $Title: String!
  $Description: String!
  $Owner: String!
  $CustomAttributeData: jsonb
) {
  insert_control_group_one(
    object: {
      Title: $Title
      Description: $Description
      Owner: $Owner
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    Id
  }
}`);o(`mutation updateControlGroup(
  $Description: String!
  $Owner: String!
  $Title: String!
  $Id: uuid!
  $OriginalTimestamp: timestamptz!
  $CustomAttributeData: jsonb
) {
  update_control_group(
    where: {
      Id: { _eq: $Id }
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
    }
    _set: {
      Description: $Description
      Owner: $Owner
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    affected_rows
  }
}`);o(`query getCustomAttributeSchemaAuditById($Id: uuid!) {
  custom_attribute_schema_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    Id
    Schema
    Title
    UiSchema
  }
}`);o(`mutation deleteCustomDatasource($Id: uuid!) {
  delete_custom_datasource_by_pk(Id: $Id) {
    Id
  }
}`);o(`query getCustomDatasourceById($Id: uuid!) {
  custom_datasource_by_pk(Id: $Id) {
    Title
    Id
    Filters
    Datasources
    Fields
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
  }
}`);o(`query getCustomDatasources {
  custom_datasource {
    Title
    Id
    Filters
    Datasources
    Fields
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`);o(`mutation insertCustomDataSource(
  $customDatasource: custom_datasource_insert_input!
) {
  insert_custom_datasource_one(object: $customDatasource) {
    Id
  }
}`);o(`mutation updateCustomDatasource(
  $Id: uuid!
  $Data: custom_datasource_set_input!
) {
  update_custom_datasource_by_pk(pk_columns: { Id: $Id }, _set: $Data) {
    Id
  }
}`);o(`query getCustomRibbonAuditById($Id: uuid!) {
  custom_ribbon_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    Id
    Filters
    ParentType
  }
}`);o(`query getRibbonItemsByParentType($parentType: parent_type_enum!) {
  custom_ribbon(where: { ParentType: { _eq: $parentType } }) {
    Id
    ParentType
    Filters
    ModifiedAtTimestamp
  }
}`);o(`mutation insertRibbonItemsByParentType(
  $parentType: parent_type_enum!
  $filters: jsonb!
) {
  insert_custom_ribbon_one(
    object: { ParentType: $parentType, Filters: $filters }
    on_conflict: {
      update_columns: [Filters]
      constraint: idx_customribbon_orgkey_parenttype
    }
  ) {
    Id
  }
}`);o(`mutation updateRibbonItemsByParentType(
  $id: uuid
  $originalTimestamp: timestamptz!
  $parentType: parent_type_enum!
  $filters: jsonb!
) {
  update_custom_ribbon(
    where: {
      Id: { _eq: $id }
      ParentType: { _eq: $parentType }
      ModifiedAtTimestamp: { _eq: $originalTimestamp }
    }
    _set: { Filters: $filters }
  ) {
    affected_rows
  }
}`);o(`mutation customRoleUserUpdate($input: CustomRoleUserUpdateInputData) {
  customRoleUserUpdate(Input: $input) {
    affected_rows
  }
}`);o(`mutation deleteCustomRole($filter: custom_role_bool_exp!) {
  delete_custom_role(where: $filter) {
    affected_rows
  }
}`);o(`query getCustomRoleById($Id: uuid) {
  custom_role(where: { Id: { _eq: $Id } }) {
    Id
    RoleName
    Description
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    customRoleUsers {
      UserId
      Id
    }
    customRoleAssignments {
      RoleTypeKey
      Id
    }
  }
}`);o(`query getCustomRoles {
  custom_role {
    Id
    RoleName
    Description
    CreatedAtTimestamp
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    customRoleUsers_aggregate {
      aggregate {
        count
      }
    }
  }
}`);o(`mutation insertCustomRole($input: CustomRoleInsertInputData) {
  customRoleInsert(Input: $input) {
    Id
  }
}`);o(`mutation updateCustomRole($input: CustomRoleUpdateInputData) {
  customRoleUpdate(Input: $input) {
    affected_rows
  }
}`);o(`fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}`);o(`mutation deleteDashboard($Id: uuid!) {
  delete_dashboard_by_pk(Id: $Id) {
    Id
  }
}`);o(`query getDashboardAuditById($Id: uuid!) {
  dashboard_audit(where: {Id: {_eq: $Id}}, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    Name
    Description
    Sharing
    Content
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getDashboardById($Id: uuid!) {
  dashboard_by_pk(Id: $Id) {
    ...DashboardParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getDashboards {
  dashboard {
    ...DashboardParts
  }
}

fragment DashboardParts on dashboard {
  Id
  Name
  Description
  Sharing
  Content
  CreatedByUser
}`);o(`query getMyItemsDashboard(
  $userId: String!
  $actionFilterConditions: action_bool_exp!
  $riskFilterConditions: risk_bool_exp!
  $indicatorFilterConditions: indicator_bool_exp!
  $documentFilterConditions: document_bool_exp!
  $assessmentFilterConditions: assessment_bool_exp!
  $controlFilterConditions: control_bool_exp!
  $issueFilterConditions: issue_bool_exp!
  $assessmentActivityFilterConditions: assessment_activity_bool_exp!
  $obligationFilterConditions: obligation_bool_exp!
) {
  change_request {
    ...MyItemsChangeRequestParts
  }

  action(
    where: {
      _or: [$actionFilterConditions]
      _and: [{ Status: { _neq: closed } }]
    }
  ) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  risk(where: $riskFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  indicator(where: $indicatorFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  document(where: $documentFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment(where: $assessmentFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment_activity(
    where: {
      _or: [$assessmentActivityFilterConditions]
      _and: [{ IsRCSA: { _eq: true } }, { Status: { _neq: complete } }]
    }
  ) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
  }

  control(where: $controlFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  issue(
    where: {
      _or: [$issueFilterConditions]
      _and: [
        {
          _or: [
            { _not: { assessment: {} } }
            { assessment: { Status: { _neq: closed } } }
          ]
        }
      ]
    }
  ) {
    Id
    assessment {
      Status
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  attestation_record_aggregate(
    where: {
      _and: [
        { UserId: { _eq: $userId } }
        { AttestationStatus: { _eq: pending } }
      ]
    }
  ) {
    aggregate {
      count
    }
  }

  obligation(where: $obligationFilterConditions) {
    Id
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }
}

fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: $userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}

fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}

fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`);o(`mutation insertDashboard(
  $Name: String!
  $Description: String
  $Sharing: dashboard_sharing_type_enum_action!
  $Content: jsonb!
  $ContributorGroupIds: [uuid!]!
  $ContributorUserIds: [String!]!
) {
  insertChildDashboard(
    Name: $Name
    Description: $Description
    Sharing: $Sharing
    Content: $Content
    ContributorUserIds: $ContributorUserIds
    ContributorGroupIds: $ContributorGroupIds
  ) {
    Id
  }
}`);o(`fragment MyItemsAncestorContributorsParts on ancestor_contributor {
  ContributorType
  Id
  AncestorId
  UserGroupId
}`);o(`fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: $userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}`);o(`fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`);o(`fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`);o(`mutation updateDashboard(
  $Id: uuid!
  $Name: String!
  $Description: String
  $Sharing: dashboard_sharing_type_enum_action!
  $Content: jsonb!
  $ContributorUserIds: [String!]!
  $ContributorGroupIds: [uuid!]!
) {
  updateChildDashboard(
    Id: $Id
    Content: $Content
    Description: $Description
    Name: $Name
    Sharing: $Sharing
    ContributorUserIds: $ContributorUserIds
    ContributorGroupIds: $ContributorGroupIds
  ) {
    Id
  }
}`);o(`mutation dataExportCreateSchedule(
  $object: DataExportCreateScheduleInput!
) {
  dataExportCreateSchedule(
    object: $object
  ) {
    message
  }
}`);o(`query dataExportOneOffExport {
  dataExportOneOffExport {
    message
    downloadUrl
    expiresInSeconds
  }
}`);o(`subscription getActiveDataExportSchedule {
  data_export_schedule(
    where: { Status: { _eq: active } }
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Frequency
    StartTimestamp
    EndTimestamp
    StorageType
  }
}`);o(`subscription getDataExportScheduleExecutions {
  data_export_schedule_execution {
    ParentId
    ExecutionTimestamp
    Status
    Errors
    dataExportSchedule {
      Frequency
      StartTimestamp
      EndTimestamp
    }
  }
}`);o(`mutation dataExportTestSchedule($object: DataExportTestScheduleInput!) {
  dataExportTestSchedule(object: $object) {
    message
  }
}`);o(`mutation dataImportStartImport($Id: uuid!) {
  dataImportStartImport(Id: $Id) {
    message
  }
}`);o(`mutation dataImportValidate($Id: uuid!) {
  dataImportValidate(Id: $Id) {
    message
  }
}`);o(`mutation deleteDataImportById($id: uuid!) {
  delete_data_import(where: { Id: { _eq: $id } }) {
    affected_rows
  }
}`);o(`query getDataImportById($id: uuid!) {
  data_import(where: { Id: { _eq: $id } }) {
    Id
    files {
      ...RelationFileParts
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getDataImportErrors($dataImportId: uuid) {
  data_import_error(where: { DataImportId: { _eq: $dataImportId } }) {
    RowNumber
    ImportObject
    DataImportId
    Message
  }
}`);o(`subscription getDataImportStatus($id: uuid!) {
  data_import(where: { Id: { _eq: $id } }) {
    Status
  }
}`);o(`query getDataImports {
  data_import {
    Id
    Status
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
  }
}`);o(`mutation insertDataImport {
  insert_data_import_one(object: {}) {
    Id
  }
}`);o(`mutation deleteDepartmentTypes($Ids: [uuid!]!) {
  deleteDepartmentTypeApi(Ids: $Ids) {
    affected_rows
  }
}`);o(`fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getDepartmentAuditById($DepartmentTypeId: uuid!, $ParentId: uuid!) {
  department_audit(where: {DepartmentTypeId: {_eq: $DepartmentTypeId}, ParentId: {_eq: $ParentId}}, order_by: {ModifiedAtTimestamp: desc}) {
    DepartmentTypeId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
  }
}`);o(`query GetDepartmentTypeById($Id: uuid) {
  department_type(where: { DepartmentTypeId: { _eq: $Id } }) {
    DepartmentTypeId
    Name
    Description
    ModifiedAtTimestamp
    DepartmentTypeGroupId
    department_type_group {
      Id
      Name
    }
  }
}`);o(`query getDepartmentTypesByName($Name: String!) {
  department_type(where: { Name: { _eq: $Name } }) {
    Name
    DepartmentTypeId
  }
}`);o(`query getDepartmentTypeGroups {
  department_type_group(order_by: { Name: asc }) {
    Id
    Name
  }
}`);o(`query getDepartments {
  department_type(order_by: { Name: asc }) {
    DepartmentTypeId
    Name
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    department_type_group {
      Id
      Name
    }
  }
}`);o(`mutation InsertDepartmentTypeGroupByName($Name: String) {
  insert_department_type_group_one(
    object: { Name: $Name }
    on_conflict: {
      constraint: DepartmentTypeGroup_pkey
      update_columns: Name
      where: { Name: { _eq: $Name } }
    }
  ) {
    Id
  }
}`);o(`mutation insertDepartmentTypeWithGroupName(
  $Name: String!
  $Description: String
  $DepartmentGroupName: String
) {
  insert_department_type_one(
    object: {
      Name: $Name
      Description: $Description
      department_type_group: {
        data: { Name: $DepartmentGroupName }
        on_conflict: {
          constraint: DepartmentTypeGroup_pkey
          update_columns: Name
        }
      }
    }
  ) {
    DepartmentTypeId
  }
}`);o(`mutation insertDepartmentTypeWithOptionalGroupId(
  $Name: String!
  $Description: String
  $DepartmentTypeGroupId: uuid
) {
  insert_department_type_one(
    object: {
      Name: $Name
      Description: $Description
      DepartmentTypeGroupId: $DepartmentTypeGroupId
    }
  ) {
    DepartmentTypeId
  }
}`);o(`mutation UpdateDepartmentType(
  $DepartmentTypeId: uuid!
  $Name: String
  $Description: String
  $DepartmentTypeGroupId: uuid
  $OriginalTimestamp: timestamptz
) {
  update_department_type(
    where: {
      DepartmentTypeId: { _eq: $DepartmentTypeId }
      _and: { ModifiedAtTimestamp: { _eq: $OriginalTimestamp } }
    }
    _set: {
      Name: $Name
      Description: $Description
      DepartmentTypeGroupId: $DepartmentTypeGroupId
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteDocument($id: uuid!) {
  deleteDocumentById(Id: $id) {
    affected_rows
  }
}`);o(`fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`query getDocumentAuditById($id: uuid!) {
  document_audit(
    where: { Id: { _eq: $id } }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    Id
    Title
    DocumentType
    Purpose
    ParentDocument
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
    SequentialId
  }
}`);o(`query getDocumentById($id: uuid!) {
  document(where: { Id: { _eq: $id } }) {
    ...DocumentParts
    tags {
      ...TagParts
    }
    scheduleState {
      LatestDate
    }
    departments {
      ...DepartmentParts
    }
    linkedDocuments {
      LinkedDocumentId
      child {
        Title
      }
    }
    attestationConfig {
      ...AttestationConfigParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    latestDraftVersion: documentFiles(
      where: { Status: { _in: [draft, pending_approval] } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Status
    }
    latestPublishedVersion: documentFiles(
      where: { Status: { _in: [published, archived] } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Status
    }
    parent {
      Title
    }
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AttestationConfigParts on attestation_config {
  RequireGlobalAttestation
  AttestationTimeLimit
  PromptText
  groups {
    ...AttestationGroupParts
  }
}

fragment AttestationGroupParts on attestation_group {
  GroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getDocumentList {
  document(order_by: { Title: asc }) {
    Id
    Title
  }
}`);o(`query getDocuments(
  $where: document_bool_exp! = {}
  $filesWhere: document_file_bool_exp = {}
  $documentAssessmentResultsWhere: document_assessment_result_bool_exp = {}
  $includeAssessmentResultsHistory: Boolean = false
) {
  document(where: $where) {
    ...DocumentParts
    parent {
      Title
    }
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    documentFiles(
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
      where: $filesWhere
    ) {
      Status
      ReviewDate
      NextReviewDate
      changeRequests(
        distinct_on: [ChangeRequestStatus]
        order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
      ) {
        ChangeRequestStatus
        ModifiedAtTimestamp
      }
    }
    latestPublishedVersion: documentFiles(
      where: { PublishedDate: { _is_null: false } }
      order_by: { PublishedDate: desc }
      limit: 1
    ) {
      PublishedDate
    }
    assessmentResults(
      where: {
        documentAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            $documentAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { documentAssessmentResult: { TestDate: desc_nulls_last } }
        { documentAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) @include(if: $includeAssessmentResultsHistory) {
      ParentId
      documentAssessmentResult {
        Id
        Rating
        TestDate
        CreatedAtTimestamp
      }
    }
  }
  assessment_result_parent(
    where: {
      documentAssessmentResult: {
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
    distinct_on: [ParentId]
    order_by: [
      { ParentId: desc }
      {
        documentAssessmentResult: {
          TestDate: desc_nulls_last
          CreatedAtTimestamp: desc_nulls_last
        }
      }
    ]
  ) {
    documentAssessmentResult {
      parents {
        ParentId
      }
      Id
      Rating
      CustomAttributeData
    }
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertDocument($object: InsertChildDocumentInput) {
  insertChildDocument(object: $object) {
    Id
  }
}`);o(`mutation updateDocument($object: UpdateChildDocumentInput) {
  updateChildDocument(object: $object) {
    Id
  }
}`);o(`fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}`);o(`fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}`);o(`mutation deleteDocumentFiles($documentFileIds: [uuid!]!) {
  delete_file(where: { documentFile: { Id: { _in: $documentFileIds } } }) {
    affected_rows
  }

  delete_document_file(where: { Id: { _in: $documentFileIds } }) {
    affected_rows
  }
}`);o(`query getDocumentFileAuditById($id: uuid!) {
  document_file_audit(where: { Id: { _eq: $id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CustomAttributeData
    CreatedAtTimestamp
    CreatedByUser
    FileId
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    NextReviewDate
    ParentDocumentId
    ReasonForReview
    ReviewDate
    ReviewedBy
    Status
    Summary
    Version
    Type
  }
}`);o(`query getDocumentFileById($id: uuid!) {
  document_file(where: { Id: { _eq: $id } }) {
    ...DocumentRelationFileParts
    Content
    Link
    Version
    file {
      ...FileParts
    }
    parent {
      Id
      Title
      ownerGroups {
        ...OwnerGroupParts
      }
      owners {
        ...OwnerParts
      }
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}`);o(`query getDocumentFilesByDocumentId($documentId: uuid!) {
  document_file(where: { ParentDocumentId: { _eq: $documentId } }) {
    ...DocumentRelationFileParts
    Content
    Link
    ModifiedAtTimestamp
    file {
      ...FileParts
    }
    reviewedBy {
      FriendlyName
    }
    changeRequests(
      distinct_on: [ChangeRequestStatus]
      order_by: [{ ChangeRequestStatus: asc }, { ModifiedAtTimestamp: desc }]
    ) {
      ChangeRequestStatus
      ModifiedAtTimestamp
    }
  }
}

fragment DocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getDocumentFile($where: document_file_bool_exp) {
  document_file(
    where: $where
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Version
    Content
    Type
    Link
    FileId
    CustomAttributeData
    PublishedDate
    file {
      FileName
    }
    parent {
      Title
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      tags {
        ...TagParts
      }
      linkedDocuments {
        child {
          Id
          Title
        }
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`);o(`query getLatestPublicDocumentFileByDocumentId($documentId: uuid!) {
  document_file(
    where: {
      Status: { _eq: published }
      ParentDocumentId: { _eq: $documentId }
    }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...PublicDocumentRelationFileParts
    Link
    Content
    file {
      ...FileParts
    }
    reviewedBy {
      FriendlyName
    }
    parent {
      Title
      DocumentType
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
    }
  }
}

fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getPublicDocumentFiles($currentUserId: String!) {
  document_file(
    where: { Status: { _eq: published } }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    ...PublicDocumentRelationFileParts
    Link
    Content
    file {
      ...FileParts
    }
    ModifiedAtTimestamp
    reviewedBy {
      FriendlyName
    }
    parent {
      Title
      DocumentType
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      departments {
        ...DepartmentParts
      }
    }
    attestations(
      where: { UserId: { _eq: $currentUserId } }
      limit: 1
      order_by: { CreatedAtTimestamp: desc }
    ) {
      AttestationStatus
      attestationRecordStatus {
        Status
      }
      ExpiresAt
      Active
    }
  }
}

fragment PublicDocumentRelationFileParts on document_file {
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  FileId
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextReviewDate
  ParentDocumentId
  ReasonForReview
  ReviewDate
  ReviewedBy
  Status
  Summary
  Version
  Type
  PublishedDate
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertDocumentVersion(
  $FileId: uuid
  $NextReviewDate: timestamptz
  $ParentDocumentId: uuid!
  $ReasonForReview: String
  $ReviewDate: timestamptz
  $ReviewedBy: String
  $Summary: String
  $Version: String
  $Content: String
  $Type: document_file_type_enum
  $Link: String
  $CustomAttributeData: jsonb
) {
  insertDocumentVersion(
    FileId: $FileId
    NextReviewDate: $NextReviewDate
    ParentDocumentId: $ParentDocumentId
    ReasonForReview: $ReasonForReview
    ReviewDate: $ReviewDate
    ReviewedBy: $ReviewedBy
    Summary: $Summary
    Version: $Version
    Content: $Content
    Type: $Type
    Link: $Link
    CustomAttributeData: $CustomAttributeData
  ) {
    Id
  }
}`);o(`mutation updateDocumentVersion(
  $Id: uuid!
  $FileId: uuid
  $LatestModifiedAtTimestamp: timestamptz!
  $NextReviewDate: timestamptz
  $ReasonForReview: String
  $ReviewDate: timestamptz
  $ReviewedBy: String
  $Status: version_status_enum!
  $Summary: String
  $Version: String!
  $Content: String
  $Type: document_file_type_enum!
  $Link: String
  $CustomAttributeData: jsonb
) {
  updateDocumentVersion(
    NextReviewDate: $NextReviewDate
    ReasonForReview: $ReasonForReview
    ReviewDate: $ReviewDate
    ReviewedBy: $ReviewedBy
    Summary: $Summary
    Status: $Status
    Version: $Version
    FileId: $FileId
    Content: $Content
    Type: $Type
    Link: $Link
    Id: $Id
    LatestModifiedAtTimestamp: $LatestModifiedAtTimestamp
    CustomAttributeData: $CustomAttributeData
  ) {
    affected_rows
  }
}`);o(`mutation addRiskToEnterpriseRisk($objects: [AddRiskToEnterpriseRiskInput!]!) {
  addRiskToEnterpriseRisk(objects: $objects) {
    affected_rows
  }
}`);o(`query getEnterpriseRisks($where: enterprise_risk_bool_exp! = {}) {
  enterprise_risk(where: $where) {
    Id
    SequentialId
    Title
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Treatment
    CustomAttributeData
    Tier
    ParentId

    score {
      InherentScoreMean
      InherentScoreMedian
      InherentScoreWorstCase
      ResidualScoreMean
      ResidualScoreMedian
      ResidualScoreWorstCase
      InherentRatingMean
      InherentRatingMedian
      InherentRatingWorstCase
      ResidualRatingMean
      ResidualRatingMedian
      ResidualRatingWorstCase
    }

    parent {
      Id
      Title
    }

    createdByUser {
      FriendlyName
    }

    modifiedByUser {
      FriendlyName
    }
  }
}`);o(`query getEnterpriseRiskById($Id: uuid!) {
  enterprise_risk(where: { Id: { _eq: $Id } }) {
    Id
    SequentialId
    Title
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Treatment
    CustomAttributeData
    Tier
    ParentId
    children {
      Id
    }

    parent {
      Id
      Title
    }
  }
}`);o(`mutation deleteEnterpriseRisk($Id: uuid!) {
  deleteChildEnterpriseRisk(Id: $Id) {
    affected_rows
  }
}`);o(`mutation insertEnterpriseRisk(
  $Title: String!
  $Description: String
  $Treatment: risk_treatment_type_enum
  $CustomAttributeData: jsonb
  $Tier: Int!
  $ParentId: uuid
) {
  insertChildEnterpriseRisk(
    object: {
      Title: $Title
      Description: $Description
      Treatment: $Treatment
      CustomAttributeData: $CustomAttributeData
      Tier: $Tier
      ParentId: $ParentId
    }
  ) {
    Id
  }
}`);o(`mutation updateEnterpriseRisk(
  $Id: uuid!
  $Title: String!
  $Description: String
  $Treatment: risk_treatment_type_enum
  $CustomAttributeData: jsonb
  $Tier: Int!
  $ParentId: uuid
) {
  updateChildEnterpriseRisk(
    object: {
      Id: $Id
      Title: $Title
      Description: $Description
      Treatment: $Treatment
      CustomAttributeData: $CustomAttributeData
      Tier: $Tier
      ParentId: $ParentId
    }
  ) {
    affected_rows
  }
}`);o(`query getEnterpriseRisksByTier($Tier: Int!) {
  enterprise_risk(where: { Tier: { _eq: $Tier } }) {
    Id
    SequentialId
    Title
  }
}`);o(`query getEnterpriseRisksFlat($where: enterprise_risk_bool_exp! = {}) {
  enterprise_risk(where: $where) {
    Id
    SequentialId
    Title
    Tier
    Treatment
    ParentId
    CustomAttributeData
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Description
    score {
      InherentScoreMean
      InherentScoreMedian
      InherentScoreWorstCase
      ResidualScoreMean
      ResidualScoreMedian
      ResidualScoreWorstCase
      InherentRatingMean
      InherentRatingMedian
      InherentRatingWorstCase
      ResidualRatingMean
      ResidualRatingMedian
      ResidualRatingWorstCase
    }
    createdByUser {
      FriendlyName
    }

    modifiedByUser {
      FriendlyName
    }
  }
}`);o(`mutation instatiateEnterpriseRisk(
  $EnterpriseRiskIds: [uuid!]!
  $Entities: [uuid!]!
) {
  instantiateChildEnterpriseRisk(
    object: { EnterpriseRiskIds: $EnterpriseRiskIds, Entities: $Entities }
  ) {
    affected_rows
  }
}`);const yu=o(`query getEntities {
  entity {
    Id
    Name
    Description
    ParentId
    Weight
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Id
      Name
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    children {
      Id
      Name
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getEntityById($Id: uuid!) {
  entity_by_pk(Id: $Id) {
    Id
    Name
    Description
    ParentId
    Weight
    CreatedAtTimestamp
    ModifiedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Id
      Name
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`mutation insertEntity(
  $Name: String!
  $Description: String
  $ParentId: uuid
  $Weight: numeric!
  $owners: [String!]!
  $ownerGroups: [String!]!
) {
  insertChildEntity(
    object: {
      Name: $Name
      Description: $Description
      ParentId: $ParentId
      Weight: $Weight
      owners: $owners
      ownerGroups: $ownerGroups
    }
  ) {
    Id
  }
}`);o(`mutation updateEntity(
  $Id: uuid!
  $Name: String!
  $Description: String
  $ParentId: uuid
  $Weight: numeric!
  $owners: [String!]!
  $ownerGroups: [String!]!
) {
  updateChildEntity(
    object: {
      Id: $Id
      Name: $Name
      Description: $Description
      ParentId: $ParentId
      Weight: $Weight
      owners: $owners
      ownerGroups: $ownerGroups
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteEntity($Id: uuid!) {
  deleteChildEntity(Id: $Id) {
    affected_rows
  }
}`);o(`fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation deleteRelationFileById($parentIds: [uuid!], $fileIds: [uuid!]) {
  delete_relation_file(
    where: { FileId: { _in: $fileIds }, ParentId: { _in: $parentIds } }
  ) {
    affected_rows
  }
}`);o(`query getFileAuditById($Id: uuid!) {
  file_audit(where: { Id: { _eq: $Id } }, order_by: {ModifiedAtTimestamp: desc}) {
    Id
    FileName
    FileSize
    Meta
    ContentType
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getFileById($Id: uuid!) {
  file_by_pk(Id: $Id) {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`);o(`query getFormConfiguration($where: form_configuration_bool_exp! = {}) {
  form_configuration(where: $where) {
    ...FormConfigurationParts
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`);o(`query getFormConfigurationAudit($parentType: String!) {
  form_configuration_audit(where: { ParentType: { _eq: $parentType } }, order_by: {ModifiedAtTimestamp: desc}) {
    ParentType
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
    CustomAttributeSchemaId
  }
}`);o(`query getFormConfigurationByParentType($parentTypes: [parent_type_enum!]!) {
  form_configuration(where: { ParentType: { _in: $parentTypes } }) {
    ...FormConfigurationParts
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`);o(`mutation deleteFormField($object: DeleteFormFieldInput!) {
  deleteFormField(object: $object) {
    Id
  }
}`);o(`mutation insertFormField($object: InsertFormFieldInput!) {
  insertFormField(object: $object) {
    Id
  }
}`);o(`mutation updateFormField($object: UpdateFormFieldInput!) {
  updateFormField(object: $object) {
    Id
  }
}`);o(`query getAllFormsCustomisation {
  # This contains the custom attribute configuration for the form (json forms schema)
  form_configuration {
    ...FormConfigurationParts
  }
  # This contains customisation for both standard and custom attributes
  form_field_configuration {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
  }
  # This contains the order of both standard and custom attributes within a form
  form_field_ordering {
    FieldId
    Position
    FormConfigurationParentType
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`);o(`query getFormCustomisation($parentTypes: [parent_type_enum!]!) {
  # This contains the custom attribute configuration for the form (json forms schema)
  form_configuration(where: { ParentType: { _in: $parentTypes } }) {
    ...FormConfigurationParts
  }
  ## todo: try and remove this as lives as also returned in query above
  # This contains customisation for both standard and custom attributes
  form_field_configuration(
    where: { FormConfigurationParentType: { _in: $parentTypes } }
  ) {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }

  # This contains the order of both standard and custom attributes within a form
  form_field_ordering(
    where: { FormConfigurationParentType: { _in: $parentTypes } }
  ) {
    FieldId
    Position
    FormConfigurationParentType
  }
}

fragment FormConfigurationParts on form_configuration {
  ParentType
  createdByUser {
    FriendlyName
  }
  customAttributeSchema {
    UiSchema
    Schema
    Id
  }
  modifiedByUser {
    FriendlyName
  }
  fields_config {
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    FormConfigurationParentType
    Label
    Description
    Conditions
  }
}`);o(`query getFormFieldConfigurationAuditByParentType(
  $parentType: String!,
  $fieldId: String!) {
  form_field_configuration_audit(
    where: {
      FormConfigurationParentType: { _eq: $parentType }
      FieldId: { _eq: $fieldId }
    }, order_by: {ModifiedAtTimestamp: desc}
  ) {
    FieldId
    Hidden
    Required
    ReadOnly
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
    FormConfigurationParentType
  }
}`);o(`query getFormFieldOptionsByParentType($parentTypes: [parent_type_enum!]!) {
  form_field_configuration(
    where: { FormConfigurationParentType: { _in: $parentTypes } }
  ) {
    FormConfigurationParentType
    FieldId
    Hidden
    Required
    ReadOnly
    DefaultValue
    Label
    Description
  }
}`);o(`query getFormFieldOrderingAuditById(
  $parentType: String!,
  $fieldId: String!) {
  form_field_ordering_audit(
    where: {
      FormConfigurationParentType: { _eq: $parentType }
      FieldId: { _eq: $fieldId }
    }
  ) {
    FieldId
    Position
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`mutation insertFormFieldPositions(
  $parentType: parent_type_enum!
  $fieldConfig: [form_field_ordering_insert_input!]!
  $fieldIds: [String!]!
) {
  insert_form_configuration_one(
    object: {
      ParentType: $parentType
      fields_ordering: {
        data: $fieldConfig
        on_conflict: {
          update_columns: [Position, FieldId]
          constraint: form_field_configuration_pkey
        }
      }
    }
    on_conflict: {
      constraint: form_configuration_pkey
      update_columns: [ParentType]
    }
  ) {
    CreatedAtTimestamp
  }

  # Delete any field configs that are no longer in the form
  delete_form_field_ordering(
    where: {
      FieldId: { _nin: $fieldIds }
      FormConfigurationParentType: { _eq: $parentType }
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateFormFieldPositions(
  $parentType: parent_type_enum!
  $fieldConfig: [form_field_ordering_insert_input!]!
  $fieldIds: [String!]!
) {
  # Update the form configuration object, and change nothing, to trigger an audit log
  update_form_configuration(
    _set: { ParentType: $parentType }
    where: { ParentType: { _eq: $parentType } }
  ) {
    affected_rows
  }

  insert_form_field_ordering(
    objects: $fieldConfig
    on_conflict: {
      update_columns: [Position, FormConfigurationParentType, FieldId]
      constraint: form_field_configuration_pkey
    }
  ) {
    returning {
      FieldId
    }
  }

  # Delete any field configs that are no longer in the form
  delete_form_field_ordering(
    where: {
      FieldId: { _nin: $fieldIds }
      FormConfigurationParentType: { _eq: $parentType }
    }
  ) {
    affected_rows
  }
}`);o(`query getOwnersAndContributors($parentId: uuid!) {
  ancestor_contributor(where: { Id: { _eq: $parentId } }) {
    UserId
    UserGroupId
    ContributorType
  }
}`);o(`query getUsers {
  user(
    order_by: { FriendlyName: asc }
    where: {
      _or: [
        { RoleKey: { _neq: "ThirdPartyRespondent" } }
        { RoleKey: { _is_null: true } }
      ]
    }
  ) {
    Id
    FriendlyName
    Status
    RoleKey
    Email
    Department
    JobTitle
    OfficeLocation
    LastSeen
    IsCustomerSupport
  }
}`);o(`mutation deleteImpactRating($Id: uuid!) {
  delete_impact_rating(where: { Id: { _eq: $Id } }) {
    affected_rows
  }
}`);o(`mutation deleteImpactRatings($Ids: [uuid!]!) {
  delete_impact_rating(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getImpactRatingAuditById($id: uuid!) {
  impact_rating_audit(where: { Id: { _eq: $id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CreatedAtTimestamp
    CreatedByUser
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    CustomAttributeData
    SequentialId
    Rating
    RatedItemId
    ImpactId
    TestDate
    CompletedBy
    Likelihood
  }
}`);o(`query getImpactRatingById($id: uuid!) {
  impact_rating(where: { Id: { _eq: $id } }) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getInternalAuditImpactRatingById($id: uuid!) {
  impact_internal_audit_rating(where: { Id: { _eq: $id } }) {
    ...ImpactInternalAuditRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getSecondLineImpactRatingById($id: uuid!) {
  impact_second_line_rating(where: { Id: { _eq: $id } }) {
    ...ImpactSecondLineRatingParts
    createdByUser {
      FriendlyName
    }
  }
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getImpactRatingCount {
  impact_rating_aggregate(
    where: { RatingType: { _in: ["assessment", "rating"] } }
  ) {
    aggregate {
      count
    }
  }
}`);o(`query getImpactRatings {
  impact_rating(where: { RatingType: { _in: ["assessment", "rating"] } }) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getImpactRatingsByImpactId($impactId: uuid!) {
  impact_rating(
    where: {
      ImpactId: { _eq: $impactId }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Name
      Rationale
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getImpactRatingsByRatedItemId($ratedItemId: uuid!) {
  impact_rating(
    where: {
      RatedItemId: { _eq: $ratedItemId }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: { TestDate: desc, CreatedAtTimestamp: desc }
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Name
      Rationale
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getImpactRatingsWithAppetites($today: timestamptz!) {
  impact_rating(
    where: { RatingType: { _in: ["assessment", "rating"] } }
    distinct_on: [RatedItemId, ImpactId]
    order_by: [
      { RatedItemId: desc, ImpactId: desc }
      { CreatedAtTimestamp: desc }
    ]
  ) {
    ...ImpactRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
        likelihoodAppetite: appetites(
          where: {
            appetite: {
              AppetiteType: { _eq: likelihood }
              EffectiveDate: { _lte: $today }
            }
          }
          order_by: { appetite: { EffectiveDate: desc } }
          limit: 1
        ) {
          appetite {
            LikelihoodAppetite
            EffectiveDate
          }
        }
        impactAppetites: appetites(
          where: {
            appetite: {
              AppetiteType: { _eq: impact }
              EffectiveDate: { _lte: $today }
            }
          }
          order_by: { appetite: { EffectiveDate: desc } }
        ) {
          appetite {
            ImpactId
            ImpactAppetite
            EffectiveDate
          }
        }
      }
      ObjectType
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getLatestImpactRatingsForRatedImpactsByRatedItemId($RatedItemId: uuid!) {
  impact(
    where: {
      ratings: {
        RatedItemId: { _eq: $RatedItemId }
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
  ) {
    Name
    Rationale
    ratings(
      where: {
        RatedItemId: { _eq: $RatedItemId }
        RatingType: { _in: ["assessment", "rating"] }
      }
      order_by: { TestDate: desc }
      limit: 1
    ) {
      ...ImpactRatingParts
      createdByUser {
        FriendlyName
      }
      completedBy {
        FriendlyName
      }
    }
  }
}

fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`fragment ImpactRatingParts on impact_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`mutation insertChildImpactRatings(
  $Ratings: [InsertImpactRatingPairInput!]!
  $TestDate: timestamptz!
  $AssessmentId: uuid
  $RatedItemId: uuid!
  $CustomAttributeData: jsonb
  $CompletedBy: String
  $Likelihood: Int
) {
  insertChildImpactRating(
    AssessmentId: $AssessmentId
    Ratings: $Ratings
    TestDate: $TestDate
    RatedItemId: $RatedItemId
    CustomAttributeData: $CustomAttributeData
    CompletedBy: $CompletedBy
    Likelihood: $Likelihood
  ) {
    Ids
  }
}`);o(`mutation deleteImpact($Id: uuid!) {
  delete_impact_rating(where: { ImpactId: { _eq: $Id } }) {
    affected_rows
  }

  delete_impact(where: { Id: { _eq: $Id } }) {
    affected_rows
  }
}`);o(`query getImpactAuditById($id: uuid!) {
  impact_audit(where: { Id: { _eq: $id } }, order_by: {ModifiedAtTimestamp: desc}) {
    CreatedAtTimestamp
    CreatedByUser
    Rationale
    RatingGuidance
    Id
    ModifiedAtTimestamp
    ModifiedByUser
    Name
    CustomAttributeData
    SequentialId
    LikelihoodAppetite
  }
}`);o(`query getImpactById($id: uuid!) {
  impact(where: { Id: { _eq: $id } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getImpactCount {
  impact_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getImpactList {
  impact {
    Id
    SequentialId
    Name
    Rationale
    RatingGuidance
  }
}`);o(`query getImpacts {
  impact {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}`);o(`fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}`);o(`mutation insertImpact($object: InsertImpactInput!) {
  insertImpactApi(object: $object) {
    Id
  }
}`);o(`mutation updateImpact($object: UpdateImpactInput!) {
  updateImpactApi(object: $object) {
    affected_rows
  }
}`);o(`mutation deleteIndicatorResults($ids: [uuid!]) {
  delete_indicator_result(where: { Id: { _in: $ids } }) {
    affected_rows
  }
}`);o(`query getIndicatorResultAuditById($id: uuid!) {
  indicator_result_audit(where: { Id: { _eq: $id } }) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    ModifiedByUser
    ModifiedAtTimestamp
    CreatedByUser
    CreatedAtTimestamp
  }
}`);o(`query getIndicatorResultById($id: uuid!) {
  indicator_result(where: { Id: { _eq: $id } }) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    modifiedBy {
      FriendlyName
    }
    parent {
      Type
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getIndicatorResultsByIndicatorId($indicatorId: uuid!) {
  indicator_result(
    where: { IndicatorId: { _eq: $indicatorId } }
    order_by: { ResultDate: asc }
  ) {
    Description
    Id
    ResultDate
    TargetValueNum
    TargetValueTxt
    CustomAttributeData
    modifiedBy {
      FriendlyName
    }
    parent {
      Type
    }
  }
}`);o(`mutation insertIndicatorResult(
  $Description: String
  $IndicatorId: uuid!
  $ResultDate: timestamptz!
  $TargetValueNum: numeric
  $TargetValueTxt: String
  $CustomAttributeData: jsonb
) {
  insert_indicator_result_one(
    object: {
      Description: $Description
      IndicatorId: $IndicatorId
      ResultDate: $ResultDate
      TargetValueNum: $TargetValueNum
      TargetValueTxt: $TargetValueTxt
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    Id
  }
}`);o(`mutation updateIndicatorResult(
  $id: uuid!
  $Description: String
  $ResultDate: timestamptz!
  $TargetValueNum: numeric
  $TargetValueTxt: String
  $CustomAttributeData: jsonb
) {
  update_indicator_result(
    where: { Id: { _eq: $id } }
    _set: {
      Description: $Description
      ResultDate: $ResultDate
      TargetValueNum: $TargetValueNum
      TargetValueTxt: $TargetValueTxt
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    returning {
      Id
    }
  }
}`);o(`mutation deleteIndicators($ids: [uuid!]) {
  delete_indicator_result(where: { IndicatorId: { _in: $ids } }) {
    affected_rows
  }
  delete_indicator(where: { Id: { _in: $ids } }) {
    affected_rows
  }
}`);o(`query getIndicatorAuditById($id: uuid) {
  indicator_audit(where: { Id: { _eq: $id } }) {
    SequentialId
    Type
    UpperToleranceNum
    Unit
    Title
    TargetValueTxt
    LowerToleranceNum
    Id
    Description
    CustomAttributeData
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    LowerAppetiteNum
    UpperAppetiteNum
  }
}`);o(`query getIndicatorById($id: uuid) {
  indicator(where: { Id: { _eq: $id } }) {
    ...IndicatorParts
    tags {
      ...TagParts
    }
    scheduleState {
      LatestDate
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getIndicatorTitlesByParentId($parentId: uuid) {
  indicator(where: { parents: { ParentId: { _eq: $parentId } } }) {
    Title
    Id
  }
}`);o(`query getIndicators(
  $where: indicator_bool_exp! = {}
  $resultsWhere: indicator_result_bool_exp! = {}
) {
  indicator(where: $where) {
    ...IndicatorParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    orderedResults: results(
      where: $resultsWhere
      order_by: { ResultDate: desc_nulls_last }
    ) {
      TargetValueNum
      TargetValueTxt
      ResultDate
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      control {
        Title
      }
      risk {
        Title
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getIndicatorsByParentId($parentId: uuid) {
  indicator(where: { parents: { ParentId: { _eq: $parentId } } }) {
    ...IndicatorParts
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    orderedResults: results(
      limit: 2
      order_by: { ResultDate: desc_nulls_last }
    ) {
      TargetValueNum
      TargetValueTxt
      ResultDate
    }
    parents {
      control {
        Title
      }
      risk {
        Title
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation insertIndicator($object: InsertChildIndicatorInput) {
  insertChildIndicator(object: $object) {
    Id
  }
}`);o(`mutation updateIndicator($object: UpdateChildIndicatorInput) {
  updateChildIndicator(object: $object) {
    Id
  }
}`);o(`mutation deleteIngestionConfig(
  $object: DeleteIngestionConfigInput!
) {
  deleteChildIngestionConfig(object: $object) {
    Id
  }
}`);o(`query getIngestionConfigs {
  ingestion_config {
    Id
    IngestionConfig
    SecretArn
    ModifiedAtTimestamp
  }
}`);o(`mutation insertIngestionConfig(
  $object: InsertIngestionConfigInput!
) {
  insertChildIngestionConfig(object: $object) {
    Id
  }
}`);o(`mutation updateIngestionConfig(
  $object: UpdateIngestionConfigInput!
) {
  updateChildIngestionConfig(object: $object) {
    Id
  }
}`);o(`mutation deleteInternalAudits($Ids: [uuid!]!) {
  delete_internal_audit_entity(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getInternalAuditById($id: uuid) {
  internal_audit_entity(where: { Id: { _eq: $id } }) {
    ...InternalAuditEntityParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getInternalAudits($where: internal_audit_entity_bool_exp! = {}) {
  internal_audit_entity(where: $where) {
    ...InternalAuditEntityParts
    actions {
      action {
        ...ActionParts
      }
    }
    internalAuditReports {
      ...InternalAuditReportParts
    }
    issues {
      issue {
        ...IssueParts
        assessment {
          ...IssueAssessmentParts
        }
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getLinkedRisksByInternalAuditId($id: uuid) {
  linked_risks: linked_item(where: { Source: { _eq: $id }, target_risk: {} }) {
    Id
    risk: target_risk {
      ...RiskParts
      createdByUser {
        FriendlyName
      }
      parent {
        Title
      }
      parentNode {
        Id
        ObjectType
        SequentialId
      }
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributors {
        ...ContributorParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
      ancestorContributors {
        ...AncestorContributorParts
      }
      appetites(
        limit: 1
        where: { appetite: { AppetiteType: { _eq: risk } } }
        order_by: [
          { appetite: { EffectiveDate: desc_nulls_last } }
          { appetite: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        appetite {
          LowerAppetite
          UpperAppetite
        }
      }
      impactRatings(
        where: { RatingType: { _in: ["assessment", "rating"] } }
        distinct_on: [ImpactId]
        order_by: [{ ImpactId: desc }, { TestDate: desc }]
      ) {
        Rating
        ImpactId
      }
      impactRatingsForTrend: impactRatings(
        where: { RatingType: { _in: ["assessment", "rating"] } }
        order_by: [{ TestDate: desc_nulls_last }]
        limit: 10
      ) {
        ImpactId
        Rating
        TestDate
      }
      assessmentResults(
        where: {
          riskAssessmentResult: {
            RatingType: { _in: ["assessment", "rating"] }
          }
        }
        order_by: [
          { riskAssessmentResult: { TestDate: desc_nulls_last } }
          { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
        ]
      ) {
        ParentId
        riskAssessmentResult {
          Id
          Rating
          ControlType
          Likelihood
          Impact
          CustomAttributeData
          CreatedAtTimestamp
          TestDate
        }
      }
      controls_aggregate {
        aggregate {
          count
        }
      }
      indicators_aggregate {
        aggregate {
          count
        }
      }
      actions_aggregate {
        aggregate {
          count
        }
      }
      tags {
        ...TagParts
      }
      departments {
        ...DepartmentParts
      }
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertInternalAudit($Input: InsertInternalAuditInput) {
  insertInternalAudit(Input: $Input) {
    Id
  }
}`);o(`fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}`);o(`mutation updateInternalAudit($Input: UpdateInternalAuditInput) {
  updateInternalAudit(Input: $Input) {
    Id
  }
}`);o(`fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`mutation deleteInternalAuditReports($Ids: [uuid!]!) {
  delete_internal_audit_report(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getInternalAuditReportById($Id: uuid!) {
  internal_audit_report(where: { Id: { _eq: $Id } }) {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getInternalAuditReports {
  internal_audit_report {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      controlledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      uncontrolledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getInternalAuditReportsByOriginatingItemId($OriginatingItemId: uuid!) {
  internal_audit_report(
    where: { OriginatingItemId: { _eq: $OriginatingItemId } }
  ) {
    ...InternalAuditReportParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      UserGroupId
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    completedByUser {
      FriendlyName
    }
    assessedItems: assessmentResults {
      controlledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      uncontrolledRiskAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: risk } }) {
          risk {
            Id
            Title
          }
        }
      }
      obligationAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: obligation } }) {
          obligation {
            Id
            Title
          }
        }
      }
      documentAssessmentResult {
        Id
        parents(where: { ParentType: { _eq: document } }) {
          document {
            Id
            Title
          }
        }
      }
    }
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertInternalAuditReport($object: InsertAssessmentInput!) {
  insertInternalAuditReportApi(object: $object) {
    Id
  }
}`);o(`mutation updateInternalAuditReport($object: UpdateAssessmentInput!) {
  updateInternalAuditReportApi(object: $object) {
    affected_rows
  }
}`);o(`mutation deleteInternalAuditResults($Ids: [uuid!]!) {
  delete_document_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_obligation_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_risk_controlled_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_risk_uncontrolled_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_control_test_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_control_test_internal_audit_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_impact_internal_audit_rating(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAllInternalAuditReportResults {
  document_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...DocumentInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...ObligationInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_uncontrolled_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_controlled_internal_audit_result(
    order_by: { CreatedByUser: asc }
    where: { parents: { internalAuditReport: {} } }
  ) {
    ...RiskControlledInternalAuditResultParts
    internalAuditReports: parents(
      where: { ParentType: { _eq: internal_audit_report } }
    ) {
      internalAuditReport {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getDocumentInternalAuditResultById($Id: uuid!) {
  document_internal_audit_result(where: { Id: { _eq: $Id } }) {
    ...DocumentInternalAuditResultParts
    parents {
      document {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getInternalAuditReportDocumentAssessmentResultsByDocumentId(
  $ParentId: uuid!
) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
  ) {
    ...DocumentInternalAuditResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getInternalAuditReportObligationAssessmentResultsByObligationId(
  $ObligationId: uuid!
) {
  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ObligationId } } }
  ) {
    ...ObligationInternalAuditResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getInternalAuditReportRiskAssessmentResultsByRiskId($RiskId: uuid!) {
  risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledInternalAuditResultParts
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }

  risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getInternalAuditReportTestResultsByControlId($controlId: uuid) {
  control_test_internal_audit_result(
    where: { ParentControlId: { _eq: $controlId } }
  ) {
    ...ControlTestInternalAuditResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getInternalAuditResultById($Id: uuid!) {
  internal_audit_result_parent(where: { Id: { _eq: $Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationInternalAuditResultParts
    }
    documentAssessmentResult {
      ...DocumentInternalAuditResultParts
    }
    controlledRiskAssessmentResult {
      ...RiskControlledInternalAuditResultParts
    }
    uncontrolledRiskAssessmentResult {
      ...RiskUncontrolledInternalAuditResultParts
    }
    testResult {
      ...ControlTestInternalAuditResultParts
    }
    impactRating {
      ...ImpactInternalAuditRatingParts
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getInternalAuditResultsByParentId($ParentId: uuid!) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentInternalAuditResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationInternalAuditResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledInternalAuditResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  control_test_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ControlTestInternalAuditResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_internal_audit_rating(
    where: { parents: { ParentId: { _eq: $ParentId } } }
  ) {
    ...ImpactInternalAuditRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactInternalAuditRatingParts on impact_internal_audit_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`query getInternalAuditTestResultById($Id: uuid) {
  control_test_internal_audit_result(where: { Id: { _eq: $Id } }) {
    ...ControlTestInternalAuditResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getLatestInternalAuditReportDocumentAssessmentResultByDocumentId(
  $DocumentId: uuid!
) {
  document_internal_audit_result(
    where: { parents: { ParentId: { _eq: $DocumentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...DocumentInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentInternalAuditResultParts on document_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestInternalAuditReportObligationAssessmentResultByObligationId(
  $ObligationId: uuid!
) {
  obligation_internal_audit_result(
    where: { parents: { ParentId: { _eq: $ObligationId } } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
    limit: 1
  ) {
    ...ObligationInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestInternalAuditReportRiskAssessmentResultsByRiskId(
  $RiskId: uuid!
) {
  uncontrolled: risk_uncontrolled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskUncontrolledInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
  controlled: risk_controlled_internal_audit_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskControlledInternalAuditResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getLatestInternalAuditReportTestResultsByControlId($controlId: uuid) {
  control_test_internal_audit_result(
    where: { ParentControlId: { _eq: $controlId } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...ControlTestInternalAuditResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: internal_audit_report } }) {
      internalAuditReport {
        ...InternalAuditReportParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getObligationInternalAuditResultById($Id: uuid!) {
  obligation_internal_audit_result(where: { Id: { _eq: $Id } }) {
    ...ObligationInternalAuditResultParts
    parents {
      obligation {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationInternalAuditResultParts on obligation_internal_audit_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getRiskInternalAuditResultById($Id: uuid!) {
  risk_controlled_internal_audit_result(where: { Id: { _eq: $Id } }) {
    ...RiskControlledInternalAuditResultParts
    parents {
      risk {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
  risk_uncontrolled_internal_audit_result(where: { Id: { _eq: $Id } }) {
    ...RiskUncontrolledInternalAuditResultParts
    parents {
      risk {
        Id
        Title
      }
      internalAuditReport {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskControlledInternalAuditResultParts on risk_controlled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment RiskUncontrolledInternalAuditResultParts on risk_uncontrolled_internal_audit_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`mutation insertInternalAuditTestResult(
  $Description: String
  $DesignEffectiveness: Int
  $OverallEffectiveness: Int
  $ControlIds: [uuid!]!
  $PerformanceEffectiveness: Int
  $InternalAuditReportId: uuid!
  $Submitter: String
  $TestDate: timestamptz
  $TestType: String
  $Title: String
  $CustomAttributeData: jsonb
) {
  insertChildControlTestInternalAuditResult(
    Description: $Description
    DesignEffectiveness: $DesignEffectiveness
    OverallEffectiveness: $OverallEffectiveness
    ControlIds: $ControlIds
    PerformanceEffectiveness: $PerformanceEffectiveness
    Submitter: $Submitter
    TestDate: $TestDate
    TestType: $TestType
    Title: $Title
    InternalAuditReportId: $InternalAuditReportId
    CustomAttributeData: $CustomAttributeData
  ) {
    Ids
  }
}`);o(`mutation insertDocumentInternalAuditResult(
  $Rating: Int
  $InternalAuditReportId: uuid!
  $DocumentIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildDocumentInternalAuditResult(
    Rating: $Rating
    InternalAuditReportId: $InternalAuditReportId
    DocumentIds: $DocumentIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertInternalAuditImpactRating(
  $Ratings: [InsertImpactRatingPairInput!]!
  $TestDate: timestamptz!
  $InternalAuditReportId: uuid!
  $RatedItemId: uuid!
  $CustomAttributeData: jsonb
  $CompletedBy: String
  $Likelihood: Int
) {
  insertChildImpactInternalAuditRating(
    InternalAuditReportId: $InternalAuditReportId
    Ratings: $Ratings
    TestDate: $TestDate
    RatedItemId: $RatedItemId
    CustomAttributeData: $CustomAttributeData
    CompletedBy: $CompletedBy
    Likelihood: $Likelihood
  ) {
    Ids
  }
}`);o(`mutation insertObligationInternalAuditResult(
  $Rating: Int
  $InternalAuditReportId: uuid!
  $ObligationIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildObligationInternalAuditResult(
    Rating: $Rating
    InternalAuditReportId: $InternalAuditReportId
    ObligationIds: $ObligationIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertRiskInternalAuditResult(
  $Rating: Int
  $Likelihood: Int
  $Impact: Int
  $ControlType: risk_assessment_result_control_type_enum
  $InternalAuditReportId: uuid!
  $RiskIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildRiskInternalAuditResult(
    Rating: $Rating
    InternalAuditReportId: $InternalAuditReportId
    RiskIds: $RiskIds
    Impact: $Impact
    Likelihood: $Likelihood
    ControlType: $ControlType
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation updateControlTestInternalAuditResult($object: UpdateTestResultInput) {
  updateControlTestInternalAuditResultApi(object: $object) {
    Id
  }
}`);o(`mutation updateDocumentInternalAuditResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_document_internal_audit_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateObligationInternalAuditResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_obligation_internal_audit_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateControlledRiskInternalAuditResult(
  $Id: uuid!
  $Impact: Int
  $Likelihood: Int
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_risk_controlled_internal_audit_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
      Likelihood: $Likelihood
      Impact: $Impact
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateUncontrolledRiskInternalAuditResult(
  $Id: uuid!
  $Impact: Int
  $Likelihood: Int
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_risk_uncontrolled_internal_audit_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
      Likelihood: $Likelihood
      Impact: $Impact
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteIssues($Ids: [uuid!]!) {
  deleteIssuesById(Ids: $Ids) {
    affected_rows
  }
}`);o(`query getIssueAuditById($Id: uuid!) {
  issue_audit(where: {Id: {_eq: $Id}}) {
    RaisedAtTimestamp
    DateIdentified
    DateOccurred
    Details
    Id
    ImpactsCustomer
    IsExternalIssue
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    SequentialId
    CustomAttributeData
  }
}`);o(`query getIssueById($_eq: uuid!) {
  issue(where: { Id: { _eq: $_eq } }) {
    ...IssueParts
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getIssues(
  $where: issue_bool_exp! = {}
) {
  issue(where: $where) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
      }
      document {
        Title
      }
      control {
        Title
      }
      thirdParty {
        Title
      }
      assessment {
        Title
      }
      internalAuditEntity {
        Title
      }
      internalAuditReport {
        Title
      }
      complianceMonitoringAssessment {
        Title
      }
      risk {
        Title
      }
    }
    issueUpdateSummary {
      Count
      LatestTitle
      LatestDescription
      LatestCreatedAtTimestamp
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`);o(`query getIssuesByParentId($ParentId: uuid!, $Type: parent_type_enum!) {
  issue(where: { parents: { ParentId: { _eq: $ParentId } }, Type: { _eq: $Type} }) {
    ...IssueParts
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    assessment {
      ...IssueAssessmentParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query GetOldestOpenIssueDate($where: issue_bool_exp) {
  issue(order_by: { CreatedAtTimestamp: asc }, where: $where, limit: 1) {
    CreatedAtTimestamp
  }
}`);o(`query getWidgetIssueCauses($where: issue_bool_exp!) {
  issue(where: $where) {
    causes {
      Title
    }
  }
}`);o(`query getWidgetIssuesByType($where: issue_assessment_bool_exp!) {
  issue_assessment(where: $where) {
    IssueType
  }
}`);o(`mutation insertChildIssue($object: InsertIssueInput!) {
  insertChildIssue(object: $object) {
    Id
    SequentialId
  }
}`);o(`fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}`);o(`fragment SimplifiedIssueParts on issue {
  Id
  Title
}`);o(`fragment BreachedIssuesParts on issue_parent {
  issue {
    ...SimplifiedIssueParts
  }
}

fragment SimplifiedIssueParts on issue {
  Id
  Title
}`);o(`query GetOpenIssueAssessmentCount($where: issue_assessment_bool_exp) {
  issue_assessment_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`mutation updateIssue($object: UpdateIssueInput!) {
  updateIssueApi(object: $object) {
    affected_rows
  }
}`);o(`query getIssueAssessmentAuditById($Id: uuid!) {
  issue_assessment_audit(where: { Id: { _eq: $Id } }) {
    ActualCloseDate
    CertifiedIndividual
    IssueCausedBySystemIssue
    IssueCausedByThirdParty
    IssueType
    ParentIssueId
    PoliciesBreached
    PolicyBreach
    PolicyOwner
    PolicyOwnerCommentary
    Rationale
    RegulatoryBreach
    RegulationsBreached
    Reportable
    Severity
    Status
    SystemResponsible
    TargetCloseDate
    ThirdPartyResponsible
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    Id
    Type
    CustomAttributeData
  }
}`);o(`query getIssueAssessmentByParentId($parentIssueId: uuid!) {
  issue_assessment(where: { ParentIssueId: { _eq: $parentIssueId } }) {
    ...IssueAssessmentParts
    policyOwner {
      FriendlyName
    }
    certifiedIndividual {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
  }

  # Get ancestorContributors separately as assessment may not have been created yet.
  issue(where: { Id: { _eq: $parentIssueId } }) {
    owners {
      ...OwnerParts
    }
    tags {
      ...TagParts
    }
  }

  # Get parents separately as an assessment may not have been created yet.
  issue_parent(where: { IssueId: { _eq: $parentIssueId } }) {
    IssueId
    ParentId
    obligation {
      Id
      Title
    }
    parent {
      ObjectType
      SequentialId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`);o(`mutation insertIssueAssessment(
  $ActualCloseDate: timestamptz
  $ThirdPartyResponsible: String
  $TargetCloseDate: timestamptz
  $PolicyOwnerCommentary: String
  $CertifiedIndividual: String
  $IssueCausedBySystemIssue: Boolean
  $IssueCausedByThirdParty: Boolean
  $IssueType: String
  $ParentIssueId: uuid!
  $PoliciesBreached: String
  $PolicyOwner: String
  $PolicyBreach: Boolean
  $Rationale: String
  $RegulatoryBreach: Boolean
  $RegulationsBreached: String
  $Reportable: Boolean
  $Severity: Int
  $Status: issue_assessment_status_enum
  $SystemResponsible: String
  $TagTypeIds: [uuid!]!
  $DepartmentTypeIds: [uuid!]!
  $CustomAttributeData: jsonb
  $RegulationsBreachedIds: [uuid!]!
  $AssociatedControlIds: [uuid!]!
  $PoliciesBreachedIds: [uuid!]!
) {
  insertChildIssueAssessment(
    ActualCloseDate: $ActualCloseDate
    ThirdPartyResponsible: $ThirdPartyResponsible
    TargetCloseDate: $TargetCloseDate
    PolicyOwnerCommentary: $PolicyOwnerCommentary
    CertifiedIndividual: $CertifiedIndividual
    IssueCausedBySystemIssue: $IssueCausedBySystemIssue
    IssueCausedByThirdParty: $IssueCausedByThirdParty
    IssueType: $IssueType
    ParentIssueId: $ParentIssueId
    PoliciesBreached: $PoliciesBreached
    PolicyOwner: $PolicyOwner
    PolicyBreach: $PolicyBreach
    Rationale: $Rationale
    RegulatoryBreach: $RegulatoryBreach
    RegulationsBreached: $RegulationsBreached
    Reportable: $Reportable
    Severity: $Severity
    Status: $Status
    SystemResponsible: $SystemResponsible
    TagTypeIds: $TagTypeIds
    DepartmentTypeIds: $DepartmentTypeIds
    CustomAttributeData: $CustomAttributeData
    AssociatedControlIds: $AssociatedControlIds
    RegulationsBreachedIds: $RegulationsBreachedIds
    PoliciesBreachedIds: $PoliciesBreachedIds
  ) {
    Id
  }
}`);o(`fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}`);o(`mutation updateIssueAssessment(
  $ActualCloseDate: timestamptz
  $ThirdPartyResponsible: String
  $TargetCloseDate: timestamptz
  $PolicyOwnerCommentary: String
  $CertifiedIndividual: String
  $IssueCausedBySystemIssue: Boolean
  $IssueCausedByThirdParty: Boolean
  $IssueType: String
  $PoliciesBreached: String
  $PolicyOwner: String
  $PolicyBreach: Boolean
  $Rationale: String
  $RegulatoryBreach: Boolean
  $RegulationsBreached: String
  $Reportable: Boolean
  $Severity: Int
  $Status: issue_assessment_status_enum
  $SystemResponsible: String
  $OriginalTimestamp: timestamptz!
  $Id: uuid!
  $CustomAttributeData: jsonb
  $TagTypeIds: [uuid!]!
  $DepartmentTypeIds: [uuid!]!
  $RegulationsBreachedIds: [uuid!]!
  $PoliciesBreachedIds: [uuid!]!
  $AssociatedControlIds: [uuid!]!
) {
  updateChildIssueAssessment(
    Id: $Id
    OriginalTimestamp: $OriginalTimestamp
    ActualCloseDate: $ActualCloseDate
    ThirdPartyResponsible: $ThirdPartyResponsible
    TargetCloseDate: $TargetCloseDate
    PolicyOwnerCommentary: $PolicyOwnerCommentary
    CertifiedIndividual: $CertifiedIndividual
    IssueCausedBySystemIssue: $IssueCausedBySystemIssue
    IssueCausedByThirdParty: $IssueCausedByThirdParty
    IssueType: $IssueType
    PoliciesBreached: $PoliciesBreached
    PolicyOwner: $PolicyOwner
    PolicyBreach: $PolicyBreach
    Rationale: $Rationale
    RegulatoryBreach: $RegulatoryBreach
    RegulationsBreached: $RegulationsBreached
    Reportable: $Reportable
    Severity: $Severity
    Status: $Status
    SystemResponsible: $SystemResponsible
    CustomAttributeData: $CustomAttributeData
    AssociatedControlIds: $AssociatedControlIds
    RegulationsBreachedIds: $RegulationsBreachedIds
    PoliciesBreachedIds: $PoliciesBreachedIds
    TagTypeIds: $TagTypeIds
    DepartmentTypeIds: $DepartmentTypeIds
  ) {
    Id
  }
}`);o(`query getIssueAssessmentHistory($where: issue_assessment_audit_bool_exp) {
  issue_assessment_audit(
    where: $where
    order_by: { ModifiedAtTimestamp: asc }
  ) {
    Status
    ParentIssueId
    ModifiedAtTimestamp
    Action
  }
}`);o(`mutation deleteIssueUpdates($Ids: [uuid!]) {
  delete_file(where: { relationFile: { ParentId: { _in: $Ids } } }) {
    affected_rows
  }

  delete_relation_file(where: { ParentId: { _in: $Ids } }) {
    affected_rows
  }

  delete_issue_update(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getIssueUpdateAuditById($Id: uuid!) {
  issue_update_audit(where: { Id: { _eq: $Id } }) {
    Description
    Id
    ParentIssueId
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
  }
}`);o(`query getIssueUpdateById($_eq: uuid!) {
  issue_update(where: { Id: { _eq: $_eq } }) {
    ...IssueUpdateParts
    files {
      ...RelationFileParts
    }
  }
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getIssueUpdatesByParentIssueId($_eq: uuid!) {
  issue_update(where: { ParentIssueId: { _eq: $_eq } }) {
    ...IssueUpdateParts
    createdByUser {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation insertIssueUpdate(
  $ParentIssueId: uuid!
  $Description: String!
  $Title: String!
  $CustomAttributeData: jsonb
) {
  insert_issue_update_one(
    object: {
      Description: $Description
      ParentIssueId: $ParentIssueId
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    Id
  }
}`);o(`fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`mutation updateIssueUpdate(
  $ParentIssueId: uuid!
  $Description: String!
  $Title: String!
  $Id: uuid!
  $OriginalTimestamp: timestamptz!
  $CustomAttributeData: jsonb
) {
  update_issue_update(
    where: {
      Id: { _eq: $Id }
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
    }
    _set: {
      Description: $Description
      ParentIssueId: $ParentIssueId
      Title: $Title
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteLinkedItems($Ids: [uuid!]!) {
  unlinkItems(Ids: $Ids) {
    Ids
  }
}`);o(`query getLinkedItemAudit(
  $Id: uuid!
) {
  risksmart_linked_item_audit(where: { Id: { _eq: $Id } }) {
    Id
    Source
    Target
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedAtTimestamp
    CreatedByUser
  }
}`);o(`query getLinkedItemRisks($Id: uuid!) {
  linked_item(where: { Source: { _eq: $Id }, TargetType: { _eq: "risk" } }) {
    Id
    Source
    Target
    target_risk {
      ...RiskParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`query getLinkedItems(
  $Id: uuid!
  $IncludeInternalAudit: Boolean!
  $IncludeCompliance: Boolean!
) {
  linked_item(where: { Source: { _eq: $Id } }) {
    Id
    Source
    Target
    RelationshipType
    target_node {
      ObjectType
      SequentialId
    }
    target_control {
      ...ControlParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_control_group {
      ...ControlGroupParts
    }
    target_obligation {
      ...ObligationParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_obligation_change {
      Id
      SequentialId
      DescriptionBefore
      DescriptionAfter
      Rationale
      ObligationId
      ExternalId
      EffectiveDate
      CreatedAtTimestamp
      ModifiedAtTimestamp
      CreatedByUser
      ModifiedByUser
      obligation {
        Reference
        Title
        regulatorySource {
          RegulatorName
        }
      }
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_document {
      ...DocumentParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_risk {
      ...RiskParts
      enterpriseRiskInstance {
        EntityId
        entity {
          Id
          Name
          ParentId
        }
      }
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_assessment_activity {
      ...AssessmentActivityParts
      parentInternalAuditReport @include(if: $IncludeInternalAudit) {
        Id
      }
      parentAssessment {
        Id
      }
      parentComplianceMonitoringAssessment @include(if: $IncludeCompliance) {
        Id
      }
    }
    target_assessment {
      ...AssessmentParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_internal_audit_report @include(if: $IncludeInternalAudit) {
      ...InternalAuditReportParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_internal_audit_entity @include(if: $IncludeInternalAudit) {
      ...InternalAuditEntityParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_impact {
      ...ImpactParts
      owners {
        ...OwnerParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
    }
    target_obligation_impact {
      Id
      Description
      ParentObligationId
    }
    target_impact_rating {
      Id
      impact {
        ...ImpactParts
        owners {
          ...OwnerParts
        }
        ownerGroups {
          ...OwnerGroupParts
        }
      }
    }
    target_action {
      ...ActionParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_indicator {
      ...IndicatorParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_acceptance {
      ...AcceptanceParts
    }
    target_appetite {
      ...AppetiteParts
    }
    target_issue {
      ...IssueParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
    target_consequence {
      ...ConsequenceParts
    }
    target_cause {
      ...CauseParts
    }
    target_test_result {
      ...TestResultParts
    }
    target_action_update {
      ...ActionUpdateParts
    }
    target_issue_update {
      ...IssueUpdateParts
      issue {
        Type
      }
    }
    target_third_party {
      ...ThirdPartyParts
      owners {
        ...OwnerParts
      }
      contributors {
        ...ContributorParts
      }
      ownerGroups {
        ...OwnerGroupParts
      }
      contributorGroups {
        ...ContributorGroupParts
      }
    }
  }
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ControlGroupParts on control_group {
  Description
  Id
  Owner
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  ModifiedByUser
  CreatedByUser
  CustomAttributeData
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment DocumentParts on document {
  Id
  Title
  DocumentType
  Purpose
  ParentDocument
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment AssessmentActivityParts on assessment_activity {
  Title
  Id
  ParentId
  Summary
  Status
  ActivityType
  CompletionDate
  AssignedUser
  CreatedByUser
  CreatedAtTimestamp
  ModifiedByUser
  ModifiedAtTimestamp
  CustomAttributeData
  ownerGroups {
    UserGroupId
    group {
      Name
      users{
        UserId
      }
    }
  }
  owners {
    UserId
    user {
      FriendlyName
    }
  }
  createdByUser {
    FriendlyName
  }
  modifiedByUser {
    FriendlyName
  }
  IsRCSA
  RiskId
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment InternalAuditReportParts on internal_audit_report {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment InternalAuditEntityParts on internal_audit_entity {
  Id
  SequentialId
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  businessArea {
    Title
    SequentialId
    Id
  }
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment IndicatorParts on indicator {
  SequentialId
  Type
  UpperToleranceNum
  Unit
  Title
  TargetValueTxt
  LowerToleranceNum
  Id
  Description
  CustomAttributeData
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  LowerAppetiteNum
  UpperAppetiteNum
  schedule {
    ...ScheduleParts
  }
}

fragment AcceptanceParts on acceptance {
  DateAcceptedFrom
  DateAcceptedTo
  Details
  Id
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ApprovedByUser
  ApprovedByUserGroup
  RequestedByUser
  RequestedByUserGroup
  CustomAttributeData
  SequentialId
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment ConsequenceParts on consequence {
  CostType
  CostValue
  Criticality
  Description
  Id
  ParentIssueId
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  Type
}

fragment CauseParts on cause {
  ModifiedByUser
  CreatedByUser
  Title
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Significance
  ParentIssueId
  Id
  Description
  CustomAttributeData
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment IssueUpdateParts on issue_update {
  Description
  Id
  ParentIssueId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}`);o(`mutation linkItems($Source: uuid!, $Targets: [uuid!]!) {
  linkItems(Source: $Source, Targets: $Targets) {
    Links {
      Source
      Target
      RelationshipType
    }
  }
}`);o(`query getModules {
  organisation_module {
    ModuleSettings
  }
}`);o(`mutation updateModules($ModuleSettings: jsonb!) {
  insert_organisation_module(
    objects: [{ ModuleSettings: $ModuleSettings }]
    on_conflict: {
      constraint: organisation_module_pkey
      update_columns: [ModuleSettings]
    }
  ) {
    affected_rows
  }
}`);o(`query getMyDueItems(
  $userId: String!
  $date: timestamptz!
  $riskFilterConditions: risk_bool_exp!
  $actionFilterConditions: action_bool_exp!
  $assessmentFilterConditions: assessment_bool_exp!
  $controlFilterConditions: control_bool_exp!
  $issueFilterConditions: issue_bool_exp!
  $assessmentActivityFilterConditions: assessment_activity_bool_exp!
  $documentFilterConditions: document_bool_exp!
  $indicatorFilterConditions: indicator_bool_exp!
  $obligationFilterConditions: obligation_bool_exp!
) {
  change_request {
    ...MyItemsChangeRequestParts
  }

  risk(
    where: {
      _or: [$riskFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: $date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  action(
    where: {
      _or: [$actionFilterConditions]
      _and: [{ Status: { _neq: closed } }, { DateDue: { _lte: $date } }]
    }
  ) {
    Id
    DateDue
    Title
    Status
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment(
    where: {
      _or: [$assessmentFilterConditions]
      _and: [
        { Status: { _neq: complete } }
        { TargetCompletionDate: { _lte: $date } }
      ]
    }
  ) {
    Id
    Title
    TargetCompletionDate
    Status
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  control(
    where: {
      _or: [$controlFilterConditions]
      _and: { scheduleState: { DueDate: { _lte: $date } } }
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  issue(
    where: {
      _or: [$issueFilterConditions]
      _and: {
        assessment: {
          Status: { _neq: closed }
          TargetCloseDate: { _lte: $date }
        }
      }
    }
  ) {
    Id
    Title
    assessment {
      TargetCloseDate
      Status
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  assessment_activity(
    where: {
      _or: [$assessmentActivityFilterConditions]
      _and: [
        { IsRCSA: { _eq: true } }
        { Status: { _neq: complete } }
        { parentRisk: { scheduleState: { DueDate: { _lte: $date } } } }
      ]
    }
  ) {
    Id
    Title
    RiskId
    parentRisk {
      scheduleState {
        DueDate
      }
    }
    Status
  }

  attestation_record(
    where: {
      _and: [
        { UserId: { _eq: $userId } }
        { AttestationStatus: { _eq: pending } }
        { ExpiresAt: { _lte: $date } }
      ]
    }
  ) {
    ExpiresAt
    AttestationStatus
    attestationRecordStatus {
      Status
    }
    node {
      documentFile {
        parent {
          Id
          Title
        }
      }
    }
  }

  document(
    where: {
      _or: [$documentFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: $date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  indicator(
    where: {
      _or: [$indicatorFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: $date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }

  obligation(
    where: {
      _or: [$obligationFilterConditions]
      _and: [{ scheduleState: { DueDate: { _lte: $date } } }]
    }
  ) {
    Id
    Title
    scheduleState {
      DueDate
      OverdueDate
    }
    ownerGroups {
      ...MyItemsOwnerGroupParts
    }
    contributorGroups {
      ...MyItemsContributorGroupParts
    }
  }
}

fragment MyItemsChangeRequestParts on change_request {
  ChangeRequestStatus
  CreatedAtTimestamp
  Id
  responses {
    Approved
    approver {
      OwnerApprover
      level {
        Id
        ApprovalRuleType
      }
      group {
        users {
          UserId
        }
      }
      user {
        Id
      }
    }
  }
  parent {
    Id
    SequentialId
    ObjectType
    risk {
      Id
      Title
    }

    documentFile {
      Version
      parent {
        Id
        Title
      }
    }

    action {
      Id
      Title
    }

    issue_assessment {
      parent {
        Id
        Title
      }
    }

    acceptance {
      Id
      Title
    }

    control {
      Id
      Title
    }

    issue {
      Id
      Title
    }
  }
  currentUserOwnerList: parentOwnerAndContributors(
    where: { ContributorType: { _eq: "owner" }, UserId: { _eq: $userId } }
    distinct_on: [UserId]
  ) {
    UserId
  }
}

fragment MyItemsOwnerGroupParts on owner_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}

fragment MyItemsContributorGroupParts on contributor_group {
  UserGroupId
  group {
    users {
      UserId
    }
  }
}`);o(`query getMyItems($userId: String!) {
  obligation(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  risk(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  action(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  control(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  indicator(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Description
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  issue(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Details
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  document(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Purpose
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }

  assessment(where: { ancestorContributors: { UserId: { _eq: $userId } } }) {
    Id
    Title
    Summary
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }

    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getAcceptanceCount($where: acceptance_bool_exp! = {}) {
  acceptance_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getAppetiteCount($where: risk_bool_exp! = {}) {
  risk_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getAssessmentActivityCount {
  assessment_activity_aggregate(
    where: { parentAssessment: {} }
  ) {
    aggregate {
      count
    }
  }
}`);o(`query getAssessmentCount {
  assessment_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getAssessmentResultCount {
  risk_assessment_result_aggregate(where: { parents: { assessment: {} } }) {
    aggregate {
      count
    }
  }
  document_assessment_result_aggregate(where: { parents: { assessment: {} } }) {
    aggregate {
      count
    }
  }
  obligation_assessment_result_aggregate(
    where: { parents: { assessment: {} } }
  ) {
    aggregate {
      count
    }
  }
}`);o(`query getCauseCount($where: cause_bool_exp! = {}) {
  cause_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getComplianceMonitoringAssessmentCount {
  compliance_monitoring_assessment_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getComplianceMonitoringAssessmentResultCount {
  risk_controlled_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  risk_uncontrolled_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  document_second_line_result_aggregate {
    aggregate {
      count
    }
  }
  obligation_second_line_result_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getConsequenceCount($where: consequence_bool_exp! = {}) {
  consequence_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getControlCount($where: control_bool_exp! = {}) {
  control_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getControlGroupCount {
  control_group_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getInternalAuditReportCount {
  internal_audit_report_aggregate {
    aggregate {
      count
    }
  }
}`);o(`query getInternalAuditReportResultCount {
  risk_controlled_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  risk_uncontrolled_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  document_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
  obligation_internal_audit_result_aggregate(
    where: { parents: { internalAuditReport: {} } }
  ) {
    aggregate {
      count
    }
  }
}`);o(`query getIssueCount($where: issue_bool_exp! = {}) {
  issue_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getRiskCount($where: risk_bool_exp! = {}) {
  risk_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getTestResultCount($where: test_result_bool_exp! = {}) {
  test_result_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`query getObjectTypeById($Id: uuid!) {
  node: node_by_pk(Id: $Id) {
    ObjectType
  }
}`);o(`mutation disconnectSlack {
  disconnectSlack {
    message
  }
}`);o(`query getNotificationListDetails(
  $issueIds: [uuid!]!
  $actionIds: [uuid!]!
  $riskIds: [uuid!]!
  $controlIds: [uuid!]!
  $documentFileIds: [uuid!]!
  $documentIds: [uuid!]!
  $indicatorIds: [uuid!]!
) {
  action(where: { Id: { _in: $actionIds } }) {
    Id
    SequentialId
    Title
  }

  issue(where: { Id: { _in: $issueIds } }) {
    Id
    SequentialId
    Title
  }

  risk(where: { Id: { _in: $riskIds } }) {
    Id
    SequentialId
    Title
  }

  control(where: { Id: { _in: $controlIds } }) {
    Id
    SequentialId
    Title
  }

  document_file(where: { Id: { _in: $documentFileIds } }) {
    Id
    ParentDocumentId
  }

  document(where: { Id: { _in: $documentIds } }) {
    Id
    SequentialId
    Title
  }

  indicator(where: { Id: { _in: $indicatorIds } }) {
    Id
    SequentialId
    Title
  }
}`);o(`query getNotificationPreferences {
  notificationPreferences {
    categories
    channel_types
    id
    workflows
  }
  slackNotificationConnection {
    connected
  }
}`);o(`mutation updateNotificationPreferences(
  $preferenceSet: UpdateNotificationPreferencesInput!
) {
  updateNotificationPreferences(preferenceSet: $preferenceSet) {
    message
  }
}`);o(`mutation deleteObligation($id: uuid!) {
  delete_obligation_impact(where: { ParentObligationId: { _eq: $id } }) {
    affected_rows
  }

  delete_obligation(where: { Id: { _eq: $id } }) {
    affected_rows
  }
}`);o(`query getObligationAuditById($Id: uuid!) {
  obligation_audit(where: { Id: { _eq: $Id } }) {
    Adherence
    Description
    Id
    Interpretation
    ParentId
    Title
    Type
    CustomAttributeData
    SequentialId
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
  }
}`);o(`query getObligationById($_eq: uuid!) {
  obligation(where: { Id: { _eq: $_eq } }) {
    ...ObligationParts
    scheduleState {
      LatestDate
    }
    CreatedBy: createdBy {
      FriendlyName
    }
    ModifiedBy: modifiedBy {
      FriendlyName
    }
    Parent: parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getObligationList {
  # Note: Query is must faster for standard users when obligations are queried separately to nodes
  obligation {
    Id
    Title
    SequentialId
  }
  # Get obligation nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: obligation } }) {
    Id
    SequentialId
  }
}`);o(`query getObligations(
  $where: obligation_bool_exp! = {}
  $obligationAssessmentResultsWhere: obligation_assessment_result_bool_exp = {}
  $includeAssessmentResultsHistory: Boolean = false
) {
  obligation(where: $where) {
    ...ObligationParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
    CreatedBy: createdBy {
      FriendlyName
    }
    ModifiedBy: modifiedBy {
      FriendlyName
    }

    Parent: parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    controls_aggregate {
      aggregate {
        count
      }
    }
    BreachedIssues: issues(
      where: {
        issue: {
          assessment: {
            Status: { _in: [open, pending] }
            RegulatoryBreach: { _eq: true }
          }
        }
      }
    ) {
      ...BreachedIssuesParts
    }
    assessmentResults(
      where: {
        obligationAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            $obligationAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { obligationAssessmentResult: { TestDate: desc_nulls_last } }
        { obligationAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) @include(if: $includeAssessmentResultsHistory) {
      ParentId
      obligationAssessmentResult {
        Id
        Rating
        TestDate
        CreatedAtTimestamp
      }
    }
  }
  assessment_result_parent(
    where: {
      obligationAssessmentResult: {
        RatingType: { _in: ["assessment", "rating"] }
      }
    }
    distinct_on: [ParentId]
    order_by: [
      { ParentId: desc }
      {
        obligationAssessmentResult: {
          TestDate: desc_nulls_last
          CreatedAtTimestamp: desc_nulls_last
        }
      }
    ]
  ) {
    obligationAssessmentResult {
      parents {
        ParentId
      }
      Id
      Rating
      CustomAttributeData
    }
  }
}

fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment BreachedIssuesParts on issue_parent {
  issue {
    ...SimplifiedIssueParts
  }
}

fragment SimplifiedIssueParts on issue {
  Id
  Title
}`);o(`query getObligationsByType($type: obligation_type_enum!) {
  obligation(where: { Type: { _eq: $type } }) {
    Title
    SequentialId
    Id
  }
}`);o(`mutation insertObligation($object: InsertChildObligationInput) {
  insertChildObligation(object: $object) {
    Id
  }
}`);o(`fragment ObligationParts on obligation {
  Adherence
  Description
  Id
  Interpretation
  ParentId
  Title
  Type
  CustomAttributeData
  SequentialId
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
  ExternalId
  RegulatorySourceId
  ExternalSyncedAt
  Reference
  SourceUrl
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation updateObligation($object: UpdateChildObligationInput) {
  updateChildObligation(object: $object) {
    Id
  }
}`);o(`query getObligationChangeById($_eq: uuid!) {
  obligation_change(where: { Id: { _eq: $_eq } }) {
    Id
    SequentialId
    DescriptionBefore
    DescriptionAfter
    Rationale
    ObligationId
    ExternalId
    EffectiveDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    obligation {
      Id
      Title
      Description
      Reference
      regulatorySource {
        RegulatorName
      }
    }
    createdBy {
      Id
      FriendlyName
    }
    modifiedBy {
      Id
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    attestations {
      UserId
    }
    actions {
      action {
        Id
        Title
        SequentialId
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`query getObligationChanges {
  obligation_change {
    Id
    SequentialId
    DescriptionBefore
    DescriptionAfter
    Rationale
    ObligationId
    ExternalId
    EffectiveDate
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CreatedByUser
    ModifiedByUser
    obligation {
      Id
      Title
      Reference
      regulatorySource {
        RegulatorName
      }
    }
    createdBy {
      Id
      FriendlyName
    }
    modifiedBy {
      Id
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    attestations {
      UserId
    }
    actions {
      action {
        Id
        Title
        SequentialId
      }
    }
  }
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`mutation DeleteObligationChangeAttestation(
  $object: DeleteChildObligationChangeAttestationInput!
) {
  deleteChildObligationChangeAttestation(object: $object) {
    Id
  }
}`);o(`mutation InsertObligationChangeAttestationOne(
  $object: InsertChildObligationChangeAttestationInput!
) {
  insertChildObligationChangeAttestation(object: $object) {
    Id
  }
}`);o(`mutation deleteImpacts($Ids: [uuid!]) {
  delete_obligation_impact(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getObligationImpactAuditById($id: uuid!) {
  obligation_impact_audit(where: { Id: { _eq: $id } }) {
    Id
    Description
    ImpactRating
    CustomAttributeData
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getObligationImpactById($id: uuid!) {
  obligation_impact(where: { Id: { _eq: $id } }) {
    Id
    Description
    ImpactRating
    CustomAttributeData
  }
}`);o(`query getObligationImpactsByParentId($_eq: uuid!) {
  obligation_impact(where: { ParentObligationId: { _eq: $_eq } }) {
    CreatedAtTimestamp
    CreatedByUser
    Description
    Id
    ImpactRating
    ModifiedAtTimestamp
    ModifiedByUser
    ParentObligationId
    CustomAttributeData
    parent {
      Title
      Id
    }
    createdBy {
      FriendlyName
    }
    modifiedBy {
      FriendlyName
    }
  }
}`);o(`mutation insertObligationImpact(
  $Description: String!
  $ImpactRating: smallint!
  $ParentObligationId: uuid!
  $CustomAttributeData: jsonb
) {
  insert_obligation_impact_one(
    object: {
      Description: $Description
      ImpactRating: $ImpactRating
      ParentObligationId: $ParentObligationId
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    Id
  }
}`);o(`mutation updateObligationImpact(
  $id: uuid!
  $ImpactRating: smallint!
  $Description: String!
  $CustomAttributeData: jsonb
) {
  update_obligation_impact(
    where: { Id: { _eq: $id } }
    _set: {
      Description: $Description
      ImpactRating: $ImpactRating
      CustomAttributeData: $CustomAttributeData
    }
  ) {
    affected_rows
  }
}`);o(`query getOrganisation {
  auth_organisation {
    Meta
    ScimEnabled
  }
}`);o(`mutation updateOrganisation($OrgKey: String, $ScimEnabled: Boolean) {
  update_auth_organisation(
    where: { OrgKey: { _eq: $OrgKey } }
    _set: { ScimEnabled: $ScimEnabled }
  ) {
    affected_rows
  }
}`);o(`query getQuestionnaireInvites($thirdPartyId: uuid!) {
  questionnaire_invite(where: { ThirdPartyId: { _eq: $thirdPartyId } }) {
    Id
    UserEmail
    CreatedAtTimestamp
    ModifiedAtTimestamp
    parent {
      Id
      Status
      StartDate
      ExpiresAt
      ResponseData
    }
    thirdParty {
      Id
      Title
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    questionnaireTemplateVersion {
      Id
      Version
      parent {
        Title
      }
    }
  }
}`);o(`mutation insertQuestionnaireInvites(
  $thirdPartyId: uuid!
  $users: [String!]!
  $message: String
  $questionnaires: [uuid!]!
) {
  insertQuestionnaireInvites(
    ThirdPartyId: $thirdPartyId
    UserEmails: $users
    Message: $message
    QuestionnaireTemplateVersionIds: $questionnaires
  ) {
    affected_rows
  }
}`);o(`mutation deleteQuestionnaireTemplateVersions($questionnaireTemplateVersionIds: [uuid!]!) {
  delete_questionnaire_template_version(where: { Id: { _in: $questionnaireTemplateVersionIds } }) {
    affected_rows
  }
}`);o(`query getLatestQuestionnaireTemplateVersion($where: questionnaire_template_version_bool_exp) {
  questionnaire_template_version(
    where: $where
    order_by: { CreatedAtTimestamp: desc }
    limit: 1
  ) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    parent {
      Id
      Title
    }
    CustomAttributeData
  }
}`);o(`query getQuestionnaireTemplateVersionById($Id: uuid!) {
  questionnaire_template_version: questionnaire_template_version_by_pk(Id:$Id) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    parent {
      Id
      Title
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`);o(`query getQuestionnaireTemplateVersionsByQuestionnaireTemplateId($questionnaireTemplateId: uuid!) {
  questionnaire_template_version(where: { ParentId: { _eq: $questionnaireTemplateId } }) {
    Id
    Version
    Status
    ParentId
    Schema
    UISchema
    CreatedByUser
    createdByUser {
      Id
      FriendlyName
    }
    ModifiedByUser
    modifiedByUser {
      Id
      FriendlyName
    }
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
  }
}`);o(`mutation insertQuestionnaireTemplateVersion($object: questionnaire_template_version_insert_input!) {
  insert_questionnaire_template_version_one(object: $object) {
    Id
  }
}`);o(`mutation publishQuestionnaireTemplateVersion(
  $questionnaireTemplateId: uuid!
  $questionnaireTemplateVersionId: uuid!
) {
  publishQuestionnaireTemplateVersion(
    QuestionnaireTemplateId: $questionnaireTemplateId,
    QuestionnaireTemplateVersionId: $questionnaireTemplateVersionId) {
    affected_rows
  }
}`);o(`mutation updateQuestionnaireTemplateVersion($Id: uuid!, $object: questionnaire_template_version_set_input!) {
  update_questionnaire_template_version_by_pk(pk_columns: { Id: $Id }, _set: $object) {
    Id
  }
}`);o(`mutation deleteQuestionnaireTemplate($Id: uuid!) {
  delete_questionnaire_template_version(where: { ParentId: { _eq: $Id } }) {
    affected_rows
  }

  delete_questionnaire_template_by_pk(Id: $Id) {
    Id
  }
}`);o(`query getQuestionnaireTemplateById($Id: uuid!) {
  questionnaire_template: questionnaire_template_by_pk(Id: $Id) {
    ...QuestionnaireTemplateParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    draftVersions: versions(
      where: { Status: { _eq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    nonDraftVersions: versions(
      where: { Status: { _neq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    publishedVersion: versions(
      where: { Status: { _eq: published } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
  }
}

fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getQuestionnaireTemplates($where: questionnaire_template_bool_exp) {
  questionnaire_template(where: $where) {
    ...QuestionnaireTemplateParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    createdByUser {
      Id
      FriendlyName
    }
    modifiedByUser {
      Id
      FriendlyName
    }
    draftVersions: versions(
      where: { Status: { _eq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    nonDraftVersions: versions(
      where: { Status: { _neq: draft } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
    publishedVersion: versions(
      where: { Status: { _eq: published } }
      order_by: { CreatedAtTimestamp: desc }
      limit: 1
    ) {
      Id
      Version
      Status
    }
  }
}

fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertQuestionnaireTemplate(
  $object: InsertQuestionnaireTemplateInput
) {
  insertQuestionnaireTemplateApi(object: $object) {
    Id
  }
}`);o(`fragment QuestionnaireTemplateParts on questionnaire_template {
  Id
  Title
  Description
  CreatedByUser
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
}`);o(`mutation updateQuestionnaireTemplate(
  $object: UpdateQuestionnaireTemplateInput
) {
  updateQuestionnaireTemplateApi(object: $object) {
    Id
  }
}`);o(`fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getReportingData($Input: ReportingDataInput!) {
  reportingData(Input: $Input) {
    value
    meta
  }
}`);o(`query getReportingFilterOptions($Input: ReportingFilterOptionsInput!) {
  reportingFilterOptions(Input: $Input) {
    value
  }
}`);o(`mutation deleteRisk($id: uuid!) {
  deleteRiskById(Id: $id) {
    affected_rows
  }
}`);o(`fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`);o(`query getRiskAuditById($Id: uuid) {
  risk_audit(where: { Id: { _eq: $Id } }) {
    Id
    Title
    Tier
    Description
    ParentRiskId
    CreatedByUser
    Treatment
    Status
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    CustomAttributeData
    SequentialId
  }
}`);o(`query getRiskById($_eq: uuid) {
  risk(where: { Id: { _eq: $_eq } }) {
    ...RiskParts
    scheduleState {
      LatestDate
    }
    parent {
      Id
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    assessmentResults(
      where: {
        riskAssessmentResult: { RatingType: { _in: ["assessment", "rating"] } }
      }
    ) {
      riskAssessmentResult {
        ControlType
        Rating
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      UserGroupId
      group {
        Name
        users {
          UserId
        }
      }
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    enterpriseRiskInstance {
      EnterpriseRiskId
      EntityId
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getRiskList {
  # Note: Query is must faster for standard users when risks are queried separately to nodes
  risk {
    Id
    Title
    SequentialId
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}`);o(`query getRiskListOnlyOptimized {
  risk {
    Id
    Title
    SequentialId
  }
}`);o(`query getRiskListOnlyWithEntitiesOptimized {
  risk {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
  }
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`);o(`query getRiskListOptimized {
  # Note: Query is much faster for standard users when risks are queried separately to nodes
  risk {
    Id
    Title
    SequentialId
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}`);o(`query getRiskListWithEntities {
  # Enhanced risk query including entity information for multi-entity support
  risk {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
  }
  # Get risks nodes so we have IDs for even controls we don't have access to
  node(where: { ObjectType: { _eq: risk } }) {
    Id
    SequentialId
  }
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}`);o(`query getRiskWithOwnContributions($currentUserId: String!) {
  risk {
    Id
    SequentialId
    Title
    ancestorContributors(where: { UserId: { _eq: $currentUserId } }) {
      ...AncestorContributorParts
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getRisksByTier($where: risk_bool_exp!) {
  risk(where: $where, order_by: { Title: asc }) {
    Id
    Title
    SequentialId
    enterpriseRiskInstance {
      EnterpriseRiskId
      EntityId
      entity {
        Id
        Name
      }
    }
  }
}`);o(`query getRisksFlat(
  $where: risk_bool_exp! = {}
  $riskAssessmentResultsWhere: risk_assessment_result_bool_exp! = {}
) {
  risk(where: $where) {
    ...RiskParts
    scheduleState {
      LatestDate
      DueDate
      OverdueDate
    }
    createdByUser {
      FriendlyName
    }
    parent {
      Title
    }
    parentNode {
      Id
      ObjectType
      SequentialId
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    appetites(
      limit: 1
      where: { appetite: { AppetiteType: { _eq: risk } } }
      order_by: [
        { appetite: { EffectiveDate: desc_nulls_last } }
        { appetite: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) {
      appetite {
        LowerAppetite
        UpperAppetite
      }
    }
    impactRatings(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      distinct_on: [ImpactId]
      order_by: [{ ImpactId: desc }, { TestDate: desc }]
    ) {
      ImpactId
      Rating
    }
    impactRatingsForTrend: impactRatings(
      where: { RatingType: { _in: ["assessment", "rating"] } }
      order_by: [{ TestDate: desc }, { CreatedAtTimestamp: desc }]
      limit: 10
    ) {
      ImpactId
      Rating
      TestDate
    }
    assessmentResults(
      where: {
        riskAssessmentResult: {
          _and: [
            { RatingType: { _in: ["assessment", "rating"] } }
            $riskAssessmentResultsWhere
          ]
        }
      }
      order_by: [
        { riskAssessmentResult: { TestDate: desc_nulls_last } }
        { riskAssessmentResult: { CreatedAtTimestamp: desc_nulls_last } }
      ]
    ) {
      ParentId
      riskAssessmentResult {
        Id
        Rating
        ControlType
        Likelihood
        Impact
        CustomAttributeData
        CreatedAtTimestamp
        TestDate
      }
    }
    controls_aggregate {
      aggregate {
        count
      }
    }
    indicators_aggregate {
      aggregate {
        count
      }
    }
    actions_aggregate {
      aggregate {
        count
      }
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    enterpriseRiskInstance {
      entity {
        Id
        Name
      }
      enterpriseRisk {
        Id
        Title
      }
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getRisksWithAncestorContributors {
  risk {
    ...RiskParts
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`query getRisksWithAncestorContributorsAndEntities {
  risk {
    ...RiskParts
    enterpriseRiskInstance {
      ...EnterpriseRiskInstanceWithEntityHierarchyParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }
}

fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment EnterpriseRiskInstanceWithEntityHierarchyParts on enterprise_risk_instance {
  EntityId
  EnterpriseRiskId
  entity {
    Id
    Name
    ParentId
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`mutation insertRisk($object: InsertChildRiskInput) {
  insertChildRisk(object: $object) {
    Id
  }
}`);o(`fragment RiskParts on risk {
  Id
  Title
  Tier
  Description
  ParentRiskId
  CreatedByUser
  Treatment
  Status
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation updateRisk($object: UpdateChildRiskInput) {
  updateChildRisk(object: $object) {
    Id
  }
}`);o(`query getLatestRiskAssessmentResultConfig {
  risk_assessment_result_config(where: { IsLatest: { _eq: true } }, limit: 1) {
    Id
    Version
    Config
    IsLatest
    ModifiedAtTimestamp
  }
}`);o(`query getRiskAssessmentResultConfigAuditById($id: uuid!) {
  risk_assessment_result_config_audit(where: { Id: { _eq: $id } }) {
    Id
    Version
    Config
    IsLatest
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getRiskAssessmentResultConfigByVersions($versions: [Int!]!) {
  risk_assessment_result_config(where: { Version: { _in: $versions } }) {
    Id
    Version
    Config
    IsLatest
  }
}`);o(`mutation InsertRiskAssessmentResultConfig($Config: jsonb!) {
  insertRiskAssessmentResultConfigApi(Config: $Config) {
    Id
    Version
    IsLatest
  }
}`);o(`mutation UpdateRiskAssessmentResultConfig(
  $Id: uuid!
  $Config: jsonb!
  $OriginalTimestamp: timestamptz!
) {
  updateRiskAssessmentResultConfigApi(
    Id: $Id
    Config: $Config
    OriginalTimestamp: $OriginalTimestamp
  ) {
    Id
    Version
    IsLatest
  }
}`);o(`query getRiskAssessmentResultImpactAuditById($id: uuid!) {
  risk_assessment_result_impact_audit(where: { Id: { _eq: $id } }) {
    Id
    RiskAssessmentResultId
    Label
    Value
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`query getRoleAccess {
  role_access {
    AccessType
    ContributorType
    ObjectType
  }
}`);o(`query GetAvailableRoles {
  available_roles {
    id
    name
    description
  }
}`);o(`query getDefaultRoles {
  auth_role_type {
    RoleKey
    Description
    Name
    Category
    resourceTypes {
      resourceType {
        ResourceType
      }
    }
  }
}`);o(`fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}`);o(`mutation deleteScimDomain($domain: String!) {
  delete_scim_domain(domain: $domain) {
    updatedDomains {
      domain
      createdOn
    }
  }
}`);o(`mutation deleteScimToken($keyId: String!) {
  delete_scim_token(keyId: $keyId) {
    keyId
  }
}`);o(`query getScimConfig {
  getScimConfig {
    domains {
      domain
      createdOn
    }
    tokens {
      keyId
      orgKey
      token
      createdOn
      expiresOn
      status
    }
    legacyTokens
  }
}`);o(`mutation insertScimDomain($domain: String!) {
  insert_scim_domain(domain: $domain) {
    domain
    createdOn
  }
}`);o(`mutation insertScimToken($expireInMonths: String!) {
  insert_scim_token(expireInMonths: $expireInMonths) {
    keyId
    orgKey
    token
    createdOn
    expiresOn
    status
  }
}`);o(`mutation deleteSecondLineResults($Ids: [uuid!]!) {
  delete_document_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_obligation_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_risk_controlled_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_risk_uncontrolled_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_control_test_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_control_test_second_line_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }

  delete_impact_second_line_rating(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getAllComplianceMonitoringAssessmentResults {
  document_second_line_result(order_by: { CreatedByUser: asc }) {
    ...DocumentSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    documents: parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  obligation_second_line_result(order_by: { CreatedByUser: asc }) {
    ...ObligationSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    obligations: parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_controlled_second_line_result(order_by: { CreatedByUser: asc }) {
    ...RiskControlledSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }

  risk_uncontrolled_second_line_result(order_by: { CreatedByUser: asc }) {
    ...RiskUncontrolledSecondLineResultParts
    complianceMonitoringAssessments: parents(
      where: { ParentType: { _eq: compliance_monitoring_assessment } }
    ) {
      complianceMonitoringAssessment {
        Id
        Title
        ActualCompletionDate
        StartDate
        Status
        completedByUser {
          FriendlyName
        }
      }
    }
    risks: parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getComplianceMonitoringAssessmentTestResultsByControlId(
  $controlId: uuid
) {
  control_test_second_line_result(
    where: { ParentControlId: { _eq: $controlId } }
  ) {
    ...ControlTestSecondLineResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentId(
  $ParentId: uuid!
) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
  ) {
    ...DocumentSecondLineResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getComplianceMonitoringAssessmentObligationAssessmentResultsByObligationId(
  $ObligationId: uuid!
) {
  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: $ObligationId } } }
  ) {
    ...ObligationSecondLineResultParts
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
  $RiskId: uuid!
) {
  risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledSecondLineResultParts
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }

  risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledSecondLineResultParts
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getDocumentSecondLineResultById($Id: uuid!) {
  document_second_line_result(where: { Id: { _eq: $Id } }) {
    ...DocumentSecondLineResultParts
    parents {
      document {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentId(
  $DocumentId: uuid!
) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: $DocumentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...DocumentSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestComplianceMonitoringAssessmentObligationAssessmentResultByObligationId(
  $ObligationId: uuid!
) {
  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: $ObligationId } } }
    order_by: [
      { TestDate: desc_nulls_last }
      { CreatedAtTimestamp: desc_nulls_last }
    ]
    limit: 1
  ) {
    ...ObligationSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskId(
  $RiskId: uuid!
) {
  uncontrolled: risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskUncontrolledSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
  controlled: risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: $RiskId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...RiskControlledSecondLineResultParts
    ancestorContributors {
      ...AncestorContributorParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getLatestComplianceMonitoringAssessmentTestResultsByControlId(
  $controlId: uuid
) {
  control_test_second_line_result(
    where: { ParentControlId: { _eq: $controlId } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...ControlTestSecondLineResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    parents(where: { ParentType: { _eq: compliance_monitoring_assessment } }) {
      complianceMonitoringAssessment {
        ...ComplianceMonitoringAssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment ComplianceMonitoringAssessmentParts on compliance_monitoring_assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getObligationSecondLineResultById($Id: uuid!) {
  obligation_second_line_result(where: { Id: { _eq: $Id } }) {
    ...ObligationSecondLineResultParts
    parents {
      obligation {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getRiskSecondLineResultById($Id: uuid!) {
  risk_controlled_second_line_result(where: { Id: { _eq: $Id } }) {
    ...RiskControlledSecondLineResultParts
    parents {
      risk {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
  risk_uncontrolled_second_line_result(where: { Id: { _eq: $Id } }) {
    ...RiskUncontrolledSecondLineResultParts
    parents {
      risk {
        Id
        Title
      }
      complianceMonitoringAssessment {
        Id
        Title
      }
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}`);o(`query getSecondLineResultById($Id: uuid!) {
  second_line_result_parent(where: { Id: { _eq: $Id } }) {
    Id
    ParentId
    ResultType
    ParentType
    obligationAssessmentResult {
      ...ObligationSecondLineResultParts
    }
    documentAssessmentResult {
      ...DocumentSecondLineResultParts
    }
    controlledRiskAssessmentResult {
      ...RiskControlledSecondLineResultParts
    }
    uncontrolledRiskAssessmentResult {
      ...RiskUncontrolledSecondLineResultParts
    }
    testResult {
      ...ControlTestSecondLineResultParts
    }
    impactRating {
      ...ImpactSecondLineRatingParts
    }
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}`);o(`query getSecondLineResultsByParentId($ParentId: uuid!) {
  document_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...DocumentSecondLineResultParts
    parents(where: { ParentType: { _eq: document } }) {
      document {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  obligation_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ObligationSecondLineResultParts
    parents(where: { ParentType: { _eq: obligation } }) {
      obligation {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_controlled_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskControlledSecondLineResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  risk_uncontrolled_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...RiskUncontrolledSecondLineResultParts
    parents(where: { ParentType: { _eq: risk } }) {
      risk {
        Id
        Title
      }
      node {
        Id
        SequentialId
        ObjectType
      }
    }
    files {
      ...RelationFileParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
  }

  control_test_second_line_result(
    where: { parents: { ParentId: { _eq: $ParentId } } }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
  ) {
    ...ControlTestSecondLineResultParts
    parent {
      ...ControlParts
    }
    files {
      ...RelationFileParts
    }
  }

  impact_second_line_rating(
    where: { parents: { ParentId: { _eq: $ParentId } } }
  ) {
    ...ImpactSecondLineRatingParts
    createdByUser {
      FriendlyName
    }
    completedBy {
      FriendlyName
    }
    impact {
      Id
      Name
    }
    ratedItem {
      risk {
        Title
      }
      ObjectType
    }
  }

  issue(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...IssueParts
    consequences {
      CostType
      CostValue
      Type
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    assessment {
      ...IssueAssessmentParts
      modifiedByUser {
        FriendlyName
      }
      createdByUser {
        FriendlyName
      }
      certifiedIndividual {
        FriendlyName
      }
      departments {
        ...DepartmentParts
      }
    }
    actions_aggregate(where: { action: { Status: { _eq: open } } }) {
      aggregate {
        count
      }
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    departments {
      ...DepartmentParts
    }
    tags {
      ...TagParts
    }
    parents {
      obligation {
        Title
        Id
      }
      document {
        Title
        Id
      }
      control {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
  }

  impact(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ImpactParts
    createdByUser {
      FriendlyName
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    ratings(
      distinct_on: [RatedItemId]
      order_by: [{ RatedItemId: desc }, { TestDate: desc }]
    ) {
      Rating
      RatedItemId
      ratedItem {
        risk {
          Id
          Title
        }
      }
    }
    appetites(
      order_by: [
        { EffectiveDate: desc_nulls_last }
        { CreatedAtTimestamp: desc_nulls_last }
      ]
    ) {
      ...AppetiteParts
      ImpactId
      parents {
        risk {
          Id
        }
      }
    }
  }

  action(where: { parents: { ParentId: { _eq: $ParentId } } }) {
    ...ActionParts
    parents {
      parent {
        Id
        ObjectType
        SequentialId
      }
      obligation {
        Title
        Id
      }
      risk {
        Title
        Id
      }
      control {
        Title
        Id
      }
      issue {
        Title
        Id
        Type
      }
      document {
        Title
        Id
      }
      assessment {
        Title
        Id
      }
    }
    updates(order_by: { CreatedAtTimestamp: desc }, limit: 1) {
      ...ActionUpdateParts
    }
    updates_aggregate {
      aggregate {
        count
      }
    }
    owners {
      ...OwnerParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributors {
      ...ContributorParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    modifiedByUser {
      FriendlyName
    }
    createdByUser {
      FriendlyName
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment DocumentSecondLineResultParts on document_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment ObligationSecondLineResultParts on obligation_second_line_result {
  Id
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskControlledSecondLineResultParts on risk_controlled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment RiskUncontrolledSecondLineResultParts on risk_uncontrolled_second_line_result {
  Id
  Likelihood
  Impact
  Rating
  CustomAttributeData
  Rationale
  TestDate
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment ControlParts on control {
  CreatedByUser
  ModifiedByUser
  Description
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  Type
  CustomAttributeData
  SequentialId
  schedule {
    ...ScheduleParts
  }
}

fragment ScheduleParts on schedule {
  Id
  Frequency
  ManualDueDate
  StartDate
  TimeToCompleteValue
  TimeToCompleteUnit
}

fragment ImpactSecondLineRatingParts on impact_second_line_rating {
  CreatedAtTimestamp
  CreatedByUser
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  CustomAttributeData
  SequentialId
  Rating
  RatedItemId
  ImpactId
  TestDate
  CompletedBy
  Likelihood
}

fragment IssueParts on issue {
  RaisedAtTimestamp
  DateIdentified
  DateOccurred
  Details
  Id
  ImpactsCustomer
  IsExternalIssue
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  SequentialId
  CustomAttributeData
  Meta
  Type
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment IssueAssessmentParts on issue_assessment {
  ActualCloseDate
  CertifiedIndividual
  IssueCausedBySystemIssue
  IssueCausedByThirdParty
  IssueType
  ParentIssueId
  PoliciesBreached
  PolicyBreach
  PolicyOwner
  PolicyOwnerCommentary
  Rationale
  RegulatoryBreach
  RegulationsBreached
  Reportable
  Severity
  Status
  SystemResponsible
  TargetCloseDate
  ThirdPartyResponsible
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  Id
  CustomAttributeData
  Type
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment ImpactParts on impact {
  CreatedAtTimestamp
  CreatedByUser
  Rationale
  RatingGuidance
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  Name
  CustomAttributeData
  SequentialId
  LikelihoodAppetite
}

fragment AppetiteParts on appetite {
  Id
  LowerAppetite
  UpperAppetite
  ImpactAppetite
  LikelihoodAppetite
  Statement
  EffectiveDate
  AppetiteType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
  ImpactId
}

fragment ActionParts on action {
  DateDue
  DateRaised
  Description
  Id
  Priority
  Status
  ModifiedAtTimestamp
  CreatedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  ClosedDate
  CustomAttributeData
  SequentialId
}

fragment ActionUpdateParts on action_update {
  Description
  Id
  ParentActionId
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
}`);o(`query getSecondLineTestResultById($Id: uuid) {
  control_test_second_line_result(where: { Id: { _eq: $Id } }) {
    ...ControlTestSecondLineResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`mutation insertDocumentSecondLineResult(
  $Rating: Int
  $ComplianceMonitoringAssessmentId: uuid!
  $DocumentIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildDocumentSecondLineResult(
    Rating: $Rating
    ComplianceMonitoringAssessmentId: $ComplianceMonitoringAssessmentId
    DocumentIds: $DocumentIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertObligationSecondLineResult(
  $Rating: Int
  $ComplianceMonitoringAssessmentId: uuid!
  $ObligationIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildObligationSecondLineResult(
    Rating: $Rating
    ComplianceMonitoringAssessmentId: $ComplianceMonitoringAssessmentId
    ObligationIds: $ObligationIds
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertChildRiskSecondLineResult(
  $Rating: Int
  $Likelihood: Int
  $Impact: Int
  $ControlType: risk_assessment_result_control_type_enum
  $ComplianceMonitoringAssessmentId: uuid!
  $RiskIds: [uuid!]!
  $CustomAttributeData: jsonb
  $TestDate: timestamptz
  $Rationale: String
) {
  insertChildRiskSecondLineResult(
    Rating: $Rating
    ComplianceMonitoringAssessmentId: $ComplianceMonitoringAssessmentId
    RiskIds: $RiskIds
    Impact: $Impact
    Likelihood: $Likelihood
    ControlType: $ControlType
    CustomAttributeData: $CustomAttributeData
    TestDate: $TestDate
    Rationale: $Rationale
  ) {
    Ids
  }
}`);o(`mutation insertSecondLineControlTestResult(
  $Description: String
  $DesignEffectiveness: Int
  $OverallEffectiveness: Int
  $ControlIds: [uuid!]!
  $PerformanceEffectiveness: Int
  $ComplianceMonitoringAssessmentId: uuid!
  $Submitter: String
  $TestDate: timestamptz
  $TestType: String
  $Title: String
  $CustomAttributeData: jsonb
) {
  insertChildControlTestSecondLineResult(
    Description: $Description
    DesignEffectiveness: $DesignEffectiveness
    OverallEffectiveness: $OverallEffectiveness
    ControlIds: $ControlIds
    PerformanceEffectiveness: $PerformanceEffectiveness
    Submitter: $Submitter
    TestDate: $TestDate
    TestType: $TestType
    Title: $Title
    ComplianceMonitoringAssessmentId: $ComplianceMonitoringAssessmentId
    CustomAttributeData: $CustomAttributeData
  ) {
    Ids
  }
}`);o(`mutation insertSecondLineImpactRating(
  $Ratings: [InsertImpactRatingPairInput!]!
  $TestDate: timestamptz!
  $ComplianceMonitoringAssessmentId: uuid!
  $RatedItemId: uuid!
  $CustomAttributeData: jsonb
  $CompletedBy: String
  $Likelihood: Int
) {
  insertChildImpactSecondLineRating(
    ComplianceMonitoringAssessmentId: $ComplianceMonitoringAssessmentId
    Ratings: $Ratings
    TestDate: $TestDate
    RatedItemId: $RatedItemId
    CustomAttributeData: $CustomAttributeData
    CompletedBy: $CompletedBy
    Likelihood: $Likelihood
  ) {
    Ids
  }
}`);o(`mutation updateControlTestSecondLineResultApi($object: UpdateTestResultInput) {
  updateControlTestSecondLineResultApi(object: $object) {
    Id
  }
}`);o(`mutation updateDocumentSecondLineResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_document_second_line_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateObligationSecondLineResult(
  $Id: uuid!
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_obligation_second_line_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateControlledRiskSecondLineResult(
  $Id: uuid!
  $Impact: Int
  $Likelihood: Int
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_risk_controlled_second_line_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
      Likelihood: $Likelihood
      Impact: $Impact
    }
  ) {
    affected_rows
  }
}`);o(`mutation updateUncontrolledRiskSecondLineResult(
  $Id: uuid!
  $Impact: Int
  $Likelihood: Int
  $Rating: Int
  $Rationale: String
  $TestDate: timestamptz
  $CustomAttributeData: jsonb
) {
  update_risk_uncontrolled_second_line_result(
    where: { Id: { _eq: $Id } }
    _set: {
      CustomAttributeData: $CustomAttributeData
      Rating: $Rating
      Rationale: $Rationale
      TestDate: $TestDate
      Likelihood: $Likelihood
      Impact: $Impact
    }
  ) {
    affected_rows
  }
}`);o(`mutation DeleteSsoConfigurationByConnectionId($connectionId: String!) {
  delete_sso_configuration(where: { ConnectionId: { _eq: $connectionId } }) {
    returning {
      Id
      ConnectionId
    }
  }
}`);o(`query getSsoConfigurations {
  sso_configuration(order_by: { CreatedAtTimestamp: desc }) {
    Id
    Name
    Strategy
    ClientId
    ConnectionId
    Domain
    DomainAliases
    IsActive
    IsRestApiEnabled
    IsOrganizationConnected
    CreatedAtTimestamp
    CreatedByUser
    ModifiedAtTimestamp
    ModifiedByUser
  }
}`);o(`mutation insertSsoConfig($object: InsertSsoConfigInput!) {
  insertSsoConfig(object: $object) {
    Id
    Name
    Strategy
    Enabled
    IsOrgConnected
    Action
    Options {
        Domain
        DomainAliases
    }
  }
}`);o(`mutation insertSsoConfiguration($object: sso_configuration_insert_input!) {
  insert_sso_configuration_one(object: $object) {
    Id
    Name
    Strategy
    ClientId
    ConnectionId
    IsActive
    IsRestApiEnabled
    IsOrganizationConnected
    CreatedAtTimestamp
    ModifiedAtTimestamp
  }
}`);o(`mutation UpdateSsoConfigurationByConnectionId(
  $connectionId: String!
  $set: sso_configuration_set_input!
) {
  update_sso_configuration(
    where: { ConnectionId: { _eq: $connectionId } }
    _set: $set
  ) {
    returning {
      Id
      Name
      Strategy
      ClientId
      ConnectionId
      IsActive
      IsRestApiEnabled
      IsOrganizationConnected
      ModifiedAtTimestamp
    }
  }
}`);o(`query getDefaultTabs {
  tab {
    ParentType
    Tabs
  }

  organisation_tab_preference {
    ObjectType
    Preferences
  }

  user_tab_preference {
    ObjectType
    Preferences
  }
}`);o(`query getOrganisationTabPreferences {
  organisation_tab_preference {
    ObjectType
    Preferences
  }
}`);o(`query getUserTabPreferences {
  user_tab_preference {
    ObjectType
    Preferences
  }
}`);o(`mutation resetTabPreferences($ObjectType: parent_type_enum!) {
  delete_organisation_tab_preference(
    where: { ObjectType: { _eq: $ObjectType } }
  ) {
    affected_rows
  }
  delete_user_tab_preference(where: { ObjectType: { _eq: $ObjectType } }) {
    affected_rows
  }
}`);o(`mutation updateOrganisationTabPreferences(
  $ObjectType: parent_type_enum!
  $Preferences: jsonb!
) {
  insert_organisation_tab_preference(
    objects: [{ ObjectType: $ObjectType, Preferences: $Preferences }]
    on_conflict: {
      constraint: organisation_tab_preference_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }

  delete_user_tab_preference(where: { ObjectType: { _eq: $ObjectType } }) {
    affected_rows
  }
}`);o(`mutation updateUserTabPreferences(
  $ObjectType: parent_type_enum!
  $Preferences: jsonb!
) {
  insert_user_tab_preference(
    objects: [{ ObjectType: $ObjectType, Preferences: $Preferences }]
    on_conflict: {
      constraint: user_tab_preference_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteTagTypes($Ids: [uuid!]!) {
  deleteTagTypeApi(Ids: $Ids) {
    affected_rows
  }
}`);o(`query GetTagTypeById($Id: uuid) {
  tag_type(where: { TagTypeId: { _eq: $Id } }) {
    TagTypeId
    Name
    Description
    ModifiedAtTimestamp
    TagTypeGroupId
    tag_type_group {
      Id
      Name
    }
  }
}`);o(`query getTagTypesByName($Name: String!) {
  tag_type(where: { Name: { _eq: $Name } }) {
    Name
    TagTypeId
  }
}`);o(`query getTagTypeGroups {
  tag_type_group(order_by: { Name: asc }) {
    Id
    Name
  }
}`);o(`query getTags {
  tag_type(order_by: { Name: asc }) {
    TagTypeId
    Name
    Description
    CreatedAtTimestamp
    ModifiedAtTimestamp
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    tag_type_group {
      Id
      Name
    }
  }
}`);o(`mutation InsertTagTypeGroupByName($Name: String) {
  insert_tag_type_group_one(
    object: { Name: $Name }
    on_conflict: {
      constraint: TagTypeGroup_pkey
      update_columns: Name
      where: { Name: { _eq: $Name } }
    }
  ) {
    Id
  }
}`);o(`mutation insertTagTypeWithGroupName(
  $Name: String!
  $Description: String
  $TagGroupName: String
) {
  insert_tag_type_one(
    object: {
      Name: $Name
      Description: $Description
      tag_type_group: {
        data: { Name: $TagGroupName }
        on_conflict: { constraint: TagTypeGroup_pkey, update_columns: Name }
      }
    }
  ) {
    TagTypeId
  }
}`);o(`mutation insertTagTypeWithOptionalGroupId(
  $Name: String!
  $Description: String
  $TagTypeGroupId: uuid
) {
  insert_tag_type_one(
    object: {
      Name: $Name
      Description: $Description
      TagTypeGroupId: $TagTypeGroupId
    }
  ) {
    TagTypeId
  }
}`);o(`fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}`);o(`mutation UpdateTagType(
  $TagTypeId: uuid!
  $Name: String
  $Description: String
  $TagTypeGroupId: uuid
  $OriginalTimestamp: timestamptz
) {
  update_tag_type(
    where: {
      TagTypeId: { _eq: $TagTypeId }
      _and: { ModifiedAtTimestamp: { _eq: $OriginalTimestamp } }
    }
    _set: {
      Name: $Name
      Description: $Description
      TagTypeGroupId: $TagTypeGroupId
    }
  ) {
    affected_rows
  }
}`);o(`mutation deleteTaxonomyOrg($TaxonomyId: uuid!, $OrgKey: String!) {
  delete_taxonomy_org(
    where: { TaxonomyId: { _eq: $TaxonomyId }, OrgKey: { _eq: $OrgKey } }
  ) {
    affected_rows
  }

  delete_taxonomy(
    where: {
      Id: { _eq: $TaxonomyId }
      organisations_aggregate: { count: { predicate: { _eq: 0 } } }
    }
  ) {
    affected_rows
  }
}`);o(`query getTaxonomyByLocaleAndOrg($Locale: String!, $OrgKey: String!) {
  taxonomy_org(where: { Locale: { _eq: $Locale }, OrgKey: { _eq: $OrgKey } }) {
    Id
    Locale
    OrgName
    TaxonomyId
    taxonomy {
      Common
      Description
      ModifiedAtTimestamp
      Id
      Library
      Rating
      Taxonomy
      InternalAuditRating
      organisations_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}`);o(`mutation InsertTaxonomy {
  insert_taxonomy_one(
    object: {
      Description: "Description"
      Common: {}
      Library: {}
      Taxonomy: {}
      Rating: {}
      InternalAuditRating: {}
      organisations: { data: { Locale: "en", OrgName: "" } }
    }
  ) {
    Id
  }
}`);o(`mutation updateTaxonomy(
  $Id: uuid!
  $Common: jsonb!
  $Library: jsonb!
  $Rating: jsonb!
  $Taxonomy: jsonb!
  $InternalAuditRating: jsonb!
  $OriginalTimestamp: timestamptz
) {
  update_taxonomy(
    where: {
      Id: { _eq: $Id }
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
    }
    _set: {
      Common: $Common
      Library: $Library
      Rating: $Rating
      Taxonomy: $Taxonomy
      InternalAuditRating: $InternalAuditRating
    }
  ) {
    affected_rows
  }
}`);o(`query getTaxonomyAudit($Locale: String!, $OrgKey: String!) {
  taxonomy_audit(
    where: {
      organisations: { Locale: { _eq: $Locale }, OrgKey: { _eq: $OrgKey } }
    }
    order_by: { ModifiedAtTimestamp: desc }
  ) {
    Description
    Id
    Common
    Library
    Rating
    Taxonomy
    InternalAuditRating
    ModifiedAtTimestamp
    organisations_aggregate {
      aggregate {
        count
      }
    }
  }
}`);o(`mutation deleteTestResults($Ids: [uuid!]) {
  delete_relation_file(where: { ParentId: { _in: $Ids } }) {
    affected_rows
  }

  delete_test_result(where: { Id: { _in: $Ids } }) {
    affected_rows
  }
}`);o(`query getLatestTestResultsByControlId($controlId: uuid) {
  test_result(
    where: {
      ParentControlId: { _eq: $controlId }
      RatingType: { _in: ["assessment", "rating"] }
    }
    order_by: [{ TestDate: desc_nulls_last }, { CreatedAtTimestamp: desc }]
    limit: 1
  ) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    assessmentParents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getTestResultAuditById($Id: uuid) {
  test_result_audit(where: { Id: { _eq: $Id } }) {
    Description
    DesignEffectiveness
    Id
    OverallEffectiveness
    ParentControlId
    PerformanceEffectiveness
    Submitter
    TestDate
    TestType
    CreatedAtTimestamp
    ModifiedAtTimestamp
    Title
    CreatedByUser
    ModifiedByUser
    CustomAttributeData
    SequentialId
  }
}`);o(`query getTestResultById($Id: uuid) {
  test_result(where: { Id: { _eq: $Id } }) {
    ...TestResultParts
    files {
      ...RelationFileParts
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getTestResults(
  $where: test_result_bool_exp! = {
    RatingType: { _in: ["assessment", "rating"] }
  }
) {
  test_result(where: $where) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    parent {
      Id
      Title
      SequentialId
      tags {
        ...TagParts
      }
      departments {
        ...DepartmentParts
      }
      schedule {
        ManualDueDate
      }
    }
    createdByUser {
      FriendlyName
    }
    files_aggregate {
      aggregate {
        count
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getTestResultsByControlId($controlId: uuid) {
  test_result(
    where: {
      ParentControlId: { _eq: $controlId }
      RatingType: { _in: ["assessment", "rating"] }
    }
  ) {
    ...TestResultParts
    submitter {
      FriendlyName
    }
    files {
      ...RelationFileParts
    }
    assessmentParents(where: { ParentType: { _eq: assessment } }) {
      assessment {
        ...AssessmentParts
        completedByUser {
          FriendlyName
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}

fragment AssessmentParts on assessment {
  ActualCompletionDate
  CompletedByUser
  CreatedAtTimestamp
  CreatedByUser
  CustomAttributeData
  Id
  ModifiedAtTimestamp
  ModifiedByUser
  NextTestDate
  OriginatingItemId
  SequentialId
  StartDate
  Summary
  TargetCompletionDate
  Title
  Status
  Outcome
}`);o(`query getWidgetTestResults(
  $where: test_result_bool_exp!
  $controlWhere: control_bool_exp
) {
  control(where: $controlWhere) {
    testResults(where: $where) {
      ...TestResultParts
      submitter {
        FriendlyName
      }
      parent {
        Id
        Title
        tags {
          ...TagParts
        }
        departments {
          ...DepartmentParts
        }
        schedule {
          ManualDueDate
        }
      }
      createdByUser {
        FriendlyName
      }
      files_aggregate {
        aggregate {
          count
        }
      }
    }
  }
}

fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`mutation insertControlTestResult(
  $Description: String
  $DesignEffectiveness: Int
  $OverallEffectiveness: Int
  $ControlIds: [uuid!]!
  $PerformanceEffectiveness: Int
  $AssessmentId: uuid
  $Submitter: String
  $TestDate: timestamptz
  $TestType: String
  $Title: String
  $CustomAttributeData: jsonb
) {
  insertControlTestResult(
    Description: $Description
    DesignEffectiveness: $DesignEffectiveness
    OverallEffectiveness: $OverallEffectiveness
    ControlIds: $ControlIds
    PerformanceEffectiveness: $PerformanceEffectiveness
    Submitter: $Submitter
    TestDate: $TestDate
    TestType: $TestType
    Title: $Title
    AssessmentId: $AssessmentId
    CustomAttributeData: $CustomAttributeData
  ) {
    Ids
  }
}`);o(`fragment TestResultParts on test_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`);o(`fragment ControlTestInternalAuditResultParts on control_test_internal_audit_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`);o(`fragment ControlTestSecondLineResultParts on control_test_second_line_result {
  Description
  DesignEffectiveness
  Id
  OverallEffectiveness
  ParentControlId
  PerformanceEffectiveness
  Submitter
  TestDate
  TestType
  CreatedAtTimestamp
  ModifiedAtTimestamp
  Title
  CreatedByUser
  ModifiedByUser
  CustomAttributeData
  SequentialId
}`);o(`mutation updateTestResult($object: UpdateTestResultInput) {
  updateTestResultApi(object: $object) {
    Id
  }
}`);o(`subscription tppGetResponseById($Id: uuid!) {
  third_party_response_by_pk(Id: $Id) {
    ...TppThirdPartyResponseParts

    questionnaireTemplateVersion {
      Id
      Version
      Schema
      UISchema

      parent {
        Id
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`);o(`subscription tppGetResponses {
  third_party_response {
    ...TppThirdPartyResponseParts

    questionnaireTemplateVersion {
      Id
      Version

      parent {
        Id
        Title
      }
    }
  }
}

fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`);o(`fragment TppThirdPartyResponseParts on third_party_response {
  Id
  Status
  ResponseData
  ParentId
  StartDate
  ExpiresAt
  QuestionnaireTemplateVersionId
  ModifiedByUser
  ModifiedAtTimestamp
  CreatedByUser
  CreatedAtTimestamp
}`);o(`mutation tppUpdateThirdPartyResponse($Id: uuid!, $response: jsonb!, $status: third_party_response_status_enum!) {
  update_third_party_response_by_pk(pk_columns: { Id: $Id }, _set: { ResponseData: $response, Status: $status }) {
    Id
  }
}`);o(`mutation createThirdParty($object: InsertThirdPartyInput!) {
  insertThirdPartyApi(object: $object) {
    Id
  }
}`);o(`mutation deleteThirdParty($Id: uuid!) {
  delete_questionnaire_invite(where: { ThirdPartyId: { _eq: $Id } }) {
    affected_rows
  }
  delete_third_party_response(where: { ParentId: { _eq: $Id } }) {
    affected_rows
  }
  delete_third_party_by_pk(Id: $Id) {
    Id
  }
}`);o(`query getThirdParties($where: third_party_bool_exp! = {}) {
  third_party(where: $where) {
    ...ThirdPartyParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
  }
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}`);o(`query getThirdPartyById($Id: uuid!) {
  third_party: third_party_by_pk(Id: $Id) {
    ...ThirdPartyParts
    owners {
      ...OwnerParts
    }
    contributors {
      ...ContributorParts
    }
    ownerGroups {
      ...OwnerGroupParts
    }
    contributorGroups {
      ...ContributorGroupParts
    }
    ancestorContributors {
      ...AncestorContributorParts
    }
    tags {
      ...TagParts
    }
    departments {
      ...DepartmentParts
    }
    files {
      ...RelationFileParts
    }
  }
}

fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}

fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}

fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}

fragment TagParts on tag {
  type {
    Description
    Name
  }
  ParentId
  TagTypeId
}

fragment DepartmentParts on department {
  type {
    Description
    Name
  }
  ParentId
  DepartmentTypeId
}

fragment RelationFileParts on relation_file {
  ParentId
  ChangeRequestFileOperation
  file {
    ...FileParts
  }
}

fragment FileParts on file {
  ContentType
  FileName
  FileSize
  Id
  CreatedAtTimestamp
  CreatedByUser
  ModifiedAtTimestamp
  ModifiedByUser
}`);o(`query getThirdPartyResponseById($Id: uuid!) {
  third_party_response_by_pk(Id: $Id) {
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt

    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }

    thirdParty {
      Id
      Title
      ancestorContributors {
        ...AncestorContributorParts
      }
    }

    questionnaireTemplateVersion {
      Id
      Version
      Status
      Schema
      UISchema
      parent {
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`subscription getThirdPartyResponseSubscriptionById($Id: uuid!) {
  third_party_response_by_pk(Id: $Id) {
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt

    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }

    thirdParty {
      Id
      Title
      ancestorContributors {
        ...AncestorContributorParts
      }
    }

    questionnaireTemplateVersion {
      Id
      Version
      Status
      Schema
      UISchema
      parent {
        Title
      }
    }

    files {
      file {
        ContentType
        FileName
        FileSize
        Id
        CreatedAtTimestamp
        CreatedByUser
        ModifiedAtTimestamp
        ModifiedByUser
        Meta
      }
    }
  }
}

fragment AncestorContributorParts on ancestor_contributor {
  ContributorType
  UserId
  Id
  AncestorId
  UserGroupId
  user {
    FriendlyName
  }
  user_group {
    Name
  }
}`);o(`subscription getThirdPartyResponses {
  third_party_response {
    Id
    ResponseData
    Status
    CreatedByUser
    ModifiedByUser
    CreatedAtTimestamp
    ModifiedAtTimestamp
    QuestionnaireTemplateVersionId
    ParentId
    StartDate
    ExpiresAt
    invitees {
      UserId
      UserEmail
      user {
        Email
      }
    }
    thirdParty {
      Id
      Title
    }
    questionnaireTemplateVersion {
      Id
      Version
      Status
      parent {
        Title
      }
    }
  }
}`);o(`subscription getThirdPartyResponsesByThirdParty($ThirdPartyId: uuid!) {
  third_party_response(where: { ParentId: { _eq: $ThirdPartyId } }) {
    ...ThirdPartyResponseParts
    invitees {
      UserEmail
      UserId
      user {
        FriendlyName
      }
    }
    createdByUser {
      FriendlyName
    }
    modifiedByUser {
      FriendlyName
    }
    questionnaireTemplateVersion {
      Id
      Version
      parent {
        Title
      }
    }
  }
}

fragment ThirdPartyResponseParts on third_party_response {
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  ParentId
  QuestionnaireTemplateVersionId
  Status
  ResponseData
  StartDate
  ExpiresAt
}`);o(`fragment ThirdPartyParts on third_party {
  Id
  SequentialId
  Title
  Description
  CompanyName
  CompaniesHouseNumber
  Address
  CityTown
  Postcode
  Country
  PrimaryContactName
  ContactName
  ContactEmail
  CompanyDomain
  Type
  Status
  Criticality
  CreatedByUser
  CustomAttributeData
  ModifiedByUser
  CreatedAtTimestamp
  ModifiedAtTimestamp
}`);o(`fragment ThirdPartyResponseParts on third_party_response {
  Id
  CreatedAtTimestamp
  ModifiedAtTimestamp
  ParentId
  QuestionnaireTemplateVersionId
  Status
  ResponseData
  StartDate
  ExpiresAt
}`);o(`mutation updateThirdParty($object: UpdateThirdPartyInput!) {
  updateThirdPartyApi(object: $object) {
    Id
  }
}`);o(`mutation updateThirdPartyResponse(
  $Id: uuid!
  $Status: third_party_response_status_enum!
) {
  update_third_party_response_by_pk(pk_columns: { Id: $Id }, _set: { Status: $Status }) {
    Id
  }
}`);o(`mutation updateThirdPartyResponseStatus(
  $Action: third_party_response_enum_action!
  $ResponseIds: [uuid!]!
  $Reason: String
  $RequestType: String
  $ShareWithRespondents: Boolean
  $ThirdPartyId: uuid!
) {
  updateThirdPartyResponseStatusAction(
    Action: $Action
    ResponseIds: $ResponseIds
    Reason: $Reason
    RequestType: $RequestType
    ShareWithRespondents: $ShareWithRespondents
    ThirdPartyId: $ThirdPartyId
  ) {
    affected_rows
  }
}`);o(`query getThirdPartyContactsByThirdPartyId($ThirdPartyId: uuid!) {
  third_party_contact(
    where: { ThirdPartyId: { _eq: $ThirdPartyId } }
    order_by: { CreatedAtTimestamp: desc }
  ) {
    Id
    ThirdPartyId
    Email
    Name
    JobTitle
    IsRevoked
    PasswordSetAtTimestamp
    user {
      LastSeen
    }
  }
}`);o(`query getActiveThirdPartyContacts($ThirdPartyId: uuid!) {
  third_party_contact(
    where: { ThirdPartyId: { _eq: $ThirdPartyId }, IsRevoked: { _eq: false } }
    order_by: { Name: asc_nulls_last, Email: asc }
  ) {
    Id
    Email
    Name
    JobTitle
  }
}`);o(`mutation insertThirdPartyContactApi(
  $ThirdPartyId: uuid!
  $Email: String!
  $Name: String
  $JobTitle: String
) {
  insertThirdPartyContactApi(
    ThirdPartyId: $ThirdPartyId
    Email: $Email
    Name: $Name
    JobTitle: $JobTitle
  ) {
    Id
  }
}`);o(`mutation RevokeThirdPartyContactAccess($ContactIds: [uuid!]!) {
  revokeThirdPartyContactAccess(ContactIds: $ContactIds) {
    results {
      Id
      IsRevoked
      Message
    }
  }
}`);o(`fragment ContributorGroupParts on contributor_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`mutation DeleteUserGroupUsers(
  $UserIds: [String!] = ""
  $UserGroupId: uuid = ""
) {
  delete_user_group_user(
    where: { UserId: { _in: $UserIds }, UserGroupId: { _eq: $UserGroupId } }
  ) {
    affected_rows
  }
}`);o(`mutation deleteUserGroups($UserGroupIds: [uuid!]!) {
  deleteUserGroups(Ids: $UserGroupIds){
    affected_rows
  }
}`);o(`query GetUserGroupById($Id: uuid!) {
  user_group(where: { Id: { _eq: $Id } }) {
    Id
    Name
    Description
    Email
    OwnerContributor
    ModifiedAtTimestamp
    approvers_aggregate {
      aggregate {
        count
      }
    }
  }
}`);o(`query getUserGroups {
  user_group(order_by: { Name: asc }) {
    Id
    Name
    Email
    Description
    OwnerContributor
    createdByUser {
      FriendlyName
    }
    CreatedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    ModifiedAtTimestamp
    users_aggregate {
      aggregate {
        count
      }
    }
  }
}`);o(`query getUserGroupsWithApprovers {
  user_group(order_by: { Name: asc }) {
    Id
    Name
    Email
    Description
    OwnerContributor
    createdByUser {
      FriendlyName
    }
    CreatedAtTimestamp
    modifiedByUser {
      FriendlyName
    }
    ModifiedAtTimestamp
    users_aggregate {
      aggregate {
        count
      }
    }
    approvers_aggregate {
      aggregate {
        count
      }
    }
  }
}`);o(`query GetUsersByGroupId($GroupId: uuid!) {
  user_group(where: { Id: { _eq: $GroupId } }) {
    users(order_by: { CreatedAtTimestamp: desc }) {
      authUsers {
        Id
        FirstName
        LastName
        Email
        RoleKey
        Status
        FriendlyName
        organisationusers {
          Status
        }
      }
      CreatedAtTimestamp
      createdByUser {
        FriendlyName
      }
    }
  }
}`);o(`mutation InsertUserGroup(
  $Name: String!
  $Email: String
  $Description: String
  $OwnerContributor: Boolean
) {
  insert_user_group_one(
    object: {
      Name: $Name
      Email: $Email
      Description: $Description
      OwnerContributor: $OwnerContributor
    }
  ) {
    Id
  }
}`);o(`mutation InsertUserGroupUsers($objects: [user_group_user_insert_input!]!) {
  insert_user_group_user(
    objects: $objects
    on_conflict: { constraint: user_group_user_pkey, update_columns: [] }
  ) {
    affected_rows
  }
}`);o(`fragment OwnerGroupParts on owner_group {
  UserGroupId
  group {
    Name
    users {
      UserId
    }
  }
}`);o(`mutation UpdateUserGroup(
  $Id: uuid!
  $OriginalTimestamp: timestamptz!
  $Name: String
  $Email: String
  $Description: String
  $OwnerContributor: Boolean
) {
  update_user_group(
    where: {
      Id: { _eq: $Id }
      ModifiedAtTimestamp: { _eq: $OriginalTimestamp }
    }
    _set: {
      Name: $Name
      Email: $Email
      Description: $Description
      OwnerContributor: $OwnerContributor
    }
  ) {
    affected_rows
  }
}`);o(`query getUserSearchPreferences {
  user_search_preferences {
    RecentUserIds
    ShowGroups
    FilterByActivePlatformUsers
    ShowUserPlatformRole
    ShowUserJobTitle
    ShowDirectoryDepartment
    ShowUserLocation
    ShowUserEmail
    ShowArchivedUsers
    ShowInheritedContributors
  }
}`);o(`query getUserSearchPreferencesAuditById($Id: String!) {
  user_search_preferences_audit(where: {
    CreatedByUser: {
      _eq: $Id
    }
  }) {
    RecentUserIds
    ShowGroups
    FilterByActivePlatformUsers
    ShowUserPlatformRole
    ShowUserJobTitle
    ShowDirectoryDepartment
    ShowUserLocation
    ShowUserEmail
    ShowArchivedUsers
    CreatedByUser
    CreatedAtTimestamp
    ModifiedByUser
    ModifiedAtTimestamp
  }
}`);o(`mutation upsertRecentUsers($RecentUserIds: [String!]!) {
  insert_user_search_preferences(
    objects: [{ RecentUserIds: $RecentUserIds }]
    on_conflict: {
      constraint: recent_users_pkey
      update_columns: [RecentUserIds]
    }
  ) {
    affected_rows
  }
}`);o(`mutation upsertUserSearchPreferences(
  $ShowGroups: Boolean!
  $FilterByActivePlatformUsers: Boolean!
  $ShowUserPlatformRole: Boolean!
  $ShowUserJobTitle: Boolean!
  $ShowDirectoryDepartment: Boolean!
  $ShowUserLocation: Boolean!
  $ShowUserEmail: Boolean!
  $ShowArchivedUsers: Boolean!
  $ShowInheritedContributors: Boolean!
) {
  insert_user_search_preferences(
    objects: [
      {
        ShowGroups: $ShowGroups
        FilterByActivePlatformUsers: $FilterByActivePlatformUsers
        ShowUserPlatformRole: $ShowUserPlatformRole
        ShowUserJobTitle: $ShowUserJobTitle
        ShowDirectoryDepartment: $ShowDirectoryDepartment
        ShowUserLocation: $ShowUserLocation
        ShowUserEmail: $ShowUserEmail
        ShowArchivedUsers: $ShowArchivedUsers
        ShowInheritedContributors: $ShowInheritedContributors
      }
    ]
    on_conflict: {
      constraint: recent_users_pkey
      update_columns: [
        ShowGroups
        FilterByActivePlatformUsers
        ShowUserPlatformRole
        ShowUserJobTitle
        ShowDirectoryDepartment
        ShowUserLocation
        ShowUserEmail
        ShowArchivedUsers
        ShowInheritedContributors
      ]
    }
  ) {
    affected_rows
  }
}`);o(`query getUserTablePreferences($TableId: String!) {
  user_table_preferences(where: { TableId: { _eq: $TableId } }) {
    Preferences
  }
}`);o(`mutation upsertUserTablePreferences($Preferences: jsonb!, $TableId: String!) {
  insert_user_table_preferences(
    objects: [{ TableId: $TableId, Preferences: $Preferences }]
    on_conflict: {
      constraint: user_table_preferences_pkey
      update_columns: [Preferences]
    }
  ) {
    affected_rows
  }
}`);o(`fragment ContributorParts on contributor {
  UserId
  user {
    FriendlyName
    Id
  }
}`);o(`query GetAuthUserById($Id: String!) {
  auth_user_by_pk(Id: $Id) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    Status
    CreatedOn
    DisplayName
    JobTitle
    Department
    OfficeLocation
    RoleKey
    organisationusers {
      RoleKey
      LastSeen
      External_Id
    }
  }
}`);o(`query GetAuthUserByIdWithRoles($Id: String!) {
  auth_user_by_pk(Id: $Id) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    Status
    CreatedOn
    DisplayName
    JobTitle
    Department
    OfficeLocation
    RoleKey
    organisationusers {
      RoleKey
      LastSeen
      External_Id
    }
    customRoles {
      role {
        RoleName
        Id
        Description
      }
    }
  }
}`);o(`query GetAuthUsers(
  $limit: Int
  $offset: Int
  $orderBy: [auth_user_order_by!]
  $where: auth_user_bool_exp
) {
  auth_user(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
    Id
    FirstName
    LastName
    FriendlyName
    Email
    RoleKey
    Status
    CreatedOn
    LastSeen
    DisplayName
    JobTitle
    Department
    OfficeLocation
    CreatedByUser
    ModifiedByUser
    ModifiedAtTimestamp
    organisationusers {
      RoleKey
      LastSeen
      Status
    }
    userGroupUsers {
      userGroups {
        Id
        Name
      }
    }
    customRoles {
      role {
        RoleName
        Id
        Description
      }
    }
    IsCustomerSupport
  }
  auth_user_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}`);o(`fragment OwnerParts on owner {
  UserId
  user {
    FriendlyName
    Id
  }
}`);o(`mutation UpdateUserRoles($userId: String!, $roleIds: [String!]!) {
  update_user_roles(userId: $userId, roleIds: $roleIds) {
    roles {
      id
      name
      description
    }
  }
}`);o(`mutation deleteWizard($RiskId: uuid!) {
  deleteWizardById(RiskId: $RiskId) {
    affected_rows
  }
}`);o(`query getWizardById($RiskId: uuid!) {
  wizard(where: { RiskId: { _eq: $RiskId } }) {
    RiskId
    CurrentStep
    AssessmentId
    ActivityId
    Status
  }
}`);o(`query getWizards {
  wizard {
    RiskId
  }
}`);o(`mutation insertWizard($object: InsertWizardInput) {
  insertChildWizard(object: $object) {
    RiskId
  }
}`);o(`mutation updateWizard($object: UpdateWizardInput) {
  updateWizardById(object: $object) {
    affected_rows
  }
}`);new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:(t,e)=>typeof e=="string"?e.toLowerCase():void 0});new Proxy({},{get:()=>new Proxy({},{get:(t,e)=>String(e)})});var Sr,xa;function hu(){if(xa)return Sr;xa=1;var t=typeof Element<"u",e=typeof Map=="function",r=typeof Set=="function",i=typeof ArrayBuffer=="function"&&!!ArrayBuffer.isView;function a(s,n){if(s===n)return!0;if(s&&n&&typeof s=="object"&&typeof n=="object"){if(s.constructor!==n.constructor)return!1;var l,d,u;if(Array.isArray(s)){if(l=s.length,l!=n.length)return!1;for(d=l;d--!==0;)if(!a(s[d],n[d]))return!1;return!0}var c;if(e&&s instanceof Map&&n instanceof Map){if(s.size!==n.size)return!1;for(c=s.entries();!(d=c.next()).done;)if(!n.has(d.value[0]))return!1;for(c=s.entries();!(d=c.next()).done;)if(!a(d.value[1],n.get(d.value[0])))return!1;return!0}if(r&&s instanceof Set&&n instanceof Set){if(s.size!==n.size)return!1;for(c=s.entries();!(d=c.next()).done;)if(!n.has(d.value[0]))return!1;return!0}if(i&&ArrayBuffer.isView(s)&&ArrayBuffer.isView(n)){if(l=s.length,l!=n.length)return!1;for(d=l;d--!==0;)if(s[d]!==n[d])return!1;return!0}if(s.constructor===RegExp)return s.source===n.source&&s.flags===n.flags;if(s.valueOf!==Object.prototype.valueOf&&typeof s.valueOf=="function"&&typeof n.valueOf=="function")return s.valueOf()===n.valueOf();if(s.toString!==Object.prototype.toString&&typeof s.toString=="function"&&typeof n.toString=="function")return s.toString()===n.toString();if(u=Object.keys(s),l=u.length,l!==Object.keys(n).length)return!1;for(d=l;d--!==0;)if(!Object.prototype.hasOwnProperty.call(n,u[d]))return!1;if(t&&s instanceof Element)return!1;for(d=l;d--!==0;)if(!((u[d]==="_owner"||u[d]==="__v"||u[d]==="__o")&&s.$$typeof)&&!a(s[u[d]],n[u[d]]))return!1;return!0}return s!==s&&n!==n}return Sr=function(n,l){try{return a(n,l)}catch(d){if((d.message||"").match(/stack|recursion/i))return console.warn("react-fast-compare cannot handle circular refs"),!1;throw d}},Sr}var gu=hu();const Iu=Kt(gu);var kr,La;function bu(){if(La)return kr;La=1;var t=function(e,r,i,a,s,n,l,d){if(r===void 0)throw new Error("invariant requires an error message argument");if(!e){var u;if(r===void 0)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var c=[i,a,s,n,l,d],m=0;u=new Error(r.replace(/%s/g,function(){return c[m++]})),u.name="Invariant Violation"}throw u.framesToPop=1,u}};return kr=t,kr}var Tu=bu();const Ga=Kt(Tu);var Ur,ja;function Au(){return ja||(ja=1,Ur=function(e,r,i,a){var s=i?i.call(a,e,r):void 0;if(s!==void 0)return!!s;if(e===r)return!0;if(typeof e!="object"||!e||typeof r!="object"||!r)return!1;var n=Object.keys(e),l=Object.keys(r);if(n.length!==l.length)return!1;for(var d=Object.prototype.hasOwnProperty.bind(r),u=0;u<n.length;u++){var c=n[u];if(!d(c))return!1;var m=e[c],p=r[c];if(s=i?i.call(a,m,p,c):void 0,s===!1||s===void 0&&m!==p)return!1}return!0}),Ur}var Cu=Au();const vu=Kt(Cu);var fn=(t=>(t.BASE="base",t.BODY="body",t.HEAD="head",t.HTML="html",t.LINK="link",t.META="meta",t.NOSCRIPT="noscript",t.SCRIPT="script",t.STYLE="style",t.TITLE="title",t.FRAGMENT="Symbol(react.fragment)",t))(fn||{}),Or={link:{rel:["amphtml","canonical","alternate"]},script:{type:["application/ld+json"]},meta:{charset:"",name:["generator","robots","description"],property:["og:type","og:title","og:url","og:image","og:image:alt","og:description","twitter:url","twitter:title","twitter:description","twitter:image","twitter:image:alt","twitter:card","twitter:site"]}},Va=Object.values(fn),lr={accesskey:"accessKey",charset:"charSet",class:"className",contenteditable:"contentEditable",contextmenu:"contextMenu","http-equiv":"httpEquiv",itemprop:"itemProp",tabindex:"tabIndex"},yn=Object.entries(lr).reduce((t,[e,r])=>(t[r]=e,t),{}),te="data-rh",He={DEFAULT_TITLE:"defaultTitle",DEFER:"defer",ENCODE_SPECIAL_CHARACTERS:"encodeSpecialCharacters",ON_CHANGE_CLIENT_STATE:"onChangeClientState",TITLE_TEMPLATE:"titleTemplate",PRIORITIZE_SEO_TAGS:"prioritizeSeoTags"},Ye=(t,e)=>{for(let r=t.length-1;r>=0;r-=1){const i=t[r];if(Object.prototype.hasOwnProperty.call(i,e))return i[e]}return null},$u=t=>{let e=Ye(t,"title");const r=Ye(t,He.TITLE_TEMPLATE);if(Array.isArray(e)&&(e=e.join("")),r&&e)return r.replace(/%s/g,()=>e);const i=Ye(t,He.DEFAULT_TITLE);return e||i||void 0},Du=t=>Ye(t,He.ON_CHANGE_CLIENT_STATE)||(()=>{}),Br=(t,e)=>e.filter(r=>typeof r[t]<"u").map(r=>r[t]).reduce((r,i)=>({...r,...i}),{}),Pu=(t,e)=>e.filter(r=>typeof r.base<"u").map(r=>r.base).reverse().reduce((r,i)=>{if(!r.length){const a=Object.keys(i);for(let s=0;s<a.length;s+=1){const l=a[s].toLowerCase();if(t.indexOf(l)!==-1&&i[l])return r.concat(i)}}return r},[]),wu=t=>console&&typeof console.warn=="function"&&console.warn(t),lt=(t,e,r)=>{const i={};return r.filter(a=>Array.isArray(a[t])?!0:(typeof a[t]<"u"&&wu(`Helmet: ${t} should be of type "Array". Instead found type "${typeof a[t]}"`),!1)).map(a=>a[t]).reverse().reduce((a,s)=>{const n={};s.filter(d=>{let u;const c=Object.keys(d);for(let p=0;p<c.length;p+=1){const _=c[p],f=_.toLowerCase();e.indexOf(f)!==-1&&!(u==="rel"&&d[u].toLowerCase()==="canonical")&&!(f==="rel"&&d[f].toLowerCase()==="stylesheet")&&(u=f),e.indexOf(_)!==-1&&(_==="innerHTML"||_==="cssText"||_==="itemprop")&&(u=_)}if(!u||!d[u])return!1;const m=d[u].toLowerCase();return i[u]||(i[u]={}),n[u]||(n[u]={}),i[u][m]?!1:(n[u][m]=!0,!0)}).reverse().forEach(d=>a.push(d));const l=Object.keys(n);for(let d=0;d<l.length;d+=1){const u=l[d],c={...i[u],...n[u]};i[u]=c}return a},[]).reverse()},Ru=(t,e)=>{if(Array.isArray(t)&&t.length){for(let r=0;r<t.length;r+=1)if(t[r][e])return!0}return!1},Su=t=>({baseTag:Pu(["href"],t),bodyAttributes:Br("bodyAttributes",t),defer:Ye(t,He.DEFER),encode:Ye(t,He.ENCODE_SPECIAL_CHARACTERS),htmlAttributes:Br("htmlAttributes",t),linkTags:lt("link",["rel","href"],t),metaTags:lt("meta",["name","charset","http-equiv","property","itemprop"],t),noscriptTags:lt("noscript",["innerHTML"],t),onChangeClientState:Du(t),scriptTags:lt("script",["src","innerHTML"],t),styleTags:lt("style",["cssText"],t),title:$u(t),titleAttributes:Br("titleAttributes",t),prioritizeSeoTags:Ru(t,He.PRIORITIZE_SEO_TAGS)}),hn=t=>Array.isArray(t)?t.join(""):t,ku=(t,e)=>{const r=Object.keys(t);for(let i=0;i<r.length;i+=1)if(e[r[i]]&&e[r[i]].includes(t[r[i]]))return!0;return!1},qr=(t,e)=>Array.isArray(t)?t.reduce((r,i)=>(ku(i,e)?r.priority.push(i):r.default.push(i),r),{priority:[],default:[]}):{default:t,priority:[]},Wa=(t,e)=>({...t,[e]:void 0}),Uu=["noscript","script","style"],ni=(t,e=!0)=>e===!1?String(t):String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;"),gn=t=>Object.keys(t).reduce((e,r)=>{const i=typeof t[r]<"u"?`${r}="${t[r]}"`:`${r}`;return e?`${e} ${i}`:i},""),Ou=(t,e,r,i)=>{const a=gn(r),s=hn(e);return a?`<${t} ${te}="true" ${a}>${ni(s,i)}</${t}>`:`<${t} ${te}="true">${ni(s,i)}</${t}>`},Bu=(t,e,r=!0)=>e.reduce((i,a)=>{const s=a,n=Object.keys(s).filter(u=>!(u==="innerHTML"||u==="cssText")).reduce((u,c)=>{const m=typeof s[c]>"u"?c:`${c}="${ni(s[c],r)}"`;return u?`${u} ${m}`:m},""),l=s.innerHTML||s.cssText||"",d=Uu.indexOf(t)===-1;return`${i}<${t} ${te}="true" ${n}${d?"/>":`>${l}</${t}>`}`},""),In=(t,e={})=>Object.keys(t).reduce((r,i)=>{const a=lr[i];return r[a||i]=t[i],r},e),qu=(t,e,r)=>{const i={key:e,[te]:!0},a=In(r,i);return[x.createElement("title",a,e)]},Lt=(t,e)=>e.map((r,i)=>{const a={key:i,[te]:!0};return Object.keys(r).forEach(s=>{const l=lr[s]||s;if(l==="innerHTML"||l==="cssText"){const d=r.innerHTML||r.cssText;a.dangerouslySetInnerHTML={__html:d}}else a[l]=r[s]}),x.createElement(t,a)}),J=(t,e,r=!0)=>{switch(t){case"title":return{toComponent:()=>qu(t,e.title,e.titleAttributes),toString:()=>Ou(t,e.title,e.titleAttributes,r)};case"bodyAttributes":case"htmlAttributes":return{toComponent:()=>In(e),toString:()=>gn(e)};default:return{toComponent:()=>Lt(t,e),toString:()=>Bu(t,e,r)}}},Nu=({metaTags:t,linkTags:e,scriptTags:r,encode:i})=>{const a=qr(t,Or.meta),s=qr(e,Or.link),n=qr(r,Or.script);return{priorityMethods:{toComponent:()=>[...Lt("meta",a.priority),...Lt("link",s.priority),...Lt("script",n.priority)],toString:()=>`${J("meta",a.priority,i)} ${J("link",s.priority,i)} ${J("script",n.priority,i)}`},metaTags:a.default,linkTags:s.default,scriptTags:n.default}},Fu=t=>{const{baseTag:e,bodyAttributes:r,encode:i=!0,htmlAttributes:a,noscriptTags:s,styleTags:n,title:l="",titleAttributes:d,prioritizeSeoTags:u}=t;let{linkTags:c,metaTags:m,scriptTags:p}=t,_={toComponent:()=>[],toString:()=>""};return u&&({priorityMethods:_,linkTags:c,metaTags:m,scriptTags:p}=Nu(t)),{priority:_,base:J("base",e,i),bodyAttributes:J("bodyAttributes",r,i),htmlAttributes:J("htmlAttributes",a,i),link:J("link",c,i),meta:J("meta",m,i),noscript:J("noscript",s,i),script:J("script",p,i),style:J("style",n,i),title:J("title",{title:l,titleAttributes:d},i)}},oi=Fu,kt=[],Ni=!!(typeof window<"u"&&window.document&&window.document.createElement),li=class{instances=[];canUseDOM=Ni;context;value={setHelmet:t=>{this.context.helmet=t},helmetInstances:{get:()=>this.canUseDOM?kt:this.instances,add:t=>{(this.canUseDOM?kt:this.instances).push(t)},remove:t=>{const e=(this.canUseDOM?kt:this.instances).indexOf(t);(this.canUseDOM?kt:this.instances).splice(e,1)}}};constructor(t,e){this.context=t,this.canUseDOM=e||!1,e||(t.helmet=oi({baseTag:[],bodyAttributes:{},htmlAttributes:{},linkTags:[],metaTags:[],noscriptTags:[],scriptTags:[],styleTags:[],title:"",titleAttributes:{}}))}},Eu=parseInt(x.version.split(".")[0],10),di=Eu>=19,Mu={},bn=x.createContext(Mu),Tn=class An extends S.Component{static canUseDOM=Ni;helmetData;constructor(e){super(e),di?this.helmetData=null:this.helmetData=new li(this.props.context||{},An.canUseDOM)}render(){return di?x.createElement(x.Fragment,null,this.props.children):x.createElement(bn.Provider,{value:this.helmetData.value},this.props.children)}},Fe=(t,e)=>{const r=document.head||document.querySelector("head"),i=r.querySelectorAll(`${t}[${te}]`),a=[].slice.call(i),s=[];let n;return e&&e.length&&e.forEach(l=>{const d=document.createElement(t);for(const u in l)if(Object.prototype.hasOwnProperty.call(l,u))if(u==="innerHTML")d.innerHTML=l.innerHTML;else if(u==="cssText"){const c=l.cssText;d.appendChild(document.createTextNode(c))}else{const c=u,m=typeof l[c]>"u"?"":l[c];d.setAttribute(u,m)}d.setAttribute(te,"true"),a.some((u,c)=>(n=c,d.isEqualNode(u)))?a.splice(n,1):s.push(d)}),a.forEach(l=>l.parentNode?.removeChild(l)),s.forEach(l=>r.appendChild(l)),{oldTags:a,newTags:s}},ui=(t,e)=>{const r=document.getElementsByTagName(t)[0];if(!r)return;const i=r.getAttribute(te),a=i?i.split(","):[],s=[...a],n=Object.keys(e);for(const l of n){const d=e[l]||"";r.getAttribute(l)!==d&&r.setAttribute(l,d),a.indexOf(l)===-1&&a.push(l);const u=s.indexOf(l);u!==-1&&s.splice(u,1)}for(let l=s.length-1;l>=0;l-=1)r.removeAttribute(s[l]);a.length===s.length?r.removeAttribute(te):r.getAttribute(te)!==n.join(",")&&r.setAttribute(te,n.join(","))},zu=(t,e)=>{typeof t<"u"&&document.title!==t&&(document.title=hn(t)),ui("title",e)},Qa=(t,e)=>{const{baseTag:r,bodyAttributes:i,htmlAttributes:a,linkTags:s,metaTags:n,noscriptTags:l,onChangeClientState:d,scriptTags:u,styleTags:c,title:m,titleAttributes:p}=t;ui("body",i),ui("html",a),zu(m,p);const _={baseTag:Fe("base",r),linkTags:Fe("link",s),metaTags:Fe("meta",n),noscriptTags:Fe("noscript",l),scriptTags:Fe("script",u),styleTags:Fe("style",c)},f={},g={};Object.keys(_).forEach(I=>{const{newTags:h,oldTags:A}=_[I];h.length&&(f[I]=h),A.length&&(g[I]=_[I].oldTags)}),e&&e(),d(t,f,g)},dt=null,xu=t=>{dt&&cancelAnimationFrame(dt),t.defer?dt=requestAnimationFrame(()=>{Qa(t,()=>{dt=null})}):(Qa(t),dt=null)},Lu=xu,Ha=class extends S.Component{rendered=!1;shouldComponentUpdate(t){return!vu(t,this.props)}componentDidUpdate(){this.emitChange()}componentWillUnmount(){const{helmetInstances:t}=this.props.context;t.remove(this),this.emitChange()}emitChange(){const{helmetInstances:t,setHelmet:e}=this.props.context;let r=null;const i=Su(t.get().map(a=>{const{context:s,...n}=a.props;return n}));Tn.canUseDOM?Lu(i):oi&&(r=oi(i)),e(r)}init(){if(this.rendered)return;this.rendered=!0;const{helmetInstances:t}=this.props.context;t.add(this),this.emitChange()}render(){return this.init(),null}},Gt=[],Ya=t=>{const e={};for(const r of Object.keys(t))e[yn[r]||r]=t[r];return e},we=t=>{const e={};for(const r of Object.keys(t)){const i=lr[r];e[i||r]=t[r]}return e},Ka=(t,e)=>{if(!Ni)return;const r=document.getElementsByTagName(t)[0];if(!r)return;const i="data-rh-managed",a=r.getAttribute(i),s=a?a.split(","):[],n=Object.keys(e);for(const l of s)n.includes(l)||r.removeAttribute(l);for(const l of n){const d=e[l];d==null||d===!1?r.removeAttribute(l):d===!0?r.setAttribute(l,""):r.setAttribute(l,String(d))}n.length>0?r.setAttribute(i,n.join(",")):r.removeAttribute(i)},Nr=()=>{const t={},e={};for(const r of Gt){const{htmlAttributes:i,bodyAttributes:a}=r.props;i&&Object.assign(t,Ya(i)),a&&Object.assign(e,Ya(a))}Ka("html",t),Ka("body",e)},Gu=class extends S.Component{componentDidMount(){Gt.push(this),Nr()}componentDidUpdate(){Nr()}componentWillUnmount(){const t=Gt.indexOf(this);t!==-1&&Gt.splice(t,1),Nr()}resolveTitle(){const{title:t,titleTemplate:e,defaultTitle:r}=this.props;return t&&e?e.replace(/%s/g,()=>Array.isArray(t)?t.join(""):t):t||r||void 0}renderTitle(){const t=this.resolveTitle();if(t===void 0)return null;const e=this.props.titleAttributes||{};return x.createElement("title",we(e),t)}renderBase(){const{base:t}=this.props;return t?x.createElement("base",we(t)):null}renderMeta(){const{meta:t}=this.props;return!t||!Array.isArray(t)?null:t.map((e,r)=>x.createElement("meta",{key:r,...we(e)}))}renderLink(){const{link:t}=this.props;return!t||!Array.isArray(t)?null:t.map((e,r)=>x.createElement("link",{key:r,...we(e)}))}renderScript(){const{script:t}=this.props;return!t||!Array.isArray(t)?null:t.map((e,r)=>{const{innerHTML:i,...a}=e,s=we(a);return i&&(s.dangerouslySetInnerHTML={__html:i}),x.createElement("script",{key:r,...s})})}renderStyle(){const{style:t}=this.props;return!t||!Array.isArray(t)?null:t.map((e,r)=>{const{cssText:i,...a}=e,s=we(a);return i&&(s.dangerouslySetInnerHTML={__html:i}),x.createElement("style",{key:r,...s})})}renderNoscript(){const{noscript:t}=this.props;return!t||!Array.isArray(t)?null:t.map((e,r)=>{const{innerHTML:i,...a}=e,s=we(a);return i&&(s.dangerouslySetInnerHTML={__html:i}),x.createElement("noscript",{key:r,...s})})}render(){return x.createElement(x.Fragment,null,this.renderTitle(),this.renderBase(),this.renderMeta(),this.renderLink(),this.renderScript(),this.renderStyle(),this.renderNoscript())}},fy=class extends S.Component{static defaultProps={defer:!0,encodeSpecialCharacters:!0,prioritizeSeoTags:!1};shouldComponentUpdate(t){return!Iu(Wa(this.props,"helmetData"),Wa(t,"helmetData"))}mapNestedChildrenToProps(t,e){if(!e)return null;switch(t.type){case"script":case"noscript":return{innerHTML:e};case"style":return{cssText:e};default:throw new Error(`<${t.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`)}}flattenArrayTypeChildren(t,e,r,i){return{...e,[t.type]:[...e[t.type]||[],{...r,...this.mapNestedChildrenToProps(t,i)}]}}mapObjectTypeChildren(t,e,r,i){switch(t.type){case"title":return{...e,[t.type]:i,titleAttributes:{...r}};case"body":return{...e,bodyAttributes:{...r}};case"html":return{...e,htmlAttributes:{...r}};default:return{...e,[t.type]:{...r}}}}mapArrayTypeChildrenToProps(t,e){let r={...e};return Object.keys(t).forEach(i=>{r={...r,[i]:t[i]}}),r}warnOnInvalidChildren(t,e){return Ga(Va.some(r=>t.type===r),typeof t.type=="function"?"You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.":`Only elements types ${Va.join(", ")} are allowed. Helmet does not support rendering <${t.type}> elements. Refer to our API for more information.`),Ga(!e||typeof e=="string"||Array.isArray(e)&&!e.some(r=>typeof r!="string"),`Helmet expects a string as a child of <${t.type}>. Did you forget to wrap your children in braces? ( <${t.type}>{\`\`}</${t.type}> ) Refer to our API for more information.`),!0}mapChildrenToProps(t,e){let r={};return x.Children.forEach(t,i=>{if(!i||!i.props)return;const{children:a,...s}=i.props,n=Object.keys(s).reduce((d,u)=>(d[yn[u]||u]=s[u],d),{});let{type:l}=i;switch(typeof l=="symbol"?l=l.toString():this.warnOnInvalidChildren(i,a),l){case"Symbol(react.fragment)":e=this.mapChildrenToProps(a,e);break;case"link":case"meta":case"noscript":case"script":case"style":r=this.flattenArrayTypeChildren(i,r,n,a);break;default:e=this.mapObjectTypeChildren(i,e,n,a);break}}),this.mapArrayTypeChildrenToProps(r,e)}render(){const{children:t,...e}=this.props;let r={...e},{helmetData:i}=e;if(t&&(r=this.mapChildrenToProps(t,r)),i&&!(i instanceof li)){const a=i;i=new li(a.context,!0),delete r.helmetData}return di?x.createElement(Gu,{...r}):i?x.createElement(Ha,{...r,context:i.value}):x.createElement(bn.Consumer,null,a=>x.createElement(Ha,{...r,context:a}))}};function Ja(t,e){var r=t.query&&le(e?nr(t.query):t.query),i={query:r};return JSON.stringify(i)}var ju=(function(t){Z(e,t);function e(r,i,a){i===void 0&&(i=!0),a===void 0&&(a=Object.create(null));var s,n=t.call(this)||this;return n.addTypename=!0,n.showWarnings=!0,n.mockedResponsesByKey={},n.addTypename=i,n.showWarnings=(s=a.showWarnings)!==null&&s!==void 0?s:!0,r&&r.forEach(function(l){n.addMockedResponse(l)}),n}return e.prototype.addMockedResponse=function(r){var i=this.normalizeMockedResponse(r),a=Ja(i.request,this.addTypename),s=this.mockedResponsesByKey[a];s||(s=[],this.mockedResponsesByKey[a]=s),s.push(i)},e.prototype.request=function(r){var i=this,a;this.operation=r;var s=Ja(r,this.addTypename),n=[],l=r.variables||{},d=this.mockedResponsesByKey[s],u=d?d.findIndex(function(f,g){var I=f.request.variables||{};return q(l,I)||f.variableMatcher&&f.variableMatcher(r.variables)?!0:(n.push(I),!1)}):-1,c=u>=0?d[u]:void 0,m=c?.delay===1/0?0:(a=c?.delay)!==null&&a!==void 0?a:0,p;if(!c)p=new Error("No more mocked responses for the query: ".concat(le(r.query),`
Expected variables: `).concat(Za(r.variables),`
`).concat(n.length>0?`
Failed to match `.concat(n.length," mock").concat(n.length===1?"":"s",` for this query. The mocked response had the following variables:
`).concat(n.map(function(f){return"  ".concat(Za(f))}).join(`
`),`
`):"")),this.showWarnings&&console.warn(p.message+`
This typically indicates a configuration error in your mocks setup, usually due to a typo or mismatched variable.`);else{c.maxUsageCount&&c.maxUsageCount>1?c.maxUsageCount--:d.splice(u,1);var _=c.newData;_&&(c.result=_(r.variables),d.push(c)),!c.result&&!c.error&&c.delay!==1/0&&(p=new Error("Mocked response should contain either `result`, `error` or a `delay` of `Infinity`: ".concat(s)))}return new N(function(f){var g=setTimeout(function(){if(p)try{if(i.onError(p,f)!==!1)throw p}catch(I){f.error(I)}else c&&c.delay!==1/0&&(c.error?f.error(c.error):(c.result&&f.next(typeof c.result=="function"?c.result(r.variables):c.result),f.complete()))},m);return function(){clearTimeout(g)}})},e.prototype.normalizeMockedResponse=function(r){var i,a=Ri(r),s=Ci([{name:"connection"},{name:"nonreactive"},{name:"unmask"}],Be(a.request.query));w(s,75),a.request.query=s;var n=vi(a.request.query);return n&&(a.request.query=n),r.maxUsageCount=(i=r.maxUsageCount)!==null&&i!==void 0?i:1,w(r.maxUsageCount>0,76,r.maxUsageCount),this.normalizeVariableMatching(a),a},e.prototype.normalizeVariableMatching=function(r){var i=r.request;if(r.variableMatcher&&i.variables)throw new Error("Mocked response should contain either variableMatcher or request.variables");r.variableMatcher||(i.variables=y(y({},ir(Ce(i.query))),i.variables),r.variableMatcher=function(a){var s=a||{},n=i.variables||{};return q(s,n)})},e})(it);function Za(t,e){e===void 0&&(e=0);var r=ht("undefined"),i=ht("NaN");return JSON.stringify(t,function(a,s){return s===void 0?r:Number.isNaN(s)?i:s},e).replace(new RegExp(JSON.stringify(r),"g"),"<undefined>").replace(new RegExp(JSON.stringify(i),"g"),"NaN")}var Vu=(function(t){Z(e,t);function e(r){var i=t.call(this,r)||this,a=i.props,s=a.mocks,n=a.addTypename,l=a.defaultOptions,d=a.cache,u=a.resolvers,c=a.link,m=a.showWarnings,p=a.connectToDevTools,_=p===void 0?!1:p,f=new mn({cache:d||new cn({addTypename:n}),defaultOptions:l,connectToDevTools:_,link:c||new ju(s||[],n,{showWarnings:m}),resolvers:u});return i.state={client:f},i}return e.prototype.render=function(){var r=this.props,i=r.children,a=r.childProps,s=this.state.client;return S.isValidElement(i)?S.createElement(ou,{client:s},S.cloneElement(S.Children.only(i),y({},a))):null},e.prototype.componentWillUnmount=function(){this.state.client.stop()},e.defaultProps={addTypename:!0},e})(S.Component);let Wu={data:""},Qu=t=>{if(typeof window=="object"){let e=(t?t.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return e.nonce=window.__nonce__,e.parentNode||(t||document.head).appendChild(e),e.firstChild}return t||Wu},Hu=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Yu=/\/\*[^]*?\*\/|  +/g,Xa=/\n+/g,Ie=(t,e)=>{let r="",i="",a="";for(let s in t){let n=t[s];s[0]=="@"?s[1]=="i"?r=s+" "+n+";":i+=s[1]=="f"?Ie(n,s):s+"{"+Ie(n,s[1]=="k"?"":e)+"}":typeof n=="object"?i+=Ie(n,e?e.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,l):l?l+" "+d:d)):s):n!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=Ie.p?Ie.p(s,n):s+":"+n+";")}return r+(e&&a?e+"{"+a+"}":a)+i},oe={},Cn=t=>{if(typeof t=="object"){let e="";for(let r in t)e+=r+Cn(t[r]);return e}return t},Ku=(t,e,r,i,a)=>{let s=Cn(t),n=oe[s]||(oe[s]=(d=>{let u=0,c=11;for(;u<d.length;)c=101*c+d.charCodeAt(u++)>>>0;return"go"+c})(s));if(!oe[n]){let d=s!==t?t:(u=>{let c,m,p=[{}];for(;c=Hu.exec(u.replace(Yu,""));)c[4]?p.shift():c[3]?(m=c[3].replace(Xa," ").trim(),p.unshift(p[0][m]=p[0][m]||{})):p[0][c[1]]=c[2].replace(Xa," ").trim();return p[0]})(t);oe[n]=Ie(a?{["@keyframes "+n]:d}:d,r?"":"."+n)}let l=r&&oe.g?oe.g:null;return r&&(oe.g=oe[n]),((d,u,c,m)=>{m?u.data=u.data.replace(m,d):u.data.indexOf(d)===-1&&(u.data=c?d+u.data:u.data+d)})(oe[n],e,i,l),n},Ju=(t,e,r)=>t.reduce((i,a,s)=>{let n=e[s];if(n&&n.call){let l=n(r),d=l&&l.props&&l.props.className||/^go/.test(l)&&l;n=d?"."+d:l&&typeof l=="object"?l.props?"":Ie(l,""):l===!1?"":l}return i+a+(n??"")},"");function dr(t){let e=this||{},r=t.call?t(e.p):t;return Ku(r.unshift?r.raw?Ju(r,[].slice.call(arguments,1),e.p):r.reduce((i,a)=>Object.assign(i,a&&a.call?a(e.p):a),{}):r,Qu(e.target),e.g,e.o,e.k)}let vn,ci,pi;dr.bind({g:1});let pe=dr.bind({k:1});function Zu(t,e,r,i){Ie.p=e,vn=t,ci=r,pi=i}function Pe(t,e){let r=this||{};return function(){let i=arguments;function a(s,n){let l=Object.assign({},s),d=l.className||a.className;r.p=Object.assign({theme:ci&&ci()},l),r.o=/ *go\d+/.test(d),l.className=dr.apply(r,i)+(d?" "+d:"");let u=t;return t[0]&&(u=l.as||t,delete l.as),pi&&u[0]&&pi(l),vn(u,l)}return e?e(a):a}}var Xu=t=>typeof t=="function",Yt=(t,e)=>Xu(t)?t(e):t,ec=(()=>{let t=0;return()=>(++t).toString()})(),$n=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t}})(),tc=20,Fi="default",Dn=(t,e)=>{let{toastLimit:r}=t.settings;switch(e.type){case 0:return{...t,toasts:[e.toast,...t.toasts].slice(0,r)};case 1:return{...t,toasts:t.toasts.map(n=>n.id===e.toast.id?{...n,...e.toast}:n)};case 2:let{toast:i}=e;return Dn(t,{type:t.toasts.find(n=>n.id===i.id)?1:0,toast:i});case 3:let{toastId:a}=e;return{...t,toasts:t.toasts.map(n=>n.id===a||a===void 0?{...n,dismissed:!0,visible:!1}:n)};case 4:return e.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(n=>n.id!==e.toastId)};case 5:return{...t,pausedAt:e.time};case 6:let s=e.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(n=>({...n,pauseDuration:n.pauseDuration+s}))}}},jt=[],Pn={toasts:[],pausedAt:void 0,settings:{toastLimit:tc}},se={},wn=(t,e=Fi)=>{se[e]=Dn(se[e]||Pn,t),jt.forEach(([r,i])=>{r===e&&i(se[e])})},Rn=t=>Object.keys(se).forEach(e=>wn(t,e)),rc=t=>Object.keys(se).find(e=>se[e].toasts.some(r=>r.id===t)),ur=(t=Fi)=>e=>{wn(e,t)},ic={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ac=(t={},e=Fi)=>{let[r,i]=S.useState(se[e]||Pn),a=S.useRef(se[e]);S.useEffect(()=>(a.current!==se[e]&&i(se[e]),jt.push([e,i]),()=>{let n=jt.findIndex(([l])=>l===e);n>-1&&jt.splice(n,1)}),[e]);let s=r.toasts.map(n=>{var l,d,u;return{...t,...t[n.type],...n,removeDelay:n.removeDelay||((l=t[n.type])==null?void 0:l.removeDelay)||t?.removeDelay,duration:n.duration||((d=t[n.type])==null?void 0:d.duration)||t?.duration||ic[n.type],style:{...t.style,...(u=t[n.type])==null?void 0:u.style,...n.style}}});return{...r,toasts:s}},sc=(t,e="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:e,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...r,id:r?.id||ec()}),Dt=t=>(e,r)=>{let i=sc(e,t,r);return ur(i.toasterId||rc(i.id))({type:2,toast:i}),i.id},j=(t,e)=>Dt("blank")(t,e);j.error=Dt("error");j.success=Dt("success");j.loading=Dt("loading");j.custom=Dt("custom");j.dismiss=(t,e)=>{let r={type:3,toastId:t};e?ur(e)(r):Rn(r)};j.dismissAll=t=>j.dismiss(void 0,t);j.remove=(t,e)=>{let r={type:4,toastId:t};e?ur(e)(r):Rn(r)};j.removeAll=t=>j.remove(void 0,t);j.promise=(t,e,r)=>{let i=j.loading(e.loading,{...r,...r?.loading});return typeof t=="function"&&(t=t()),t.then(a=>{let s=e.success?Yt(e.success,a):void 0;return s?j.success(s,{id:i,...r,...r?.success}):j.dismiss(i),a}).catch(a=>{let s=e.error?Yt(e.error,a):void 0;s?j.error(s,{id:i,...r,...r?.error}):j.dismiss(i)}),t};var nc=1e3,oc=(t,e="default")=>{let{toasts:r,pausedAt:i}=ac(t,e),a=S.useRef(new Map).current,s=S.useCallback((m,p=nc)=>{if(a.has(m))return;let _=setTimeout(()=>{a.delete(m),n({type:4,toastId:m})},p);a.set(m,_)},[]);S.useEffect(()=>{if(i)return;let m=Date.now(),p=r.map(_=>{if(_.duration===1/0)return;let f=(_.duration||0)+_.pauseDuration-(m-_.createdAt);if(f<0){_.visible&&j.dismiss(_.id);return}return setTimeout(()=>j.dismiss(_.id,e),f)});return()=>{p.forEach(_=>_&&clearTimeout(_))}},[r,i,e]);let n=S.useCallback(ur(e),[e]),l=S.useCallback(()=>{n({type:5,time:Date.now()})},[n]),d=S.useCallback((m,p)=>{n({type:1,toast:{id:m,height:p}})},[n]),u=S.useCallback(()=>{i&&n({type:6,time:Date.now()})},[i,n]),c=S.useCallback((m,p)=>{let{reverseOrder:_=!1,gutter:f=8,defaultPosition:g}=p||{},I=r.filter(b=>(b.position||g)===(m.position||g)&&b.height),h=I.findIndex(b=>b.id===m.id),A=I.filter((b,C)=>C<h&&b.visible).length;return I.filter(b=>b.visible).slice(..._?[A+1]:[0,A]).reduce((b,C)=>b+(C.height||0)+f,0)},[r]);return S.useEffect(()=>{r.forEach(m=>{if(m.dismissed)s(m.id,m.removeDelay);else{let p=a.get(m.id);p&&(clearTimeout(p),a.delete(m.id))}})},[r,s]),{toasts:r,handlers:{updateHeight:d,startPause:l,endPause:u,calculateOffset:c}}},lc=pe`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,dc=pe`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,uc=pe`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,cc=Pe("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${lc} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${dc} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${uc} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,pc=pe`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,mc=Pe("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${pc} 1s linear infinite;
`,_c=pe`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,fc=pe`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,yc=Pe("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${_c} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${fc} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,hc=Pe("div")`
  position: absolute;
`,gc=Pe("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Ic=pe`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,bc=Pe("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ic} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Tc=({toast:t})=>{let{icon:e,type:r,iconTheme:i}=t;return e!==void 0?typeof e=="string"?S.createElement(bc,null,e):e:r==="blank"?null:S.createElement(gc,null,S.createElement(mc,{...i}),r!=="loading"&&S.createElement(hc,null,r==="error"?S.createElement(cc,{...i}):S.createElement(yc,{...i})))},Ac=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Cc=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,vc="0%{opacity:0;} 100%{opacity:1;}",$c="0%{opacity:1;} 100%{opacity:0;}",Dc=Pe("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Pc=Pe("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,wc=(t,e)=>{let r=t.includes("top")?1:-1,[i,a]=$n()?[vc,$c]:[Ac(r),Cc(r)];return{animation:e?`${pe(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${pe(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Rc=S.memo(({toast:t,position:e,style:r,children:i})=>{let a=t.height?wc(t.position||e||"top-center",t.visible):{opacity:0},s=S.createElement(Tc,{toast:t}),n=S.createElement(Pc,{...t.ariaProps},Yt(t.message,t));return S.createElement(Dc,{className:t.className,style:{...a,...r,...t.style}},typeof i=="function"?i({icon:s,message:n}):S.createElement(S.Fragment,null,s,n))});Zu(S.createElement);var Sc=({id:t,className:e,style:r,onHeightUpdate:i,children:a})=>{let s=S.useCallback(n=>{if(n){let l=()=>{let d=n.getBoundingClientRect().height;i(t,d)};l(),new MutationObserver(l).observe(n,{subtree:!0,childList:!0,characterData:!0})}},[t,i]);return S.createElement("div",{ref:s,className:e,style:r},a)},kc=(t,e)=>{let r=t.includes("top"),i=r?{top:0}:{bottom:0},a=t.includes("center")?{justifyContent:"center"}:t.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:$n()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${e*(r?1:-1)}px)`,...i,...a}},Uc=dr`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Ut=16,Oc=({reverseOrder:t,position:e="top-center",toastOptions:r,gutter:i,children:a,toasterId:s,containerStyle:n,containerClassName:l})=>{let{toasts:d,handlers:u}=oc(r,s);return S.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:Ut,left:Ut,right:Ut,bottom:Ut,pointerEvents:"none",...n},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},d.map(c=>{let m=c.position||e,p=u.calculateOffset(c,{reverseOrder:t,gutter:i,defaultPosition:e}),_=kc(m,p);return S.createElement(Sc,{id:c.id,key:c.id,onHeightUpdate:u.updateHeight,className:c.visible?Uc:"",style:_},c.type==="custom"?Yt(c.message,c):a?a(c):S.createElement(Rc,{toast:c,position:m}))}))},yy=j;const Sn=t=>ae.jsxs("div",{children:[ae.jsx(Oc,{}),t.children]});Sn.__docgenInfo={description:"",methods:[],displayName:"NotificationProvider"};const Bc="Acceptance Register",qc={invalid:"Unsupported filter"},Nc={columns:{accepted_from:"Accepted from",accepted_to:"Accepted to",associations:"Associations",details:"Details",details_link:"$t(acceptance, capitalize) link",owner:"Owner",parent_risk_id:"Parent $t(risk_one) id",risk:"$t(risk_one, capitalize)",status:"Status",tier:"Tier",title:"$t(acceptance, capitalize) title"},confirm_delete_message:"Are you sure you want to delete these acceptances?",confirm_single_delete_message:"Are you sure you want to delete this acceptance?",create_button:"Add $t(acceptance, capitalize)",create_modal_title:"Add $t(acceptance, capitalize)",create_success_message:"$t(acceptance, capitalize) added successfully",dashboard:{all:"All $t(acceptance_other)",open:"Open",closed:"Closed",declined:"Declined",draft:"Draft",overdue:"Overdue"},delete_button:"Delete $t(acceptance, capitalize)",delete_modal_title:"Delete $t(acceptance, capitalize)",delete_success_message:"$t(acceptance, capitalize, plural) deleted successfully",edit_modal_title:"Edit $t(acceptance, capitalize)",entity_name:"$t(acceptance)",fallback_title:"$t(acceptance_one, capitalize)",fields:{DateAcceptedFrom:"Date accepted from",DateAcceptedFrom_help:"",DateAcceptedTo:"Date accepted to",DateAcceptedTo_help:"",Details:"Details",Details_help:"",Details_placeholder:"Enter $t(acceptance) details",Status:"Status",Status_help:"",Title:"Title",Title_help:"",Title_placeholder:"Enter a title for your $t(acceptance)",approvedBy:"Approved by",approvedBy_help:"",newFiles:"Attach files",newFiles_help:"",requestedBy:"Requested by",requestedBy_help:""},help:[{content:"",title:""}],loading_message:"Loading acceptances",register_title:"$t(acceptance, capitalize) Register",tab_title:"$t(acceptance, capitalize, plural)",update_success_message:"$t(acceptance, capitalize) updated successfully"},Fc={paragraph1:"Hold it there. You don't have permission to view that page. If you think you should, speak to your administrator.",paragraph2:"",paragraph3:"",title:"Access denied"},Ec="update",Mc={add_button:"Add $t(actionUpdate)",columns:{date:"Date",description:"Description",title:"Title"},confirm_delete_message:"Are you sure you want to delete these $t(actionUpdate, plural)?",create_modal_title:"Add $t(actionUpdate, capitalize)",create_success_message:"$t(actionUpdate, capitalize) added successfully",delete_success_message:"$t(actionUpdate, capitalize, plural) deleted successfully",edit_modal_title:"Edit $t(actionUpdate, capitalize)",entity_name:"$t(actionUpdate)",fields:{Description_help:"",Description_placeholder:"Enter a description for your $t(actionUpdate)",Title_help:"",Title_placeholder:"Enter a title for your $t(actionUpdate)"},loading_message:"Loading $t(actionUpdate, plural)",tabHelp:[{content:"",title:""}],tab_title:"$t(actionUpdate, capitalize, plural)",update_success_message:"$t(actionUpdate, capitalize) updated successfully"},zc="this is $t(action, article) test",xc={add_button:"Add $t(action, capitalize)",columns:{closed_date:"Closed date",created_by_username:"Raised by",date_raised:"Raised",description:"Description",details_link:"$t(action, capitalize) link",due_date:"Due",latestUpdateCreatedAtTimestamp:"Latest update created on",latestUpdateDescription:"Latest update description",latestUpdateTitle:"Latest update title",modified_by_username:"Modified by",overdue:"Overdue",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",priority:"Priority",status:"Status",title:"Action title",updateCount:"Update count"},confirm_delete_message:"Are you sure you want to delete these $t(action, plural)?",createNewButton:"Add Action",create_modal_title:"Add $t(action, capitalize)",create_success_message:"$t(action, capitalize) added successfully",dashboard:{all:"All $t(action_other)",due_this_month:"Due this month",due_this_week:"Due this week",due_today:"Due today",open_actions:"Open $t(action_other)",overdue:"Overdue"},delete_button:"Delete $t(action, capitalize)",delete_success_message:"$t(action, capitalize) deleted successfully",edit_modal_title:"Edit $t(action, capitalize)",entity_name:"action",fallback_title:"$t(action, capitalize)",fields:{ClosedDate:"Actual closed date",ClosedDate_help:"",Contributor_help:"",DateRaised:"Date raised",DateRaised_help:"",Description_help:"",Description_placeholder:"Enter a description of your $t(action)",Owner_help:"",Priority:"Priority",Priority_help:"",Status_help:"",TargetCloseDate:"Target close date",TargetCloseDate_help:"",Title_help:"",Title_placeholder:"Enter a title for your $t(action)"},help:[{content:"",title:""}],loading_message:"Loading $t(action, plural)",registerHelp:[{content:"",title:""}],register_title:"$t(action, capitalize, plural) Register",tabHelp:[{content:"",title:""}],tab_title:"$t(action, capitalize, plural)",update_success_message:"$t(action, capitalize) updated successfully"},Lc="Actions",Gc="Active",jc={add_button:"Add $t(control_one)",confirm_remove_message:"Are you sure you want to remove these $t(control_other)?",control_count_one_label:"1 $t(control_one, capitalize) selected",control_count_other_label:"{{count}} $t(control_other, capitalize) selected",create_modal_title:"Add $t(control_one, capitalize)",edit_modal_title:"Edit $t(control_one, capitalize)",entity_name:"$t(control_one)",fields:{title:"Title",title_placeholder:"Select $t(control_one, article)"},loading_message:"Loading $t(control_other)",tab_title:"$t(actionUpdate, capitalize, plural)"},Vc="Advanced",Wc="App version",Qc="Appetite performance",Hc={impact:"Impact",likelihood:"Likelihood",risk:"Risk"},Yc={add_button:"Add $t(appetite_one, capitalizeAll)",appetite_cascade_warning:"This appetite can only be edited via the parent risk.",columns:{LikelihoodAppetite:"Likelihood $t(appetite_one)",LikelihoodAppetiteHelp:"",appetitePerformance:"Appetite performance",appetiteType:"Appetite Type",appetiteType_help:"",controlledRating:"$t(controlled_one, capitalize) rating",dateSet:"Date set",details_link:"$t(appetite_one, capitalizeAll) link",effectiveDate:"Effective date",effectiveDate_help:"",impact:"$t(impact_one, capitalize)",impactAppetite:"$t(impact_one, capitalize) $t(appetite_one)",impactAppetite_help:"",impact_help:"",likelihoodAppetite:"Likelihood $t(appetite_one)",lowerAppetite:"Lower $t(appetite_one)",lowerAppetite_help:"",owner:"Owner",parentRiskGuid:"Parent $t(risk_one) guid",parentRiskId:"Parent $t(risk_one) ID",posture:"Posture",posture_help:"",risk:"$t(risk_one, capitalize)",riskAppetiteStatement_help:"",statement:"Statement",status:"Status",tier:"Tier",upperAppetite:"Upper $t(appetite_one)",upperAppetite_help:""},confirm_delete_message:"Are you sure you want to delete these appetites?",create_modal_title:"Add $t(appetite_one, capitalizeAll)",create_success_message:"$t(appetite_one, capitalizeAll) added successfully",dashboard:{all:"All $t(appetite_other)",outside:"Outside",inside:"Inside"},delete_success_message:"$t(appetite_one, capitalizeAll) deleted successfully",edit_modal_title:"Edit $t(appetite_one, capitalizeAll)",entity_name:"$t(appetite_one)",help:[{content:"",title:""}],loading_message:"Loading appetites",register_title:"$t(appetite_other, capitalizeAll) Register",status:{active:"Active",archived:"Archived",upcoming:"Upcoming"},tab_title:"$t(appetite_one, capitalizeAll)",update_success_message:"$t(appetite_one, capitalizeAll) updated successfully",validation:{dateCannotBeInTheFuture:"Date cannot be in the future"}},Kc="Appetites Register",Jc={add_another_level:"Add another stage",add_approval:"Add $t(approval_one, capitalizeAll)",add_approvers:"Add $t(approver_other)",add_approvers_with_count:"$t(approver_other, capitalize)",approvalTableTitle:"$t(approval_other, capitalizeAll)",approval_change_requests_in_flight:{body:"There are pending change requests that rely on this $t(approval_one). You cannot make changes to this $t(approval_one) until the pending change requests are approved or rejected.",title:"Cannot modify $t(approval_one)"},approval_history_header:"Submitted for $t(approval_one) by",change_request_alert:{body_changes:"The values below are not approved and are pending review. To view the current status of this {{entityName}}, click the button on the right.",body_current:"A change request has been submitted for this {{entityName}}. To view the requested changes, click the button on the right.",footer_editable:"Any changes you make will be amended to the existing change request.",footer_readonly:"You cannot make changes while the approval is in-flight.",title_changes:"You are viewing unapproved changes",title_current:"This {{entityName}} is read-only because it has pending changes",view_changes:"Show Pending Changes",view_current:"View Current"},change_request_modal:{body:"The action you have tried to do must be submitted for approval before it can be executed. Do you want to continue?",cancel:"Cancel",confirm:"Submit for Approval",reason_label:"Reason for request",reason_placeholder:"Explain why you're requesting this change (optional)",title:"Action Requires Approval"},columns:{levels:"Approval Levels",parentType:"Parent Type",workflow:"Workflow"},confirm_delete_bulk_message:"Are you sure you want to delete these $t(approval_other)?",confirm_delete_bulk_title:"Delete $t(approval_other, capitalize)",confirm_delete_message:"Are you sure you want to delete this $t(approval_one)?",confirm_delete_title:"Delete $t(approval_one, capitalize)",create_modal_title:"$t(approver_other, capitalize)",create_page_title:"Create $t(approval_one, capitalizeAll)",delete_request_alert:{body_changes:"A delete request has been submitted for this {{entityName}}. To hide the request details, click the button on the right.",body_current:"A delete request has been submitted for this {{entityName}}. To view the request details, click the button on the right.",title_changes:"This {{entityName}} is pending deletion.",title_current:"This {{entityName}} is pending deletion.",view_changes:"Show Delete Request",view_current:"View Current"},edit_modal_title:"$t(approver_other, capitalize)",edit_page_title:"Edit $t(approval_one, capitalizeAll)",entity_name:"$t(approval_one, capitalize)",fields:{inflight_edit_rule:"Who can amend an in-flight request?",inflight_edit_rule_help:"",inflight_edit_rule_placeholder:"Select in-flight edit rule",levels:"Approval levels",levels_help:"",validation:{duplicateWorkflow:"Workflow already exists"},workflow:"Workflow",workflow_help:"",workflow_placeholder:"Select workflow"},group_users:"Group Users",help:[{content:"The global approval workflow will run after any object approval workflow is complete.",title:""},{content:"Global approvals can go to item owners, or admin users.",title:""}],historical_alert:{body:"You are viewing a change request that's been resolved and can't be edited. To amend the record, please create a new change request.",view_history:"Show Approval History"},in_flight_edit_rules:{approvers:"Only approvers",everyone:"Anyone",noone:"No one"},level_rule_types:{all_approve:"All must approve",any_one_approve:"Any can approve",majority_approve:"Majority must approve"},objectLevelHelp:[{content:"An object approval workflow is specific to this item only, and it will run before any global level workflow set by admin users.",title:""},{content:"Object approvals can be set by admin users and item owners.",title:""},{content:"Object approvals can be approved by item owners/contributors, or read only users.",title:""}],overrideModalOverallHeader:"Change request override",overrideModalStepHeader:"$t(approval_one, capitalize) Override - Skip current level",override_change_request_modal_alert:"This action will bypass any completed or pending approval steps and mark the change request resolved.",override_step_alert:"Your role allows you to approve or reject this step without waiting for requirements to be met (bypass $t(approval_one) step).",page_title:"$t(approval_other, capitalizeAll)",requester_rationale_header:"Reason for request",requestsRegister:{columns:{approvalConfig:"Approval Config Guid",changes:"Changes",currentLevel:"Current Level",currentLevelValue:"{{current}} of {{max}}",dateClosed:"Date Closed",dateLastActioned:"Date Last Actioned",dateOpened:"Date Request Raised",parentGuid:"Parent Guid",status:"Status",workflow:"Workflow"},summary:{all:"All $t(request_other, lowercase)",approved:"Approved",myRequests:"Requested by me",pending:"Pending",rejected:"Rejected",requiresAction:"Requires my action"}},save:"Save",status:{approved:"Approved",deleted:"Deleted",failed:"Failed",pending:"Pending",rejected:"Rejected"},tab_title:"$t(approval_other, capitalize)",tabs:{details:"Details"},workflowDescriptions:{"close-action":"Require approval when an $t(action_one) is closed.","close-issue-assessment":"Require approval when an $t(issue_one) is closed.","delete-acceptance":"Require approval when someone tries to delete an $t(acceptance_one).","delete-action":"Require approval when an $t(action_one) is deleted.","delete-control":"Require approval when someone tries to delete a $t(control_one).","delete-issue":"Require approval when someone tries to delete an $t(issue_one).","delete-risk":"Require approval when someone tries to delete a $t(risk_one).","open-acceptance":"Require approval when someone tries to open an $t(acceptance_one).","publish-document-version":"Require approval when someone tries to publish a policy $t(document_one) version","update-action-details":"Require approval when someone tries to update an $t(action_one).","update-action-target-close-date":"Require approval when someone tries to update an $t(action_one) target close date.","update-control-details":"Require approval when someone tries to update a $t(control_one).","update-issue-assessment-target-close-date":"Require approval when someone tries to update an $t(issue_assessment_one) target close date.","update-risk-details":"Require approval when someone tries to update a $t(risk_one)."},workflows:{"close-action":"$t(action_one, capitalize) closure","close-issue-assessment":"Close $t(issue_one, capitalize)","delete-acceptance":"Delete $t(acceptance_one, capitalize)","delete-action":"Delete $t(action_one, capitalize)","delete-control":"Delete $t(control_one, capitalize)","delete-issue":"Delete $t(issue_one, capitalize)","delete-risk":"Delete $t(risk_one, capitalize)","open-acceptance":"Open $t(acceptance_one, capitalize)","publish-document-version":"Publish Version","update-action-details":"Update $t(action_one, capitalize) details","update-action-target-close-date":"Update $t(action_one, capitalize) target close date","update-control-details":"Update $t(control_one, capitalize) details","update-issue-assessment-target-close-date":"Update $t(issue_assessment_one, capitalize) target close date","update-risk-details":"Update $t(risk_one, capitalize) details"}},Zc="Approve",Xc="Archive",ep="Archived",tp="assessment",rp={activityRegisterTitle:"$t(activity_one, capitalize)",add_button:"Add $t(activity_one, capitalize)",columns:{AssignedUser:"Activity Owner",CompletionDate:"Completion date",CreatedById:"Created by ID",CreatedByUsername:"Created by",CreatedOn:"Created on",Item:"$t(activity_one, capitalize)",LinkedRisk:"Linked Risk",RiskId:"Risk ID",Status:"Status",Summary:"Activity summary",Title:"$t(activity_one, capitalize) title",Type:"Type",UpdatedById:"Updated by ID",UpdatedByUsername:"Updated by",UpdatedOn:"Last updated",NextTestOverdue:"Next test overdue",NextTestDate:"Next test date"},confirm_delete_message:"Are you sure you want to delete these $t(activity_other)?",delete_activity_button:"Delete $t(activity_one, capitalize)",delete_button:"Delete",delete_rcsa_button:"Delete RCSA",disabledUserPrompt:"This user cannot be changed as they are assigned to an RCSA $t(activity_one)",entity_name:"$t(activity_one)",entity_name_plural:"$t(activity_other)",fields:{ActivityType:"$t(activity_one, capitalize) type",ActivityType_help:"",AssignedUser:"$t(activity_one, capitalize) user",AssignedUser_help:"",CompletionDate:"Completion date",CompletionDate_help:"",NewFiles:"Attach files",NewFiles_help:"",Status:"Status",Status_help:"",Summary:"$t(activity_one, capitalize) summary",Summary_help:"",Summary_placeholder:"Enter $t(activity_one) summary",Title:"$t(activity_one, capitalize) title",Title_help:"",Title_placeholder:"Enter $t(activity_one) title"},findingCreateMessage:"Create {{entity}} {{finding}}",link_item_button:"Link items +",linkedItems:{add:"Add Link",entity_name:"Linked item",modal_title:"Link Item",tabHelp:[{content:"",title:""}]},loading_message:"Loading $t(activity_other)",rcsa:"RCSA",rcsaActivityRegisterTitle:"RCSA $t(activity_one, capitalize)",register_title:"$t(activity_other, capitalize) $t(register_one, capitalize)",status:{complete:"Complete",inprogress:"In progress",notstarted:"Not started"},tab_title:"$t(activity_other, capitalize)",type:{interview:"Interview",meeting:"Meeting",reminder:"Reminder",review:"Review",task:"Task"}},ip={action:"$t(action_other, capitalize)",add_button:"Add $t(finding_one, capitalizeAll)",columns:{CompletionBy:"Completed by",CompletionDate:"Completion date",Impact:"$t(impact_one, capitalize)",Item:"Assessed item",Likelihood:"$t(likelihood_one, capitalize)",Rating:"Rating",Rationale:"Rationale",Result:"Result",StartDate:"Start date",TestDate:"Result date",Title:"Title",Type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(finding_other)?",confirm_single_delete_message:"Are you sure you want to delete this $t(finding_one)?",controlTypes:{controlled:"$t(controlled_one, capitalize)",uncontrolled:"$t(uncontrolled_one, capitalize)"},controlTypesCased:{Controlled:"$t(controlled_one, capitalize)",Uncontrolled:"$t(uncontrolled_one,capitalize)"},create_modal_title:"Add $t(finding_one, capitalizeAll)",create_new_button:"Add $t(finding_one, capitalizeAll)",create_title:"Add $t(finding_one, capitalizeAll)",dashboard:{all:"All $t(finding_other)",complete:"Complete",in_progress:"In progress",not_started:"Not started"},delete_button:"Delete",delete_modal_title:"Delete $t(finding_one, capitalize)",edit_modal_title:"$t(finding_one, capitalizeAll)",edit_title:"Edit $t(finding_one, capitalizeAll)",entity_name:"$t(finding_one, capitalizeAll)",fallback_title:"$t(finding_one, capitalizeAll)",fields:{Assessment:"$t(assessment_one, capitalize)",Assessment_help:"",ComplianceMonitoringAssessment:"$t(compliance_monitoring_assessment_one, capitalize)",ComplianceMonitoringAssessment_help:"",ControlTest:"$t(control_one, capitalize) - $t(control_test_one)",ControlType:"Result type",ControlType_help:"",ControlType_help_readonly:"Result type cannot be changed once saved",ControlType_placeholder:"Select result type",Document:"$t(document_one, capitalize)",Document_help:"",Document_placeholder:"Select $t(document_one, article)",Impact:"$t(impact_one, capitalize)",Impact_help:"",Impact_placeholder:"Select $t(impact_one)",InternalAuditReport:"$t(internal_audit_report_one, capitalize)",InternalAuditReport_help:"",Likelihood:"$t(likelihood_one, capitalize)",Likelihood_help:"",Likelihood_placeholder:"Select $t(likelihood_one)",Obligation:"$t(obligation_one, capitalize)",Obligation_help:"",Obligation_placeholder:"Select $t(obligation_one, article)",Rating:"Rating",RatingType:"Rating type",RatingType_placeholder:"Select rating type",Rating_help:"",Rating_placeholder:"Select rating",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Enter your rationale for this rating",Risk:"$t(risk_one, capitalize)",Risk_help:"",Risk_placeholder:"Select $t(risk_one, article)",TestDate:"Result date",TestDate_help:"",TestType:"Test type",Type:"Type",Type_placeholder:"Select type",UncontrolledRisk:"$t(risk_one, capitalize) - $t(uncontrolled_one)",newFiles:"Attach files",newFiles_help:""},impact:"$t(impact_other, capitalize)",impact_rating:"$t(impact_rating_other, capitalize)",issues:"$t(issue_other, capitalize)",loading_message:"Loading $t(finding_other)",ratings:"$t(rating_other, capitalize)",registerHelp:[{content:"",title:""}],register_title:"$t(finding_other, capitalizeAll)",resultTypes:{control_test_internal_audit_result:"$t(control_test_one, capitalize) result",control_test_second_line_result:"$t(control_test_one, capitalize) result",document_assessment_result:"$t(document_one, capitalize)",document_internal_audit_result:"$t(document_one, capitalize)",document_second_line_result:"$t(document_one, capitalize)",impact_internal_audit_rating:"$t(impact_rating_one, capitalize)",impact_rating:"$t(impact_rating_one, capitalize)",impact_second_line_rating:"$t(impact_rating_one, capitalize)",obligation_assessment_result:"$t(obligation_one, capitalize)",obligation_internal_audit_result:"$t(obligation_one, capitalize)",obligation_second_line_result:"$t(obligation_one, capitalize)",risk_assessment_result:"$t(risk_one, capitalize)",risk_controlled_internal_audit_result:"$t(risk_one, capitalize)",risk_controlled_second_line_result:"$t(risk_one, capitalize)",risk_uncontrolled_internal_audit_result:"$t(risk_one, capitalize)",risk_uncontrolled_second_line_result:"$t(risk_one, capitalize)",test_result:"$t(control_test_one, capitalize) result"},tab_title:"$t(finding_other, capitalizeAll)"},ap={add_button:"Add $t(assessment_one, capitalize) ",add_rating_button:"Add rating",assessmentTypes:{document_assessment:"$t(document_one, capitalizeAll) $t(assessment_one, capitalizeAll)",obligation_assessment:"$t(obligation_one, capitalizeAll) $t(assessment_one, capitalizeAll)"},columns:{AssessedItems:"Assessed items",CompletionBy:"Completed by",CompletionById:"Completed by ID",CompletionDate:"Completion date",NextTestDate:"Next assessment date",Outcome:"Assessment outcome",Owner:"Owner",contributor:"Contributor",ParentTitle:"Parent title",Result:"Result",StartDate:"Start date",Status:"Status",Summary:"Summary",TargetCompletionDate:"Target completion date",Title:"Title",Type:"Type",created_by_id:"Created by ID",created_by_username:"Created by",created_on:"Created on",details_link:"$t(assessment_one, capitalizeAll) link",id:"ID",updated_by_id:"Updated by ID",updated_by_username:"Updated by",updated_on:"Last updated"},completed:"Completed",confirm_delete_message:"Are you sure you want to delete the $t(assessment_one)?",create_new_button:"Add $t(assessment_one, capitalizeAll)",create_success_message:"$t(assessment_one, capitalize) added successfully",create_title:"Add $t(assessment_one, capitalize)",delete_button:"Delete $t(assessment_one, capitalize)",delete_modal_title:"Delete $t(assessment_one, capitalize)",delete_success_message:"$t(assessment_one, capitalize) deleted successfully",due:"Due",entity:"$t(assessment_one)",entity_name:"$t(assessment_one)",fallback_title:"$t(assessment, capitalize)",fields:{ActualCompletionDate:"Actual completion date",ActualCompletionDate_help:"",ActualCompletionDate_placeholder:"Select the completion date",CompletedBy:"Completed by",CompletedBy_help:"",CompletedBy_placeholder:"Please select a user",Contributor_help:"",NextTestDate:"Next assessment date",NextTestDate_help:"",Outcome:"Assessment outcome",Outcome_help:"",Outcome_placeholder:"",Owner:"Owner",Owner_help:"",Result:"Result",StartDate:"Start date",StartDate_help:"",StartDate_placeholder:"Select a start date",Status:"Status",Status_help:"",Summary:"Summary",Summary_help:"",Summary_placeholder:"Enter a summary of the activity performed",TargetCompletionDate:"Target completion date",TargetCompletionDate_help:"",TargetCompletionDate_placeholder:"Select target completion date",Title:"Title",Title_help:"",Title_placeholder:"Enter a title"},loading_message:"Loading $t(assessment_other, plural)",outcome:"Outcome",registerHelp:[{content:"",title:""}],register_title:"$t(assessment_other, capitalizeAll) Register",rscaDeletionWaringMessage:"Deleting this $t(assessment_one, capitalize) will delete any in-progress RCSA Activities linked to Risks. This action cannot be undone.",status:{complete:"Complete",inprogress:"In progress",notstarted:"Not started"},summary_category_titles:{assessment_in_progress:"$t(rating_one, capitalize) in-progress",due:"Due",not_meeting:"Not meeting",overdue:"Overdue",total:"All $t(assessment, plural)"},tabHelp:[{content:"",title:""}],tab_title:"$t(assessment_other, capitalize)",update_success_message:"$t(assessment_one, capitalize) updated successfully"},sp={buttonText:{attested:"Attested",pending:"Attest"},notRequiredModal:{allAttestations:"All attestations",buttonLabel:"Not required",label:"Select attestation",placeholder:"By attestation",title:"Not required"},cardText:{version:"Version",reissue:"Re-issue cycle",requireAttestations:"Attestation required",transferOver:"Transferred over"},noPublishedDocumentWarningHeading:"Important: Publish Before Distributing Attestations",noPublishedDocumentWarningMessage:"You must publish a version before distributing an attestation. Drafts cannot be shared. Please review and publish before proceeding.",viewSelector:{all:"All",attestation_cycles:"Attestation cycles",by_user:"By user"},columns:{active:"Active",attestation_status:"Attestation status",attestations_completed:"Attestations completed",attested_at:"Attested at",cycle_end_date:"Cycle end date",cycle_start_date:"Cycle start date",cycle_status:"Cycle status",document:"Document",email:"Email",expires_at:"Expires at",name:"Name",progress:"$t(attestation_one, capitalize) progress",status:"$t(attestation_one, capitalize) status",transferred_from:"Transferred from",user_attested_at:"User attested at",user_due_date:"User due date",user_friendly_name:"User",user_id:"User ID",user:"User",version:"Version"},confirmConfigChangePrompt:{cancel:"Cancel",confirm:"Confirm",message:"The changes you have made will initiate a new attestation process, confirming this will notify {{count}} users to attest. Are you sure you want to continue?",title:"Initiate New Attestation Process"},defaultPolicyAttestationPrompt:"I have read and understood this document",entity_name:"$t(attestation_one)",is_attestation_active:{no:"No",yes:"Yes"},loading_message:"Loading $t(attestation_other)",prompt:{cancel:"Cancel",confirm:"Confirm",default:"I have read and understood this document",title:"Attestation"},registerHelp:[{content:"",title:""}],register_title:"$t(attestation_other, capitalize) Register",summary_category_titles:{active:"Active",all:"All $t(attestation_other)",all_cycles:"All $t(attestation_one) cycles",attested:"Attested",concluded:"Concluded",expired:"Expired",not_attested:"Not attested",not_required:"Not required",pending:"Pending",overdue:"Overdue"},tab_title:"$t(attestation_other, capitalize)",user_attestations_breadcrumb:"User $t(attestation_other, capitalize)"},np={auditLogActions:{DELETE:"Deleted",INSERT:"Added",LOGIN:"Logged In",UPDATE:"Updated"},auditTableTitle:"Audit",help:[{content:"",title:""}]},op={authenticationTableTitle:"Authentication",entity_name:"authentication",scimDomains:{addButton:"Add domain",columns:{createdOn:"Added on",domain:"Domain"},confirmDeleteMessage:"Are you sure you want to remove this authorised domain?",deleteButton:"Delete",deleteModalHeader:"Removed authorised domain",entityName:"Authorised domain",entity_name:"Authorised domain",fields:{domain:"New domain"},header:"Authorised domains",noDomainsDescription:"There are no authorised domains configured for your organisation",noDomainsHeader:"No authorised domains",placeholders:{domain:"Please enter a domain"}},scimProvisioning:{disableScimHeader:"Disable SCIM",disableScimWarning:"Disabling SCIM will revoke all active access tokens and prevent further updates to users from your identity provider. If you proceed you will need to re-enable SCIM and generate a new token to restore access.",fields:{enableScim:"Enable SCIM"},header:"SCIM provisioning"},scimTokens:{addButton:"Generate new token",columns:{createdOn:"Added on",expiresOn:"Expires on",keyId:"Key ID",status:"Status"},confirmDeleteMessage:"Are you sure you want to remove this SCIM access token?",copyToClipboardButtonText:"Copy to clipboard",copyToClipboardErrorMessage:"Error copying token to clipboard",copyToClipboardSuccessMessage:"Token copied to clipboard",create_modal_title:"Generate SCIM access token",deleteButton:"Delete",deleteModalHeader:"Removed token",entityName:"Access token",entity_name:"Access token",fields:{created:"Created: ",expireInMonths:"Token expiry",expires:"Expires: ",keyId:"Key ID: ",status:"Status: ",token:"Token: "},header:"Access tokens",legacyTokenWarning:"You are currently using a legacy access token which will be deprecated soon. Please generate a new token and update your SCIM client.",noTokensDescription:"There are no access tokens configured for your organisation",noTokensHeader:"No access tokens",placeholders:{expireInMonths:"Select a token expiry"},tokenCopyWarning:"Please take a copy of your token value now as you will not be able to retrieve it again."}},lp={tab_title:"SSO"},dp={false:"No",true:"Yes"},up="Cancel",cp={add_button:"Add $t(cause_one, capitalize)",columns:{assessmentDepartments:"Assessment $t(department_other)",description:"Description",issue:"$t(issue_one, capitalize)",issueClosedDate:"$t(issue_one, capitalize) Closed Date",issueId:"$t(issue_one, capitalize) Id",issueOwner:"$t(issue_one, capitalize) Owner",issueRaisedDate:"$t(issue_one, capitalize) Raised Date",issueSeverity:"$t(issue_one, capitalize) Severity",issueStatus:"$t(issue_one, capitalize) Status",issueType:"$t(issue_one, capitalize) Type",significance:"Significance",title:"Title"},confirm_delete_message:"Are you sure you want to delete these $t(cause_other)?",create_modal_title:"Add $t(cause_one, capitalize)",create_success_message:"$t(cause_one, capitalize) added successfully",dashboard:{all:"All $t(cause_other)",closed:"Closed",open:"Open",pending:"Pending"},delete_success_message:"$t(cause_one, capitalize) deleted successfully",edit_modal_title:"Edit $t(cause_one, capitalize)",entity_name:"$t(cause_one)",fields:{Description_help:"",Description_placeholder:"Enter a description of the $t(cause_one)",Significance:"Significance",Significance_help:"",Title:"Title",Title_help:"",Title_placeholder:"Enter a $t(cause_one) title"},loading_message:"Loading $t(cause_other, capitalize)",registerHelp:[{content:"",title:""}],register_title:"$t(cause_other, capitalize) Register",tabHelp:[{content:"",title:""}],tab_title:"$t(cause_other, capitalize)",update_success_message:"$t(cause_one, capitalize) updated successfully"},pp="Clear filter",mp="Close",_p="Close modal",fp={entity_name:"colours",tab_title:"Colours",form_title:"Dashboard Colour Editor"},yp={action:"Action",action_performed_by:"Performed by",approved_by:"Approved by",approvers:"$t(approver_other, capitalize)",assessmentDepartments:"Assessment $t(department_other)",associations:"Associations",attested_at:"Attested at",blank:"Blank",contributor:"Contributor",contributors:"Contributors",created_by_id:"Created by ID",created_by_username:"Created by",created_on:"Created on",currentApprovers:"Current $t(approver_other)",date:"Date",datetime:"Date / time",departments:"$t(department_other, capitalizeAll)",description:"Description",expires_at:"Expires at",guid:"Guid",id:"ID",item:"Item",nextApprovers:"Next $t(approver_other)",owner:"Owner",owners:"Owners",parentGuid:"Parent Guid",parentId:"Parent ID",parentName:"Parent Name",parentType:"Parent Type",requested_by:"Requested by",requesters:"Requested by",status:"Status",tags:"Tags",title:"Title",transferred_from:"Transferred from",type:"Type",unscheduled:"Unscheduled",updated_by_id:"Updated by ID",updated_by_username:"Updated by",updated_on:"Updated on",user:"User"},hp={add_button:"Add $t(compliance_monitoring_assessment_one, capitalize) ",add_rating_button:"Add rating",assessmentTypes:{document_assessment:"$t(document_one, capitalizeAll) $t(compliance_monitoring_assessment_one, capitalizeAll)",obligation_assessment:"$t(obligation_one, capitalizeAll) $t(compliance_monitoring_assessment_one, capitalizeAll)"},columns:{AssessedItems:"Assessed items",CompletionBy:"Completed by",CompletionDate:"Completion date",NextTestDate:"Next assessment date",Outcome:"Compliance outcome",Owner:"Owner",ParentTitle:"Parent title",Result:"Result",StartDate:"Start date",Status:"Status",TargetCompletionDate:"Target completion date",Title:"Title",Type:"Type",created_by_id:"Created by ID",created_by_username:"Created by",created_on:"Created on",id:"ID",updated_by_id:"Updated by ID",updated_by_username:"Updated by",updated_on:"Last updated"},confirm_delete_message:"Are you sure you want to delete the $t(compliance_monitoring_assessment_one)?",create_new_button:"Add $t(compliance_monitoring_assessment_one, capitalizeAll)",create_success_message:"$t(compliance_monitoring_assessment_one, capitalize) added successfully",create_title:"Add $t(compliance_monitoring_assessment_one, capitalize)",delete_button:"Delete $t(compliance_monitoring_assessment_one, capitalize)",delete_modal_title:"Delete $t(compliance_monitoring_assessment_one, capitalize)",delete_success_message:"$t(compliance_monitoring_assessment_one, capitalize) deleted successfully",entity:"$t(compliance_monitoring_assessment_one)",entity_name:"$t(compliance_monitoring_assessment_one)",fallback_title:"$t(compliance_monitoring_assessment_one, capitalize)",fields:{ActualCompletionDate:"Actual completion date",ActualCompletionDate_help:"",ActualCompletionDate_placeholder:"Select the completion date",CompletedBy:"Completed by",CompletedBy_help:"",CompletedBy_placeholder:"Please select a user",Contributor_help:"",NextTestDate:"Next assessment date",NextTestDate_help:"",Outcome:"Compliance outcome",Outcome_help:"",Outcome_placeholder:"",Owner:"Owner",Owner_help:"",Result:"Result",StartDate:"Start date",StartDate_help:"",StartDate_placeholder:"Select a start date",Status:"Status",Status_help:"",Summary:"Summary",Summary_help:"",Summary_placeholder:"Enter a summary of the activity performed",TargetCompletionDate:"Target completion date",TargetCompletionDate_help:"",TargetCompletionDate_placeholder:"Select target completion date",Title:"Title",Title_help:"",Title_placeholder:"Enter a title"},loading_message:"Loading $t(compliance_monitoring_assessment_other)",outcome:"Outcome",registerHelp:[{content:"",title:""}],register_title:"$t(compliance_monitoring_assessment_other, capitalizeAll) Register",status:{complete:"Complete",inprogress:"In progress",notstarted:"Not started"},summary_category_titles:{assessment_in_progress:"$t(rating_one, capitalize) in-progress",due:"Due",not_meeting:"Not meeting",overdue:"Overdue",total:"All $t(compliance_monitoring_assessment_other)"},tabHelp:[{content:"",title:""}],tab_title:"$t(compliance_monitoring_assessment_other, capitalize)",update_success_message:"$t(compliance_monitoring_assessment_one, capitalize) updated successfully"},gp="Confirm",Ip="Yes, delete",bp="Yes, remove",Tp={add_button:"Add $t(consequence_one, capitalize)",columns:{assessmentDepartments:"Assessment $t(department_other)",costFinancial:"Cost ($t(currency))",costHours:"Cost (hours)",costNumber:"Cost (number)",costType:"Cost type",costValue:"Cost value",criticality:"Criticality",description:"Description",issue:"$t(issue_one, capitalize)",issueClosedDate:"$t(issue_one, capitalize) Closed Date",issueId:"$t(issue_one, capitalize) Id",issueOwner:"$t(issue_one, capitalize) Owner",issueRaisedDate:"$t(issue_one, capitalize) Raised Date",issueSeverity:"$t(issue_one, capitalize) Severity",issueStatus:"$t(issue_one, capitalize) Status",issueType:"$t(issue_one, capitalize) Type",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(consequence_other)?",costType:{customers_impacted:"Customers impacted",financial:"Financial ($t(currency))",hours:"Hours",number:"Number"},create_modal_title:"Add $t(consequence_one, capitalize)",dashboard:{all:"All $t(consequence_other)"},edit_modal_title:"Edit $t(consequence_one, capitalize)",entity_name:"$t(consequence_one)",fields:{CostType:"Cost type",CostType_help:"",CostValue:"Cost value",CostValue_help:"",CostValue_placeholder:"Enter a value",Criticality:"Criticality",Criticality_help:"",Description:"Description",Description_help:"",Description_placeholder:"Enter a description of the $t(consequence_one)",Issue:"$t(issue_one, capitalize)",Issue_help:"",Title:"Title",Title_help:"",Title_placeholder:"Enter $t(consequence_one, article) title",Type:"Type",Type_help:""},loading_message:"Loading $t(consequence_other)",registerHelp:[{content:"",title:""}],register_title:"$t(consequence_one, capitalize, plural) Register",tabHelp:[{content:"",title:""}],tab_title:"$t(consequence_other, capitalize)",totals_ribbon:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},types:{customer:"Customer",financial:"Financial",legal_and_regulatory:"Legal & Regulatory",operational:"Operational",reputational:"Reputational"}},Ap="$t(control_one, capitalize)",Cp="control group",vp={add_button:"Add $t(controlGroup, capitalizeAll)",columns:{description:"Description",linked_controls:"Linked $t(control_one, capitalizeAll, plural)",owner_id:"Owner Id",owner_username:"Owner",title:"Title"},confirm_delete_message:"Are you sure you want to delete this control group? Don't worry, we won't delete any controls that are linked to it",create_button:"Add $t(controlGroup, capitalizeAll)",create_modal_title:"Add $t(controlGroup, capitalizeAll)",create_new_button:"Add $t(controlGroup, capitalizeAll)",create_success_message:"$t(controlGroup, capitalize) added successfully",delete_button:"Delete $t(controlGroup, capitalizeAll)",delete_success_message:"$t(controlGroup, capitalize, plural) deleted successfully",detailsHelp:[{content:"",title:""}],entity_name:"$t(controlGroup)",fallback_title:"$t(controlGroup, capitalizeAll)",fields:{Description_help:"",Description_placeholder:"Enter a description of the control group",Owner:"Owner",Owner_help:"",Title:"Title",Title_duplicate:"You have another control group with this title. Please enter a unique value.",Title_help:"",Title_placeholder:"Enter a title for your control group"},loading_message:"Loading $t(controlGroup, plural)",registerHelp:[{content:"",title:""}],register_title:"$t(controlGroup, capitalizeAll, plural)",tab_title:"$t(controlGroup, capitalizeAll, plural)",update_success_message:"$t(controlGroup, capitalize) updated successfully"},$p="Control test details",Dp="Control test result",Pp="Control type",wp={entity_name:"$t(controlled_one, capitalize) rating",fields:{impact:"$t(controlled_one, capitalize) $t(impact_one)",likelihood:"$t(controlled_one, capitalize) $t(likelihood_one)",nextTestDate:"Next test date",rating:"$t(controlled_one, capitalize) rating",rationale:"Rationale",rationale_placeholder:"Enter a rationale"},tab_title:"$t(controlled_one, capitalize) rating"},Rp={add_button:"Add $t(control, capitalize)",add_linked_control:"Link Control",suggest_controls:"Suggest Controls",columns:{control_groups:"$t(control_one, capitalize) $t(control_group_other)",description:"$t(control_one, capitalize) description",design_effectiveness:"Design effectiveness",details_link:"$t(control_one, capitalize) link",effectiveness:"Overall Effectiveness",effectiveness_trend:"$t(control_one, capitalize) test trend",issues:"$t(issue_other, capitalize)",latest_rating_date:"Latest rating date",linked_indicators:"Linked $t(indicator_other)",nextTestOverdue:"Next test overdue",next_test_date:"Next test date",open_actions:"Open $t(action_other)",open_issues:"Open $t(issue_other)",owner:"Owner",owner_id:"Owner Id",contributor:"Contributor",owner_name:"$t(control_one, capitalize) owner",parent_risk_id:"Associated $t(risk_one) Id",parent_title:"Association",parent_type:"Parent type",performance_effectiveness:"Performance effectiveness",test_frequency:"Test frequency",title:"Title",type:"Type",testScheduleStatus:"Test schedule status"},confirm_delete_message:"Are you sure you want to delete these $t(control_other)?",create_button:"Add $t(control, capitalize)",create_modal_title:"Add $t(control, capitalize)",create_success_message:"$t(control, capitalize) added successfully",dashboard:{all:"All $t(taxonomy:control, plural)"},deleteWarning:"Warning: Deleting this $t(control_one) will delete it for all users and linked items.",delete_button:"Delete $t(control, capitalize)",delete_success_message:"$t(control, capitalize, plural) deleted successfully",entity_name:"$t(control)",fallback_title:"$t(control, capitalize)",fields:{Contributor_help:"",Description:"Description",Description_help:"",Description_placeholder:"Enter a description",NextTestDate:"Next test date",NextTestDate_help:"",Owner_help:"",TestFrequency:"Test frequency",TestFrequency_help:"",TestFrequency_placeholder:"Select",Title:"Control title",Title_help:"",Title_placeholder:"Enter a title",Type:"Control type",Type_help:""},help:[{content:"",title:""}],loading_message:"Loading $t(control, plural)",registerHelp:[{content:"",title:""}],register_title:"$t(control, capitalize) Register",tabHelp:[{content:"",title:""}],tab_title:"$t(control, capitalize, plural)",title_groups:{createdControls:"Created controls",library:"Library"},type:{Corrective:"Corrective",Detective:"Detective",Directive:"Directive",Preventive:"Preventive"},unlinkInsteadLink:"Unlink instead?",update_success_message:"$t(control, capitalize) updated successfully"},Sp="Add",kp="{{entity, capitalize}} added successfully",Up="add version",Op="GBP",Bp={confirm_delete_message:"Are you sure you want to delete this field? This field will be removed, and all associated data will no longer be visible.",create_modal_title:"Add custom field",create_success_message:"Added custom field",entity_name:"Custom field",fieldTypes:{date:"Date",departmentmultiselect:"Department",link:"Link",multiselect:"Multiselect",select:"Dropdown",text:"Text",textarea:"Text area",usermultiselect:"User"},fields:{originalLabel:"Original label",customLabel:"Custom label",add_dropdown_option:"Add option",conditions:"Conditions",defaultValue:"Default value",description:"Guidance",description_placeholder:"Enter guidance",hidden:"Hidden",label:"Label",label_alt:"Label value",label_alt_description:"This is a code which will be used in place of the label in any data exports.",label_alt_placeholder:"Enter label value",label_placeholder:"Enter label name",option:"Option",option_alt:"Option {{index}} value",option_alt_description:"This is a code which will be used in place of the option label in any data exports.",option_alt_placeholder:"Enter option value",option_placeholder:"Enter option value",options:"Options",readOnly:"Read only",required:"Required",setDefaultValue:"Set default value",show_alt_values:"Show values",show_alt_values_description:"When enabled, you can choose to export either the field names or their stored values from the register",type:"Field type",type_placeholder:"Select"},save:"Add"},qp={columns:{createdById:"Created by ID",createdByUsername:"Created by",createdOn:"Created on",guid:"Id",title:"Title",updatedById:"Updated by ID",updatedByUsername:"Updated by",updatedOn:"Last updated"},confirm_delete_message:"Are you sure you want to delete this custom datasource?",create_new_button:"Add custom datasource",create_title:"Add Custom Datasource",data_request_failure_message:"Failed to retrieve report",datasource_not_found_message:"Custom datasource not found",delete_button:"Delete",delete_modal_title:"Delete custom datasource",edit_button:"Edit",entity_name:"Datasource",fieldSelectionForm:{fields:{label:"Edit field title",labelPlaceholder:"Enter a title"}},field_selection:{edit_modal_title:"Select fields",entity_name:"Field selection"},fields:{dataSource:"Data source",dataSource_placeholder:"Select a datasource",fields:"Fields",filters:"Filters",title:"Title",title_placeholder:"Enter a title"},help:[{content:"",title:""}],joinTypes:{leftJoin:"Return {{parents,lowercase}} without {{children,lowercase}}"},latestOnly:"Latest only",preview_button:"Preview",registerHelp:[{content:"",title:""}],register_title:"Custom Datasources",save_button:"Save",select_Fields_button:"Select fields",view_details:"View {{entity}} details"},Np={back_button_label:"Back",cancel_button_label:"Cancel",save_button_label:"Save for later",submit_button_label:"Submit"},Fp={addFilterButton:"Add another filter",editRibbon:"Edit Filters",record_updated_by_another_user:"Record may have been updated by another user. Try submitting again.",removeFilterButton:"Remove Filter",restoreDefaultsButton:"Restore defaults filters",restoreDefaultsDescription:"Would you like to restore filters to the recommended defaults?",ribbon_alert:"Any saved changes will update the filters for this register for all users",dragConfigSliderToggleLabel:"Toggle Bounciness",dragConfigSliderMessage:"Use this slider to change how bouncy the drag animation is. Don't worry, changing this won't affect anything else in the app."},Ep={add_button:"Add Role",confirm_delete_message:"Are you sure you want to delete this role? This will remove the role from all users who have been assigned it.",columns:{createdByUser:"Created by",createdAtTimestamp:"Created on",memberCount:"Members",description:"Description",roleName:"Name",modifiedByUser:"Updated by",modifiedAtTimestamp:"Updated on"},create_modal_title:"Add role",create_success_message:"Role added successfully",delete_button:"Delete role",delete_success_message:"Role deleted successfully",entity_name:"Role",fields:{description:"Description",description_help:"Enter a description for the role",description_placeholder:"Enter a role description",roleName:"Name",roleName_help:"Enter a name for the role",roleName_placeholder:"Enter a role name",assignedUsers:"Assigned users",assignedUsers_help:"Select users to assign this role to",assignedRoles:"Assigned permissions",assignedRoles_help:"Select permissions to assign to this role",permission:"Permission",managerRole:"Manager",viewerRole:"Viewer"},loading_message:"Loading roles",manage_permissions:"Manage permissions",registerHelp:[{content:"",title:""}],tabs:{details:"Role details"},register_title:"Roles",tab_title:"Roles",update_success_message:"Role updated successfully"},Mp=JSON.parse(`{"actions":{"addWidget":"Add widget","clear":"Clear","edit":"Edit","export":"Export (PDF)","exportZip":"Export all images (ZIP)","exportZipStarted":"Exporting dashboard images","exportZipFailed":"Failed to export dashboard images","new":"New","save":"Save","saveAs":"Save as"},"actions_button":"$t(action_other, capitalizeAll)","add_button":"Add widget","aggregationTypes":{"avg":"Mean","count":"Count","distinctCount":"Distinct count","max":"Max","min":"Min","sum":"Sum"},"board_navigation_aria_description":"Click on non-empty item to move focus over","board_navigation_aria_label":"Board navigation","chartTypes":{"bar":"Bar Chart","donut":"Donut Chart","kpi":"Tile","pie":"Pie Chart","radar":"Radar Chart","stacked-bar":"Stacked Bar Chart","table":"Table"},"confirm_delete_message":"Are you sure you want to delete this dashboard?","conflicted_with":"Conflicts with {{items}}","count":"Count","customise":"Customise","delete_dashboard":"Delete dashboard","departments_selected_one":"{{count}} $t(department_one) selected","departments_selected_other":"{{count}} $t(department_other) selected","description_label":"Description (optional)","disturbed_items":"Disturbed {{count}} items.","dnd_committed":"{{operation}} committed","dnd_discarded":"{{operation}} discarded","drag_handle":"Drag handle","drag_handle_description":"Use Space or Enter to activate drag, arrow keys to move, Space or Enter to submit, or Escape to discard.","dragging":"Dragging","edit_dashboard":"Edit dashboard","empty":"Empty","empty_dashboard_body":"You don't have any widgets added to your dashboard","empty_dashboard_title":"Your dashboard is empty","empty_palette_body":"You don't have any more widgets to add","entity_name":"Dashboard","filter":"Filter","filter_by_date":"Filter by date","filter_by_departments":"Filter by $t(department_other)","filter_by_tags":"Filter by tags","filters_alert":"You have {{count}} filters applied","help":[{"content":"","title":""}],"item_inserted":"Item inserted to {{position}}.","item_moved":"Item moved to {{position}}.","item_removed":"Removed item {{item}}.","item_resized":"Item resized to {{size}}.","live_announcement_dnd_discarded":"Insertion discarded","live_announcement_dnd_started":"Dragging","load_dashboard_error":"Something went wrong!","myItemsDashboard":{"entity_name":"$t(item_one)","fields":{"DueDate":"Due Date","Status":"Status","Title":"Title","Type":"Type"},"filters":{"contributor":"$t(contributor_one, capitalize)","direct":"Direct","groupContributor":"Group $t(contributor_one, capitalize)","groupOwner":"Group $t(owner_one, capitalize)","inherited":"Inherited","owner":"$t(owner_one, capitalize)","placeholder":"Choose options"},"ribbonTitles":{"actions":"My $t(action_other, capitalize)","approvals":"My Pending $t(approval_other, capitalize)","assessments":"My $t(assessment_other, capitalize)","attestations":"My $t(attestation_other, capitalize)","controls":"My $t(control_other, capitalize)","issues":"My $t(issue_other, capitalize)","documents":"My $t(document_other, capitalize)","indicators":"My $t(indicator_other, capitalize)","obligations":"My $t(obligation_other, capitalize)","rcsaActivities":"My RCSA $t(activity_other, capitalize)","risks":"My $t(risk_other, capitalize)"},"widgets":{"myDueItems30Days":{"description":"$t(my_item_other, capitalize) requiring action that are due in the next 30 days (or overdue)","title":"My Due next 30 days"},"myDueItems7Days":{"description":"$t(my_item_other, capitalize) requiring action that are due in the next 7 days (or overdue)","title":"My Due next 7 days"}}},"my_items_filters_alert":"Click-throughs are disabled when inherited filters are applied","my_items_page_title":"My Items","my_items_toggle":"My Items","name_label":"Name","no_data_body":"There is no data available","no_data_title":"No data available","not_specified_label":"Not specified","overall_page_title":"Dashboard","overall_toggle":"Dashboard","palette_navigation_aria_description":"Click on an item to move focus over","palette_navigation_aria_label":"Items palette navigation","percentage":"Percentage","remove_button":"Remove","resize_handle":"Resize handle","resize_handle_description":"Use Space or Enter to activate resize, arrow keys to move, Space or Enter to submit, or Escape to discard.","resizing":"Resizing","save_dashboard":"Save dashboard","save_dashboard_error":"Something went wrong!","select_dashboard_placeholder":"Select dashboard","shared_with_you_by":"(shared with you by {{user}})","sharing_custom":"Shared with specific users and user groups","sharing_label":"Sharing","sharing_organisation":"Everyone in your organisation","sharing_user_only":"Private","side_panel_title":"Widgets","tags_selected_one":"{{count}} tag selected","tags_selected_other":"{{count}} tags selected","units":{"day":"Day","days":"Days","total":"Total"},"widgetSettings":{"fields":{"aggregateField":"Aggregation field","aggregateFieldPlaceholder":"Select aggregate field","aggregateFunction":"Aggregate function","aggregateFunctionPlaceholder":"Aggregate function","category":"Category","categoryPlaceholder":"Select category","chartType":"Chart Type","chartTypePlaceholder":"Select chart type","customTitle":"Custom Title","customUnit":"Custom Unit","dataSource":"Data source","dataSourcePlaceholder":"Select data source","datePrecision":"Date Precision (optional)","datePrecisionPlaceholder":"Select date precision","filtering":"Filtering (optional)","ignoreDashboardDateFilter":"Ignore Dashboard Date Filter","invertBarChartAxis":"Invert X&Y Axis","showFilters":"Show Inline Filters","showAsPercentage":"Show values as percentages","subCategory":"Sub category (optional)","subCategoryPlaceholder":"Select category"}},"widget_filter_placeholder":"Filter widgets","widget_settings":"Widget settings","widgets":{"actionsByStatus":{"description":"A donut chart showing the number of $t(action_other) by status.","title":"$t(action_other, capitalizeAll) by Status"},"averageTimeToIdentify":{"description":"Indicator tile showing the average number of days between $t(issue_other) occurred date and $t(issue_other) identified date.","title":"Average Time To Identify"},"averageTimeToReport":{"description":"Indicator tile showing the average number of days between $t(issue_other) identified date and the date the issue was logged.","title":"Average Time To Report"},"averageTimeToResolve":{"description":"Indicator tile showing the average number of days between Open and Closed $t(issue_other).","title":"Average Time To Resolve"},"complianceRatingsOverTime":{"description":"A line chart showing the results of $t(compliance_one) $t(obligation_one) $t(rating_other) over time.","title":"$t(obligation_one, capitalizeAll) $t(rating_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"$t(obligation_one, capitalizeAll) $t(rating_one)"},"controlEffectiveness":{"description":"Donut chart showing the current $t(control_one) effectiveness performance.","innerMetricDescription":"$t(control_other, capitalize)","title":"$t(control_one, capitalize) Effectiveness"},"controlEffectivenessByDepartment":{"description":"A stacked bar chart showing the effectiveness of $t(control_other) by $t(department_one).","title":"$t(control_one, capitalize) Effectiveness by $t(department_one)"},"controlTestResultsOverTime":{"description":"A line chart showing the results of $t(control_one) $t(control_test_one) results over time.","title":"$t(control_one, capitalizeAll) $t(control_test_one, capitalizeAll) Results Over Time","xTitle":"Date","yTitle":"$t(control_test_one, capitalizeAll) Result"},"controlTestsDueByMonth":{"description":"Bar chart showing the number of $t(control_one) tests due in each month.","seriesTitle":"$t(control_one, capitalizeAll) Tests","title":"$t(control_one, capitalize) Tests Due by Month","yAxisTitle":"No. of $t(control_one) tests raised"},"controlledRiskHeatMap":{"description":"A heatmap that shows the performance of all $t(controlled_one) risks represented on a matrix of $t(likelihood_one) and $t(impact_one).","popover":{"impact":"$t(controlled_one, capitalize) $t(impact_one)","label":"Label","likelihood":"$t(controlled_one, capitalize) $t(likelihood_one)","recordCount":"Record count"},"title":"$t(controlled_one, capitalize) $t(risk_one, capitalizeAll) Heatmap","xAxisTitle":"$t(impact_one, capitalize)","yAxisTitle":"$t(likelihood_one, capitalize)"},"controlledRiskRatingByDepartment":{"description":"A stacked bar chart showing the $t(controlled_one) $t(risk_one) rating of risks by $t(department_one).","title":"$t(controlled_one, capitalize) $t(risk_one, capitalize) Rating by $t(department_one)"},"controlledRiskRatingsOverTime":{"description":"A line chart showing the $t(rating_other) of individual $t(controlled_one) $t(risk_other) over time.","title":"$t(controlled_one, capitalizeAll) $t(risk_one, capitalizeAll) $t(rating_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"$t(risk_one, capitalizeAll) $t(rating_one, capitalizeAll)"},"customDataSourceWidget":{"configure_button":"Configure Widget","description":"A widget based on data from a custom data source","not_configured":"Configure this widget to display data in a chart.","not_configured_title":"Not configured","title":"Custom Data Source Widget"},"documentReviewsDueByMonth":{"description":"Bar chart showing the number of $t(document_one) reviews due in each month.","title":"$t(document_one, capitalize) Reviews Due by Month"},"documentRatingsOverTime":{"description":"A line chart showing $t(document_one) $t(rating_other) over time.","title":"$t(document_one, capitalizeAll) $t(rating_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"$t(document_one, capitalizeAll) $t(rating_other, capitalizeAll)"},"gigawidget":{"configure_button":"Configure Widget","description":"A widget that can be configured to display many different types of data.","not_configured":"Configure this widget to display data in a chart.","not_configured_title":"Not configured","title":"Smart Widget"},"indicatorsDeteriorating":{"description":"The total number of indicators that are deteriorating.","title":"$t(indicator_other, capitalizeAll) - Deteriorating"},"indicatorsImproving":{"description":"The total number of indicators that are improving.","title":"$t(indicator_other, capitalizeAll) - Improving"},"indicatorsOutOfTolerance":{"description":"The total number of indicators out of tolerance.","title":"$t(indicator_other, capitalizeAll) - Out of Tolerance"},"indicatorResultsOverTime":{"description":"A line chart showing $t(indicator_one) $t(indicator_result_other) over time. This chart only supports numeric $t(indicator_result_other).","title":"$t(indicator_one, capitalizeAll) $t(indicator_result_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"$t(indicator_one, capitalizeAll) $t(indicator_result_other, capitalizeAll)"},"indicatorsStable":{"description":"The total number of indicators that are stable.","title":"$t(indicator_other, capitalizeAll) - Stable"},"issueByRaisedMonth":{"description":"Bar chart showing the number of open $t(issue_other) raised in each month.","seriesTitle":"$t(issue_other, capitalizeAll)","title":"$t(issue_other, capitalizeAll) by Raised Month","yAxisTitle":"No. of $t(issue_other) raised"},"issueCauses":{"description":"Donut chart showing the causes for issues raised.","innerMetricDescription":"$t(issue_other, capitalizeAll) Raised","title":"$t(issue_other, capitalizeAll) Causes"},"issueRaisedSeverityByMonth":{"description":"A stacked bar chart showing the severity of $t(issue_other) raised by month.","title":"$t(issue_one, capitalize) Raised Severity by Month"},"issuesRaisedInPeriod":{"description":"The total number of issues raised in a given period.","title":"$t(issue_other, capitalizeAll) Raised in Period"},"issuesTable":{"description":"A list of all $t(issue_other).","title":"$t(issue_other, capitalizeAll) Table"},"oldestOpenIssue":{"description":"Indicator tile showing the number of days that the oldest open $t(issue_one) has been open.","title":"Oldest Open $t(issue_one, capitalizeAll)"},"openActionsByPriority":{"description":"Donut chart showing the number of open $t(action_other) by priority.","innerMetricDescription":"Open $t(action_other, capitalizeAll)","title":"Open $t(action_other, capitalizeAll) by Priority"},"openIssueSeverity":{"description":"Donut chart showing the severity of all open $t(issue_other)","innerMetricDescription":"Open $t(issue_other)","title":"Open $t(issue_one, capitalizeAll) Severity"},"openIssues":{"description":"Indicator tile showing the total number of Open $t(issue_other).","title":"Open $t(issue_other, capitalizeAll)"},"openIssuesByType":{"description":"Donut chart showing the number of open $t(issue_other) by type.","innerMetricDescription":"Open $t(issue_other, capitalizeAll)","noTypeLabel":"No Type","title":"Open $t(issue_other, capitalizeAll) by Type"},"openIssuesOverTime":{"description":"A line chart showing the total number of open $t(issue_other) each day.","title":"Open $t(issue_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"No. of open $t(issue_other)"},"openRiskAcceptances":{"description":"The total number of open $t(risk_one) $t(acceptance_other).","title":"Open $t(risk_one, capitalizeAll) $t(acceptance_other, capitalizeAll)"},"overdueActions":{"description":"Indicator tile showing the total number of Overdue $t(action_other).","title":"Overdue $t(action_other, capitalize)"},"placemat":{"aggregatedScore":"Aggregated Score","aggregatedScoreSummary":"Aggregate Score Summary","aggregatedSuggestion":"Aggregated Suggestion","impactScore":"Impact Score","impactSummary":"Impact Summary","impactsAssessment":"$t(impact_one, capitalize) Assessment","likelihood":"$t(likelihood_one, capitalize)","likelihoodSummary":"Likelihood Summary","opportunityVsAction":"Opportunity vs Action","principalRisks":"Principal Risks"},"richText":{"configure_button":"Configure Widget","description":"A widget that can be configured to display rich text.","not_configured":"Configure this widget to display text.","not_configured_title":"Not configured","title":"Text"},"risksByControlledRiskRating":{"description":"A donut chart showing the number of $t(risk_one) by $t(controlled_one) $t(risk_one) rating.","title":"$t(risk_one, capitalizeAll) by $t(controlled_one, capitalize) $t(risk_one, capitalizeAll) Rating"},"risksByUncontrolledRiskRating":{"description":"A donut chart showing the number of $t(risk_one) by $t(uncontrolled_one) $t(risk_one) rating.","title":"$t(risk_one, capitalizeAll) by $t(uncontrolled_one, capitalize) $t(risk_one, capitalizeAll) Rating"},"sumOfCustomersConsequencesByType":{"description":"A pie chart showing the sum of customers consequences by type.","title":"Sum of $t(consequence_other, capitalizeAll) by Type (Customers Impacted)"},"sumOfFinancialConsequencesByType":{"description":"A pie chart showing the sum of financial consequences by type.","title":"Sum of $t(consequence_other, capitalizeAll) by Type (Financial)"},"sumOfHoursConsequencesByType":{"description":"A pie chart showing the sum of hours consequences by type.","title":"Sum of $t(consequence_other, capitalizeAll) by Type (Hours)"},"sumOfNumberConsequencesByType":{"description":"A pie chart showing the sum of number consequences by type.","title":"Sum of $t(consequence_other, capitalizeAll) by Type (Numbers)"},"uncontrolledRiskHeatMap":{"description":"A heatmap that shows the performance of all $t(uncontrolled_one) risks represented on a matrix of $t(likelihood_one) and $t(impact_one).","popover":{"impact":"$t(uncontrolled_one, capitalize) $t(impact_one)","label":"Label","likelihood":"$t(uncontrolled_one, capitalize) $t(likelihood_one)","recordCount":"Record count"},"title":"$t(uncontrolled_one, capitalize) $t(risk_one, capitalizeAll) Heatmap","xAxisTitle":"$t(impact_one, capitalize)","yAxisTitle":"$t(likelihood_one, capitalize)"},"uncontrolledRiskRatingByDepartment":{"description":"A stacked bar chart showing the $t(uncontrolled_one) $t(risk_one) rating of risks by $t(department_one).","title":"$t(uncontrolled_one, capitalize) $t(risk_one, capitalize) Rating by $t(department_one)"},"uncontrolledRiskRatingsOverTime":{"description":"A line chart showing the $t(rating_one) of individual $t(uncontrolled_one) $t(risk_other) over time.","title":"$t(uncontrolled_one, capitalizeAll) $t(risk_one, capitalizeAll) $t(rating_other, capitalizeAll) Over Time","xTitle":"Date","yTitle":"$t(risk_one, capitalizeAll) $t(rating_one, capitalizeAll)"}}}`),zp={activeScheduleInfoText:"There is currently an active export. Creating a new schedule will deactivate the previous one.",download:"One-Off Download",dataExportFormHeader:"Data Export Configuration",entity_name:"Data export",errorEndDateBeforeStartDate:"End date must be after start date",errorEndDateInPast:"End date must be in the future",errorStartDateInPast:"Start date must be in the future",errorWeeklyScheduleTooShort:"Weekly schedules require at least 7 days between start and end date to ensure at least one execution",errorMonthlyScheduleSameMonth:"Monthly schedules require the end date to be in a different month than the start date",errorFolderCannotBeUrl:"Folder path cannot contain URL",errorFolderNoLeadingTrailingSlash:"Folder path cannot start or end with a slash",errorRequired:"Required",exportFailedHeader:"Export failed",exportFailedMessage:"Something went wrong",exportSuccessDownloadText:"Download now",exportSuccessHeader:"Export successful",exportSuccessMessage:"Link expires in",exportSuccessMessageTimeUnit:"minutes",formFieldAccessKey:"Access key",formFieldAccountName:"Account name",formFieldBucketName:"Bucket name",formFieldContainerName:"Container name",formFieldCronExpression:"Cron expression",formFieldEndDate:"End date",formFieldEndTime:"End time",formFieldEntraClientId:"Entra client ID",formFieldEntraSecretValue:"Entra secret value",formFieldEntraTenantId:"Entra tenant ID",formFieldFrequency:"Frequency",formFieldHostname:"Hostname",formFieldPassword:"Password",formFieldPort:"Port",formFieldS3Folder:"Folder",formFieldSftpFolder:"Folder",formFieldSPFolder:"Folder",formFieldSasToken:"SAS token",formFieldSecretAccessKey:"Secret access key",formFieldSharePointDriveId:"SharePoint drive ID",formFieldSharePointSiteId:"SharePoint site ID",formFieldStartDate:"Start date",formFieldStartTime:"Start time",formFieldStorageType:"Storage type",formFieldUsername:"Username",frequencyLabelDaily:"Daily",frequencyLabelMonthly:"Monthly",frequencyLabelWeekly:"Weekly",frequencyTooltipDaily:"Runs at midnight UTC",frequencyTooltipMonthly:"Runs on the 1st of each month at midnight UTC",frequencyTooltipWeekly:"Runs every Monday at midnight UTC",placeholderAccessKey:"Enter access key",placeholderAccountName:"Enter account name",placeholderBucketName:"Enter bucket name",placeholderContainerName:"Enter container name",placeholderEntraClientId:"Enter Entra client ID",placeholderEntraSecretValue:"Enter Entra secret value",placeholderEntraTenantId:"Enter Entra tenant ID",placeholderHostname:"Enter hostname",placeholderPassword:"Enter password",placeholderPort:"Enter port",placeholderS3Folder:"Enter folder",placeholderSftpFolder:"Enter folder",placeholderSPFolder:"Enter folder",placeholderSasToken:"Enter SAS token",placeholderSecretAccessKey:"Enter secret access key",placeholderSharePointDriveId:"Enter SharePoint drive ID",placeholderSharePointSiteId:"Enter SharePoint site ID",placeholderUsername:"Enter username",scheduleInfoText:"Only one scheduled export can be active at a time. Creating a new schedule will deactivate the previous one.",storageTypeLabelAmazon:"Amazon S3",storageTypeLabelAzure:"Azure Blob Storage",storageTypeLabelSftp:"SFTP",storageTypeLabelSharePoint:"MS SharePoint",tabHeaderTitle:"Data Export Schedule",tabTitle:"Data Export",triggerTestExportButtonLabel:"Test saved configuration",testFailedMessage:"Failed to trigger test export. Please retry",testSuccessMessage:"Test export triggered. Check for errors below after a few minutes.",register_title:"Export Executions",yes:"Yes",no:"No",columns:{executionTimestamp:"Execution time",status:"Status",errors:"Errors",activeSchedule:"Is active schedule",frequency:"Frequency",startDate:"Start date",endDate:"End date"}},xp={confirmDeleteMessage:"Are you sure you want to delete this data import?",create_new_button:"Create Data import",deleteButton:"Delete",delete_modal_title:"Delete Data import",downloadTemplate:"Download {{item}} template",downloadTemplateFailedMessage:"Failed to retrieve csv template",entity_name:"Data import",help:[{content:"",title:""}],tabTitle:"Data Import"},Lp={columns:{importObject:"Import object",message:"Message",rowNumber:"Row number"},entity_name:"Data import error",startImport:"Start import",tabTitle:"Results"},Gp={absoluteModeTitle:"Absolute mode",applyButtonLabel:"Apply",cancelButtonLabel:"Cancel",clearButtonLabel:"Clear and dismiss",customRelativeRangeDurationLabel:"Duration",customRelativeRangeDurationPlaceholder:"Enter a duration",customRelativeRangeOptionDescription:"",customRelativeRangeOptionLabel:"Custom range",customRelativeRangeUnitLabel:"Unit of time",dateTimeConstraintText:"For date, use YYYY/MM/DD.",endDateLabel:"End date",endTimeLabel:"End time",errorIconAriaLabel:"error",missingStartOrEndDateError:"The start date or end date cannot be left empty.",nextMonthAriaLabel:"next month",previousMonthAriaLabel:"previous month",relativeAmountEmptyError:"The duration cannot be left empty.",relativeAmountTooLargeError:"The duration cannot be more than 10 years in the past or future.",relativeModeTitle:"Relative mode",relativeRangeSelectionHeading:"",startDateAfterEndDateError:"The start date must be before the end date.",startDateLabel:"Start date",startTimeLabel:"Start time",todayAriaLabel:"today"},jp="{{entity, capitalize}} deleted successfully",Vp={add_button:"Add $t(department_one, capitalizeAll)",columns:{created_by_user:"Created by",created_on:"Created on",department_type_group:"Group",description:"Description",name:"Name",updated_by_user:"Updated by",updated_on:"Updated on"},confirm_delete_message:"Are you sure you want to delete these $t(department_other)?",create_modal_title:"Add $t(department_one, capitalizeAll)",delete:"Delete",departmentsTableTitle:"$t(department_other, capitalizeAll)",edit_modal_title:"Edit $t(department_one, capitalizeAll)",entity_name:"$t(department_one)",fields:{descriptionField:"Description",groupField:"$t(department_one, capitalizeAll) Group",nameField:"Name",placeholders:{description:"Enter a description",group:"Enter a group",name:"Enter a name"},validation:{uniqueName:"$t(department_one, capitalizeAll) already exists"}},help:[{content:"",title:""}],tagsSelectorLabel:"$t(department_other, capitalizeAll)"},Wp="Design effectiveness",Qp="Details",Hp="Distribute",Yp={add_button:"Add $t(assessment_one, capitalize) ",add_rating_button:"Add rating",columns:{CompletionBy:"Completed by",CompletionDate:"Completion date",Owner:"Owner",ParentTitle:"$t(document_one, capitalize) title",Rating:"Rating",Result:"Result",StartDate:"Start date",Status:"Status",TargetCompletionDate:"Target completion date",Title:"Title"},complianceRatingSubheading:"Compliance monitoring $t(rating_other)",confirm_delete_message:"Are you sure you want to delete these $t(rating_other)?",create_modal_title:"Add $t(rating_one, capitalize)",delete_button:"Delete",delete_modal_title:"Delete $t(rating_one, capitalize)",documentRatingSubheading:"$t(policy_one, capitalize) $t(rating_other)",edit_modal_title:"Edit $t(rating_one, capitalize)",entity_name:"$t(rating_one)",fields:{ActualCompletionDate:"Actual completion date",CompletedBy:"Completed by",Owner:"Owner",Result:"Result",StartDate:"Start date",Status:"Status",Summary:"Summary",Summary_placeholder:"Enter a summary of the activity performed",TargetCompletionDate:"Target completion date",Title:"Title",Title_placeholder:"Enter a title"},internalAuditRatingSubheading:"$t(internal_audit_one, capitalize) $t(rating_other)",latestAssessmentResultTitle:"Latest $t(assessment_one) $t(rating_one)",loading_message:"Loading $t(rating_other, plural)",register_title:"$t(policy_one, capitalize) $t(rating_other, capitalize)",summary_category_titles:{assessment_in_progress:"$t(rating_other, capitalize) in-progress",due:"Due",not_meeting:"Not meeting",overdue:"Overdue",total:"All $t(rating_other, plural)"},tab_title:"$t(rating_other, capitalize)"},Kp={add_button:"Add Version",columns:{attestationStatus:"Attestation status",content:"Text",fileName:"File name",lastPublishedDate:"Last published date",link:"Link",owners:"Owners",publishDate:"Published date",reviewDate:"Last reviewed date",reviewDue:"Next review due",reviewReason:"Review reason",reviewedBy:"Reviewed by",reviewedById:"Reviewed by ID",status:"Status",summary:"Summary",type:"Type",updatedOn:"Updated on",version:"Version"},confirm_close_modal:{message:"Are you sure? Any changes you have made to this version since last saving will be lost.",title:"Confirm"},confirm_delete_message:"Are you sure you want to delete these versions?",create_modal_title:"Add Version",edit_modal_title:"Edit Version",entity_name:"version",fields:{Link:"Link",Link_help:"",NextReviewDate:"Next review date",NextReviewDate_help:"",ReasonForReview:"Reason for review",ReasonForReview_help:"",ReviewDate:"Review date",ReviewDate_help:"",ReviewedBy:"Reviewed by",ReviewedBy_help:"",Status:"Status",Status_help:"",Summary:"Summary",Summary_help:"",Text:"Text",Type:"Type",Type_help:"",Version:"Version number",Version_help:"",Version_placeholder:"Enter a version number",newFile:"Attached file",newFile_help:""},loading_message:"Loading versions",reviewReasons:["Annual review","Minor Revision","Major Revision"],tab_title:"Versions",versionPreview:{created:"Created",latestDraftTitle:"Latest draft",latestPublishedTitle:"Latest published",version:"v.{{version}}",view:"View"}},Jp="Document",Zp="Documents",Xp="Edit",em="Edit Acceptance",tm="Edit Appetite",rm="Effective date",im="Enter value",am="Enter details about test",sm="Enter an appetite statement",nm={addRiskToEnterpriseRisk:{duplicate_error:"$t(risk_one, capitalize) is already linked to the selected $t(enterprise_risk_one) and $t(entity_one).",enterpriseRiskInstructions:"$t(risk_other, capitalize) can only be linked to an $t(enterprise_risk_one) of the same tier. Please note that all existing $t(entity_one) associations will be replaced.",entityInstructions:"Please select the $t(entity_one) you would like to link to this $t(risk_one). Please note that all existing $t(entity_one) associations will be replaced.",linkToEnterpriseRisk:"Add to $t(enterprise_risk_one)",linkToEntity:"Add to $t(entity_one)"},columns:{inherentRatingMean:"$t(uncontrolled_one, capitalize) rating (mean)",inherentRatingWorstCase:"$t(uncontrolled_one, capitalize) rating (worst-case)",residualRatingMean:"$t(controlled_one, capitalize) rating (mean)",residualRatingWorstCase:"$t(controlled_one, capitalize) rating (worst-case)"},confirm_delete_message:"Are you sure you want to delete this $t(enterprise_risk_one)? Risk instances linked to this $t(enterprise_risk_one) will not be deleted.",createNewButton:"Add $t(enterprise_risk_one, capitalizeAll)",createTitle:"Add $t(enterprise_risk_one, capitalizeAll)",create_success_message:"$t(enterprise_risk_one, capitalize) added successfully",dashboard:{add:"Add",loading:"Loading",noItems:"No items found",select:"Select $0",selectionGroupLabel:"Select a $t(enterprise_risk_one)",unlinkedRisks:"Unlinked $t(enterprise_risk_other)"},dashboardHelp:[{content:"",title:""}],dashboardTitle:"$t(dashboard_one, capitalize)",delete_button:"Delete $t(enterprise_risk_one, capitalizeAll)",delete_modal_title:"Delete $t(enterprise_risk_one)",delete_success_message:"$t(enterprise_risk_one, capitalize) deleted successfully",entity_name:"$t(enterprise_risk_one)",fallback_title:"$t(enterprise_risk_one, capitalize)",fields:{description:"Description",parent:"Parent $t(risk_one)",tier:"$t(risk_one, capitalize) tier",title:"$t(risk_one, capitalize) name",treatment:"$t(risk_one, capitalize) treatment"},help:[{content:"",title:""}],instantiateButton:"Add $t(risk_one, capitalize) to $t(legal_entity_other, capitalize)",instantiateDepartments:"Please select the $t(legal_entity_other) you would like to link to this $t(enterprise_risk_one). Default owners of the $t(legal_entity_other) will be added as owners to the newly created $t(risk_other).",instantiateModal:{header:"Add $t(enterprise_risk_one) to $t(legal_entity_other)"},registerHelp:[{content:"",title:""}],registerTitle:"$t(enterprise_risk_one, capitalizeAll) $t(register, capitalize)",update_success_message:"$t(enterprise_risk_one, capitalize) updated successfully"},om={add_button:"Add $t(entity_one, capitalize)",columns:{description:"Description",name:"Name",parent_entity:"Parent entity",weight:"Weight"},createNewButton:"Add $t(entity_one, capitalizeAll)",create_modal_title:"Add $t(entity_one, capitalizeAll)",edit_modal_title:"Edit $t(entity_one, capitalizeAll)",entityTabTitle:"$t(entity_other, capitalize)",entity_name:"object",global:"Global"},lm={Contributor:"Contributor",Contributor_placeholder:"Select people",DateAcceptedFrom:"Date accepted from",DateAcceptedTo:"Date accepted to",Departments:"$t(department_other, capitalizeAll)",Departments_help:"",Description:"Description",Details:"Details",Owner:"Owner",Owner_placeholder:"Select people",Status:"Status",Tags:"Tags",Tags_help:"",Title:"Title",newFiles:"Attach files",newFiles_help:""},dm={fieldOptionalPostfix:"(optional)",fieldRequiredPostfix:""},um={fieldTypes:{date:"Date",dropdown:"Dropdown",multiselect:"Multiselect",number:"Number",radio:"Radio",text:"Text",textArea:"Text Area",url:"Link"},formField:{addConditionalButtonLabel:"Add $t(rule_one)",addFieldButtonLabel:"+ Add $t(field_one)",addFieldModalTitle:"Add $t(field_one, capitalize)",addOptionButtonLabel:"Add $t(option_one)",cancelButtonLabel:"Cancel",conditionalRequiredErrorMessage:"$t(rule_one, capitalize) must have a value",deleteButtonLabel:"Delete",deleteModal:{body:`Are you sure you want to delete this $t(field_one)?

Any logic that relies on this $t(field_one) will also be deleted.

This action cannot be undone.`,header:"Delete"},editFieldModalTitle:"Edit $t(field_one, capitalize)",i18n:{clearFiltersText:"Clear rules",editTokenHeader:"Edit rule",tokenEditorAddNewTokenLabel:"Add new rule",tokenEditorAddTokenActionsAriaLabel:"Add rule actions",tokenEditorTokenRemoveFromGroupLabel:"Remove rule from group",tokenEditorTokenRemoveLabel:"Remove rule"},optionRequiredErrorMessage:"$t(option_one, capitalize) must have a value",saveButtonLabel:"Save"},formSection:{addSectionButtonLabel:"Add $t(section_one, capitalize)",cancelButtonLabel:"Cancel",deleteButtonLabel:"Delete",deleteModal:{body:`Are you sure you want to delete this $t(section_one)?

Any $t(field_other) within this section will also be deleted.

This action cannot be undone.`,header:"Delete"},editSectionButtonLabel:"Edit $t(section_one, capitalize)",saveButtonLabel:"Save"},placeholders:{date:"DD/MM/YYYY",number:"Enter a number...",optionMultiselect:"Select options...",optionSelect:"Select an option...",text:"Type text here...",textArea:"Type text here...",url:"https://example.com"},previewMode:{cancelButtonLabel:"Cancel",modalHeader:"Preview Mode",validateButton:"Test validation"}},cm={adhoc:"Ad Hoc",annually:"Annually",biannually:"Bi-Annually",daily:"Daily",fortnightly:"Fortnightly",fourweekly:"Four Weekly",monthly:"Monthly",quarterly:"Quarterly",weekly:"Weekly"},pm="Groups",mm={field_help:"Info",show_all:"Show all",title:"Help",translation_key:"Translation key"},_m="$t(impact_one)",fm="$t(impact_one, capitalize) appetite",ym={columns:{CompletedBy:"Completed by",Likelihood:"Likelihood",LikelihoodPerformance:"Likelihood performance",Name:"Name",Performance:"Performance",PerformanceRating:"Performance rating",PerformanceScore:"Performance score",RatedItem:"Rated item",Rating:"Rating",RatingScore:"Rating score",Rationale:"Rationale",Status:"Status",TestDate:"Rating date",Type:"Type"},confirm_delete_message:"Are you sure you want to delete these ratings?",create_modal_title:"Add rating",create_new_button:"Add Rating",delete_button:"Delete",delete_modal_title:"Delete rating",edit_modal_title:"Rating",entity_name:"$t(impact_one) rating",fields:{CompletedBy:"Completed by",CompletedBy_help:"",Impact:"$t(impact_one, capitalize)",Impact_help:"",Likelihood:"Likelihood",Likelihood_help:"",Rating:"Rating",Rating_help:"",Rationale:"Rationale",Rationale_help:"",Risk:"Risk",Risk_help:"",TestDate:"Rating date",TestDate_help:""},footerLabels:{PerformanceScore:"Performance score (active)",RatingScore:"Total score (active)"},placeholders:{Rationale:"Enter a description"},registerHelp:[{content:"",title:""}],register_title:"$t(impact_one, capitalize) ratings",tabHelp:[{content:"",title:""}],tab_title:"Ratings"},hm={create_modal_title:"Add impact ratings",create_new_button:"Add Ratings",edit_modal_title:"Add impact ratings",entity_name:"$t(impact_one) rating",fields:{CompletedBy:"Completed by",CompletedBy_help:"",Likelihood:"Likelihood",TestDate:"Rating date",TestDate_help:""},no_rating_guidance:"No rating guidance provided",rating_guidance_description:"Rating Guidance"},gm={columns:{Impact:"$t(impact_one, capitalize)",Name:"Name",PerformanceScore:"Performance Score",RatedItems:"Rated items",Rationale:"Rationale",Title:"$t(impact_one, capitalize) of non-adherence"},confirm_delete_message:"Are you sure you want to delete these $t(impact, plural)?",create_button:"Add $t(impact, capitalize)",create_modal_title:"Add $t(impact_one, capitalize)",create_new_button:"Add $t(impact, capitalize)",create_new_title:"Add $t(impact, capitalize)",create_success_message:"$t(impact, capitalize) added successfully",delete_button:"Delete $t(impact_one, capitalize)",delete_modal_title:"Delete $t(impact_one, capitalize)",delete_success_message:"$t(impact, capitalize, plural) deleted successfully",detailsHelp:[{content:"",title:""}],download:"Download",edit_modal_title:"Edit $t(impact_one, capitalize)",entity_name:"$t(impact)",fallback_title:"Edit $t(impact, capitalize)",fields:{Contributor_help:"",Description:"$t(impact_one, capitalize) of non-adherence",Description_help:"",ImpactAppetite:"$t(impact_one, capitalize) appetite",ImpactAppetite_help:"",ImpactRating:"$t(impact_one, capitalize)",ImpactRating_help:"",LikelihoodAppetite:"$t(likelihood_one, capitalizeAll) appetite",LikelihoodAppetite_help:"",Name:"Name",Name_help:"",Owner_help:"",RatingGuidance:"Rating Guidance",RatingGuidance_help:"",Rationale:"Rationale",Rationale_help:""},loading_message:"Loading Impacts",placeholders:{Description:"Enter the $t(impact) of not adhering to the $t(obligation_one)",Name:"Enter a name",Rationale:"Enter a description"},registerHelp:[{content:"",title:""}],register_title:"$t(impact_one, capitalize) register",tabHelp:[{content:"",title:""}],tab_title:"$t(impact_other, capitalize)",update_success_message:"$t(impact, capitalize) updated successfully"},Im="$t(indicator_one, capitalize)",bm="$t(indicator_result_one, capitalize)",Tm={columns:{conformance:"Conformance",conformance_trend:"Conformance trend",date_time:"Date and time",description:"Details",modified_by:"Submitted by",percentage_change:"Percentage change",result:"Result"},confirm_delete_message:"Are you sure you want to delete these $t(indicator_other)?",create_modal_title:"Add $t(indicator_result_one, capitalizeAll)",create_new_button:"Add $t(indicator_result_one, capitalize)",delete_button:"Delete $t(indicator_result_one, capitalize)",delete_modal_title:"Delete $t(indicator_result_one, capitalizeAll)",edit_modal_title:"Edit $t(indicator_result_one, capitalizeAll)",entity_name:"$t(indicator_result_one, capitalize)",fields:{date:"Date",description:"Details",description_placeholder:"Enter details about the metric",num_result:"Result",result_placeholder:"Enter the result",text_result:"Result"},loading_message:"Loading $t(indicator_result_other)",tabHelp:[{content:"",title:""}],tab_title:"$t(indicator_result_other, capitalize)"},Am={columns:{conformance:"Conformance",conformance_trend:"Conformance Trend",details_link:"$t(indicator_one, capitalizeAll) link",latest_result:"Latest result",latest_result_date:"Latest result date",lower_appetite_num:"Lower appetite",lower_tolerance_num:"Lower tolerance",nextTestDate:"Next test date",nextTestOverdue:"Next test overdue",parent_title:"Parent",parent_type:"Parent type",previous_result:"Previous result",target_text_value:"Expected Text",test_frequency:"Frequency",testScheduleStatus:"Test schedule status",title:"Name",unit:"Unit",updated_on:"Last updated",upper_appetite_num:"Upper appetite",upper_tolerance_num:"Upper tolerance"},confirm_delete_message:"Are you sure you want to delete this $t(indicator_one)?",create_modal_title:"Add $t(indicator_one, capitalizeAll)",create_new_button:"Add $t(indicator_one, capitalize)",delete_button:"Delete $t(indicator_one, capitalize)",delete_title:"Delete $t(indicator_one, capitalize)",detailsHelp:[{content:"",title:""}],edit_modal_title:"Edit $t(indicator_one, capitalizeAll)",entity_name:"$t(indicator_one, capitalize)",fallback_title:"$t(indicator_one, capitalizeAll)",fields:{Contributor_help:"",Owner_help:"",description:"Details",description_help:"",description_placeholder:"Enter details about the test",lower_appetite_num:"Lower appetite",lower_appetite_num_help:"",lower_tolerance_num:"Lower tolerance",lower_tolerance_num_help:"",owner:"Owner",owner_placeholder:"Select a person",target_text_placeholder:"Enter a value",target_text_value:"Expected text value",target_text_value_help:"",test_frequency:"Frequency",test_frequency_help:"",test_frequency_placeholder:"Select",title:"Name",title_help:"",title_placeholder:"Enter a name",tolerance_placeholder:"Value",type:"Indicator type",type_help:"",unit:"Unit",unit_help:"",unit_placeholder:"E.g Days or %",upper_appetite_num:"Upper appetite",upper_appetite_num_help:"",upper_tolerance_num:"Upper tolerance",upper_tolerance_num_help:""},loading_message:"Loading $t(indicator_one)",registerHelp:[{content:"",title:""}],register_title:"$t(indicator_other, capitalizeAll)",summary_titles:{control_indicators:"$t(control_one, capitalize) indicators",outside_tolerance:"Outside tolerance",risk_indicators:"$t(risk_one, capitalize) indicators",total:"Total $t(indicator_other)",within_tolerance:"Within tolerance"},tabHelp:[{content:"",title:""}],tab_title:"$t(indicator_other, capitalize)"},Cm={register_title:"$t(finding_other, capitalizeAll)",dashboard:{all:"All $t(finding_other)",complete:"Complete",in_progress:"In progress",not_started:"Not started"}},vm={add_button:"Add $t(internal_audit_report_one, capitalize) ",add_rating_button:"Add rating",assessmentTypes:{document_assessment:"$t(document_one, capitalizeAll) $t(internal_audit_report_one, capitalizeAll)",obligation_assessment:"$t(obligation_one, capitalizeAll) $t(internal_audit_report_one, capitalizeAll)"},columns:{AssessedItems:"Assessed items",CompletionBy:"Completed by",CompletionDate:"Completion date",NextTestDate:"Next audit date",Outcome:"Report outcome",Owner:"Owner",ParentTitle:"Parent title",Result:"Result",StartDate:"Start date",Status:"Status",TargetCompletionDate:"Target completion date",Title:"Title",Type:"Type",created_by_id:"Created by ID",created_by_username:"Created by",created_on:"Created on",id:"ID",updated_by_id:"Updated by ID",updated_by_username:"Updated by",updated_on:"Last updated"},confirm_delete_message:"Are you sure you want to delete the $t(internal_audit_report_one)?",create_new_button:"Add $t(internal_audit_report_one, capitalizeAll)",create_success_message:"$t(internal_audit_report_one, capitalize) added successfully",create_title:"Add $t(internal_audit_report_one, capitalize)",delete_button:"Delete $t(internal_audit_report_one, capitalize)",delete_modal_title:"Delete $t(internal_audit_report_one, capitalize)",delete_modal_warning:"This will delete the report and findings from $t(internal_audit_other) but not $t(rating_other), $t(action_other) or $t(issue_other) that have been associated with an underlying entity. This action cannot be undone.",delete_success_message:"$t(internal_audit_report_one, capitalize) deleted successfully",entity:"$t(internal_audit_report_one)",entity_name:"$t(internal_audit_report_one)",fallback_title:"$t(internal_audit_report_one, capitalize)",fields:{ActualCompletionDate:"Actual completion date",ActualCompletionDate_help:"",ActualCompletionDate_placeholder:"Select the completion date",CompletedBy:"Completed by",CompletedBy_help:"",CompletedBy_placeholder:"Please select a user",Contributor_help:"",NextTestDate:"Next audit date",NextTestDate_help:"",Outcome:"Report outcome",Outcome_help:"",Outcome_placeholder:"",Owner:"Owner",Owner_help:"",Result:"Result",StartDate:"Start date",StartDate_help:"",StartDate_placeholder:"Select a start date",Status:"Status",Status_help:"",Summary:"Summary",Summary_help:"",Summary_placeholder:"Enter a summary of the activity performed",TargetCompletionDate:"Target completion date",TargetCompletionDate_help:"",TargetCompletionDate_placeholder:"Select target completion date",Title:"Title",Title_help:"",Title_placeholder:"Enter a title"},loading_message:"Loading $t(internal_audit_report_other)",outcome:"Outcome",registerHelp:[{content:"",title:""}],register_title:"$t(internal_audit_report_other, capitalizeAll) Register",status:{complete:"Complete",inprogress:"In progress",notstarted:"Not started"},summary_category_titles:{assessment_in_progress:"$t(rating_one, capitalize) in-progress",due:"Due",not_meeting:"Not meeting",overdue:"Overdue",total:"All $t(internal_audit_report_other)"},tabHelp:[{content:"",title:""}],tab_title:"$t(internal_audit_report_other, capitalize)",update_success_message:"$t(internal_audit_report_one, capitalize) updated successfully"},$m={add_button:"Add $t(internal_audit_one, capitalize)",columns:{AuditRatingLabelled:"Audit rating",BusinessArea:"Business area",LatestReportDate:"Latest report date",OpenActionCount:"Open actions",OpenIssueCount:"Open issues",Owner:"Owner",ReportStatusLabelled:"Report status",Title:"Title",created_by_id:"Created by ID",created_by_username:"Created by",created_on:"Created on",id:"ID",updated_by_id:"Updated by ID",updated_by_username:"Updated by",updated_on:"Last updated"},confirm_delete_message:"Are you sure you want to delete the $t(internal_audit_one)?",create_new_button:"Add $t(internal_audit_one, capitalizeAll)",create_success_message:"$t(internal_audit_one, capitalize) added successfully",create_title:"Add $t(internal_audit_one, capitalize)",dashboard_category_titles:{businessArea:"Business Area",internalAuditEntity:"Audit Entity",risks:"$t(risk_other, capitalize)"},delete_button:"Delete $t(internal_audit_one, capitalize)",delete_modal_title:"Delete $t(internal_audit_one, capitalize)",delete_success_message:"$t(internal_audit_one, capitalize) deleted successfully",entity:"$t(internal_audit_one)",entity_name:"$t(internal_audit_one)",fallback_title:"$t(internal_audit_one, capitalize)",fields:{BusinessArea:"Business area",BusinessArea_help:"",BusinessArea_placeholder:"Enter a business area",Contributor_help:"",Description:"Description",Description_help:"",Description_placeholder:"Enter a description",Owner:"Owner",Owner_help:"",Title:"Title",Title_help:"",Title_placeholder:"Enter a title"},help:[{content:"",title:""}],linkRisksModal:{create_modal_title:"Link $t(risk_one)",edit_modal_title:"Link $t(risk_one)",entity_name:"$t(risk_one, capitalize)",header:"Link $t(risk_other)",linkButton:"Link",risks:"$t(risk_other, capitalize)"},loading_message:"Loading $t(internal_audit_other)",register_default_filters:{all:"All $t(internal_audit_other)",not_scheduled:"Not scheduled",planned:"Planned",unallocated:"Unallocated"},registerHelp:[{content:"",title:""}],register_title:"$t(internal_audit_other, capitalizeAll) Register",riskTab:{addButton:"Link $t(risk_other)",confirmDeleteMessage:"Are you sure you want to remove these linked $t(risk_other)",entity_name:"$t(risk_other)",header:"$t(risk_other, capitalize)",loadingMessage:"Loading $t(risk_other)",removeButton:"Unlink $t(risk_other)"},tabHelp:[{content:"",title:""}],tab_title:"$t(internal_audit_other, capitalize)",universe:{create_new_button:"Add Audit Entity",help:[{content:"",title:""}],itemSelection:"Item selection",select:"select",title:"Audit Universe"},update_success_message:"$t(internal_audit_one, capitalize) updated successfully"},Dm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issue_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issue_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issue_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Pm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueBreachLog_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueBreachLog_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueBreachLog_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},wm={disclosure:"Disclosure",hack:"Hack",insider:"Insider",physical:"Physical"},Rm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueConsumerDuty_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueConsumerDuty_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueConsumerDuty_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Sm={"inconsistent-information":"Inconsistent Information","long-wait":"Long Wait Times","unsupportive-agent":"Unsupportive Agent"},km={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueCustomerTrust_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueCustomerTrust_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueCustomerTrust_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Um={"inconsistent-information":"Inconsistent Information","long-wait":"Long Wait Times","unsupportive-agent":"Unsupportive Agent"},Om={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueGDPRBreachLog_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueGDPRBreachLog_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueGDPRBreachLog_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Bm={disclosure:"Disclosure",hack:"Hack",insider:"Insider",physical:"Physical"},qm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issuePCIBreachLog_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issuePCIBreachLog_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issuePCIBreachLog_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Nm={disclosure:"Disclosure",hack:"Hack",insider:"Insider",physical:"Physical"},Fm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueRiskEvent_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueRiskEvent_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueRiskEvent_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},Em={"external-fraud":"External Fraud","internal-fraud":"Internal Fraud","system-failure":"System Failure","unethical-client":"Unethical Client"},Mm={entity_name:"$t(assessment_one)",fields:{ActualCloseDate:"Actual close date",ActualCloseDate_help:"",AssociatedControls:"Associated controls",AssociatedControls_help:"",CertifiedIndividual:"SMF/Certified individual",CertifiedIndividual_help:"",IssueCausedBySystemIssue:"$t(issueSARLog_one, capitalize) caused by system issue?",IssueCausedBySystemIssue_help:"",IssueCausedByThirdParty:"$t(issueSARLog_one, capitalize) caused by third party?",IssueCausedByThirdParty_help:"",IssueType:"$t(issueSARLog_one, capitalize) type",IssueType_help:"",Owner:"Owner",PoliciesBreached:"Policy(s) breached",PoliciesBreached_help:"",PoliciesBreached_placeholder:"Enter the policies breached",PolicyBreach:"Policy breached?",PolicyBreach_help:"",PolicyOwner:"Policy owner",PolicyOwnerCommentary:"Policy owner commentary",PolicyOwnerCommentary_help:"",PolicyOwnerCommentary_placeholder:"Enter commentary from the policy owner",PolicyOwner_help:"",Rationale:"Rationale",Rationale_help:"",Rationale_placeholder:"Provide some rationale",RegulationsBreached:"Regulation(s) breached",RegulationsBreachedIds_placeholder:"Select regulations breached",RegulationsBreached_help:"",RegulationsBreached_placeholder:"Enter regulations breached",RegulatoryBreach:"Regulatory breach",RegulatoryBreach_help:"",RegulatoryBreech:"Regulatory breech",Reportable:"Reportable",Reportable_help:"",Severity:"Severity",Severity_help:"",Status_help:"",SystemResponsible:"System responsible",SystemResponsible_help:"",SystemResponsible_placeholder:"Enter system name",TargetCloseDate:"Target close date",TargetCloseDate_help:"",ThirdPartyResponsible:"Third party responsible",ThirdPartyResponsible_help:"",ThirdPartyResponsible_placeholder:"Enter the third party name"},headings:{policy:"$t(policy_one, capitalize)",regulation:"Regulation",system:"System",thirdParty:"Third Party"},help:[{content:"",title:""}],tab_title:"Assessment"},zm={a:"A",b:"B",c:"C"},xm={"compliance-finding":"Compliance Finding","control-test-finding":"Control Test Finding","internal-audit-finding":"Internal Audit Finding","material-impact":"Material $t(impact_one, capitalize)","near-miss":"Near Miss"},Lm={tabHelp:[{content:"",title:""}],tab_title:"Updates"},Gm={add_button:"Add $t(issue_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",details_link:"$t(issue_one, capitalize) link",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",latestUpdateCreatedAtTimestamp:"Latest update created on",latestUpdateDescription:"Latest update description",latestUpdateTitle:"Latest update title",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type",updateCount:"Update count",variant:"Variant"},confirm_delete_message:"Are you sure you want to delete these $t(issue_other)?",create_modal_title:"Add $t(issue_one, capitalizeAll)",create_new_button:"Add $t(issue_one, capitalizeAll)",create_success_message:"$t(issue_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issue_other)",open_issues:"Open $t(issue_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issue_one, capitalizeAll)",delete_success_message:"$t(issue_one, capitalize) deleted successfully",entity_name:"$t(issue_one)",external:"External",fallback_title:"$t(issue_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issue_one)",ImpactsCustomer:"Does this $t(issue_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issue_one)",IsExternalIssue_help:"",IssueType:"Issue type",IssueType_help:"",IssueType_placeholder:"Select issue type",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issue_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issue_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issues.internal)",true:"$t(issues.external)"},issue_submitted_subtitle:"$t(issue_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issue_one, article)",loading_message:"Loading $t(issue_other)",registerHelp:[{content:"",title:""}],register_title:"$t(issue_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issue_one)",report_issue_title:"Report $t(issue_one, article)",tabHelp:[{content:"",title:""}],tab_title:"$t(issue_other, capitalize)",update_success_message:"$t(issue_one, capitalize) updated successfully"},jm={add_button:"Add $t(issueBreachLog_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueBreachLog_other)?",create_modal_title:"Add $t(issueBreachLog_one, capitalizeAll)",create_new_button:"Add $t(issueBreachLog_one, capitalizeAll)",create_success_message:"$t(issueBreachLog_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueBreachLog_other)",open_issues:"Open $t(issueBreachLog_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueBreachLog_one, capitalizeAll)",delete_success_message:"$t(issueBreachLog_one, capitalize) deleted successfully",entity_name:"$t(issueBreachLog_one)",external:"External",fallback_title:"$t(issueBreachLog_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueBreachLog_one)",ImpactsCustomer:"Does this $t(issueBreachLog_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueBreachLog_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueBreachLog_one, article) title",newFiles:"$t(fields.newFiles)"},filtering_placeholder:"Filter $t(issueBreachLog_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesBreachLog.internal)",true:"$t(issuesBreachLog.external)"},issue_submitted_subtitle:"$t(issueBreachLog_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueBreachLog_one, article)",loading_message:"Loading $t(issueBreachLog_other)",registerHelp:null,register_title:"$t(issueBreachLog_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueBreachLog_one)",report_issue_title:"Report $t(issueBreachLog_one, article)",tabHelp:null,tab_title:"$t(issueBreachLog_other, capitalize)",update_success_message:"$t(issueBreachLog_one, capitalize) updated successfully"},Vm={add_button:"Add $t(issueConsumerDuty_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueConsumerDuty_other)?",create_modal_title:"Add $t(issueConsumerDuty_one, capitalizeAll)",create_new_button:"Add $t(issueConsumerDuty_one, capitalizeAll)",create_success_message:"$t(issueConsumerDuty_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueConsumerDuty_other)",open_issues:"Open $t(issueConsumerDuty_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueConsumerDuty_one, capitalizeAll)",delete_success_message:"$t(issueConsumerDuty_one, capitalize) deleted successfully",entity_name:"$t(issueConsumerDuty_one)",external:"External",fallback_title:"$t(issueConsumerDuty_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueConsumerDuty_one)",ImpactsCustomer:"Does this $t(issueConsumerDuty_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueConsumerDuty_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueConsumerDuty_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issueConsumerDuty_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesConsumerDuty.internal)",true:"$t(issuesConsumerDuty.external)"},issue_submitted_subtitle:"$t(issueConsumerDuty_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueConsumerDuty_one, article)",loading_message:"Loading $t(issueConsumerDuty_other)",registerHelp:null,register_title:"$t(issueConsumerDuty_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueConsumerDuty_one)",report_issue_title:"Report $t(issueConsumerDuty_one, article)",tabHelp:null,tab_title:"$t(issueConsumerDuty_other, capitalize)",update_success_message:"$t(issueConsumerDuty_one, capitalize) updated successfully"},Wm={add_button:"Add $t(issueCustomerTrust_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueCustomerTrust_other)?",create_modal_title:"Add $t(issueCustomerTrust_one, capitalizeAll)",create_new_button:"Add $t(issueCustomerTrust_one, capitalizeAll)",create_success_message:"$t(issueCustomerTrust_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueCustomerTrust_other)",open_issues:"Open $t(issueCustomerTrust_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueCustomerTrust_one, capitalizeAll)",delete_success_message:"$t(issueCustomerTrust_one, capitalize) deleted successfully",entity_name:"$t(issueCustomerTrust_one)",external:"External",fallback_title:"$t(issueCustomerTrust_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueCustomerTrust_one)",ImpactsCustomer:"Does this $t(issueCustomerTrust_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueCustomerTrust_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueCustomerTrust_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issueCustomerTrust_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesCustomerTrust.internal)",true:"$t(issuesCustomerTrust.external)"},issue_submitted_subtitle:"$t(issueCustomerTrust_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueCustomerTrust_one, article)",loading_message:"Loading $t(issueCustomerTrust_other)",registerHelp:null,register_title:"$t(issueCustomerTrust_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueCustomerTrust_one)",report_issue_title:"Report $t(issueCustomerTrust_one, article)",tabHelp:null,tab_title:"$t(issueCustomerTrust_other, capitalize)",update_success_message:"$t(issueCustomerTrust_one, capitalize) updated successfully"},Qm={add_button:"Add $t(issueGDPRBreachLog_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueGDPRBreachLog_other)?",create_modal_title:"Add $t(issueGDPRBreachLog_one, capitalizeAll)",create_new_button:"Add $t(issueGDPRBreachLog_one, capitalizeAll)",create_success_message:"$t(issueGDPRBreachLog_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueGDPRBreachLog_other)",open_issues:"Open $t(issueGDPRBreachLog_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueGDPRBreachLog_one, capitalizeAll)",delete_success_message:"$t(issueGDPRBreachLog_one, capitalize) deleted successfully",entity_name:"$t(issueGDPRBreachLog_one)",external:"External",fallback_title:"$t(issueGDPRBreachLog_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueGDPRBreachLog_one)",ImpactsCustomer:"Does this $t(issueGDPRBreachLog_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueGDPRBreachLog_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueGDPRBreachLog_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issueGDPRBreachLog_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesGDPRBreachLog.internal)",true:"$t(issuesGDPRBreachLog.external)"},issue_submitted_subtitle:"$t(issueGDPRBreachLog_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueGDPRBreachLog_one, article)",loading_message:"Loading $t(issueGDPRBreachLog_other)",registerHelp:null,register_title:"$t(issueGDPRBreachLog_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueGDPRBreachLog_one)",report_issue_title:"Report $t(issueGDPRBreachLog_one, article)",tabHelp:null,tab_title:"$t(issueGDPRBreachLog_other, capitalize)",update_success_message:"$t(issueGDPRBreachLog_one, capitalize) updated successfully"},Hm={add_button:"Add $t(issuePCIBreachLog_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issuePCIBreachLog_other)?",create_modal_title:"Add $t(issuePCIBreachLog_one, capitalizeAll)",create_new_button:"Add $t(issuePCIBreachLog_one, capitalizeAll)",create_success_message:"$t(issuePCIBreachLog_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issuePCIBreachLog_other)",open_issues:"Open $t(issuePCIBreachLog_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issuePCIBreachLog_one, capitalizeAll)",delete_success_message:"$t(issuePCIBreachLog_one, capitalize) deleted successfully",entity_name:"$t(issuePCIBreachLog_one)",external:"External",fallback_title:"$t(issuePCIBreachLog_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issuePCIBreachLog_one)",ImpactsCustomer:"Does this $t(issuePCIBreachLog_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issuePCIBreachLog_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issuePCIBreachLog_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issuePCIBreachLog_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesPCIBreachLog.internal)",true:"$t(issuesPCIBreachLog.external)"},issue_submitted_subtitle:"$t(issuePCIBreachLog_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issuePCIBreachLog_one, article)",loading_message:"Loading $t(issuePCIBreachLog_other)",registerHelp:null,register_title:"$t(issuePCIBreachLog_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issuePCIBreachLog_one)",report_issue_title:"Report $t(issuePCIBreachLog_one, article)",tabHelp:null,tab_title:"$t(issuePCIBreachLog_other, capitalize)",update_success_message:"$t(issuePCIBreachLog_one, capitalize) updated successfully"},Ym={add_button:"Add $t(issueRiskEvent_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueRiskEvent_other)?",create_modal_title:"Add $t(issueRiskEvent_one, capitalizeAll)",create_new_button:"Add $t(issueRiskEvent_one, capitalizeAll)",create_success_message:"$t(issueRiskEvent_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueRiskEvent_other)",open_issues:"Open $t(issueRiskEvent_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueRiskEvent_one, capitalizeAll)",delete_success_message:"$t(issueRiskEvent_one, capitalize) deleted successfully",entity_name:"$t(issueRiskEvent_one)",external:"External",fallback_title:"$t(issueRiskEvent_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueRiskEvent_one)",ImpactsCustomer:"Does this $t(issueRiskEvent_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueRiskEvent_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueRiskEvent_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issueRiskEvent_one) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesRiskEvents.internal)",true:"$t(issuesRiskEvents.external)"},issue_submitted_subtitle:"$t(issueRiskEvent_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueRiskEvent_one, article)",loading_message:"Loading $t(issueRiskEvent_other)",registerHelp:null,register_title:"$t(issueRiskEvent_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueRiskEvent_one)",report_issue_title:"Report $t(issueRiskEvent_one, article)",tabHelp:null,tab_title:"$t(issueRiskEvent_other, capitalize)",update_success_message:"$t(issueRiskEvent_one, capitalize) updated successfully"},Km={add_button:"Add $t(issueSARLog_one, capitalizeAll)",assessment:"assessment",columns:{actual_close_date:"Actual close date",assessment_created_by_username:"Assessed by",assessment_departments:"Assessment $t(department_other)",assessment_modified_by_username:"Assessment modified by",caused_by_system_issue:"Issue caused by system issue",certified_individual:"Certified individual",cost:"Cost",createdOn:"Created on",created_by_username:"Raised by",customers_impacted:"Customers impacted",date_identified:"Date identified",date_occurred:"Date occurred",details:"Details",hours:"Hours",impacts_customer:"Impacts customer",internal_or_external_issue:"Internal or external $t(issue_one)",is_external_issue:"Is external issue",issue_caused_by_third_party:"Issue caused by third party",modified_by_username:"Modified by",open_actions:"Open actions",owner:"Owner",owner_id:"Owner ID",contributor:"Contributor",parent_id:"Parent ID",parent_title:"Association",parent_type:"Parent type",policies_breached:"Policies breached",policy_breach:"Policy breach",policy_owner:"Policy owner",policy_owner_commentary:"Policy owner commentary",raised:"Raised",rationale:"Rationale",regulations_breached:"Regulations breached",regulatory_breach:"Regulatory breach",reportable:"Reportable",severity:"Severity",status:"Status",system_responsible:"System responsible",target_close_date:"Target close date",third_party_responsible:"Third party responsible",time_since_created:"Time since raised (days)",time_to_identify:"Time to Identify (days)",time_to_report:"Time to Report (days)",time_to_resolve:"Time to Resolve (days)",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete these $t(issueSARLog_other)?",create_modal_title:"Add $t(issueSARLog_one, capitalizeAll)",create_new_button:"Add $t(issueSARLog_one, capitalizeAll)",create_success_message:"$t(issueSARLog_one, capitalize) added successfully",dashboard:{all_issues:"All $t(issueSARLog_other)",open_issues:"Open $t(issueSARLog_other)",overdue:"Overdue",without_open_action:"Without open action"},delete_button:"Delete $t(issueSARLog_one, capitalizeAll)",delete_success_message:"$t(issueSARLog_one, capitalize) deleted successfully",entity_name:"$t(issueSARLog_one)",external:"External",fallback_title:"$t(issueSARLog_one, capitalize)",fields:{Contributor:"$t(fields.Contributor)",Contributor_help:"",Contributor_placeholder:"$t(fields.Contributor_placeholder)",DateIdentified:"Date identified",DateIdentified_help:"",DateOccurred:"Date occurred",DateOccurred_help:"",Departments:"$t(fields.Departments)",Departments_help:"$t(fields.Departments_help)",Details:"$t(fields.Details)",Details_help:"",Details_placeholder:"Enter details about the $t(issueSARLog_one)",ImpactsCustomer:"Does this $t(issueSARLog_one) $t(impact_one) customers?",ImpactsCustomer_help:"",IsExternalIssue:"Internal or external $t(issueSARLog_one)",IsExternalIssue_help:"",Owner:"$t(fields.Owner)",Owner_help:"",Owner_placeholder:"$t(fields.Owner_placeholder)",Tags:"$t(fields.Tags)",Tags_help:"$t(fields.Tags_help)",Title:"$t(fields.Title)",Title_help:"",Title_placeholder:"Enter $t(issueSARLog_one, article) title",newFiles:"$t(fields.newFiles)",newFiles_help:"$t(fields.newFiles_help)"},filtering_placeholder:"Filter $t(issueSARLog_other) by free text, property or value",footerLabels:{cost:"Cost ($t(currency))",customers_impacted:"Customers impacted",hours:"Cost (Hours)"},help:[{content:"",title:""}],internal:"Internal",isExternalIssue:{false:"$t(issuesSARLog.internal)",true:"$t(issuesSARLog.external)"},issue_submitted_subtitle:"$t(issueSARLog_one, capitalize) ID: {{ id }}",issue_submitted_title:"Thank you for submitting $t(issueSARLog_one, article)",loading_message:"Loading $t(issueSARLog_other)",registerHelp:null,register_title:"$t(issueSARLog_one, capitalizeAll) $t(register_one, capitalize)",report_another_issue:"Report another $t(issueSARLog_one)",report_issue_title:"Report $t(issueSARLog_one, article)",tabHelp:null,tab_title:"$t(issueSARLog_other, capitalize)",update_success_message:"$t(issueSARLog_one, capitalize) updated successfully"},Jm={add_button:"$t(link_one, capitalize) $t(control_one)",confirm_remove_message:"Are you sure you want to remove these $t(control_one) $t(link_other)?",control_count_one_label:"1 $t(control_one, capitalize) selected",control_count_other_label:"{{count}} $t(control_other, capitalize) selected",create_button:"$t(link_one, capitalize) $t(control_one)",create_modal_title:"$t(link_one, capitalize) $t(control_one, capitalize)",edit_modal_title:"Edit $t(control_one, capitalize) $t(link_one, capitalize)",entity_name:"$t(control_one)",fields:{title:"Title",title_placeholder:"Select $t(control_one, article)"},loading_message:"Loading $t(control_other)",tab_title:"Linked $t(control_other, capitalize)"},Zm={add_button:"Link items",confirm_remove_button:"Yes, remove",confirm_remove_title:"Remove link?",create_modal_title:"Link items",edit_modal_title:"Link items",entity_name:"Linked item",fields:{type:"Type",type_help:"",type_placeholder:"Please select a type"},remove_button:"Unlink",remove_confirmation:"Are you sure you want to remove the link between these items?",tabHelp:[{content:"",title:""}],tab_title:"Linked items"},Xm="Loading",e_="Loading appetites",t_="Loading test results",r_="Lower appetite",i_={alertMessage:"Please be aware this action will reset the tab order for ALL users for this module.",configuration:"Configuration",descriptions:{acceptance:"Log and monitor accepted $t(risk_other, capitalize) so they remain visible and up to date.",action:"Track $t(action_other, capitalize) with clear deadlines, updates and links to other objects in RiskSmart.",ai:"Get instant insights, automate tasks, and enhance decision-making with AI-powered features.",appetite:"Define $t(appetite_one, capitalize) levels for $t(risk_other) and track any breaches against those thresholds.",appetite_cascading:"Cascade $t(appetite_one, capitalize) levels from higher $t(risk_one, capitalize) tiers down with one simple setting, saving users the need to manually input $t(appetite_other) on every $t(risk_one, capitalize).",approval:"Manage $t(approval_other) smoothly, capturing every ‘yes’ and ‘no’ along the way.",assessment:"Conduct $t(assessment_other, capitalize) of objects in RiskSmart and log $t(assessment_activity_other, capitalize) and Findings against them.",attestation:"Distribute $t(policy_other, capitalize) for $t(attestation_one, capitalize) across your organisation and track responses with ease.",cause:"Identify and record the $t(cause_other, capitalize) of $t(issue_other, capitalize) and assign their significance.",chat:"Allow RiskSmart to use AI to help you generate descriptions.",chat_warning:"Your AI-powered companion for risk management. This is currently a beta feature.",suggested_controls:"Uses AI to suggest controls to add a risk. This can include new and existing controls.",compliance_monitoring_assessment:"Compile and report on $t(compliance_one, capitalize) findings across your organisation.",consequence:"Record the $t(consequence_other, capitalize) of $t(issue_other, capitalize) and allocate values to reflect their impact.",control:"Record and test $t(control_other, capitalize), link them to $t(risk_other, capitalize), and track $t(issue_other, capitalize), $t(action_other, capitalize) and $t(indicator_other, capitalize) all in one view.",control_group:"Group related $t(control_other, capitalize) for sharper visibility and oversight.",custom_datasource:"Connect your RiskSmart data sources to unlock tailored reporting.",dashboard:"Get an instant view of risk, control health, and compliance on the RiskSmart dashboard.",document:"Draft, update and publish $t(policy_other, capitalize) to your organisation in minutes.",enterprise_risk:"Define enterprise-level $t(risk_other, capitalize), push them to individual entities for local management, and roll up ratings to see an aggregated enterprise-wide view.",impact:"Assess the potential severity of a $t(risk_other, capitalize) consequences against a range of organisation-defined $t(impact_other, capitalize).",incident_reporting:"Enable users to log $t(issue_other, capitalize) as they arise.",indicator:"Track KPIs, spot trends and view how $t(indicator_other, capitalize) link across your organisation.",internal_audit:"Plan audits, capture findings, and push fixes through RiskSmart.",internal_audit_entity:"Plan audits, write Reports and link $t(action_other, capitalize), $t(control_other, capitalize) and $t(issue_other, capitalize) to your audit records.",internal_audit_report:"Compile Reports and Findings across different audits in one place.",issue:"Capture and track $t(issue_other, capitalize), monitor progress and see how quickly they are resolved.",notification:"Stay up to date with RiskSmart notifications and never miss an update.",obligation:"Manage organisational $t(compliance_one, capitalize) and track $t(action_other, capitalize), $t(control_other, capitalize) and $t(issue_other, capitalize).",public_document:"Publish and share public-facing $t(document_other, capitalize) from one central place.",rcsa_wizard:"Build and guide processes quickly with RiskSmart’s step-by-step wizard.",risk:"Bring your entire $t(risk_other, capitalize) cycle together in one place, without the need for spreadsheets.",risk_scoring:"Select and configure the scoring methodology that best suits your organisation.",reg_feed:"Track and review regulatory obligation changes across your organisation.",third_party:"Onboard $t(third_party_other, capitalize) and link $t(action_other, capitalize), $t(control_other, capitalize) and $t(issue_other, capitalize) to them.",integrations:"Connect RiskSmart with external tools and services to automate workflows and streamline processes.",zapier:"Automate workflows by connecting RiskSmart to thousands of apps via Zapier.",mcp_server:"Connect AI assistants and agents to RiskSmart using the Model Context Protocol server.",rest_api:"Build custom integrations using the RiskSmart REST API.",slack:"Receive RiskSmart notifications and updates directly in your Slack channels.",zapier_self_managed:"Connect using your API credentials. Manage your own Zaps, choose your apps, and control your Zapier subscription.",zapier_by_risksmart:"Embedded integration experience — browse thousands of apps and build automated workflows without leaving the platform.",mcp_server_integrations:"Connect long-running B2B AI systems to RiskSmart for automated compliance monitoring and continuous risk intelligence.",mcp_personal:"Connect AI assistants like Claude and ChatGPT directly to your risk data for natural language queries and insights."},edit_tabs:"Edit tabs",fields:{AppetiteCascadingModel:"Appetite cascading model",AppetiteCascadingModelConfig:"Appetite cascading model config",AppetiteCascadingModelConfig_help:"Select the appetite cascading model configuration",AppetiteCascadingModel_help:"Select the appetite cascading model to use for this module.",AppetiteCascadingModels:{default:"Default",top_down_cascade:"Top-down cascading"},IngestionApiKey:"API key",IngestionApiKey_help:"",IngestionConfig:"Ingestion configuration",IngestionConfig_help:"",RiskScoringModel:"Risk scoring model",RiskScoringModelConfig:"Risk scoring model config",RiskScoringModelConfig_help:"Select the risk scoring model configuration to use for this module.",RiskScoringModel_help:"Select the risk scoring model to use for this module.",RiskScoringModels:{control_effectiveness_averages:"Control effectiveness averages",default:"Default",typed_control_effectiveness_averages:"Control type-based effectiveness averages"}},submodules_title:"Submodules",tab_title:"Modules",titles:{acceptance:"$t(acceptance_other, capitalize)",action:"$t(action_other, capitalize) module",ai:"RiskSmart AI",appetite:"$t(appetite_other, capitalize)",appetite_cascading:"$t(appetite_one, capitalize) cascade",approval:"$t(approval_other, capitalize)",assessment:"$t(assessment_other, capitalize) module",attestation:"$t(attestation_other, capitalize)",cause:"$t(cause_other, capitalize)",chat:"RiskSmart assistant",chat_warning:"RiskSmart AI beta warning",suggested_controls:"Suggest $t(risk_one, capitalize) $t(control_other, capitalize)",compliance_monitoring_assessment:"Monitoring and Findings",consequence:"$t(consequence_other, capitalize)",control:"$t(control_other, capitalize) module",control_group:"$t(control_group_other, capitalize)",custom_datasource:"Custom data sources",document:"$t(policy_one, capitalize) module",enterprise_risk:"$t(enterprise_risk_other, capitalize) module",impact:"$t(impact_other, capitalize)",incident_reporting:"$t(issue_one, capitalize) reporting",indicator:"$t(indicator_other, capitalize) module",internal_audit:"$t(internal_audit_one, capitalize)",internal_audit_entity:"$t(internal_audit_one, capitalize) module",internal_audit_report:"Reports and Findings",issue:"$t(issue_other, capitalize) module",notification:"$t(notification_other, capitalize)",obligation:"$t(compliance_one, capitalize) module",public_document:"Public documents",rcsa_wizard:"Wizard",risk:"$t(risk_other, capitalize) module",risk_scoring:"Scoring methodology",reg_feed:"Regulatory Change Feed",third_party:"$t(third_party_one, capitalize) module",integrations:"Integrations",zapier:"Zapier",mcp_server:"MCP Server",rest_api:"REST API",slack:"Slack",zapier_self_managed:"Zapier (Self-Managed)",zapier_by_risksmart:"Zapier by RiskSmart",mcp_server_integrations:"MCP Server for Integrations",mcp_personal:"MCP Personal"},unsaved_changes:"You have unsaved changes. You must save your changes before you can configure tabs. This will also reset any existing tab configurations for the module."},a_={columns:{description:"Description",name:"Name",type:"Type"},dashboard:{all:"All items"},help:[{content:"",title:""}],register_title:"My Items"},s_={ReportsTitle:"Reports",actionsTitle:"$t(action_other, capitalize)",assessments:{findingsTitle:"$t(finding_other, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(assessment_other, capitalize)"},compliance:{dashboardTitle:"$t(dashboard_one, capitalize)",findingsTitle:"$t(finding_other, capitalize)",monitoringTitle:"$t(monitoring_other, capitalize)",obligationChangesTitle:"Change feed",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(compliance, capitalize)"},controls:{groupsTitle:"$t(control_group_other, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(control_other, capitalize)",testsTitle:"$t(control_test_other, capitalize)"},customDatasourcesTitle:"Custom Datasources",dashboardTitle:"$t(home, capitalize)",enterpriseRisks:{dashboardTitle:"$t(dashboard_one, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(enterprise_risk_other, capitalize)"},impacts:{ratingsTitle:"$t(rating_other, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(impact_other, capitalize)"},indicatorsTitle:"$t(indicator_other, capitalize)",internalAudit:{dashboardTitle:"$t(common:internalAudits.universe.title)",findingsTitle:"$t(finding_other, capitalize)",registerTitle:"$t(register, capitalize)",reportsTitle:"$t(internal_audit_report_other, capitalize)",sectionTitle:"$t(internal_audit_other, capitalize)"},issues:{causesTitle:"$t(cause_other, capitalize)",consequencesTitle:"$t(consequence_other, capitalize)",registerTitle:"$t(register, capitalize)",reportAnIssueTitle:"$t(issues.report_issue_title)",sectionTitle:"$t(issue_other, capitalize)"},issuesBreachLog:{registerTitle:"$t(issueBreachLog_other, capitalize)"},issuesConsumerDuty:{registerTitle:"$t(issueConsumerDuty_other, capitalize)"},issuesCustomerTrust:{registerTitle:"$t(issueCustomerTrust_other, capitalize)"},issuesGDPRBreachLog:{registerTitle:"$t(issueGDPRBreachLog_other, capitalize)"},issuesPCIBreachLog:{registerTitle:"$t(issuePCIBreachLog_other, capitalize)"},issuesRiskEvents:{registerTitle:"$t(issueRiskEvent_other, capitalize)"},issuesSARLog:{registerTitle:"$t(issueSARLog_other, capitalize)"},myItemsTitle:"$t(common:myItems.register_title)",notificationsTitle:"$t(notification_other, capitalize)",policy:{attestationsTitle:"$t(attestation_other, capitalize)",registerTitle:"$t(document_other, capitalize)",sectionTitle:"$t(policy_one, capitalize)"},publicPoliciesTitle:"$t(common:publicPolicies.register_title)",requestsTitle:"$t(request_other, capitalize)",risks:{acceptancesTitle:"$t(acceptance_other, capitalize)",appetitesTitle:"$t(appetite_other, capitalize)",dashboardTitle:"$t(dashboard_one, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(risk_other, capitalize)"},automationsTitle:"Automations",settingsTitle:"$t(setting_other, capitalize)",thirdParty:{questionnaireResponsesRegisterTitle:"$t(response_other, capitalize)",questionnaireTemplatesRegisterTitle:"$t(questionnaire_other, capitalize)",registerTitle:"$t(register, capitalize)",sectionTitle:"$t(third_party_one, capitalize)"}},n_="Next page",o_="Next test date",l_="No {{entity, capitalizeAll}}",d_="No items found.",u_="No {{entity, lowercase}} to display.",c_="We can't find a match.",p_="No matches found",m_="No matches",__={categories:{actions:"$t(action_other, capitalizeAll)",attestations:"$t(attestation_other, capitalizeAll)",controls:"$t(control_other, capitalizeAll)",indicators:"$t(indicator_other, capitalizeAll)",issues:"$t(issue_other, capitalizeAll)",policy:"$t(policy_one, capitalizeAll)",requests:"$t(request_other, capitalizeAll)",risks:"$t(risk_other, capitalizeAll)","third-party":"$t(third_party_one, capitalizeAll)"},channel_types:{chat:"Slack",email:"Email",in_app_feed:"In-app",push:"Push",sms:"SMS",http:"HTTP"},create_modal_title:"Notification Preferences",edit_modal_title:"Notification Preferences",entity_name:"Notification preferences",slackButton:{connect:"Connect Slack",disconnect:"Disconnect Slack"},workflows:{actionDeleted:"$t(action_one, capitalizeAll) deleted",actionDue:"$t(action_one, capitalizeAll) due",actionNew:"$t(action_one, capitalizeAll) new",actionOverdue:"$t(action_one, capitalizeAll) overdue",actionUpdated:"$t(action_one, capitalizeAll) updated",changeRequestNew:"Change request new",changeRequestRejected:"Change request rejected",controlDeleted:"$t(control_one, capitalizeAll) deleted",controlNew:"$t(control_one, capitalizeAll) new",controlTestDue:"$t(control_one, capitalizeAll) test due",controlTestOverdue:"$t(control_one, capitalizeAll) test overdue",controlUpdated:"$t(control_one, capitalizeAll) updated",documentDeleted:"$t(document_one, capitalizeAll) deleted",documentNew:"$t(document_one, capitalizeAll) new",documentReviewDue:"$t(document_one, capitalizeAll) review due",documentReviewOverdue:"$t(document_one, capitalizeAll) review overdue",documentUpdated:"$t(document_one, capitalizeAll) updated",indicatorDue:"$t(indicator_one, capitalizeAll) due",indicatorOverdue:"$t(indicator_one, capitalizeAll) overdue",issueDeleted:"$t(issue_one, capitalizeAll) deleted",issueDue:"$t(issue_one, capitalizeAll) due",issueNew:"$t(issue_one, capitalizeAll) new",issueOverdue:"$t(issue_one, capitalizeAll) overdue",issueUpdated:"$t(issue_one, capitalizeAll) updated",riskAssessmentDue:"$t(risk_one, capitalizeAll) assessment due",riskAssessmentOverdue:"$t(risk_one, capitalizeAll) assessment overdue",riskDeleted:"$t(risk_one, capitalizeAll) deleted",riskNew:"$t(risk_one, capitalizeAll) new",riskUpdated:"$t(risk_one, capitalizeAll) updated",thirdPartyResponseSubmission:"Response submitted",thirdPartyNewQuestionnaire:"New questionnaire",thirdPartyRecallQuestionnaire:"Questionnaire recalled",thirdPartyResponseUpdateStatus:"Response status updated",thirdPartySetPassword:"Set password",thirdPartyPasswordReset:"Password reset",attestationRecordInsert:"$t(attestation_one, capitalizeAll) required",documentDue:"$t(document_one, capitalizeAll) due",documentOverdue:"$t(document_one, capitalizeAll) overdue",policyApprover:"$t(policy_one, capitalizeAll) approval",policyAttestationReminder:"$t(attestation_one, capitalizeAll) reminder",digest:"Notification digest"},tenant_modal_title:"Tenant Notification Defaults",tenant_load_error:"Failed to load notification preferences",tenant_load_error_detail:"An error occurred while loading preferences. Please try again.",tenant_column_notification:"Notification",tenant_column_lock:"Lock",tenant_confirm_header:"Confirm Changes",tenant_confirm_body:"These changes will affect notification defaults for all users in this organisation. Continue?",tenant_button:"Notification Defaults",tenant_save_error:"Failed to save notification preferences",tenant_save_error_detail:"An error occurred while saving preferences. Please try again."},f_={tab_title:"Notification History",columns:{recipient:"Recipient",objectType:"Object Type",workflow:"Workflow",channel:"Channel",deliveryStatus:"Delivery Status",engagementStatus:"Engagement Status",timestamp:"Timestamp",link:"Link"},deliveryStatus:{queued:"Queued",sent:"Sent",delivered:"Delivered",undelivered:"Undelivered",not_sent:"Not Sent",delivery_attempted:"Delivery Attempted",bounced:"Bounced"},engagementStatus:{seen:"Seen",read:"Read",archived:"Archived",interacted:"Interacted",link_clicked:"Link Clicked",unseen:"Unseen",unread:"Unread",unarchived:"Unarchived"},dateRange:{last24h:"Last 24 hours",last7:"Last 7 days",last30:"Last 30 days",last90:"Last 90 days"},actions_aria_label:"Notification history actions",date_range_menu:"Date range",export_button:"Export",loading:"Loading notifications...",loading_more:"Loading more notifications...",empty:"No notifications found for the selected filters.",link_view:"View",digest_count:"Daily Digest ({{count}} notifications)",digest_count_one:"Daily Digest (1 notification)",digest_loading:"Loading digest contents...",digest_entity_info:"Daily digest notifications are not shown in this view. To see digest history, visit the notification history in Settings."},y_={clear_button:"Clear all",empty_message:"You don't have any notifications",header:"Notifications",messages:{actionChange:"Edited $t(action_one, capitalizeAll): {{title}}",actionDelete:"Deleted $t(action_one, capitalizeAll): {{title}}",actionDue:"$t(action_one, capitalizeAll) due: {{title}}",actionInsert:"New $t(action_one, capitalizeAll): {{title}}",actionOverdue:"$t(action_one, capitalizeAll) overdue: {{title}}",actionUpdate:"Updated $t(action_one, capitalizeAll): {{title}}",attestationRecordInsert:"Attestation required for document. Please review.",changeRequestInsert:"New change request requires your approval",changeRequestRejected:"Your change request has been rejected",controlDelete:"Deleted $t(control_one, capitalizeAll): {{title}}",controlInsert:"New $t(control_one, capitalizeAll): {{title}}",controlTestDue:"$t(control_one, capitalizeAll) due: {{title}}",controlTestOverdue:"$t(control_one, capitalizeAll) overdue: {{title}}",controlUpdate:"Updated $t(control_one, capitalizeAll): {{title}}",documentDelete:"Deleted $t(document_one, capitalizeAll): {{title}}",documentInsert:"New $t(document_one, capitalizeAll): {{title}}",documentUpdate:"Updated $t(document_one, capitalizeAll): {{title}}",indicatorDue:"$t(indicator_one, capitalizeAll) due: {{title}}",issueDelete:"Deleted $t(issue_one, capitalizeAll): {{title}}",issueDue:"$t(issue_one, capitalizeAll) due: {{title}}",issueInsert:"New $t(issue_one, capitalizeAll): {{title}}",issueOverdue:"$t(issue_one, capitalizeAll) overdue: {{title}}",issueUpdate:"Updated $t(issue_one, capitalizeAll): {{title}}","issue_breach-log_Delete":"Deleted $t(breach_log_one, capitalizeAll): {{title}}","issue_breach-log_Due":"$t(breach_log_one, capitalizeAll) due: {{title}}","issue_breach-log_Insert":"New $t(breach_log_one, capitalizeAll): {{title}}","issue_breach-log_Overdue":"$t(breach_log_one, capitalizeAll) overdue: {{title}}","issue_breach-log_Update":"Updated $t(breach_log_one, capitalizeAll): {{title}}","issue_consumer-duty_Delete":"Deleted $t(consumer_duty_one, capitalizeAll): {{title}}","issue_consumer-duty_Due":"$t(consumer_duty_one, capitalizeAll) due: {{title}}","issue_consumer-duty_Insert":"New $t(consumer_duty_one, capitalizeAll): {{title}}","issue_consumer-duty_Overdue":"$t(consumer_duty_one, capitalizeAll) overdue: {{title}}","issue_consumer-duty_Update":"Updated $t(consumer_duty_one, capitalizeAll): {{title}}","issue_customer-trust_Delete":"Deleted $t(customer_trust_one, capitalizeAll): {{title}}","issue_customer-trust_Due":"$t(customer_trust_one, capitalizeAll) due: {{title}}","issue_customer-trust_Insert":"New $t(customer_trust_one, capitalizeAll): {{title}}","issue_customer-trust_Overdue":"$t(customer_trust_one, capitalizeAll) overdue: {{title}}","issue_customer-trust_Update":"Updated $t(customer_trust_one, capitalizeAll): {{title}}","issue_gdpr-breach-log_Delete":"Deleted $t(gdpr_breach_log_one, capitalizeAll): {{title}}","issue_gdpr-breach-log_Due":"$t(gdpr_breach_log_one, capitalizeAll) due: {{title}}","issue_gdpr-breach-log_Insert":"New $t(gdpr_breach_log_one, capitalizeAll): {{title}}","issue_gdpr-breach-log_Overdue":"$t(gdpr_breach_log_one, capitalizeAll) overdue: {{title}}","issue_gdpr-breach-log_Update":"Updated $t(gdpr_breach_log_one, capitalizeAll): {{title}}","issue_pci-breach-log_Delete":"Deleted $t(pci_breach_log_one, capitalizeAll): {{title}}","issue_pci-breach-log_Due":"$t(pci_breach_log_one, capitalizeAll) due: {{title}}","issue_pci-breach-log_Insert":"New $t(pci_breach_log_one, capitalizeAll): {{title}}","issue_pci-breach-log_Overdue":"$t(pci_breach_log_one, capitalizeAll) overdue: {{title}}","issue_pci-breach-log_Update":"Updated $t(pci_breach_log_one, capitalizeAll): {{title}}","issue_risk-events_Delete":"Deleted $t(issueRiskEvent_one, capitalizeAll): {{title}}","issue_risk-events_Due":"$t(issueRiskEvent_one, capitalizeAll) due: {{title}}","issue_risk-events_Insert":"New $t(issueRiskEvent_one, capitalizeAll): {{title}}","issue_risk-events_Overdue":"$t(issueRiskEvent_one, capitalizeAll) overdue: {{title}}","issue_risk-events_Update":"Updated $t(issueRiskEvent_one, capitalizeAll): {{title}}","issue_sar-log_Delete":"Deleted $t(sar_log_one, capitalizeAll): {{title}}","issue_sar-log_Due":"$t(sar_log_one, capitalizeAll) due: {{title}}","issue_sar-log_Insert":"New $t(sar_log_one, capitalizeAll): {{title}}","issue_sar-log_Overdue":"$t(sar_log_one, capitalizeAll) overdue: {{title}}","issue_sar-log_Update":"Updated $t(sar_log_one, capitalizeAll): {{title}}",policyAttestationReminder:"Reminder: attestation required for document. Please review.",policyDocumentVersionApproval:"New document version to approve",policyDocumentVersionReviewDue:"Document review due",policyDocumentVersionReviewUpcoming:"Document review upcoming",riskAssessmentDue:"$t(risk_one, capitalizeAll) due: {{title}}",riskAssessmentOverdue:"$t(risk_one, capitalizeAll) overdue: {{title}}",riskDelete:"Deleted $t(risk_one, capitalizeAll): {{title}}",riskInsert:"New $t(risk_one, capitalizeAll): {{title}}",riskUpdate:"Updated $t(risk_one, capitalizeAll): {{title}}"},unknown:"Deleted or Unavailable"},h_={acceptance:"$t(acceptance_one, capitalizeAll)",action:"$t(action_one, capitalizeAll)",action_update:"$t(action_one, capitalizeAll) Update",appetite:"$t(appetite_one, capitalizeAll)",approval:"Approval",approval_level:"Approval Level",approval_rule:"Approval Rule",cause:"$t(cause_one, capitalizeAll)",comment:"Comment",consequence:"$t(consequence_one, capitalizeAll)",contributor:"Contributor",control:"$t(control_one, capitalize)",control_action:"$t(control_one, capitalizeAll) $t(action_one, capitalizeAll)",control_group:"$t(control_group_one, capitalizeAll) $t(control_group_one, capitalizeAll)",conversation:"Conversation",custom_attribute_schema:"Custom Attribute Schema",data_export_schedule:"Data Export Schedule",department:"$t(department_one, capitalizeAll)",department_type:"$t(department_one, capitalizeAll) Type",document:"$t(document_one, capitalizeAll)",document_action:"$t(document_one, capitalizeAll) $t(action_one, capitalizeAll)",document_assessment:"$t(document_one, capitalizeAll) $t(assessment_one, capitalizeAll)",document_file:"$t(document_one, capitalizeAll) Version",document_issue:"$t(document_one, capitalizeAll) $t(issue_one, capitalizeAll)",document_linked_document:"$t(document_one, capitalizeAll) Linked $t(document_one, capitalizeAll)",enterprise_risk:"$t(enterprise_risk_one, capitalize)",enterprise_risk_instance:"$t(enterprise_risk_one, capitalize) instance",entity:"$t(entity_one, capitalize)",file:"File",form_configuration:"Form Configuration",indicator:"$t(indicator_one, capitalizeAll)",indicator_result:"$t(indicator_one, capitalizeAll) $t(indicator_result_one, capitalizeAll)",issue:"$t(issue_one, capitalizeAll)",issue_action:"$t(issue_one, capitalizeAll) $t(action_one, capitalizeAll)",issue_assessment:"$t(issue_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_breach_log:"$t(issueBreachLog_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_consumer_duty:"$t(issueConsumerDuty_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_customer_trust:"$t(issueCustomerTrust_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_gdpr_breach_log:"$t(issueGDPRBreachLog_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_pci_breach_log:"$t(issuePCIBreachLog_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_risk_event:"$t(issueRiskEvent_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_assessment_sar_log:"$t(issueSARLog_one, capitalizeAll) $t(assessment_one, capitalizeAll)",issue_breach_log:"$t(issueBreachLog_one, capitalizeAll)",issue_consumer_duty:"$t(issueConsumerDuty_one, capitalizeAll)",issue_customer_trust:"$t(issueCustomerTrust_one, capitalizeAll)",issue_gdpr_breach_log:"$t(issueGDPRBreachLog_one, capitalizeAll)",issue_pci_breach_log:"$t(issuePCIBreachLog_one, capitalizeAll)",issue_risk_event:"$t(issueRiskEvent_one, capitalizeAll)",issue_sar_log:"$t(issueSARLog_one, capitalizeAll)",issue_update:"$t(issue_one, capitalizeAll) Update",obligation:"$t(obligation_one, capitalizeAll)",obligation_action:"$t(obligation_one, capitalizeAll) $t(action_one, capitalizeAll)",obligation_assessment:"$t(obligation_one, capitalizeAll) $t(assessment_one, capitalizeAll)",obligation_impact:"$t(obligation_one, capitalizeAll) $t(impact_one, capitalize)",obligation_issue:"$t(obligation_one, capitalizeAll) $t(issue_one, capitalizeAll)",owner:"Owner",questionnaire_invite:"$t(questionnaire_one) $t(invitation_one)",questionnaire_template:"$t(questionnaire_one)",questionnaire_template_version:"$t(version_one)",relation_file:"Relation File",risk:"$t(risk_one, capitalizeAll)",risk_action:"$t(risk_one, capitalizeAll) $t(action_one, capitalizeAll)",risk_assessment:"$t(risk_one, capitalizeAll) $t(assessment_one, capitalizeAll)",risk_assessment_result_impact:"Risk Assessment Result Impact",risk_assessment_result_config:"Risk Assessment Result Config",schedule:"Schedule",tag:"Tag",tag_type:"Tag Type",taxonomy:"Taxonomy",taxonomy_org:"Taxonomy Org",test_result:"$t(control_test_one, capitalizeAll) Result",third_party_response:"$t(response_one)",user_activity:"Auth",user_group:"User Group",user_search_preferences:"User Search Preferences"},g_={columns:{Adherence:"Adherence",AssessmentStatus:"Assessment status",Breaches:"Breaches",Controls:"Controls",CreatedAt:"Created on",CreatedBy:"Created by",Description:"Description",Details:"Details",Interpretation:"Interpretation",ModifiedAt:"Updated on",ModifiedBy:"Updated by",Owner:"Owner",Contributor:"Contributor",ParentId:"Associated $t(obligation_one) ID",ParentTitle:"Parent",Performance:"Performance",Rating:"Rating",RatingTrend:"$t(obligation_one, capitalize) rating trend",Title:"$t(obligation_one, capitalize) title",Type:"Type",details_link:"$t(obligation_one, capitalizeAll) link",latest_rating_date:"Latest rating date",next_test_date:"Next test Date",test_frequency:"Assessment frequency"},confirm_delete_message:"Are you sure you want to delete this $t(obligation_one)?",create_button:"Add $t(obligation_one, capitalize)",create_new_button:"Add $t(obligation_one, capitalize)",create_new_title:"Add $t(obligation_one, capitalize)",create_success_message:"$t(obligation_one, capitalize) added successfully",dashboard:{all:"All $t(obligation_other)",in_progress:"In-progress"},dashboardHelp:[{content:"",title:""}],dashboard_category_titles:{chapter:"Chapters",rule:"Rules & Guidance",standard:"High-Level Standards",task:"Tasks"},dashboard_title:"$t(compliance, capitalize) Dashboard",delete_button:"Delete $t(obligation_one, capitalizeAll)",delete_modal_title:"Delete $t(obligation_one, capitalizeAll)",delete_success_message:"$t(obligation_one, capitalize) deleted successfully",detailsHelp:[{content:"",title:""}],download:"Download",entity_name:"$t(obligation_one)",entity_name_other:"$t(obligation_other)",fallback_title:"Edit $t(obligation_one, capitalize)",fields:{Adherence:"Adherence",Adherence_help:"",Contributor_help:"",Description:"Description",Description_help:"",Interpretation:"Interpretation",Interpretation_help:"",NextTestDate:"Next test date",NextTestDate_help:"",Owner:"Owner",Owner_help:"",ParentId:"Parent $t(obligation_one)",ParentId_help:"",TestFrequency:"Assessment frequency",TestFrequency_help:"",Title:"Title",Title_help:"",Type:"Type",Type_help:"",placeholders:{Adherence:"Select an Adherence level",Description:"Enter a description",Interpretation:"Enter your interpretation of the $t(obligation_one)",Owner:"Search for a owner",ParentId:"Select a parent $t(obligation_one)",Title:"Enter a title"},types:{chapter:"Chapter",rule:"Rule",standard:"High-level standard",task:"Task"}},loading_message:"Loading $t(obligation_other)",orphaned_obligation_title:"Unlinked $t(obligation_other, capitalize)",registerHelp:[{content:"",title:""}],register_title:"$t(compliance, capitalize) Register",update_success_message:"$t(obligation_one, capitalize) updated successfully"},I_={columns:{created_on:"Created on",created_by_id:"Created by",description:"Description",effective_date:"Effective date",external_id:"External ID",id:"ID",obligation:"$t(obligation_one, capitalize)",reference:"Reference",regulator:"Regulator",title:"Title",updated_by_id:"Updated by",updated_on:"Updated on",status:"Status",actions:"Associated actions",tags:"Tags"},entity:"$t(obligation_change_one, capitalize)",registerHelp:[{content:"",title:""}],register_title:"Regulatory change feed",detail_title:"Regulatory change",mark_as_read:"Mark as read",mark_as_unread:"Mark as unread",create_action:"Create action",cancel:"Cancel",rule_number:"Rule number",regulatory_body:"Regulatory body",summary_category_titles:{total:"Total",action_created:"Action created",unread:"Unread",no_action_required:"No action required"},details:"Details",current:"Current",upcoming:"Upcoming",unread:"Unread",read:"Read"},b_="$t(document_one, capitalize) Review",T_="$t(indicator_one, capitalize) Test",A_="$t(obligation_one, capitalize) Review",C_={add_button:"Add $t(assessment, capitalize) ",add_rating_button:"Add $t(rating_one)",columns:{CompletionBy:"Completed by",CompletionDate:"Completion date",Owner:"Owner",ParentTitle:"$t(obligation_one, capitalize)",Rating:"Rating",Result:"Result",StartDate:"Start date",Status:"Status",TargetCompletionDate:"Target completion date",Title:"Title"},complianceMonitoringRatingSubheading:"Compliance monitoring ratings",confirm_delete_message:"Are you sure you want to delete these $t(rating_other, capitalize)?",delete_button:"Delete",entity_name:"$t(rating_one)",fallback_title:"$t(rating_one, capitalize)",fields:{ActualCompletionDate:"Actual completion date",CompletedBy:"Completed by",Owner:"Owner",Result:"Result",StartDate:"Start date",Status:"Status",Summary:"Summary",Summary_placeholder:"Enter a summary of the activity performed",TargetCompletionDate:"Target completion date",Title:"Title",Title_placeholder:"Enter a title"},internalAuditRatingSubheading:"Internal audit ratings",loading_message:"Loading $t(rating_other)",obligationRatingSubheading:"Compliance ratings",register_title:"Compliance $t(rating_other, capitalize)",summary_category_titles:{assessment_in_progress:"$t(rating_one, capitalize) in-progress",due:"Due",not_meeting:"Not meeting",overdue:"Overdue",total:"All $t(assessment, plural)"},tabHelp:[{content:"",title:""}],tab_title:"$t(rating_other, capitalize)"},v_="Owner",$_="Performance",D_="Performance effectiveness",P_="Performed by",w_={fields:{message:"Message",message_help:"Your message will be included in the email sent to the third party",message_placeholder:"A message to be included in the email sent to the third party",questionnaires:"$t(questionnaire, capitalizeAll) ({{count}}/{{total}})",questionnaires_help:"",users:"Add a Recipient",users_help:"",users_placeholder:"Enter user email"},form_title:"$t(questionnaire_other, capitalizeAll)",page_title:"Plan $t(questionnaire_one, capitalizeAll)"},R_={attestation_time_limits:{"1 day":"1 day (QA Only)","1 mon":"1 month","1 year":"1 year","14 days":"2 weeks","2 mons":"2 months","2 years":"2 years","3 mons":"3 months","6 mons":"6 months","7 days":"1 week"},users_affected:"{{count}} users targeted",no_users_affected:"Not enabled for this document",columns:{download:"View Latest",lastApprovedDate:"Last approved date",lastPublishedDate:"Last published date",latest_rating_date:"Latest rating date",nextTestOverdue:"Next test overdue",next_test_date:"Next test date",owner:"Owner",contributor:"Contributor",parent:"Parent",performance:"Performance",performanceTrend:"$t(policy_one, capitalize) rating trend",purpose:"Purpose",rating:"Rating",review_date:"Last reviewed date",review_due:"Next review due",review_status:"Review status",status:"Version status",test_frequency:"Assessment frequency",title:"Title",type:"Type"},confirm_delete_message:"Are you sure you want to delete this $t(document_one)?",create_new_button:"Add $t(document_one, capitalize)",create_title:"Add $t(document_one, capitalize)",delete_button:"Delete $t(document_one, capitalize)",details:"Details",entity_name:"$t(document_one)",fallback_title:"$t(policy_one, capitalize)",fields:{AttestationGroups:"Which groups require attestation?",AttestationGroups_help:"",AttestationPromptText:"Attestation prompt text",AttestationPromptText_help:"",AttestationReissue:"Do you want to re-issue to users who attested to the previous version of this document?",AttestationTarget:"Does this policy require attestation from everyone in the organisation?",AttestationTarget_help:"",AttestationTimeLimit:"Attestation time limit",AttestationTimeLimit_help:"",Contributor_help:"",DocumentType:"Type",DocumentType_help:"",LinkedDocuments:"Linked documents",LinkedDocuments_help:"",NextTestDate:"Next assessment date",NextTestDate_help:"",Owner:"Owner",Owner_help:"",Parent:"Parent",Parent_help:"",Purpose:"Purpose",Purpose_help:"",Purpose_placeholder:"Enter the purpose of the $t(document_one)",TestFrequency:"Assessment frequency",TestFrequency_help:"",Title:"Title",Title_help:"",Title_placeholder:"Enter $t(document_one, article) title"},headings:{attestation:"Attestations"},loading_message:"Loading $t(document)",policy:"$t(policy_one, capitalize)",publicFile:{body:"This policy is stored outside of the RiskSmart platform. You need to click ‘Download’ to download it.",button:"Download",errorBody:"There was an error downloading the file. Please try again later.",errorTitle:"Error downloading file",title:"Download File"},publicLink:{body:"This policy is stored outside of the RiskSmart platform. You need to click ‘Visit Link’ to view it.",button:"Visit Link",title:"External Link"},publicLinkedDocuments:"Related Policies",publicPolicyFileHelp:[{content:"",title:""}],publicPublishedDate:"Published",publicVersion:"Version",registerHelp:[{content:"",title:""}],register_title:"$t(policy_one, capitalize) Register",summary_category_titles:{overdue:"Overdue",review_due:"Review due",total:"All $t(document_other, lowercase)"},types:{framework:"Framework",policy:"Policy",sop:"Statement of process",standard:"Standard"}},S_="Previous page",k_={register_title:"$t(document_other, capitalize)",viewSelector:{card:"Card",table:"Table"}},U_="Publish",O_={actions:{approve:"Approve",moreActions:"More Actions",moreInformation:"More Information",plan:"Plan $t(questionnaire_one, capitalizeAll)",recall:"Recall",reject:"Reject"},columns:{expireBy:"Expire by",questionnaire:"$t(questionnaire_one, capitalize)",startDate:"Start date",userEmail:"Email address",userId:"User ID",version:"$t(version_one, capitalize)"},confirm_delete_message:"Are you sure you want to delete this $t(questionnaire_one, capitalizeAll) $t(invitation_one, capitalizeAll)?",create_new_button:"Add $t(questionnaire_one, capitalizeAll) $t(invitation_one, capitalizeAll)",create_title:"Add $t(questionnaire_one, capitalizeAll) $t(invitation_one, capitalizeAll)",delete_button:"Delete",delete_modal_title:"Delete $t(questionnaire_one, capitalizeAll) $t(invitation_one, capitalizeAll)",entity_name:"$t(questionnaire_one) $t(invitation_one)",fields:{addRecipient:"Add a recipient",addRecipient_help:"",addRecipient_placeholder:"Select recipient",selectQuestionnaires:"Select $t(questionnaire_other)",selectQuestionnaires_help:"",selectQuestionnaires_placeholder:"Enter a description"},help:[{content:"",title:""}],registerHelp:[{content:"",title:""}],register_title:"$t(questionnaire_other, capitalizeAll)"},B_={add_button:"Add $t(version_one, capitalizeAll)",columns:{created_by:"Created by",id:"ID",id_help:"",schema:"Schema",status:"Status",uiSchema:"UI Schema",updated_by:"Updated by",version:"Version",version_help:null},confirm_close_modal:{message:"Are you sure? Any changes you have made to this version since last saving will be lost.",title:"Confirm"},confirm_delete_message:"Are you sure you want to delete this $t(questionnaire_one, capitalizeAll) $t(version_one, capitalizeAll)?",create_version_breadcrumb:"Add $t(version_one, capitalizeAll)",create_version_page_title:"Add $t(version_one, capitalizeAll)",details:"$t(detail_other, capitalize)",entity_name:"$t(version_one)",fields:{description:"Description",description_help:"",description_placeholder:"Enter a description",status:"Status",status_help:"",status_placeholder:"Select status",version:"Version",version_help:"",version_placeholder:"Enter a version number"},loading_message:"Loading $t(questionnaire_one) $t(version_other)",previewButtonLabel:"Preview",save_draft:"Save",status:{archive_past:"Archived",archive_present:"Archive",draft_past:"Drafted",draft_present:"Draft",publish_past:"Published",publish_present:"Publish"},tab_title:"$t(questionnaire_one, capitalizeAll) $t(version_other, capitalizeAll)"},q_={actions:{archive:"Archive",draft:"Save as draft",publish:"Publish"},columns:{created_by:"Created by",created_on:"Created on",description:"Description",status:"Status",title:"Title",updated_by:"Updated by",updated_on:"Updated on"},confirm_delete_message:`Are you sure you want to delete this $t(questionnaire_one)?

This action will also delete all $t(questionnaire_one) invites and responses associated with this $t(questionnaire_one).`,create_new_button:"Add $t(questionnaire_one, capitalizeAll)",create_title:"Add $t(questionnaire_one, capitalizeAll)",dashboard:{all:"All $t(questionnaire_other)",archived:"Archived",draft:"Draft",published:"Published"},delete_button:"Delete $t(questionnaire_one, capitalizeAll)",delete_modal_title:"Delete $t(questionnaire_one, capitalizeAll)",entity_name:"$t(questionnaire_one)",fields:{contributor:"Contributor",contributor_help:"",contributor_placeholder:"Select a contributor",description:"Description",description_help:"",description_placeholder:"Enter a description",owner:"Owner",owner_help:"",owner_placeholder:"Select an owner",title:"Title",title_help:"",title_placeholder:"Enter a title"},help:[{content:"",title:""}],registerHelp:[{content:"",title:""}],register_title:"$t(questionnaire_one, capitalizeAll)",tabs:{details:"$t(detail_other, capitalize)",versions:"$t(version_other, capitalize)"}},N_={columns:{AssessmentStatus:"$t(assessment_one, capitalize) status",AssessmentTitle:"Linked $t(assessment_one)",CompletionBy:"Completed by",CompletionDate:"Completion date",ComplianceMonitoringAssessmentStatus:"$t(compliance_monitoring_assessment_one, capitalize) status",ComplianceMonitoringAssessmentTitle:"Linked $t(compliance_monitoring_assessment_one)",Impact:"$t(impact_one, capitalize)",InternalAuditReportStatus:"$t(internal_audit_report_one, capitalize) status",InternalAuditReportTitle:"Linked $t(internal_audit_report_one)",Item:"Assessed Item",Likelihood:"$t(likelihood_one, capitalize)",Rating:"$t(rating_one, capitalize)",Rationale:"Rationale",Result:"Result",StartDate:"Start date",TestDate:"$t(rating_one, capitalize) date",Type:"Type"},complianceRatingSubheading:"Compliance monitoring $t(rating_other)",confirm_delete_message:"Are you sure you want to delete the $t(rating_one)?",create_modal_title:"Add $t(rating_one, capitalizeAll)",edit_modal_title:"$t(rating_one, capitalizeAll)",entity_name:"$t(rating_one)",internalAuditRatingSubheading:"$t(internal_audit_one, capitalize) $t(rating_other)",riskRatingSubheading:"$t(risk_one, capitalize) $t(rating_other)",tab_title:"$t(rating_other, capitalize)"},F_="Recents",E_="You are now being redirected to {{url}}",M_="Hold on tight, you are being redirected",z_="Reject",x_={error:{invalidDateRangeFormatter:"INVALID DATE RANGE"},next:{day_one:"Next {{count}} day",day_other:"Next {{count}} days",hour_one:"Next {{count}} hour",hour_other:"Next {{count}} hours",minute_one:"Next {{count}} minute",minute_other:"Next {{count}} minutes",month_one:"Next {{count}} month",month_other:"Next {{count}} months",second_one:"Next {{count}} second",second_other:"Next {{count}} seconds",week_one:"Next {{count}} week",week_other:"Next {{count}} weeks",year_one:"Next {{count}} year",year_other:"Next {{count}} years"},previous:{day_one:"Last {{count}} day",day_other:"Last {{count}} days",hour_one:"Last {{count}} hour",hour_other:"Last {{count}} hours",minute_one:"Last {{count}} minute",minute_other:"Last {{count}} minutes",month_one:"Last {{count}} month",month_other:"Last {{count}} months",second_one:"Last {{count}} second",second_other:"Last {{count}} seconds",week_one:"Last {{count}} week",week_other:"Last {{count}} weeks",year_one:"Last {{count}} year",year_other:"Last {{count}} years"}},L_="Remove",G_="{{entity, capitalize}} removed successfully",j_={registerHelp:[{content:"",title:""}],register_title:"$t(request_other,capitalizeAll) Register"},V_="$t(risk_one, capitalize)",W_="Appetite",Q_="Appetite statement",H_={columns:{appetite_performance:"$t(appetite_one, capitalize) performance",associated_risk_id:"Associated $t(risk_one) ID",controlled_description:"$t(controlled_one,capitalize) description",controlled_impact:"$t(controlled_one,capitalize) $t(impact_one)",controlled_impact_score:"$t(controlled_one,capitalize) $t(impact_one) score",controlled_likelihood:"$t(controlled_one,capitalize) $t(likelihood_one)",controlled_likelihood_score:"$t(controlled_one,capitalize) $t(likelihood_one) score",controlled_rating:"$t(controlled_one,capitalize) rating",controlled_rating_history:"$t(controlled_one,capitalize) rating history",controlled_score:"$t(controlled_one,capitalize) score",details_link:"$t(risk_one, capitalize) link",enterprise_risk:"$t(enterprise_risk_one, capitalize)",entity:"$t(entity_one, capitalize)",impact_performance:"$t(impact_one, capitalize) performance",latest_rating_date:"Latest rating date",linked_controls:"Linked $t(control_other)",linked_indicators:"Linked $t(indicator_other)",linked_actions:"Linked $t(action_other)",lower_appetite:"Lower $t(appetite_one)",nextTestOverdue:"Next test overdue",next_test_date:"Next test date",owner_id:"Owner ID",parent_risk:"Parent $t(risk_one)",risk_description:"$t(risk_one, capitalize) description",risk_name:"$t(risk_one, capitalize) name",risk_owner:"$t(risk_one, capitalize) owner",risk_contributor:"$t(risk_one, capitalize) contributor",risk_status:"$t(risk_one, capitalize) status",risk_tier:"$t(risk_one, capitalize) tier",risk_treatment:"$t(risk_one, capitalize) treatment",test_frequency:"Assessment frequency",testScheduleStatus:"Test schedule status",uncontrolled_description:"$t(uncontrolled_one, capitalize) description",uncontrolled_impact:"$t(uncontrolled_one, capitalize) $t(impact_one)",uncontrolled_impact_score:"$t(uncontrolled_one, capitalize) $t(impact_one) score",uncontrolled_likelihood:"$t(uncontrolled_one, capitalize) $t(likelihood_one)",uncontrolled_likelihood_score:"$t(uncontrolled_one, capitalize) $t(likelihood_one) score",uncontrolled_rating:"$t(uncontrolled_one, capitalize) rating",uncontrolled_rating_history:"$t(uncontrolled_one, capitalize) rating history",uncontrolled_rating_trend:"$t(uncontrolled_one, capitalize) $t(risk_one) rating trend",uncontrolled_score:"$t(uncontrolled_one, capitalize) score",upper_appetite:"Upper $t(appetite_one)",controlled_rating_trend:"$t(controlled_one, capitalize) $t(risk_one) rating trend"},confirm_delete_message:"Are you sure you want to delete this $t(risk_one)?",create_button:"Add $t(risk_one, capitalize)",create_new_button:"Add $t(risk_one, capitalize)",create_success_message:"$t(risk_one, capitalize) added successfully",create_title:"Add $t(risk_one, capitalize)",dashboardHelp:[{content:"",title:""}],dashboard_title:"$t(risk_one, capitalize) Dashboard",delete_button:"Delete $t(risk_one, capitalize)",delete_modal_title:"Delete $t(risk_one, capitalize)",delete_success_message:"$t(risk_one, capitalize) deleted successfully",download:"Download",entity_name:"$t(risk_one)",fallback_title:"Edit $t(risk_one, capitalize)",fields:{Contributor_help:"",departmentsHelp:"$t(fields.Departments_help)",description:"Description",description_help:"",description_placeholder:"Enter a description",next_test_date:"Next test date",next_test_date_help:"",owner:"Owner",owner_help:"",owner_placeholder:"Search for a person",parent:"Parent $t(risk_one)",parent_help:"",parent_risk_disabled_reason_linked_item:"This $t(risk_one) is already linked in Linked Items.",status:"$t(risk_one, capitalize) status",status_help:"",status_placeholder:"Select $t(risk_one, article) status",tagsHelp:"$t(fields.Tags_help)",test_frequency:"Assessment frequency",test_frequency_help:"",tier:"$t(risk_one, capitalize) tier",tier_help:"",title:"$t(risk_one, capitalize) name",title_help:"",title_placeholder:"Enter $t(risk_one, article) name",treatment:"$t(risk_one, capitalize) treatment",treatment_help:"",treatment_placeholder:"Select $t(risk_one) treatment"},help:[{content:"",title:""}],loading_message:"Loading $t(risk_other)",registerHelp:[{content:"",title:""}],register_title:"$t(risk_one, capitalize) Register",update_success_message:"$t(risk_one, capitalize) updated successfully"},Y_={alert:{title:"Now configuring:",subtitle:{impactLikelihood:"Impact & likelihood levels",multiImpact:"Multi Impacts"},description:{default:"Complete the configuration sections below.",pending:"You have unsaved changes.",pendingNewVersion:"You have unsaved changes. Saving will create a new version."}},page:{title:"Scoring Settings",header:"Scoring methodologies",description:"Enable and configure your risk scoring approaches",saveButton:"Save",discardButton:"Discard"},impactLikelihoodCard:{title:"Configure impact, likelihood and the scoring matrix",description:"Matrix-based risk scoring",selectedAlert:"Always Active",selectedBadge:"READY",setupBadge:"SETUP"},multiImpactCard:{title:"Configure multi impacts",description:"Evaluate risks across multiple impacts",selectedAlert:"Active",selectedBadge:"READY",setupBadge:"SETUP",unselectedAlert:"Inactive",unselectedBadge:"OFF"},likelihoodLevels:{title:"Likelihood Levels",description:"Define likelihood values and labels",addButton:"Add Likelihood"},impactLevels:{title:"Impact Levels",description:"Define impact values and labels",addButton:"Add Impact"},matrix:{title:"Configure scoring matrix",description:"Define risk ratings for each impact-likelihood combination",alert:{description:"Click on any cell to customize the risk rating"}},invertMatrixToggle:{title:"Invert Axis",checked:"(Impact vs Likelihood)",unchecked:"(Likelihood vs Impact)"},impactCategories:{title:"Multi impact configuration",description:"Define impact categories for multi-dimensional risk assessment",addButton:"Add Impact"},impactAggregation:{title:"Impact calculation method",description:{average:"Risk rating based upon the average score of the rated impacts",maximum:"Risk rating based upon the highest score of the rated impacts"},averageLabel:"Average",maximumLabel:"Worst case"},saveDialog:{newVersionTitle:"Save as new version",updateTitle:"Save changes",newVersionBody:"This will <bold>create a new version</bold> of your ratings. Past ratings will remain unchanged on the previous version.",updateBody:"Your changes will affect how ratings appear. <bold>Update</bold> all historic ratings, or <bold>Save as new</bold> to create a new version and keep past ratings unchanged.",saveAsNewButton:"Save as new",savingButton:"Saving...",updateButton:"Update",updatingButton:"Updating...",cancelButton:"Cancel",updateSuccessMessage:"Configuration updated successfully",updateErrorMessage:"Failed to update configuration. Please try again.",saveAsNewSuccessMessage:"New version created successfully",saveAsNewErrorMessage:"Failed to create new version. Please try again."},discardDialog:{dialogTitle:"Discard changes?",dialogDescription:"You have unsaved changes. If you <bold>cancel</bold> now, your updates to how ratings appear will <bold>not be saved</bold>.",keepEditingButton:"Keep Editing",confirmButton:"Discard Changes",successMessage:"Changes discarded"},editLevelDialog:{impact:{dialogTitle:"Edit impact level",dialogDescription:"Configure the title, value, and colour for this impact level."},likelihood:{dialogTitle:"Edit likelihood level",dialogDescription:"Configure the title, value, and colour for this likelihood level."},titleLabel:"Title",descriptionLabel:"Description",valueLabel:"Value",colourLabel:"Colour",customColourLabel:"Custom colour",saveButton:"Save",cancelButton:"Cancel",titleRequired:"Title is required",valueRequired:"Value is required",valueAlreadyInUse:"This value is already in use",titleAlreadyInUse:"This title is already in use",previewLabel:"Preview:"},editImpactCategoryDialog:{dialogTitle:"Edit impact category",dialogDescription:"Configure the impact name and colour (e.g., Financial, Operational, Reputational).",nameLabel:"Impact Name",colourLabel:"Colour",customColourLabel:"Custom colour",saveButton:"Save",cancelButton:"Cancel",nameRequired:"Name is required",nameAlreadyInUse:"This name is already in use",previewLabel:"Preview:"},editMatrixCellDialog:{dialogTitle:"Edit matrix cell",dialogDescription:"Configure the title, value, and colour for this risk level.",titleLabel:"Title",valueLabel:"Value",colourLabel:"Colour",customColourLabel:"Custom colour",saveButton:"Save",cancelButton:"Cancel",titleRequired:"Title is required",valueRequired:"Value is required",previewLabel:"Preview:"}},K_="Save",J_="Search for a person",Z_="Select",X_="Set Acceptance",ef="Sign out",tf="Signed in",rf={errorDescription:"Something went wrong while connecting to Slack. Please try again.",errorTitle:"Slack Connection Failed",loadingDescription:"Hold tight while we connect you to Slack",loadingTitle:"Connecting to Slack...",successDescription:"This window will close automatically in 3 seconds.",successTitle:"Slack Connected Successfully!"},af="Status",sf={active:"Active",emerging:"Emerging",monitored:"Monitored",retired:"Retired"},nf="Submit for Approval",of="Switch org",lf={cancel:"Cancel",confirm:"Confirm",content_density:{description:"Select to display content in a denser, more compact mode",label:"Compact mode"},filtering_placeholder:"Filter {{entity, lowercase}} by property or value",filtering_placeholder_free_text:"Filter {{entity, lowercase}} by free text, property or value",loading_message:"Loading {{entity, lowercase}}",page_size:"Page size",paging_option:"{{size}} {{entity, lowercase}}",preferences:"Preferences",preferences_columns_title:"Set column preferences",stick_column_options:{first:"First column",first_two:"First two columns",last:"Last column",none:"None"},stick_first_columns_description:"Keep the first column(s) visible while horizontally scrolling the table content.",stick_first_columns_title:"Stick first column(s)",stick_last_columns_description:"Keep the last column visible while horizontally scrolling the table content.",stick_last_columns_title:"Stick last column",striped_rows:{description:"Select to add alternating shaded rows",label:"Striped rows"},totals:"Totals",wrap_lines:{description:"Select to see all the text and wrap the lines",label:"Wrap lines"}},df={add_button:"Add Tag",columns:{created_by_user:"Created by",created_on:"Created on",description:"Description",name:"Name",tag_type_group:"Group",updated_by_user:"Updated by",updated_on:"Updated on"},confirm_delete_message:"Are you sure you want to delete these tags?",create_modal_title:"Add Tag",delete:"Delete",edit_modal_title:"Edit Tag",entity_name:"tag",fields:{descriptionField:"Description",groupField:"Tag Group",nameField:"Name",placeholders:{description:"Enter a description",group:"Enter a group",name:"Enter a name"},validation:{uniqueName:"Tag already exists"}},help:[{content:"",title:""}],tagsSelectorLabel:"Tags",tagsTableTitle:"Tags"},uf={add_button:"Add Translations",confirm_delete_message:"Are you sure you want to delete these translations?",entity_name:"Translations",help:[{content:"",title:""}],noTaxonomyFound:"No translations found",organisationCountMessage:"Used by {{count}} other organisation(s)",taxonomyTableTitle:"Translations",taxonomyTypes:{common:"Common",internalAuditRatings:"Internal Audit Ratings",library:"Library",ratings:"Ratings",taxonomy:"Taxonomy"}},cf="Test date",pf={add_button:"Add Test Result",columns:{assessmentTitle:"Linked $t(assessment_one)",associated_files:"Associated files",complianceMonitoringAssessmentTitle:"Linked $t(compliance_monitoring_assessment_one)",date:"Date",design_effectiveness:"Design effectiveness",internalAuditReportTitle:"Linked $t(internal_audit_report_one)",next_test_date:"Next test",overall_effectiveness:"Overall effectiveness",parent:"$t(control, capitalize)",parent_guid:"$t(control, capitalize) guid",parent_id:"$t(control, capitalize) ID",performance_effectiveness:"Performance effectiveness",submitter:"Submitted by",test_type:"Test type",title:"Title"},complianceMonitoringRatingSubheading:"Compliance monitoring ratings",confirm_delete_message:"Are you sure you want to delete these test results?",create_modal_title:"Add Test Result",create_success_message:"Test result added successfully",delete_success_message:"Test results deleted successfully",edit_modal_title:"Edit Test Result",entity_name:"Test Result",fields:{controlHelp:"",controlTestDetailsHelp:"",controlTestResultHelp:"",designEffectivenessHelp:"",performanceEffectivenessHelp:"",performedByHelp:"",testDateHelp:"",testTypeHelp:"",titleFieldHelp:""},internalAuditRatingSubheading:"Internal audit ratings",loading_message:"Loading tests",performanceRatingSubheading:"Control test ratings",registerHelp:[{content:"",title:""}],register_title:"$t(control, capitalize) Tests",summary_category_titles:{all:"All test results",not_effective:"Not effective"},tabHelp:[{content:"",title:""}],tab_title:"$t(control, capitalize) Test History"},mf={fields:{nextTestDue:"Next test due",nextTestDueHelp:"",nextTestOverdue:"Next test overdue",startDate:"Start date",startDateHelp:"",testFrequency:"Test frequency",testFrequencyHelp:"",testFrequencyPlaceholder:"",timeToCompleteUnit:"Time to complete (unit)",timeToCompleteUnitHelp:"",timeToCompleteValue:"Time to complete (value)",timeToCompleteValueHelp:""},headings:{title:"Test schedule"}},_f="Test type",ff={"1stLine":"1st line","2ndLine":"2nd line","3rdLine":"3rd line",businessLine:"Business line"},yf={general:{fixSpellingAndGrammar:"Fix spelling & grammar",generateAControlDescription:"Generate $t(control_one, article) description",generateARiskDescription:"Generate $t(risk_one, article) description",improveWriting:"Improve writing",makeLonger:"Make longer",makeMoreConcise:"Make more concise",useSimplerLanguage:"Use simpler language"},help:"Ask AI for help",language:{brazilianPortuguese:"Brazilian Portuguese",english:"English",french:"French",german:"German",italian:"Italian",portuguese:"Portuguese",spanish:"Spanish"},translate:"Translate to different language",undo:"Undo changes"},hf={columns:{address:"Address",cityTown:"City/Town",companiesHouseNumber:"Companies House Number",companyDomain:"Company Domain",companyName:"Company Name",contactEmail:"Contact Email",contactName:"Contact Name",country:"Country",criticality:"Criticality",description:"Description",postcode:"Postcode",primaryContactName:"Primary Contact Name",title:"Title"},confirm_delete_message:`Are you sure you want to delete this $t(third_party_one)?

This action will also delete all $t(questionnaire_one) invites and responses associated with this $t(third_party_one).`,create_new_button:"Add $t(third_party_one, capitalizeAll)",create_title:"Add $t(third_party_one, capitalizeAll)",dashboard:{all:"All $t(third_party_other)"},delete_button:"Delete $t(third_party_one, capitalizeAll)",delete_modal_title:"Delete $t(third_party_one, capitalizeAll)",entity_name:"$t(third_party_one)",fields:{address:"Address",address_help:"",address_placeholder:"Enter the address",cityTown:"City/Town",cityTown_help:"",cityTown_placeholder:"Enter the city/town",companiesHouseNumber:"Companies House Number",companiesHouseNumber_help:"",companiesHouseNumber_placeholder:"Enter the Companies House number",companyDomain:"Company Domain",companyDomain_help:"",companyDomain_placeholder:"Enter the company domain",companyName:"Company Name",companyName_help:"",companyName_placeholder:"Enter the company name",contactEmail:"Contact Email",contactEmail_help:"",contactEmail_placeholder:"Enter the contact email",contactName:"Contact Name",contactName_help:"",contactName_placeholder:"Enter the contact name",contributors:"Contributors",contributors_help:"",contributors_placeholder:"Select contributors",country:"Country",country_help:"",country_placeholder:"Enter the country",criticality:"Criticality",criticality_help:"",criticality_placeholder:"Select criticality",description:"Description",description_help:"",description_placeholder:"Enter a description",newFiles:"Attach files",newFiles_help:"",owners:"Owners",owners_help:"",owners_placeholder:"Select owners",postcode:"Postcode",postcode_help:"",postcode_placeholder:"Enter the postcode",primaryContactName:"Primary Contact Name",primaryContactName_help:"",primaryContactName_placeholder:"Enter the primary contact name",status:"Status",status_help:"",status_placeholder:"Select status",title:"Title",title_help:"",title_placeholder:"Enter a title",type:"Type",type_help:"",type_placeholder:"Select type"},help:[{content:"",title:""}],questionnaires:{templates:{columns:{status:"Status",title:"Title",version:"Version"},confirm_delete_message:"Are you sure you want to delete this $t(questionnaire_one, capitalizeAll)?",create_new_button:"Add $t(questionnaire_one, capitalizeAll)",create_title:"Add $t(questionnaire_one, capitalizeAll)",delete_button:"Delete $t(questionnaire_one, capitalizeAll)",delete_modal_title:"Delete $t(questionnaire_one, capitalizeAll)",entity_name:"$t(questionnaire_one)",fields:{description:"Description",description_help:"",description_placeholder:"Enter a description",status:"Status",status_help:"",status_placeholder:"Select status",title:"Title",title_help:"",title_placeholder:"Enter a title"},help:[{content:"",title:""}],registerHelp:[{content:"",title:""}],register_title:"$t(questionnaire_one, capitalizeAll)",tabs:{details:"Details"}}},registerHelp:[{content:"",title:""}],register_title:"$t(third_party_one, capitalizeAll) Register",tabs:{contacts:"Contacts",details:"Details",questionnaires:"Questionnaires"},contacts:{entity_name:"Contact",register_title:"Contacts",create_new_button:"Add Contact",create_title:"Add Contact",view_title:"Contact",revoke_access_button:"Revoke Access",revoke_access_modal_title:"Revoke Access",revoke_access_modal_button:"Yes, revoke",revoke_access_confirm_multiple:"Are you sure you want to revoke access for these contacts? They will no longer be able to log in to the third party portal",revoke_access_success:"Contact access has been revoked",revoke_access_success_multiple:"Successfully revoked access for {{count}} contact(s)",revoke_access_error:"Failed to revoke contact access",resend_password_reset_button:"Resend Password Reset",resend_password_reset_success:"Password reset email has been sent successfully",resend_password_reset_error:"Failed to send password reset email",close_button:"Close",cancel_button:"Cancel",confirm_button:"Confirm",columns:{email:"Email",name:"Name",jobTitle:"Job title",status:"Status",lastLogin:"Last login"},fields:{email:"Email",email_placeholder:"Enter email address",name:"Name",name_placeholder:"Enter name",jobTitle:"Job Title",jobTitle_placeholder:"Enter job title"}}},gf={columns:{expireBy:"Expire by",questionnaire:"$t(questionnaire_one, capitalize)",questionnaireTitle:"$t(questionnaire_one, capitalize)",questionnaireVersion:"$t(version_one, capitalize)",respondent:"Respondent",response:"$t(response_one, capitalize)",startDate:"Start date",status:"Status",thirdPartyTitle:"$t(third_party_one, capitalize)",userEmail:"Email address",version:"Version",recallReason:"Recall reason"},create_success_message:"$t(questionnaire_one, capitalize) added successfully",dashboard:{all:"All $t(response_other)",completed:"Completed",awaiting_review:"Awaiting review",in_progress:"In progress",not_started:"Not started",rejected:"Rejected"},delete_success_message:"$t(questionnaire_one, capitalize) deleted successfully",entity_name:"$t(response_one)",questionnaire_form:{back_button_label:"Back",cancel_button_label:"Cancel",notification:{save_success:"Saved as draft for later",submit_error:"This form has errors",submit_success:"Form submitted successfully"},save_button_label:"Save for later",submit_button_label:"Submit"},registerHelp:[{content:"",title:""}],register_title:"$t(response_one, capitalizeAll) Register",updateStatus:{actions:{approve:"Approved",recall:"Recalled",reject:"Rejected",request_more_information:"More information requested"},approve:{cannotPerformActionModalTitle:"",cannotPerformActionOneDescription:"",cannotPerformActionSomeDescription:"",confirm:"Approve",confirmation:"",edit_modal_title:"Approve $t(questionnaire, capitalizeAll)",header:"Approve $t(questionnaire, capitalizeAll)",shareWithRespondentsOffInfo:"",shareWithRespondentsOnInfo:"",warning:`You are about to approve $t(this, {"count": {{selectedItemsCount}} }) $t(questionnaire, {"count": {{selectedItemsCount}} }). This action will change the status of the $t(questionnaire, {"count": {{selectedItemsCount}} }) to 'Completed' and cannot be undone.`},deselectButtonLabel:"Deselect",entityName:"$t(questionnaire_one)",moreInformation:{cannotPerformActionModalTitle:"Cannot Request More Information",cannotPerformActionOneDescription:"The selected $t(questionnaire) cannot have more information requested. Please select a different $t(questionnaire) to request more information.",cannotPerformActionSomeDescription:'{{ cannotPerformActionListCount }} of the {{ selectedItemsCount }} selected $t(questionnaire, {"count": {{selectedItemsCount}} }) cannot have more information requested. Please deselect the $t(questionnaire, {"count": {{cannotPerformActionListCount}} }) that $t(is, {"count": {{cannotPerformActionListCount}} }) not eligible and try again.',confirm:"Request",confirmation:"",header:"Request More Information",shareWithRespondentsOffInfo:"NONE of the questionnaire participants will be notified by email.",shareWithRespondentsOnInfo:"ALL questionnaire participants will be notified by email with the reason above.",warning:`You are about to send a request for more information. This action will change the status of the $t(questionnaire, {"count": {{selectedItemsCount}} }) to 'In progress'.`},recall:{cannotPerformActionModalTitle:"Cannot Recall $t(questionnaire, capitalizeAll)",cannotPerformActionOneDescription:"The selected $t(questionnaire) cannot be recalled. Please select a different $t(questionnaire) to recall.",cannotPerformActionSomeDescription:'{{ cannotPerformActionListCount }} of the {{ selectedItemsCount }} selected $t(questionnaire, {"count": {{selectedItemsCount}} }) cannot be recalled. Please deselect $t(this, {"count": {{cannotPerformActionListCount}} }) $t(questionnaire, {"count": {{cannotPerformActionListCount}} }) and try again.',confirm:"Recall",confirmation:"Are you sure you want to recall the selected $t(questionnaire)?",edit_modal_title:"Recall $t(questionnaire_one, capitalizeAll)",header:"Recall $t(questionnaire, capitalizeAll)",shareWithRespondentsOffInfo:"NONE of the questionnaire participants will be notified by email.",shareWithRespondentsOnInfo:"ALL questionnaire participants will be notified by email with the reason above.",warning:`You are about to recall $t(this, {"count": {{selectedItemsCount}} }) $t(questionnaire, {"count": {{selectedItemsCount}} }). This action will change the status of the $t(questionnaire, {"count": {{selectedItemsCount}} }) to 'Recalled' and cannot be undone.`},reject:{cannotPerformActionModalTitle:"Cannot Reject $t(questionnaire, capitalizeAll)",cannotPerformActionOneDescription:"The selected $t(questionnaire) cannot be rejected. Please select a different $t(questionnaire) to reject.",cannotPerformActionSomeDescription:'{{ cannotPerformActionListCount }} of the {{ selectedItemsCount }} selected $t(questionnaire, {"count": {{selectedItemsCount}} }) cannot be rejected. Please deselect $t(this, {"count": {{cannotPerformActionListCount}} }) $t(questionnaire, {"count": {{cannotPerformActionListCount}} }) and try again.',confirm:"Reject",confirmation:"Are you sure you want to reject the selected $t(questionnaire)?",edit_modal_title:"Reject $t(questionnaire_one, capitalizeAll)",header:"Reject $t(questionnaire, capitalizeAll)",shareWithRespondentsOffInfo:"NONE of the questionnaire participants will be notified by email.",shareWithRespondentsOnInfo:"ALL questionnaire participants will be notified by email with the reason above.",warning:`You are about to reject $t(this, {"count": {{selectedItemsCount}} }) $t(questionnaire, {"count": {{selectedItemsCount}} }). This action will change the status of the $t(questionnaire, {"count": {{selectedItemsCount}} }) to 'Rejected' and cannot be undone.`}},update_success_message:"$t(questionnaire_one, capitalize) updated successfully"},If={1:"$t(tier_one, capitalize) 1",2:"$t(tier_one, capitalize) 2",3:"$t(tier_one, capitalize) 3"},bf="RiskSmart",Tf="Title",Af={showFewer:"Show fewer",showMore:"Show more"},Cf={terminate:"Terminate",tolerate:"Tolerate",transfer:"Transfer",treat:"Treat"},vf={entity_name:"$t(uncontrolled_one, capitalize) rating",fields:{impact:"$t(uncontrolled_one, capitalize) $t(impact_one)",likelihood:"$t(uncontrolled_one, capitalize) $t(likelihood_one)",nextTestDate:"Next test date",rating:"$t(uncontrolled_one, capitalize) rating",rationale:"Rationale",rationale_placeholder:"Enter a rationale"},tab_title:"$t(uncontrolled_one, capitalize) rating"},$f={day_one:"day",day_other:"days",week_one:"week",week_other:"weeks"},Df={day_one:"{{count}} day",day_other:"{{count}} days"},Pf="{{entity, capitalize}} updated successfully",wf="Upper appetite",Rf={add_button:"Add Members",columns:{created_by_user:"Added by",created_on:"Added on",email:"Email",firstName:"First name",lastName:"Last name",name:"Name",role:"Role",status:"Status",username:"Username"},confirm_remove_message:"Are you sure you want to remove these users?",create_modal_title:"Add Users",entity_name:"member",fields:{placeholders:{users:"Select"},users:"Users"},membersTableTitle:"Members",remove_button:"Remove"},Sf={add_button:"Add Group",cannot_delete_message:"The following groups cannot be deleted because they are linked to one or more approval workflows. Please remove them from the workflows first.",columns:{created_by_user:"Created by",created_on:"Created on",description:"Description",email:"Email address",members:"Members",name:"Name",owner_contributor:"Owner / Contributor",updated_by_user:"Updated by",updated_on:"Updated on"},confirm_delete_message:"Are you sure you want to delete these groups?",create_modal_title:"Add Group",delete:"Delete",edit_modal_title:"Edit Group",entity_name:"group",fields:{OwnerContributorField:"Owner / Contributor",descriptionField:"Description",emailField:"Email",nameField:"Name",placeholders:{description:"Enter a description",email:"Enter a group email address",name:"Enter a group name"}},group_page_title:"Edit User Group",groupsTableTitle:"Groups",help:[{content:"",title:""}],page_title:"User Groups",tabs:{details:"Details",members:"Members"}},kf={create_modal_title:"Search preferences",edit_modal_title:"Search preferences",entity_name:"Search preferences",fields:{filterByActivePlatformUsers:"Filter by active platform users",showArchivedUsers:"Show archived users",showDirectoryDepartments:"Show directory departments",showGroups:"Show groups",showInheritedContributors:"Show inherited owners",showUserEmail:"Show user email",showUserJobTitle:"Show user job title",showUserLocation:"Show user location",showUserPlatformRole:"Show user platform role"},headings:{attributes:"Attributes",sections:"Sections"}},Uf={columns:{createdByUser:"Created by",created_on:"Created on",department:"Department",displayName:"Display name",email:"Email address",firstName:"First name",jobTitle:"Job title",lastName:"Last name",lastSeen:"Last seen",modifiedAtTimestamp:"Modified at",modifiedByUser:"Modified by",name:"Name",officeLocation:"Office location",role:"Role",status:"Status",userGroups:"Groups",userId:"ID",username:"Username"},edit_modal_title:"Edit User",entity_name:"user",fields:{role:"Role",role_help:"The role of the user within the RiskSmart platform. Note that you can only change the role for users that have been provisioned via SCIM.",role_placeholder:"Select",roles:"Roles",roles_help:"The roles of the user within the RiskSmart platform. Note that you can only change the roles for users that have been provisioned via SCIM."},help:[{content:"",title:""}],usersTableTitle:"Users"},Of="Users",Bf="versions",qf="View",Nf={create_modal_title:"Edit Widget Settings",edit_modal_title:"Edit Widget Settings",entity_name:"widget",error_fallback:"An error has occurred",error_fallback_title:"Error",settings:"Settings"},Ff={forms:{createAssessmentButton:"Create $t(assessment_one, capitalize)",linkAssessmentHelp:"",linkAssessmentLabel:"$t(assessment_one, capitalize)",linkAssessmentPlaceholder:"Select $t(assessment_one)",linkModalTitle:"Link to an $t(assessment_one, capitalize)"},steps:[{controlType:"",description:"",showModal:"",tab:"",title:""}],wizardName:"RCSA",wizardTitle:"RCSA $t(wizard_one, capitalize)"},Ef="Select entity",Mf="Organisation logo",zf="Page link copied to clipboard!",xf="Failed to copy link to clipboard",Lf="Link copied!",Gf="Copy page link",jf="Page Content",Vf="No content available from the current page.",Wf={helpAndInformation:"Help and information",getHelpAndInformation:"Get help and information",viewNotifications:"View notifications",viewYourNotifications:"View your notifications",aiAssistant:"AI Assistant",openAiAssistant:"Open AI Assistant"},Qf={false:"No",true:"Yes"},Hf={page_title:"Automations",get_started:"Get Started",coming_soon:"Coming Soon",early_access:"Early Access",contact_customer_success:"Contact your Customer Success team to enable this integration.",credentials_contact_notice:"To manage API credentials, contact your administrator or Customer Success team to get the required permissions.",close:"Close",cards:{zapier_self_managed:{name:"Zapier (Self-Managed)",description:"Your Zapier account, your rules.",content:"Connect using your API credentials. Manage your own Zaps, choose your apps, and control your Zapier subscription — full flexibility for technical teams.",modal_title:"Zapier (Self-Managed)",modal_description:"Connect your existing Zapier account to RiskSmart using your External API credentials. You manage your own Zapier subscription, create and maintain your own Zaps, and have full control over your integrations. Perfect for teams who already use Zapier or want direct control over their automation setup.",features_title:"What you can do",features_description:"Find RiskSmart in the Zapier App Directory and connect with your API client key and secret. Build custom Zaps that trigger actions whenever risks, controls, or issues change. Sync data to spreadsheets, create tasks in project management tools, send alerts — all managed through your own Zapier account.",create_zap:"Create a Zap",browse_apps:"Browse Apps",manage_credentials:"Manage API Credentials",close:"Close"},zapier_by_risksmart:{name:"Zapier by RiskSmart",description:"Automate without the setup.",content:"We host and manage everything — connect to 7,000+ apps without leaving the platform. No separate Zapier account or API credentials required.",modal_title:"Zapier by RiskSmart",modal_description:"RiskSmart provides a rich, embedded integration experience right inside the platform. Browse thousands of apps, build powerful automated workflows, and manage everything from a single place — we host the integrations and handle the complexity for you.",features_title:"What you can do",features_description:"Create automated workflows connecting RiskSmart to Slack, Jira, Microsoft Teams, Google Sheets, and thousands more — all from within RiskSmart. No separate accounts to manage, no credentials to configure. Start with pre-built templates for common GRC workflows or build your own custom automations.",get_started:"Connect Zapier",close:"Close"},mcp_server_integrations:{name:"MCP Server for Integrations",description:"Always-on enterprise AI.",content:"Connect long-running B2B AI systems to RiskSmart for automated compliance monitoring, continuous risk intelligence, and deep data pipelines.",modal_title:"MCP Server for Integrations",modal_description:"The MCP Server for Integrations provides a secure, enterprise-ready connection point for B2B AI systems. Designed for long-lasting, always-on integrations that power automated compliance workflows, continuous risk monitoring, and intelligent data pipelines across your organisation's AI infrastructure.",features_title:"What you can do",features_description:"Enable enterprise AI systems to securely access and update your risk data in real time. Power automated compliance monitoring, continuous control testing, and intelligent evidence collection. Build deep integrations between RiskSmart and your organisation's AI infrastructure for always-on risk intelligence.",close:"Close"},mcp_personal:{name:"MCP Personal",description:"Your AI, your risk data.",content:"Connect Claude, ChatGPT, and other AI assistants directly to your risks for natural language queries and on-the-fly insights.",modal_title:"MCP Personal",modal_description:"Connect your favourite AI productivity tools directly to RiskSmart. Ask questions about your risks and controls in natural language, generate reports on the fly, and get intelligent insights — all from the AI assistant you already use every day.",features_title:"What you can do",features_description:"Query your risks, controls, and issues using natural language in Claude, ChatGPT, or other AI tools. Generate risk summaries and trend analysis on the fly. Draft risk assessments, identify control gaps, and surface insights that would take hours to find manually — all from your personal AI assistant.",close:"Close"},rest_api:{name:"REST API",description:"Full programmatic access.",content:"Build custom dashboards, reporting pipelines, and internal tools with complete read/write API access to your risk data.",modal_title:"REST API",modal_description:"The RiskSmart REST API gives your development team complete programmatic access to read and write risk data. Build custom dashboards, integrate with internal tools, feed data into reporting pipelines, or create entirely new experiences on top of RiskSmart.",features_title:"What you can do",features_description:"Access all your risks, controls, issues, and assessments through a clean, well-documented API. Build real-time dashboards, automate data exports, create custom reporting integrations, and connect RiskSmart to any system in your technology stack.",manage_credentials:"Manage API Credentials",view_docs:"View API Documentation",close:"Close"},slack:{name:"Slack App",description:"Risk management in Slack.",content:"Get instant notifications, approve actions, and interact with RiskSmart data right where your team collaborates."}},create_automation_modal:{title:"Create Automation",zapier_placeholder_title:"Zapier Workflow Builder",zapier_placeholder_description:"Create automated workflows connecting RiskSmart to thousands of apps. Search for 'RiskSmart' when selecting your trigger or action app.",zapier_open_editor:"Create Zap on Zapier.com",zapier_open_editor_hint:"Opens in a new tab.",zapier_manage_zaps:"Manage existing Zaps",zapier_load_error:"Failed to load the Zapier workflow builder. Please try again later."}},Yf={add_button:"Create Credentials",help:[{content:"Manage access credentials for use with the RiskSmart API",title:"API Credentials"}],info_message:"Manage API credentials that provide secure programmatic access to your RiskSmart data. Use them to integrate with external applications, automate workflows, or build custom integrations.",view_documentation:"View API documentation",max_clients_warning:"You have reached the maximum number of API credentials allowed for your organisation. Please delete an existing credential to create a new one.",delete_warning_message:"Deleting API credentials will immediately revoke API access for any applications or integrations using these credentials.",confirm_delete_message:"Are you sure you want to delete the selected API credentials?",table_title:"API client credentials",columns:{createdByUser:"Created by",createdAtTimestamp:"Created on",name:"Name",clientKey:"Client Key",apiVersion:"API Version",status:"Status",scopes:"Permissions",modifiedByUser:"Updated by",modifiedAtTimestamp:"Updated on"},create_modal:{title:"Create new API credentials",error_scopes_required:"Please select at least one permission scope",success_message:"Credentials created successfully",error_message:"Failed to create credentials",cancel_button:"Cancel",submit_button:"Create",close_button:"Close",credentials_created_title:"API Credentials Created",secret_warning_title:"Important: Save Your Credentials",secret_warning_message:"This is the only time you will be able to view the client secret. Please copy it now and store it securely.",credential_name_label:"Credential Name",client_key_label:"Client Key",client_secret_label:"Client Secret"},create_modal_title:"Add credential",delete_button:"Delete credential",delete_modal_title:"Delete credential",delete_success_message:"Credential deleted successfully",delete_error_message:"Failed to delete credentials",entity_name:"Client Credential",fields:{name:"Name",name_description:"name must only include letters, numbers, spaces, '.', and '-'",scopes:"Permissions",scopes_description:"assign permissions to credentials",name_help:"Enter a name for the credential",name_placeholder:"Enter a credential name",select_resource:"Select a resource",add_another_resource:"Add another resource",select_all_read:"Read All",select_all_write:"Write All",clear_all:"Clear",read_all_resources:"Read All",write_all_resources:"Write All",configure_custom:"Configure",clear_all_resources:"Clear",using_wildcard_read:"Full read access granted to all resources (*:read)",using_wildcard_write:"Full write access granted to all resources (*:write)",using_wildcard_both:"Full read and write access granted to all resources",remove_resource:"Remove",nested_resources:"Nested resources",no_resources_available:"No resources available"},loading_message:"Loading API client credentials",tab_title:"API Credentials",update_success_message:"Credential updated successfully"},Kf={tab_title:"Integrations",help:[{content:"View and manage integrations connected to your RiskSmart organisation",title:"Integrations"}],page_description:"Manage third-party integrations that connect to your RiskSmart data. Enable an integration to allow credential creation and configure access.",credentials_section_title:"Integration client credentials",credentials_section_description:"Credentials used by your connected integrations",enabled:"Enabled",disabled:"Disabled",zapier:{name:"Zapier",description:"Connect RiskSmart to thousands of apps with automated workflows. Create triggers for risk events, sync data with external systems, and automate compliance tasks. Zapier is a user level integration that can be set up by any user with API credentials.",status_connected:"Connected",status_not_connected:"Not connected",credentials_count_one:"{{count}} active credential",credentials_count_other:"{{count}} active credentials",setup_guide:"View Zapier setup guide"}},Jf={"Controlled Rating":"$t(controlled_one, capitalize) Rating","Uncontrolled Rating":"$t(uncontrolled_one, capitalize) Rating",acceptanceRegister:Bc,propertyFilter:qc,acceptances:Nc,accessDenied:Fc,actionUpdate:Ec,actionUpdates:Mc,action_test:zc,actions:xc,actionsButton:Lc,active:Gc,addControl:jc,advanced:Vc,appVersionTitle:Wc,appetitePerformance:Qc,appetiteTypes:Hc,appetites:Yc,appetitesRegister:Kc,approvals:Jc,approve:Zc,archive:Xc,archived:ep,assessment:tp,assessmentActivities:rp,assessmentResults:ip,assessments:ap,attestations:sp,auditLog:np,authenticationSettings:op,sso:lp,booleanRadio:dp,cancel:up,causes:cp,clearFilter:pp,close:mp,closeModal:_p,colours:fp,columns:yp,complianceMonitoringAssessment:hp,confirm:gp,confirmDelete:Ip,confirmRemove:bp,consequences:Tp,control:Ap,controlGroup:Cp,controlGroups:vp,controlTestDetails:$p,controlTestResult:Dp,controlType:Pp,controlledRiskAssessment:wp,controls:Rp,create:Sp,create_success_message:kp,create_version:Up,currency:Op,customAttributes:Bp,customDatasources:qp,customForms:Np,customisableRibbons:Fp,customRoles:Ep,dashboard:Mp,dataExport:zp,dataImport:xp,dataImportResult:Lp,dateRangeInput:Gp,delete:"Delete",delete_success_message:jp,departments:Vp,designEffectiveness:Wp,details:Qp,distribute:Hp,documentAssessments:Yp,documentFiles:Kp,document_one:Jp,document_other:Zp,edit:Xp,editAcceptanceHeader:em,editAppetiteHeader:tm,effectiveDate:rm,enterAValue:im,enterDetailsAboutTest:am,enterRiskAppetiteStatement:sm,enterpriseRisks:nm,entity:om,export:{cancel:"Cancel",custom_pdf_header:"Customise PDF export",custom_pdf_hide_ribbon:"Hide ribbon in export",custom_pdf_orientation_label:"Orientation",custom_pdf_subtitle_label:"Subtitle",custom_pdf_subtitle_placeholder:"Optional subtitle",custom_pdf_title_label:"Title",custom_pdf_title_placeholder:"Export title",export:"Export",export_failed_header:"Export failed",export_failed_message:"Something went wrong",export_success_download_text:"Download now",export_success_header:"Export successful",export_success_message:"Link expires in",export_success_message_time_unit:"minutes",exporting:"Exporting...",exporting_message:"Your export is being prepared. You will be notified when it is ready.",images:{export_jpeg:"Export as JPEG",export_png:"Export as PNG",export_svg:"Export as SVG"},orientation:{landscape:"Landscape",portrait:"Portrait"}},fields:lm,form:dm,formBuilder:um,frequency:cm,groups:pm,help:mm,impact:_m,impactAppetite:fm,impactRatings:ym,impactRatingsMultiple:hm,impacts:gm,indicator:Im,indicator_result:bm,indicator_results:Tm,indicators:Am,internalAuditAssessmentResults:Cm,internalAuditReports:vm,internalAudits:$m,issueAssessment:Dm,issueBreachLogAssessment:Pm,issueBreachLogTypes:wm,issueConsumerDutyAssessment:Rm,issueConsumerDutyTypes:Sm,issueCustomerTrustAssessment:km,issueCustomerTrustTypes:Um,issueGDPRBreachLogAssessment:Om,issueGDPRBreachLogTypes:Bm,issuePCIBreachLogAssessment:qm,issuePCIBreachLogTypes:Nm,issueRiskEventAssessment:Fm,issueRiskEventTypes:Em,issueSARLogAssessment:Mm,issueSARLogTypes:zm,issueTypes:xm,issueUpdates:Lm,issues:Gm,issuesBreachLog:jm,issuesConsumerDuty:Vm,issuesCustomerTrust:Wm,issuesGDPRBreachLog:Qm,issuesPCIBreachLog:Hm,issuesRiskEvents:Ym,issuesSARLog:Km,linkControl:Jm,linkedItems:Zm,loading:Xm,loadingAppetites:e_,loadingTestResults:t_,lowerAppetite:r_,modules:i_,myItems:a_,navigationMenu:s_,nextPage:n_,nextTestDate:o_,noItems:l_,noItemsFound:d_,noItemsToDisplay:u_,noMatchFound:c_,noMatchedFound:p_,noMatches:m_,notification_settings:__,notificationHistory:f_,notifications:y_,objectTypes:h_,obligations:g_,obligationChanges:I_,documentReview:b_,indicatorTest:T_,obligationReview:A_,obligationsAssessments:C_,owner:v_,performance:$_,performanceEffectiveness:D_,performedBy:P_,plan_questionnaire:w_,policy:R_,previousPage:S_,publicPolicies:k_,publish:U_,questionnaire_invite:O_,questionnaire_template_versions:B_,questionnaire_templates:q_,ratings:N_,recents:F_,redirect_prompt:E_,redirect_title:M_,reject:z_,relativeTimes:x_,remove:L_,remove_success_message:G_,requests:j_,risk:V_,riskAppetite:W_,riskAppetiteStatement:Q_,risks:H_,riskScoringSettings:Y_,save:K_,searchForAPerson:J_,select:Z_,setAcceptanceHeader:X_,signOut:ef,signedIn:tf,slackCallback:rf,status:af,statuses:sf,submit_for_approval:nf,switchOrg:of,tables:lf,tags:df,taxonomy:uf,testDate:cf,testResults:pf,testSchedule:mf,testType:_f,testTypes:ff,textInference:yf,third_party:hf,third_party_responses:gf,tiers:If,title:bf,titleField:Tf,tokens:Af,treatments:Cf,uncontrolledRiskAssessment:vf,unitOfTime:$f,units:Df,update_success_message:Pf,upperAppetite:wf,userGroupMembers:Rf,userGroups:Sf,userSearchPreferences:kf,userSettings:Uf,users:Of,versions:Bf,view:qf,widget:Nf,wizard:Ff,selectEntity:Ef,organisationLogo:Mf,linkCopiedSuccess:zf,linkCopyError:xf,linkCopied:Lf,copyPageLink:Gf,pageContent:jf,noContentAvailable:Vf,actionButton:Wf,yesOrNo:Qf,automations:Hf,externalApi:Yf,integrations:Kf},kn=new Proxy({},{get(t,e){if(!(e==="then"||e==="toJSON"||e==="__proto__"||e==="Symbol(Symbol.toPrimitive)"))return kn}}),Zf=(()=>{let t=!1;return()=>{if(t)return;t=!0,Bt.isInitialized||Bt.init({lng:"en",fallbackLng:"en",defaultNS:"common",ns:["common"],resources:{en:{common:Jf}},interpolation:{escapeValue:!1}});const e=Bt.services?.formatter;e&&(e.add("capitalize",r=>`${r.substring(0,1).toUpperCase()}${r.substring(1)}`),e.add("capitalizeAll",r=>r?.replace(/(^\w{1})|(\s+\w{1})/g,i=>i?.toUpperCase())),e.add("article",r=>{const i=["a","e","i","o","u"],a=r?.charAt(0)?.toLowerCase();return`${i.includes(a)?"an":"a"} ${r}`}),e.add("plural",r=>`${r}s`),e.add("lowercase",r=>r?.toLowerCase()))}})();let Fr=null;const Xf=()=>{if(Fr)return Fr;const t=Bt.createInstance();return t.use(_u).init({lng:"en",fallbackLng:"en",ns:["common"],defaultNS:"common",resources:{en:{common:kn}},interpolation:{escapeValue:!1},parseMissingKeyHandler:e=>{const r=s=>s.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/_/g," ").replace(/^./,n=>n.toUpperCase())||s,i=e.split("."),a=i[i.length-1]??e;return a==="sectionTitle"&&i.length>=2?r(i[i.length-2]):r(a.replace(/Title$/,""))||e}}),Fr=t,t},ey={name:"James Romero",email:"james.romero@risksmart.com",picture:void 0,sub:"auth0|storybook",claims_username:"James Romero",claims_organization_name:"RiskSmart Inc.",claims_tenant:"risksmart","https://hasura.io/jwt/claims":{"x-hasura-default-role":"admin","x-hasura-allowed-roles":["admin"],"x-hasura-user-id":"storybook-user","x-hasura-logo":"","x-hasura-applogo":""}},Ot={request:{query:yu},result:{data:{entity:[]}}},ty=[Ot,Ot,Ot,Ot],ry=({apolloMocks:t=[],children:e,initialPath:r="/"})=>{const i=S.useMemo(()=>(Zf(),Xf()),[]),a=S.useMemo(()=>qn([{path:"/",element:e},{path:"/internal-audits",element:e},{path:"/internal-audits/dashboard",element:e},{path:"/internal-audits/reports",element:e},{path:"/internal-audits/findings",element:e},{path:"/risks",element:e},{path:"/risks/dashboard",element:e},{path:"/risks/:id",element:e},{path:"/appetites",element:e},{path:"/acceptances",element:e},{path:"/policy",element:e},{path:"/policy/:id",element:e},{path:"/opres",handle:{title:"Operational resilience"},children:[{path:"ibs",handle:{title:"Important Business Services"},children:[{index:!0,element:e},{path:"create",element:e,handle:{title:"Create new IBS"}},{path:":id",element:e,handle:{title:"Service detail"},children:[{path:"attest",element:e,handle:{title:"Submit attestation"}}]}]},{path:"scenarios",handle:{title:"Scenarios & self-assessments"},children:[{index:!0,element:e},{path:"create",element:e,handle:{title:"Schedule new scenario"}}]},{path:"vulnerabilities",element:e,handle:{title:"Vulnerabilities"}}]},{path:"/compliance",element:e},{path:"/compliance/dashboard",element:e},{path:"/compliance/changes",element:e},{path:"/compliance/monitoring",element:e},{path:"/compliance/findings",element:e},{path:"/third-party",element:e},{path:"/third-party/questionnaire",element:e},{path:"/third-party/questionnaire-responses",element:e},{path:"/controls",element:e},{path:"/controls/tests",element:e},{path:"/control-groups",element:e},{path:"/issues",element:e},{path:"/actions",element:e},{path:"/indicator",element:e},{path:"/assessments",element:e},{path:"/assessments/activities",element:e},{path:"/assessments/findings",element:e},{path:"/reports",element:e},{path:"/report-an-issue",element:e},{path:"/documents",element:e},{path:"/requests",element:e},{path:"/settings",element:e},{path:"*",element:e}],{initialEntries:[r]}),[e,r]),s=S.useMemo(()=>[...ty,...t],[t]);return ae.jsx(Tn,{children:ae.jsx(fu,{i18n:i,children:ae.jsx(Nn,{domain:"storybook.local",clientId:"storybook",authorizationParams:{redirect_uri:"http://localhost"},skipRedirectCallback:!0,children:ae.jsx(iy,{children:ae.jsx(Vu,{mocks:s,addTypename:!1,children:ae.jsx(Sn,{children:ae.jsx(Fn,{router:a})})})})})})})},iy=({children:t})=>ae.jsx(En.Provider,{value:{isAuthenticated:!0,isLoading:!1,user:ey,getAccessTokenSilently:async()=>"storybook-token",getAccessTokenWithPopup:async()=>"storybook-token",getIdTokenClaims:async()=>({}),loginWithRedirect:async()=>{},loginWithPopup:async()=>{},logout:()=>{},handleRedirectCallback:async()=>({})},children:t});ry.__docgenInfo={description:"",methods:[],displayName:"RealProviders",props:{apolloMocks:{required:!1,tsType:{name:"unknown"},description:"",defaultValue:{value:"[]",computed:!1}},children:{required:!0,tsType:{name:"ReactElement"},description:""},initialPath:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'/'",computed:!1}}}};export{ys as A,yu as G,fy as H,O as N,xt as O,ry as R,su as a,ue as b,dy as c,hs as d,q as e,Xe as f,nu as g,Qt as h,w as i,ne as j,Se as k,my as l,Tr as m,_y as n,j as o,Te as r,yy as z};
