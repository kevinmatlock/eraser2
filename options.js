/*
    Requires optionsManager.js for messaging.
*/

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function save() {
    var options = {};
    options.maintainStructure = $('#maintainStructure').prop('checked');
    options.customCursor = $('#customCursor').prop('checked');
    options.fadeSpeed = $('#fadeSpeed').val();
    chrome.extension.sendMessage({command: 'save_options', data: options});
}

function load() {
    var options = {};
    chrome.extension.sendMessage({command:'load_options'}, function(response) {
        options = response;
        $('#maintainStructure').prop('checked', options.maintainStructure === 'true');
        $('#customCursor').prop('checked', options.customCursor === 'true');
        $('#fadeSpeed').val(options.fadeSpeed);
    });
}

$(document).ready(function() {
    load();

    $('#save').on('click', function(e) {
        save();

        e.stopPropagation();
        e.preventDefault();
        return false;
    });

    var table = $('#eracings');
    var tableBody = table.find('tbody');
    var selectAll = table.find('#select_all');
    var deleteSelected = $('#delete_selected');
    var showIncognito = $('#show_incognito');
    var hideIncognito = $('#hide_incognito');
    var deleteSelected = $('#delete_selected');
    var noErasers = $('#no_erasers');
    var rowTemplate = $('<tr><td class="check"><input type="checkbox" /></td><td class="url"><a href="" target="_blank"></a></td><td class="modified"><abbr></abbr></td><td class="count"></td></tr>');

    var rowSubTemplate = $('<tr><td>&nbsp;</td><td class="elementSel"><abbr></abbr></td><td class="elementEraseDate"><abbr></abbr></td></tr>');

    updateControls();

    chrome.storage.local.get(null, function(pages) {
        var sorted = [];
        for (var key in pages) {
            var page = pages[key];
            sorted.push(page);
        }
        sorted.sort(function(a, b) {
            return b.modified - a.modified;
        });
		


        for (var i = 0; i < sorted.length; i++) {
            var page = sorted[i];
            
			var row = rowTemplate.clone();
            if (page.incognito) {
                row.addClass('incognito');
                row.attr('title', 'Incognito');
                row.hide();
            }
			
			
			
            tableBody.append(row);
            var link = row.find('.url a');
            link.attr('href', page.url);
            link.text(page.url);
			
            var count = row.find('.count');
            count.text(page.erasers.length);
			
			for (var z = 0; z < page.erasers.length; z++) {
				
				var eraser = page.erasers[z];

				if (eraser != null){
					var row2 = rowSubTemplate.clone();
					tableBody.append(row2);

					debugger;		
					
					var dateErased = new Date(eraser.created);
					var elementEraseDate = row2.find('.elementEraseDate abbr');
					var hours2 = dateErased.getHours();
					var timeOfDay2 = hours2 > 12 ? 'PM' : 'AM';
					hours2 = hours2 > 12 ? hours2 - 12 : hours2;
					var shortDate2 = months[dateErased.getMonth()] + ' ' + dateErased.getDate() + ' ' + dateErased.getFullYear() + ', ' + hours2 + ':' + dateErased.getMinutes() + timeOfDay2;
					elementEraseDate.text(shortDate2)

					var elementSel = row2.find('.elementSel abbr');
					elementSel.text(eraser.selector);
				}
			}
	
			
			
            var dateModified = new Date(page.modified);
            var hours = dateModified.getHours();
            var timeOfDay = hours > 12 ? 'PM' : 'AM';
            hours = hours > 12 ? hours - 12 : hours;
            var modified = row.find('.modified abbr');
            modified.attr('title', dateModified.toString())
            var shortDate = months[dateModified.getMonth()] + ' ' + dateModified.getDate() + ' ' + dateModified.getFullYear() + ', ' + hours + ':' + dateModified.getMinutes() + timeOfDay;
            modified.text(shortDate);
        }
        updateControls();

        table.find('.incognito a').on('click', function(e) {
            chrome.windows.create({
                url: $(this).attr('href'),
                incognito: true
            });

            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });

    selectAll.on('change', function(e) {
        table.find(':checkbox:visible').prop('checked', selectAll.prop('checked'));
    });

    deleteSelected.on('click', function(e) {
        table.find('tbody :checkbox:checked').each(function(i, item) {
            var checkbox = $(item);
            var row = checkbox.closest('tr');
            var url = row.find('.url a').attr('href');
            chrome.storage.local.remove(url, function() {});
            row.remove();
        });
        updateControls();

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    showIncognito.on('click', function(e) {
        table.find('.incognito').show('fast');
        showIncognito.hide();
        hideIncognito.show();
    });

    hideIncognito.on('click', function(e) {
        table.find('.incognito')
            .hide('fast')
            .find(':checkbox:checked').prop('checked', false);
        showIncognito.show();
        hideIncognito.hide();
    });

    function updateControls() {
        if (table.find('tbody :checkbox').length > 0) {
            deleteSelected.show();
            noErasers.hide();
        } else {
            deleteSelected.hide();
            noErasers.show();
        }
        selectAll.prop('checked', false);

        showIncognito.hide();
        hideIncognito.hide();
        if (table.find('.incognito:first').length > 0) {
            showIncognito.show();
        }
    }
});