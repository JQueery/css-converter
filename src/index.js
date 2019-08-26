import "./styles.css";
$(document).ready(() => {
  // Get Style element content from HTML input
  const getStyle = text => {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(text, "text/html");

    let style = parsedDocument.getElementsByTagName("style")[0];

    //Conditional if style block exits
    return style ? [parsedDocument, style.innerText] : false;
  };

  // Add styles to DOM elements from array of objects
  const addStyles = (json, doc) => {
    let arr = JSON.parse(json);

    //Iterate through array of DOM element css objects
    for (let i = 0; i < arr.length; i++) {
      let selector = arr[i]["selectorText"];
      let style = arr[i]["style"];

      //add the inline css
      let element = doc.querySelector(selector);
      if (!element) continue;
      element.setAttribute("style", style.cssText);
    }

    //remove style element from DOM
    let styleElement = doc.querySelector("style");
    styleElement.parentNode.removeChild(styleElement);

    //Convert DOM nodes into string
    let html = new XMLSerializer();
    var doc = html.serializeToString(doc);
    return doc;
  };

  // Parse CSS functions/algorithms parseCss, parseRule, stringifyRule
  const parseCss = text => {
    let tokenizer = /([\s\S]+?)\{([\s\S]*?)\}/gi,
      rules = [],
      rule,
      token;
    text = text.replace(/\/\*[\s\S]*?\*\//g, "");
    while ((token = tokenizer.exec(text))) {
      let style = parseRule(token[2].trim());
      style.cssText = stringifyRule(style);
      rule = {
        selectorText: token[1].trim().replace(/\s*\,\s*/, ", "),
        style: style
      };
      rule.cssText = rule.selectorText + " { " + rule.style.cssText + " }";
      rules.push(rule);
    }
    return rules;
  };

  const parseRule = css => {
    let tokenizer = /\s*([a-z\-]+)\s*:\s*((?:[^;]*url\(.*?\)[^;]*|[^;]*)*)\s*(?:;|$)/gi,
      obj = {},
      token;
    while ((token = tokenizer.exec(css))) {
      obj[token[1].toLowerCase()] = token[2];
    }
    return obj;
  };

  const stringifyRule = style => {
    let text = "",
      keys = Object.keys(style).sort();
    for (let i = 0; i < keys.length; i++) {
      let keys1 = keys[i];
      let styleKeys = style[keys[i]];
      text += ` ${keys1}: ${styleKeys};`;
    }
    return text.substring(1);
  };

  // Execute everything!
  $("#button").click(() => {
    //Parse CSS and get CSS Object
    let input = getStyle($("#input").val());
    if (!input) return alert("This HTML does not contain a Style block");

    let parsed = parseCss(input[1]);
    let parsedDoc = input[0];
    let cssObj = JSON.stringify(parsed, null, 2);

    //Output final html
    let finalOutput = addStyles(cssObj, parsedDoc);
    $("#output").text(finalOutput);
  });
});
