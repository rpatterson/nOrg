## Local development targets and utilities

# Make variables
SHELL = /bin/bash
CHECKOUT_DIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Project variables
NODE_VERSION = $(shell . ~/.nvm/nvm.sh && nvm version)

## Top-level targets

.PHONY: all
all: var/log/yarn-install.log ./.git/hooks/pre-commit ./.git/hooks/pre-push

.PHONY: run
run: all
	. ~/.nvm/nvm.sh && nvm exec yarn start

.PHONY: format
format: all
	. ~/.nvm/nvm.sh && nvm exec yarn run format
.PHONY: test
test: all format
	. ~/.nvm/nvm.sh && nvm exec yarn run test --color

.PHONY: update-snapshots
update-snapshots: all
	. ~/.nvm/nvm.sh && nvm exec yarn run test:update-snapshots
	. ~/.nvm/nvm.sh && nvm exec yarn run test:prune-snapshots

.PHONY: clean
clean:
	rm -r node_modules

## Real targets

var/log/yarn-install.log: package.json
	mkdir -pv "$(dir $(@))"
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

./.venv/bin/pip:
	python3.7 -m "venv" "$(@:%/bin/pip=%)"
	touch "$(@)"

./.venv/bin/pre-commit: ./requirements.txt.in ./.venv/bin/pip
	./.venv/bin/pip install -r "$(<)"
	touch "$(@)"

./.git/hooks/pre-commit: ./.venv/bin/pre-commit
	./.venv/bin/pre-commit install
./.git/hooks/pre-push: ./.venv/bin/pre-commit
	./.venv/bin/pre-commit install --hook-type pre-push
