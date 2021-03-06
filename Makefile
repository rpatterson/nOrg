## Local development targets and utilities

# Make variables
SHELL = /bin/bash
CHECKOUT_DIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

# Project variables
NODE_VERSION = $(shell . ~/.nvm/nvm.sh && nvm version)
export PIPENV_VENV_IN_PROJECT=1

## Top-level targets

.PHONY: all
all: var/log/yarn-install.log .git/hooks/pre-commit .git/hooks/pre-push

.PHONY: run
run: all
	. ~/.nvm/nvm.sh && nvm exec yarn start

.PHONY: test
test: all
	. ~/.nvm/nvm.sh && nvm exec yarn run format
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

.venv/bin/python:
	pipenv --python 3.7
	touch "$(@)"

.venv/bin/pre-commit: .venv/bin/python
	pipenv install -d --skip-lock
	touch "$(@)"

Pipfile.lock: .venv/bin/pre-commit Pipfile
	pipenv lock
	touch "$(@)"

.git/hooks/pre-commit: Pipfile.lock
	pipenv run pre-commit install
.git/hooks/pre-push: Pipfile.lock
	pipenv run pre-commit install --hook-type pre-push
