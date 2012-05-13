
build: clean compile

clean:
	rm -f build/observable.min.js

compile:
	uglifyjs --unsafe --output build/observable.min.js lib/observable.js

