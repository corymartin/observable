
build: clean compile

clean:
	@@rm -f build/observable.min.js

compile:
	@@cp lib/observable.js build/observable.js
	@@./node_modules/uglify-js/bin/uglifyjs --comments --unsafe --output build/observable.min.js build/observable.js

