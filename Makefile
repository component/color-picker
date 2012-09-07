
build: components template.js index.js
	@component build --dev

components: component.json
	@component install --dev

template.js: template.html
	@component convert $<

clean:
	rm -fr build components template.js

.PHONY: clean
