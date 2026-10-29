SHELL := /bin/bash

WHIP_BUILD_TOOLS ?= $(HOME)/.local/share/whip-build
ifneq ($(wildcard $(WHIP_BUILD_TOOLS)/cargo/bin/rustup),)
export RUSTUP_HOME := $(WHIP_BUILD_TOOLS)/rustup
export CARGO_HOME := $(WHIP_BUILD_TOOLS)/cargo
export PATH := $(CARGO_HOME)/bin:$(PATH)
endif
ifneq ($(wildcard $(WHIP_BUILD_TOOLS)/node/bin/node),)
export PATH := $(WHIP_BUILD_TOOLS)/node/bin:$(PATH)
endif

ANDROID_SDK_ROOT ?= $(or $(ANDROID_HOME),$(HOME)/Android/Sdk)
ANDROID_NDK_ROOT ?= $(ANDROID_SDK_ROOT)/ndk/27.1.12297006
NDK_BIN := $(ANDROID_NDK_ROOT)/toolchains/llvm/prebuilt/linux-x86_64/bin
SIGNING_PROPERTIES ?= $(HOME)/git/perso/liseur/keystore.properties
GRADLE := android/gradlew -p android
APK := android/app/build/outputs/apk/release/app-release.apk

.PHONY: help apk
help:
	@printf '%s\n' \
		'make apk  Build a personal ARM64 release APK signed with the Liseur key' \
		'Override SIGNING_PROPERTIES, ANDROID_SDK_ROOT or ANDROID_NDK_ROOT as needed.'

apk:
	@test -f "$(SIGNING_PROPERTIES)" || { printf '%s\n' 'Missing signing properties; set SIGNING_PROPERTIES to the Liseur keystore.properties file.' >&2; exit 1; }
	@test -x "$(NDK_BIN)/aarch64-linux-android24-clang" || { printf '%s\n' 'Android NDK 27.1.12297006 is required.' >&2; exit 1; }
	@WHIP_PERSONAL_BUILD=1 WHIP_DISTRIBUTION_CHANNEL= NODE_ENV=production \
		WHIP_UPLOAD_KEYSTORE_PROPERTIES="$(SIGNING_PROPERTIES)" \
		ANDROID_HOME="$(ANDROID_SDK_ROOT)" ANDROID_SDK_ROOT="$(ANDROID_SDK_ROOT)" \
		ANDROID_NDK_ROOT="$(ANDROID_NDK_ROOT)" \
		CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$(NDK_BIN)/aarch64-linux-android24-clang" \
		CC_aarch64_linux_android="$(NDK_BIN)/aarch64-linux-android24-clang" \
		AR_aarch64_linux_android="$(NDK_BIN)/llvm-ar" \
		CFLAGS_aarch64_linux_android="--target=aarch64-none-linux-android24" \
		$(GRADLE) app:assembleRelease -PreactNativeArchitectures=arm64-v8a -Pwhip.skipR8=true -Pwhip.previewSigning=false --no-daemon
	@printf 'APK: %s\n' "$(APK)"
