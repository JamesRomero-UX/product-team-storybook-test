start
  = expression

expression
  = orExpr

orExpr
  = left:andExpr " or "i right:expression {
      return { op: "or", left: left, right: right };
    }
  / andExpr

andExpr
  = left:primaryExpr " and "i right:andExpr {
      return { op: "and", left: left, right: right };
    }
  / primaryExpr

primaryExpr
  = "(" _ expr:expression _ ")" { return expr; }
  / simpleExpr

simpleExpr
  = attribute:attrName _ operator:op _ value:attrValue {
      return { attribute: attribute, operator: operator, value: value };
    }

attrName
  = $(complexAttrName / simpleAttrName)

simpleAttrName
  = [a-zA-Z][a-zA-Z0-9]*

complexAttrName
  = simpleAttrName (subquery / property)*

subquery
  = "[" _ attribute:simpleAttrName _ operator:op _ value:attrValue _ "]"

property
  = "." simpleAttrName

op
  = "eq" // Extend with other operators as needed

attrValue
  = string / boolean / null / number

string
  = '"' chars:([^"]*) '"' { return chars.join(""); }

boolean
  = "true" { return true; }
  / "false" { return false; }

null
  = "null" { return null; }

number
  = $([0-9]+) { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
