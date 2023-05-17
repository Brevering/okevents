export class CsvService {
	public saveDataInCSV(data: Array<any>): string {
		if (data.length == 0) {
			return '';
		}

		let propertyNames = Object.keys(data[0]);
		let rowWithPropertyNames = propertyNames.join(',') + '\n';

		let csvContent = rowWithPropertyNames;

		let rows: string[] = [];

		data.forEach((item) => {
			let values: string[] = [];

			propertyNames.forEach((key) => {
				let val: any = item[key];

				if (val !== undefined && val !== null) {
					val = new String(val);
				} else {
					val = '';
				}
				values.push(val);
			});
			rows.push(values.join(','));
		});
		csvContent += rows.join('\n');

		return csvContent;
	}


	public importDataFromCSV(data: string): Array<any> {


		// Split data into lines and separate headers from actual data
		// using Array spread operator
		const [headerLine, ...lines] = data.split('\n');

		// Use common line separator, which parses each line as the contents of a JSON array
		const parseLine = (line: any) => JSON.parse(`[${line}]`);

		// Split headers line into an array
		const headers = headerLine.split(',');

		// Create objects from parsing lines
		// There will be as much objects as lines
		const objects = lines
			.map((line, index) =>

				// Split line with JSON
				//!parseLine(line)
					line.split(',')

					// Reduce values array into an object like: { [header]: value } 
					.reduce(
						(object: any, value: string, index: number) => ({
							...object,
							[headers[index]]: value,
						}),
						{}
					)
			);

		return objects;
	}
}
