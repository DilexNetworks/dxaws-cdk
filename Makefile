# Define variables
PROJECT_NAME := dxaws-cdk-components
DOCS_DIR := docs
BUILD_DIR := dist
VENV_DIR := .venv
PYTHON_VERSION := python3.13

# Targets
.PHONY: all init clean test build docs

# Default target
all: clean init test build docs

# Initialize the development environment
init: 
	@echo "Initializing development environment..."
	npm install

init-all: check-python venv init
	$(VENV_DIR)/bin/pip install -r requirements/development.txt
	$(MAKE) docs
	$(MAKE) test

# Clean up build artifacts
clean:
	@echo "Cleaning up build artifacts..."
	rm -rf $(BUILD_DIR) $(DOCS_DIR)/typedoc $(DOCS_DIR)/build $(VENV_DIR)
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

# Remove everything (full reset)
dist: clean
	@echo "Removing all installed dependencies and virtual environment..."
	rm -rf $(VENV_DIR) node_modules $(DOCS_DIR)/typedoc package-lock.json

# Run unit tests
test:
	@echo "Running unit tests..."
	npm test

# Build the project
build:
	@echo "Building the project..."
	npm run build

# Generate documentation
docs: docs/typedoc
	@echo "Building Sphinx documentation..."
	$(VENV_DIR)/bin/sphinx-build -b html $(DOCS_DIR) $(DOCS_DIR)/build

# Generate TypeScript documentation using TypeDoc
docs/typedoc:
	@echo "Generating TypeScript documentation..."
	npx typedoc --options docs/typedoc.json

# Preview the documentation
serve-docs:
	@echo "Starting local server for documentation..."
	$(PYTHON_VERSION) -m http.server --directory $(DOCS_DIR)/build

# Create a Python virtual environment
venv:
	@if [ ! -d $(VENV_DIR) ]; then \
		echo "Creating Python virtual environment..."; \
		python3 -m venv $(VENV_DIR); \
		$(VENV_DIR)/bin/python3 -m pip install --upgrade pip; \
	fi

# Check if Python is available
check-python:
	@command -v $(PYTHON_VERSION) >/dev/null 2>&1 || { echo >&2 "$(PYTHON_VERSION) is not installed. Please install Python3 to continue."; exit 1; }

# Release: Update version, tag, and push
release:
	@if [ -z "$(filter patch minor major,$(TARGET))" ]; then \
		echo "Usage: make release TARGET=[patch|minor|major]"; \
		exit 1; \
	fi
	@if ! command -v gh >/dev/null; then \
 		echo "GitHub CLI (gh) is not installed. Please install it first."; \
 		exit 1; \
 	fi

	@echo "Bumping version ($(TARGET))..."
	@NEW_VERSION=$$($(VENV_DIR)/bin/bump2version $(TARGET) --tag-message "Release version {new_version}" --list | grep new_version= | cut -d '=' -f 2 ); \
    echo "Bumped to version $$NEW_VERSION";

#	@echo "Pushing changes..."
#	git push --follow-tags

#	echo "Creating GitHub release..."
#	gh release create v$(NEW_VERSION) -t "Release version $(NEW_VERSION)" -n "Automated release for version $(NEW_VERSION)"
