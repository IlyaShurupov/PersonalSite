npm run build
git checkout gh-pages
git add --recurse-submodules dist
git commit -m "deploy"
git push origin gh-pages