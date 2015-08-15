wikidata-properties-dumper
==========================

There are now more than 2000 property ids on wikidata (less active ones though), but no handy standard json version of those, so I made one by hand, per language.
You can find `en`, `de`, `fr`, `es` and `it` versions already in the `./output` folder.

How To dump Properties
-------
```bash
git clone git@github.com:maxlath/wikidata-properties-dumper.git
npm install
```

then just execute the script with the wished 2 letter language code as first argument (e.g. here `fr` for French):

```bash
./wikidata-properties-dumper.js fr
```

and you're done! JSON files are waiting for you in the `output` folder:
