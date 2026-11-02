export PATH := $(CURDIR)/.tools/bin:$(PATH)

.PHONY: setup frontend web-wasm web-native desktop check test

setup:
	moon install moonbit-community/warren@0.4.5 --bin .tools/bin

frontend:
	warren -C frontend build --browser-entry .

web-wasm: frontend
	moon run web --target wasm

web-native: frontend
	moon run web --target native

desktop:
	moonx moonbit-community/proton_cli@0.6.0 dev

check:
	moon check --target js,wasm,native

test:
	moon test shared --target js
	moon test shared shared/store --target wasm,native
