
build: clean compile

clean:
	rm -fr

compile:
	uglifyjs --unsafe --output observable.min.js

