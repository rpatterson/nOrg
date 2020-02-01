## Local development targets and utilities

# Make variables
SHELL = /bin/bash
CHECKOUT_DIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Project variables
NODE_VERSION = $(shell . ~/.nvm/nvm.sh && nvm version)


## Top-level targets

.PHONY: all
all: var/log/yarn-install.log

.PHONY: run
run: all
	. ~/.nvm/nvm.sh && nvm exec yarn start

.PHONY: test
test: all
	yarn run format
	yarn run test --color

.PHONY: clean
clean:
	rm -r node_modules

## Real targets

var/log/yarn-install.log: package.json
	. ~/.nvm/nvm.sh && nvm exec yarn install | tee "$(@)"

package.json: ~/.nvm/versions/node/$(NODE_VERSION)/bin/npm
	. ~/.nvm/nvm.sh && nvm exec npm init @open-wc

~/.nvm/nvm.sh:
	curl -o- \
		https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh \
		| bash

~/.nvm/versions/node/$(NODE_VERSION)/bin/npm: ~/.nvm/nvm.sh .nvmrc
	cd && . ~/.nvm/nvm.sh && cd "$(CHECKOUT_DIR)" && nvm install
	touch "$(@)"
