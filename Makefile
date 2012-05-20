
build: clean compile

clean:
	rm -f build/observable.min.js

compile:
	cp lib/observable.js build/observable.js
	uglifyjs --unsafe --output build/observable.min.js lib/observable.js

