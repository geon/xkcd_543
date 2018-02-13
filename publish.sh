#!/usr/bin/env bash
set -e

# TODO: add --no-tags
git clone --local --shared --no-checkout --single-branch --branch gh-pages . temp-gh-pages-repo
cd temp-gh-pages-repo
git --work-tree=../dist add .
git --work-tree=../dist commit -m "Published"
git push
chmod -R +w .git
cd ..
rm -r temp-gh-pages-repo
git push origin gh-pages
