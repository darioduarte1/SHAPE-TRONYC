#!/bin/bash
export PYTHONPATH=$(pwd)/..
export DJANGO_SETTINGS_MODULE=backend.settings
pylint "$@"
