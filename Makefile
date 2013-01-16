
build: clean compile

clean:
	@@rm -f dist/observable.min.js

compile:
	@@cp lib/observable.js dist/observable.js
	@@./node_modules/uglify-js/bin/uglifyjs --comments --output dist/observable.min.js dist/observable.js

