function outputDownload(filename, data) {
    var blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), [data]], {type: 'text/csv;charset=UTF-8'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

function processCalendarFile()
{
	var file = document.getElementById("fileForUpload").files[0];
	if (file) {
	    var reader = new FileReader();
	    reader.readAsText(file);

	    reader.onload = function (evt) {
		var jcalData = ICAL.parse(evt.target.result);
	    var vcalendar = new ICAL.Component(jcalData);
    	var vevent = vcalendar.getFirstSubcomponent('vevent');
		var vevents = vcalendar.getAllSubcomponents('vevent');
		var allCheckboxes = document.getElementsByTagName('input');

		var checkMap = Object();
		for (var i = 0; i < allCheckboxes.length; i++)
		{
			var oneCheckbox = allCheckboxes[i];
			if(oneCheckbox.type == "checkbox"){
				checkMap[oneCheckbox.id.toLowerCase()] = oneCheckbox.checked;
			}
		}

		var x;
		var csv;
		var alltitles = [];
		var csvheader;
		var isFirstLine = true;
		var csvfile;
		var linesProcessed = 0;
		var csvColumnNames = [];
		for (var oneCol in checkMap)
		{
			if (checkMap[oneCol])
			{
				csvColumnNames.push(oneCol);
			}
		}
		for(x of vevents)
		{
			alltitles = [];
			csv = csv + x.getFirstPropertyValue('summary') + '<br>';
			
			var allProps = [];

			// go through all properties in checkMap and only push ones that match to an array
			var eventProperties = x.getAllProperties();
			var valuesMap = Object();	
			for(csvCol of csvColumnNames)
			{
				for(prop of x.getAllProperties())
				{
					if (csvCol == prop.jCal[0].toLowerCase())
					{
						if (csvCol in valuesMap)
						{
							valuesMap[csvCol] = valuesMap[csvCol] + ";" + JSON.stringify(prop.jCal[3]).replace(/\\\"/g, '').replace(/\"/g, '');
						}
						else
						{
							valuesMap[csvCol] = JSON.stringify(prop.jCal[3]).replace(/\\\"/g, '').replace(/\"/g, '');
						}
					}
				}
			}
			for(csvCol of csvColumnNames)
            {
				if (csvCol in valuesMap)
				{
						allProps.push(valuesMap[csvCol]);
				}
				else
				{
						allProps.push('');
				}
			}
			var csvstring = "\"" + allProps.join("\",\"") + "\"";
			var csvheader = csvColumnNames.join(",");
			if (isFirstLine)
			{
				csvfile = csvstring;
			}
				else
				{
					csvfile = csvfile + "\n" + csvstring;
				}
				isFirstLine = false;
				linesProcessed++;
			}
    	    csvfile = csvheader + "\n" + csvfile;
			document.getElementById("calendarEvents").innerHTML = linesProcessed + " lines processed";
			outputDownload("output.csv", csvfile);
	    }
	    reader.onerror = function (evt) {
	        document.getElementById("calendarEvents").innerHTML = "error reading file";
	    }
	}
}
