# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.abspath('..'))

# Add the TypeDoc output directory to the Sphinx source path
typedoc_path = os.path.abspath('./typedoc')
sys.path.insert(0, typedoc_path)


# -- Project information -----------------------------------------------------

project = 'DxAws CDK Components'
copyright = '2024, Dilex Networks'
author = 'Andrew Wyllie'

# The full version, including alpha/beta/rc tags
release = 'v1.0.3'

# Set the title
html_title = "DxAws CDK Components v1.0.3"


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'myst_parser',
    'sphinx.ext.autodoc',
    'sphinx.ext.doctest',
    'sphinx.ext.intersphinx',
    'sphinxcontrib.mermaid'
]

source_suffix = ['.rst', '.md']

# If your ParameterStore class is inheriting from Session, and you want
# to ensure that inherited methods (like __init__) are documented correctly,
# enable autodoc_inherit_docstrings
# autodoc_inherit_docstrings = True

# Autodoc settings:
autodoc_default_options = {
    'members': True,
    'undoc-members': True,
    'show-inheritance': True,
    'special-members': '__init__',
}

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# Use Markdown with MyST
master_doc = 'index'


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
# html_theme = 'nature'
html_theme = 'furo'

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']

# Mermaid options
# ref: https://github.com/mgaitan/sphinxcontrib-mermaid?tab=readme-ov-file
mermaid_version="11.3.0"
myst_enable_extensions = [
    "colon_fence",  # Required for fenced code blocks (like Mermaid)
]
html_js_files = [
    'mermaid.js',  # for dark mode handling - file in ./_static/mermaid.js.
]
