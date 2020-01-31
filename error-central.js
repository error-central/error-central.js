// var ec = new function () {

// Settings
var useCache = true;
var doSo = true;
var doSoGeneric = true;
var doGithub = true;
var doEc = true;
// Github Repo E.g. "error-central/javascript-errors-notifier"
var repo = window.localStorage.getItem('repo') || "error-central/error-central.js";

/**
 * Find generic versino of error without code-specific variable names
 * From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors
 * @param {*} errorText Text of error
 * Returns { cleanError ,  errorDocUrl }
 */
function genericizeError(errorText) {
	l = navigator.language;
	standardErrors = [
		[/Error: Permission denied to access property (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Property_access_denied"],
		[/InternalError: too much recursion/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Too_much_recursion"],
		[/RangeError: argument is not a valid code point/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Not_a_codepoint"],
		[/RangeError: invalid array length/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_array_length"],
		[/RangeError: invalid date/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_date"],
		[/RangeError: precision is out of range/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Precision_range"],
		[/RangeError: radix must be an integer/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Bad_radix"],
		[/RangeError: repeat count must be less than infinity/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Resulting_string_too_large"],
		[/RangeError: repeat count must be non-negative/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Negative_repetition_count"],
		[/ReferenceError: (\S+) is not defined/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Not_defined"],
		[/ReferenceError: assignment to undeclared variable (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Undeclared_var"],
		[/ReferenceError: can't access lexical declaration`X' before initialization/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_access_lexical_declaration_before_init"],
		[/ReferenceError: deprecated caller or arguments usage/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_caller_or_arguments_usage"],
		[/ReferenceError: invalid assignment left-hand side/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_assignment_left-hand_side"],
		[/ReferenceError: reference to undefined property (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Undefined_prop"],
		[/SyntaxError: \"0\"-prefixed octal literals and octal escape seq. are deprecated/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_octal"],
		[/SyntaxError: \"use strict\" not allowed in function with non-simple parameters/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Strict_Non_Simple_Params"],
		[/SyntaxError: (\S+) is a reserved identifier/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Reserved_identifier"],
		[/SyntaxError: JSON.parse: bad parsing/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse"],
		[/SyntaxError: Malformed formal parameter/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Malformed_formal_parameter"],
		[/SyntaxError: Unexpected token/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Unexpected_token"],
		[/SyntaxError: Using \/\/@ to indicate sourceURL pragmas is deprecated. Use \/\/# instead/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_source_map_pragma"],
		[/SyntaxError: a declaration in the head of a for-of loop can't have an initializer/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_for-of_initializer"],
		[/SyntaxError: applying the 'delete' operator to an unqualified name is deprecated/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Delete_in_strict_mode"],
		[/SyntaxError: for-in loop head declarations may not have initializers/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_for-in_initializer"],
		[/SyntaxError: function statement requires a name/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Unnamed_function_statement"],
		[/SyntaxError: identifier starts immediately after numeric literal/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Identifier_after_number"],
		[/SyntaxError: illegal character/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Illegal_character"],
		[/SyntaxError: invalid regular expression flag (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Bad_regexp_flag"],
		[/SyntaxError: missing \) after argument list/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_parenthesis_after_argument_list"],
		[/SyntaxError: missing \) after condition/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_parenthesis_after_condition"],
		[/SyntaxError: missing : after property id/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_colon_after_property_id"],
		[/SyntaxError: missing ; before statement/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_semicolon_before_statement"],
		[/SyntaxError: missing = in const declaration/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_initializer_in_const"],
		[/SyntaxError: missing \] after element list/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_bracket_after_list"],
		[/SyntaxError: missing formal parameter/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_formal_parameter"],
		[/SyntaxError: missing name after . operator/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_name_after_dot_operator"],
		[/SyntaxError: missing variable name/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/No_variable_name"],
		[/SyntaxError: missing \} after function body/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_curly_after_function_body"],
		[/SyntaxError: missing \} after property list/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Missing_curly_after_property_list"],
		[/SyntaxError: redeclaration of formal parameter (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Redeclared_parameter"],
		[/SyntaxError: return not in function/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Bad_return_or_yield"],
		[/SyntaxError: test for equality \(==\) mistyped as assignment \(=\)?/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Equal_as_assign"],
		[/SyntaxError: unterminated string literal/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Unterminated_string_literal"],
		[/TypeError: (\S+) has no properties/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/No_properties"],
		[/TypeError: (\S+) is not a constructor/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Not_a_constructor"],
		[/TypeError: (\S+) is not a function/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Not_a_function"],
		[/TypeError: (\S+) is not a non-null object/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/No_non-null_object"],
		[/TypeError: (\S+) is read-only/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Read-only"],
		[/TypeError: (\S+) is not iterable/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/is_not_iterable"],
		[/TypeError: (\S+) is \(not\) (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Unexpected_type"],
		[/TypeError: More arguments needed/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/More_arguments_needed"],
		[/TypeError: Reduce of empty array with no initial value/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Reduce_of_empty_array_with_no_initial_value"],
		[/TypeError: X.prototype.y called on incompatible type/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Called_on_incompatible_type"],
		[/TypeError: can't access dead object/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Dead_object"],
		[/TypeError: can't access property (\S+) of (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_access_property"],
		[/TypeError: can't assign to property (\S+) on (\S+): not an object/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_assign_to_property"],
		[/TypeError: can't define property (\S+): \"obj\" is not extensible/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_define_property_object_not_extensible"],
		[/TypeError: can't delete non-configurable array element/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Non_configurable_array_element"],
		[/TypeError: can't redefine non-configurable property (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_redefine_property"],
		[/TypeError: cannot use 'in' operator to search for (\S+) in (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/in_operator_no_object"],
		[/TypeError: cyclic object value/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value"],
		[/TypeError: invalid 'instanceof' operand (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/invalid_right_hand_side_instanceof_operand"],
		[/TypeError: invalid Array.prototype.sort argument/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Array_sort_argument"],
		[/TypeError: invalid arguments/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Typed_array_invalid_arguments"],
		[/TypeError: invalid assignment to const (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Invalid_const_assignment"],
		[/TypeError: property (\S+) is non-configurable and can't be deleted/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Cant_delete"],
		[/TypeError: setting getter-only property (\S+)/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Getter_only"],
		[/TypeError: variable (\S+) redeclares argument/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Var_hides_argument"],
		[/URIError: malformed URI sequence/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Malformed_URI"],
		[/Warning: 08\/09 is not a legal ECMA-262 octal constant/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Bad_octal"],
		[/Warning: -file- is being assigned a \/\/# sourceMappingURL, but already has one/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Already_has_pragma"],
		[/Warning: Date.prototype.toLocaleFormat is deprecated/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_toLocaleFormat"],
		[/Warning: JavaScript 1.6's for-each-in loops are deprecated/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/For-each-in_loops_are_deprecated"],
		[/Warning: String.x is deprecated; use String.prototype.x instead/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_String_generics"],
		[/Warning: expression closures are deprecated/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Deprecated_expression_closures"],
		[/Warning: unreachable code after return statement/, "https://developer.mozilla.org/" + l + "/docs/Web/JavaScript/Reference/Errors/Stmt_after_return"],
	];


	for (standardError of standardErrors) {
		errorRegex = standardError[0];
		m = errorText.match(errorRegex);
		if (m) {
			// Return the generic version of the error, stripping out regex symbols
			cleanErrorText = (errorRegex.toString().replace(/\(\\S\+\)/g, "").slice(1, -1));
			// console.log(m);
			// console.log(standardError[1]);
			return {
				"genericError": cleanErrorText, "errorDocUrl": standardError[1]
			};
		}
	}
	// Not match was found
	return {
		"cleanError": null, "errorDocUrl": null
	};
}

/**
 * Log Stack exchange formatted HTML as good as possible
 * to console.log()
 */
function consoleHtml(str) {
	str = str.replace(/<pre><code>/g, "<precode>");
	str = str.replace(/<\/code><\/pre>/g, "</precode>");
	str = str.replace(/\n\n/g, "\n");
	let myRe = /(<p>|<precode>|<code>|<\/code>)/g;
	let myArray;
	let out = [];
	while ((myArray = myRe.exec(str)) !== null) {
		if (myArray[0] == "<p>")
			out.push('"color: #242729; font-family: Arial, Helvetica;"');
		else if (myArray[0] == "<precode>")
			out.push('"color: black; background-color: #eff0f1; font-family: Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace;"');
		else if (myArray[0] == "<code>")
			out.push('"color: black; background-color: #eff0f1; font-family: monospace, Courier;"');
		else if (myArray[0] == "<\\code>")
			out.push('"color: #242729; font-family: Arial, Helvetica;"'); // same as <p>
	}
	str = str.replace(myRe, "%c");
	str = str.replace(/(<\/p>|<\/precode>)/g, "");
	str = str.replace(/"/g, "'");
	const logcode = `console.log(\`${str}\`,${out.join(",")});`;
	try {
		eval(logcode);
	}
	catch (e) {
		// Fallback
		console.log(str);
	}
}

/**
 * Search Stack Overflow
 * @param {*} error
 */
function searchSo(error) {
	return new Promise((resolve, reject) => {
		if (!doSo || !error) {
			return resolve("");
		}
		let r = window.sessionStorage.getItem(`so:${error.text}`);
		if (r && useCache) {
			// Cache hit
			// console.info('SO cache hit')
			return resolve(r);
		}
		else {
			// No cache hit
			const soQueryUrl = `https://api.stackexchange.com/2.2/search/advanced?order=desc&sort=relevance&answers=1&filter=withbody&site=stackoverflow&q=${encodeURIComponent(error.text)}`;
			let soReq = new XMLHttpRequest();
			soReq.open('GET', soQueryUrl);
			soReq.onload = () => {
				window.sessionStorage.setItem( // Cache
					`so:${error.text}`, soReq.responseText);
				resolve(soReq.responseText);
			};
			soReq.send();
		}
	});
}

/**
 * Search Github Issues
 * @param {*} error
 */
function searchGithub(error) {

	return new Promise((resolve, reject) => {
		if (!doGithub) {
			resolve(""); // Hacky way to indicate we turned off this search
		}
		let r = window.sessionStorage.getItem(`github:${error.text}`);
		if (r && useCache) {
			// Cache hit
			// console.info('github cache hit')
			resolve(r);
		}
		else {
			// No cache hit, do it
			const githubQueryUrl = `https://api.github.com/search/issues?sort=updated-desc&q=type:issue+repo:${repo}+${encodeURIComponent(error.text)}`;
			let githubReq = new XMLHttpRequest();
			githubReq.open('GET', githubQueryUrl);
			githubReq.onload = () => {
				window.sessionStorage.setItem( // Cache
					`github:${error.text}`,
					githubReq.responseText);
				resolve(githubReq.responseText);
			};
			githubReq.send();
		}
	});
}

/**
* Search Error Central for matches
* @param {*} error
*/
function searchEc(error) {
	return new Promise((resolve, reject) => {
		if (!doEc) {
			resolve("");
		}
		let r = window.sessionStorage.getItem(`ec:${error.text}`);
		if (false && r && useCache) {
			// Cache hit
			console.info('ec cache hit');
			resolve(r);
		}
		else {
			// No cache hit, do it
			const ecQueryUrl = `https://wanderingstan.com/ec/ec-search.php?q=${encodeURIComponent(error.text)}`;
			let ecReq = new XMLHttpRequest();
			ecReq.open('GET', ecQueryUrl);
			ecReq.onload = () => {
				window.sessionStorage.setItem( // Cache
					`ec:${error.text}`,
					ecReq.responseText);
				resolve(ecReq.responseText);
			};
			ecReq.send();
		}
	});
}


const soHandler = (r, error) => {
	if (!r) return; // Turned off
	try {
		soResponse = JSON.parse(r);
	}
	catch (e) {
		console.warn("Internal EC error: Could not parse response from Stack Exchange");
		return;
	}
	if (soResponse.error_id == 502) {
		window.sessionStorage.removeItem(`so:${error.text}`); // Don't cache errors
		console.warn("Internal EC error: too many requests to stack overfow.\n" +
			"Setting `window.doSo=false` to disable.\n", soResponse);
		window.doSo = false;
		return;
	}
	else if (soResponse.items.length == 0) {
		console.info(
			`%cNo Stack Overflow results for ${error.text}`,
			'color: #fc212e; background-color: #fff0f0');
		return;
	}
	// Format SO
	console.groupCollapsed(
		`%c${soResponse.items.length} Stack Overflow results for '${error.text}'`,
		'color: #fc212e; background-color: #fff0f0');
	for (const i of soResponse.items.slice(0, 10)) {
		console.groupCollapsed(
			`%c${i.title} (${i.answer_count} answers)\n${i.link}`,
			'color: green; font-size: 12px; font-family: Arial,"Helvetica Neue",Helvetica,sans-serif');
		consoleHtml(i.body);
		console.groupEnd();
	}
	if (soResponse.items.length > 10) {
		console.log(`${soResponse.items.length - 10} more...`);
	}
	console.groupEnd();
};

const githubHandler = (r, error) => {

	if (!r) {
		return;
	}
	let githubResponse = JSON.parse(r);
	if (githubResponse.items.length == 0) {
		// Nothing found in github, option to create issue
		console.groupCollapsed(
			`%cCreate Gitub issue`,
			'color: #fc212e; background-color: #fff0f0');
		console.info(
			`%chttps://github.com/${repo}/issues/new?title=${encodeURIComponent(error.text)}&body=`,
			'color: green; font-size: 10px');
		console.groupEnd();
		return;
	}
	// Format Github
	console.groupCollapsed(
		`%c${githubResponse.items.length} Github issue` +
		(githubResponse.items.length > 1 ? "s" : ""),
		'color: #fc212e; background-color: #fff0f0');

	for (const i of githubResponse.items.slice(0, 10)) {
		console.groupCollapsed(
			`%c${i.title} \n${i.html_url} `,
			'color: green; font-size: 10px');
		console.log(i.body);
		console.groupEnd();
	}
	if (githubResponse.items.length > 10) {
		console.log(`${githubResponse.items.length - 10} more...`);
	}
	console.groupEnd();
};

const ecHandler = (r) => {
	if (!r) {
		return;
	}
	let ecResponse = JSON.parse(r);
	if (ecResponse.length == 0) {
		return;
	}
	// Format
	console.groupCollapsed(
		`%c${ecResponse.length} Error Central results`,
		'color: #fc212e; background-color: #fff0f0');
	console.table(ecResponse);

	console.groupEnd();
};



/**
 * Post to our server
 * @param {*} error
 */
function postError(error) {
	params = JSON.stringify({
		"sessionId": 0,
		"userName": null,
		"blobId": null,
		"date": new Date().toJSON(),
		"language": "javascript",
		"title": error.text,
		"rawText": error.text,
	});
	handler = () => {
		if (ecPostReq.readyState == 4 && ecPostReq.status == 200) {
			// Success
		}
		else if (ecPostReq.status != 200) {
			console.warn("Internal EC error: Could not log error to server.", ecPostReq);
		}
	};
	let ecPostReq = new XMLHttpRequest();
	ecPostReq.open('POST', 'https://wanderingstan.com/ec/ec-monitor.php', true);
	ecPostReq.onreadystatechange = handler;
	ecPostReq.send(params);
}

/**
 * Handler for custom 'ErrorToExtension' message.
 * The various error detection methods all call this.
 */
document.addEventListener('ErrorToExtension', function (e) {
	const error = e.detail;

	const { genericError, errorDocUrl } = genericizeError(error.text);

	let promises = [
		searchSo(error),
		searchGithub(error),
		searchEc(error),
		searchSo(doSoGeneric ? genericError : null),
	];

	Promise.all(promises).then(([soR, githubR, ecR, soGenericR]) => {

		console.groupCollapsed(
			`%c${error.text} 🐛`,
			'color: #fc212e; background-color: #fff0f0');
		if (errorDocUrl) {
			console.info(
				`%cError docs: ${errorDocUrl}`,
				'color: green; font-size: 10px');
		}
		soHandler(soR, error); // Full error search
		soHandler(soGenericR, { "text": genericError }); // Generic error search
		githubHandler(githubR, error);
		ecHandler(ecR);
		console.groupEnd();
	});

	// Record the happening of this error
	postError(error);
});

/**
 * Code injected on each page.
 * Catches all the various forms of errors that can happen.
 */
function codeToInject() {

	function handleCustomError(message, stack) {
		if (!stack) {
			stack = (new Error()).stack.split("\n").splice(2, 4).join("\n");
		}

		var stackLines = stack.split("\n");
		var callSrc = (stackLines.length > 1 && (/^.*?\((.*?):(\d+):(\d+)/.exec(stackLines[1]) || /(\w+:\/\/.*?):(\d+):(\d+)/.exec(stackLines[1]))) || [null, null, null, null];

		document.dispatchEvent(new CustomEvent('ErrorToExtension', {
			detail: {
				stack: stackLines.join("\n"),
				url: callSrc[1],
				line: callSrc[2],
				col: callSrc[3],
				text: message
			}
		}));
	}

	// handle uncaught promises errors
	window.addEventListener('unhandledrejection', function (e) {
		if (typeof e.reason === 'undefined') {
			e.reason = e.detail;
		}
		handleCustomError(e.reason.message, e.reason.stack);
	});

	// handle console.error()
	var consoleErrorFunc = window.console.error;
	window.console.error = function () {
		var argsArray = [];
		for (var i in arguments) { // because arguments.join() not working! oO
			argsArray.push(arguments[i]);
		}
		consoleErrorFunc.apply(console, argsArray);

		handleCustomError(argsArray.length == 1 && typeof argsArray[0] == 'string' ? argsArray[0] : JSON.stringify(argsArray.length == 1 ? argsArray[0] : argsArray));
	};

	// handle uncaught errors
	window.addEventListener('error', function (e) {
		if (e.filename) {
			document.dispatchEvent(new CustomEvent('ErrorToExtension', {
				detail: {
					stack: e.error ? e.error.stack : null,
					url: e.filename,
					line: e.lineno,
					col: e.colno,
					text: e.message
				}
			}));
		}
	});

	// handle 404 errors
	window.addEventListener('error', function (e) {
		var src = e.target.src || e.target.href;
		var baseUrl = e.target.baseURI;
		if (src && baseUrl && src != baseUrl) {
			document.dispatchEvent(new CustomEvent('ErrorToExtension', {
				detail: {
					is404: true,
					url: src
				}
			}));
		}
	}, true);
}

var script = document.createElement('script');
script.textContent = '(' + codeToInject + '())';
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// };
