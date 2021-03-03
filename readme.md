# dataunwrapper

Extract raw data from [datawrapper](https://www.datawrapper.de/) visualisations hosted at [datawrapper.dwcdn.net](https://datawrapper.dwcdn.net/).

## Module usage

``` javascript
const dataunwrapper = require('dataunwrapper');

dataunwrapper('<id>', function(err, data){

	// ...

});
```

`<id>` is the unique 5 character string from the url `https://datawrapper.dwcdn.net/<id>/0/`

## CLI usage

Install with `npm i -g dataunwrapper`.

```
dataunwrapper <id>
```

## License

[Unlicense](https://unlicense.org/)