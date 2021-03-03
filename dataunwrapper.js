#!/usr/bin/env node

const https = require('https');

const dataunwrapper = module.exports = function(id, fn){
	if (!id) return fn("usage: dataunwrapper <id>");
	if (!/^[a-z0-9]+$/i.test(id)) fn("invalid id");

	// resolve metatag-redirect
	https.get('https://datawrapper.dwcdn.net/'+id+'/', function(res){
		if (res.statusCode !== 200) fn("response: http status "+res.statusCode);

		var content = [];

		res.on('error', function(err){

			fn(err);

		}).on('data', function(chunk){

			content.push(chunk);

		}).on('end', function(){

			content = content.join("");
			
			if (!/<meta http-equiv="REFRESH" content="0; url=(.*?)\/([a-z0-9]+)\/([0-9]+)\/">/i.test(content)) return console.log(RegExp.$0),fn(new Error("No version redirect found"));
			
			const ver = RegExp.$3;

			// fetch content
			https.get('https://datawrapper.dwcdn.net/'+id+'/'+ver+'/', function(res){

				if (res.statusCode !== 200) fn("response: http status "+res.statusCode);

				var content = [];

				res.on('error', function(err){

					fn(err);

				}).on('data', function(chunk){

					content.push(chunk);

				}).on('end', function(){

					extract(content.join(""), fn);

				});

			});
			
		});
	});
};

// extract inline data from over-webpacked code
const extract = module.exports.extract = function(content, fn){

	// most common
	if (/\\"chartData/.test(content) && /\\"chartData\\":\\"(.*?[^\\])\\",/.test(content)) {
		try {
			var data = JSON.parse("\""+JSON.parse("\""+RegExp.$1+"\"")+"\"");
		} catch (err) {
			return fn(err);
		}
		return fn(null, data);
	}

	// less common
	if (/render\(\{/.test(content) && /render\(\{(.*?)\schartData: "(.*?)",?\n(.*?)\}\);/s.test(content)) {
		try {
			var data = JSON.parse('"'+RegExp.$2+'"');
		} catch (err) {
			return fn(err);
		}
		return fn(null, data);
	}

	// way less common
	if (/__dw\.init\(\{/.test(content) && /__dw\.init\(\{(.*?)\sdata: "(.*?)",?\n(.*?)\}\);/s.test(content)) {
		try {
			var data = JSON.parse('"'+RegExp.$2+'"');
		} catch (err) {
			return fn(err);
		}
		return fn(null, data);
	}
	
	// only found once
	if (/__dw\.init\(\$\.extend\(\{/.test(content) && /__dw\.init\(\$\.extend\(\{(.*?)\sdata: "(.*?)",?\n(.*?)\}, window\.__dwParams\)\);/s.test(content)) {
		try {
			var data = JSON.parse('"'+RegExp.$2+'"');
		} catch (err) {
			return fn(err);
		}
		return fn(null, data);
	}

	// report a bug if you find a non-functioning version
	return fn(new Error("could not find data"));
};

if (require.main === module) dataunwrapper(process.argv[2], function(err, data){
	if (err) console.error(err.toString()), process.exit(1);
	console.log(data);
});
