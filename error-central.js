// var ec = new function () {

var errors = [];
var errorsLimit = 100;
var tabId;
var timer;
var icon;
var popup;
var options;
var isIFrame = window.top != window;

// Settings
var useCache = true;
var doSo = true;
var doGithub = true;
var doEc = true;
// E.g. "error-central/javascript-errors-notifier"
var repo = window.localStorage.getItem('repo') || "error-central/javascript-errors-notifier";

function showPopup(popupUrl) {


	if (!popup) {
		popup = document.createElement('iframe');
		popup.src = popupUrl;
		popup.frameBorder = 0;
		popup.style.cssText = 'position: fixed !important; bottom: 550px !important; right: 50px !important; z-index: 2147483647 !important;';
		popup.height = '50px';
		(document.body || document.documentElement).appendChild(popup);
	}
	else {
		popup.contentWindow.postMessage({
			_reloadPopup: true,
			url: popupUrl
		}, '*');
	}
}

function showErrorNotification(popupUrl) {

	if (options.showPopup) {
		showPopup(popupUrl);
	}

	if (!icon && (options.showIcon || options.showPopup)) {
		icon = document.createElement('img');
		icon.src = chrome.extension.getURL('img/error_38.png');
		icon.title = 'Some errors occurred on this page. Click to see details.';
		icon.style.cssText = 'position: fixed !important; bottom: 10px !important; right: 10px !important; cursor: pointer !important; z-index: 2147483647 !important; width: 38px !important; height: 38px !important; min-height: 38px !important; min-width: 38px !important; max-height: 38px !important; max-width: 38px !important;';
		icon.onclick = function () {
			if (!popup) {
				showPopup(popupUrl);
			}
			else {
				popup.remove();
				popup = null;
			}
		};
		if (options.showPopupOnMouseOver) {
			icon.onmouseover = function () {
				if (!popup) {
					showPopup(popupUrl);
				}
			};
		}
		(document.body || document.documentElement).appendChild(icon);
	}
}

function handleNewError(error) {
	var lastError = errors[errors.length - 1];
	var isSameAsLast = lastError && lastError.text == error.text && lastError.url == error.url && lastError.line == error.line && lastError.col == error.col;
	var isWrongUrl = !error.url || error.url.indexOf('://') === -1;
	if (!isSameAsLast && !isWrongUrl) {
		errors.push(error);
		if (errors.length > errorsLimit) {
			errors.shift();
		}
		// Do we still need this for anything??
		// if (!timer) {
		// 	timer = window.setTimeout(function () {
		// 		timer = null;
		// 		// Send errors to background extension code
		// 	}, 200);
		// }
	}
}

/**
 * Search Stack Overflow
 * @param {*} error
 */
function searchSo(error) {
	return new Promise((resolve, reject) => {
		if (!doSo) {
			return resolve("");
		}
		let r = window.localStorage.getItem(`so:${error.text}`);
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
				window.localStorage.setItem( // Cache
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
		let r = window.localStorage.getItem(`github:${error.text}`);
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
				window.localStorage.setItem( // Cache
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
		let r = window.localStorage.getItem(`ec:${error.text}`);
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
				window.localStorage.setItem( // Cache
					`ec:${error.text}`,
					ecReq.responseText);
				resolve(ecReq.responseText);
			};
			ecReq.send();
		}
	});
}


const soHandler = (r, error) => {
	try {
		soResponse = JSON.parse(r);
	}
	catch (e) {
		console.log("Internal EC error: Could not parse response from Stack Exchange");
		return;
	}
	if (soResponse.error_id == 502) {
		console.log("EC internal error: too many requests to stack overfow.\nSetting `doEc=false` to disable.", soResponse);
		doSo = false;
		return;
	}
	else if (soResponse.items.length == 0) {
		return;
	}
	// Format SO
	console.groupCollapsed(
		`%c${soResponse.items.length} Stack Overflow results`,
		'color: #fc212e; background-color: #fff0f0');
	for (const i of soResponse.items.slice(0, 10)) {
		console.groupCollapsed(
			`%c${i.title} (${i.answer_count} answers)\n${i.link}`,
			'color: green; font-size: 12px; font-family: Arial,"Helvetica Neue",Helvetica,sans-serif');
		console.log(i.body);
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
		`%c${githubResponse.items.length} Github issue${githubResponse.items.length > 1 ? "s" : ""}`,
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
			// Error was logged
			// console.info(`3️⃣ Got wanderingstan response X: `, ecPostReq.responseText)
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

	// Stan - EC
	const soP = searchSo(error);
	const githubP = searchGithub(error);
	const ecP = searchEc(error);
	Promise.all([soP, githubP, ecP]).then(([soR, githubR, ecR]) => {

		console.groupCollapsed(
			`%c${error.text} 🐛Error Central insights`,
			'color: #fc212e; background-color: #fff0f0');
		soHandler(soR, error);
		githubHandler(githubR, error);
		ecHandler(ecR);
		console.groupEnd();
	});
	postError(error);

	if (isIFrame) {
		window.top.postMessage({
			_iframeError: true,
			_fromJEN: true,
			error: error
		}, '*');
	}
	else {
		handleNewError(error);
	}

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

function handleInternalMessage(data) {
	if (!isIFrame && (!data.tabId || data.tabId == tabId)) {
		if (data._clear) {
			errors = [];
			if (popup) {
				popup.remove();
				popup = null;
			}
			if (icon) {
				icon.remove();
				icon = null;
			}
		}
		else if (data._resize && popup) {
			var maxHeight = Math.round(window.innerHeight * options.popupMaxHeight / 100) - 60;
			var maxWidth = Math.round(window.innerWidth * options.popupMaxWidth / 100) - 60;
			var height = data.height < maxHeight ? data.height : maxHeight;
			var width = data.width < maxWidth ? data.width : maxWidth;
			popup.height = (width == maxWidth ? height + 10 : height) + 'px'; // scroll fix
			popup.width = (height == maxHeight ? width + 10 : width) + 'px'; // scroll fix
			popup.style.height = popup.height;
			popup.style.width = popup.width;
		}
		else if (data._closePopup && popup) {
			popup.style.display = 'none';
		}
		else if (data._iframeError) {
			handleNewError(data.error);
		}
	}
}

window.addEventListener('message', function (event) {
	if (typeof event.data === 'object' && event.data && typeof event.data._fromJEN !== 'undefined' && event.data._fromJEN) {
		handleInternalMessage(event.data);
	}
});

// };
