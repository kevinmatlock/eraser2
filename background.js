optionsManager.defaultOptions = {
    maintainStructure: 'true',
    customCursor: 'true',
    fadeSpeed: '200'
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {enabled: true});
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'current_tab') {
        sendResponse(sender.tab);
    } else if (request.command === 'load_options') {
        var options = optionsManager.load();
        sendResponse(options);
    } else if (request.command === 'save_options') {
        optionsManager.save(request.data);
    } else if (request.command === 'update_badge') {
        chrome.browserAction.setBadgeBackgroundColor({color: '#00CC00', tabId: sender.tab.id});
        chrome.browserAction.setBadgeText({text: request.data, tabId: sender.tab.id});
    } else if (request.command === 'save_eraser') {
        var tab = sender.tab;
        var url = cleanUrl(tab.url);
        chrome.storage.local.get(url, function(pages) {
            var now = new Date();
            var obj = {};
            var epoch = now.getTime();
            var eraser = {
                enabled: true,
                created: epoch,
                selector: request.data
            };
            // create new
            if (pages[url] === undefined) {
                obj[url] = {
                    url: url,
                    enabled: true,
                    created: epoch,
                    modified: epoch,
                    erasers: [eraser],
                    incognito: tab.incognito
                };
            // update existing
            } else {
                var page = pages[url];
                var erasers = page.erasers;
                for (var i = erasers.length - 1; i >= 0; i--) {
                    var eras = erasers[i];
                    if (eras.selector.indexOf(eraser.selector) === 0) {
                        erasers.splice(i, 1);
                    }
                }
                erasers.push(eraser);
                page.erasers = erasers;
                page.modified = epoch;
                obj[url] = page;
            }
            chrome.storage.local.set(obj);
        });
		
    } else if (request.command === 'undo_eraser') {
        var tab = sender.tab;
        var url = cleanUrl(tab.url);
		
        chrome.storage.local.get(url, function(pages) {
			
            var now = new Date();
            var obj = {};
            var epoch = now.getTime();
            var eraser = {
                enabled: true,
                created: epoch,
                selector: request.data
            };

			if (pages[url] != undefined) {
				var page = pages[url];
				var erasers = page.erasers;
				
				//var indexToRemove =
				delete erasers[erasers.length-1];
/*				for (var i = erasers.length - 1; i >= 0; i--) {
					var eras = erasers[i];
					if (eras.selector.indexOf(eraser.selector) === 0) {
						erasers.splice(i, 1);
					}
				}
	*/			
				erasers.push(eraser);
				page.erasers = erasers;
				page.modified = epoch;
				obj[url] = page;
				
				//this was outside the if/else as copied from above
				chrome.storage.local.set(obj); 
				
			}
        });
		
    } else if (request.command === 'load_erasers') {
        var url = cleanUrl(sender.tab.url);
        chrome.storage.local.get(url, function(pages) {
            sendResponse(pages);
        });
    } else if (request.command === 'remove_erasers') {
        var url = cleanUrl(sender.tab.url);
        chrome.storage.local.remove(url);
    } else if (request.command === 'clear_erasers') {
        chrome.storage.local.clear();
    }
    return true;
});

/*
    Removes anchors.
*/
function cleanUrl(url) {
    var tokens = url.split('#');
    return tokens[0];
}